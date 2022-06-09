# @Author:  <samiramaghool@gmail.com>
import csv
from pickle import Pickler, Unpickler
import os
import glob
import networkx as nx
from LPA.customexceptions import *
from pathlib import Path
from cdlib import algorithms as ag
import community as community_louvain

# File extension used
PYTHON_PICKLE_EXTENSION = ".pickled"
STATE = "_LPStates"
# / + "log_trial_"
BASE = "log_trial_"

def createIfNotExist(directory):
    """
    Creates a directory if not exists
    """
    if not os.path.exists(directory):
        os.makedirs(directory)


def states_to_colourString(LPStates, mapping=None):
    """
    Map states into colours

    arg1: state list as integers 
    arg2: dictionary with mapping (state: colour)
        e.g. 
            mapping = { 0 : "g",
                        1 : "r",
                        2 : "k"}
    """

    return [mapping.get(LPState, "k") for LPState in LPStates]


def makeFileNameLPState(dir, id):
    """
    Create a file name: dir/results{id}.pickled
    """      
    return dir / ("results" + str(id) + PYTHON_PICKLE_EXTENSION) 


def retrieveTrial(directory, trial_number):  
    """
    For a specific trial in a given directory, retrieve states, topologies
        and statevectors
    """

    LPStates = retrieve(makeFileNameLPState(directory, trial_number))
    return LPStates


def retrieveAllTrialsInDirectory(directory):
    """
    Retrieves all trials in a directory
    """

    # List of files .pickled in the directory directory
    file_list = glob.glob(os.path.join(directory, "*" + PYTHON_PICKLE_EXTENSION))

    # Retrieve datas from every file and return
    LPState_list = [retrieve(f) for f in file_list]
    return (LPState_list)

    
def storeAllToFile(LPStatesTuples, directory, trial_id):
    """
    Store LPStateTuples to file identified by trial_id
    """
    storeToFile(LPStatesTuples, makeFileNameLPState(directory, str(trial_id)))                         

def storeToFile(stuff, filename, verbose=True):   
    """
    Store one item (e.g. state list or networkx graph) to file.
    """            
    filename = os.path.normcase(filename)   
    directory = os.path.dirname(filename)
    createIfNotExist(directory)

    f = open(filename, 'wb')
    p = Pickler(f, protocol=2)
    p.dump(stuff)
    f.close()
    
    if verbose:
        total = len(stuff)
        print ("Written %i items to pickled binary file: %s" % (total, filename))
    return filename


def retrieve(filename): 
    """
    Retrieve a pickled object from file (e.g. state list or networkx graph)
    """

    filename = os.path.normcase(filename)
    try:      
        f = open(filename, 'rb')   
        u = Unpickler(f)
        stuff = u.load()
        f.close()
        return stuff
    except IOError:
        raise LogOpeningError("No file found for %s" % filename, filename)

def build_initial_network_from_files(edges_file, initial_vl_file, label_names_file, directed=True, fromPredecessors=True):
    # network from edges
    print("Making the graph")
    if directed:
        lp_net = nx.read_edgelist(edges_file, nodetype=int, create_using=nx.DiGraph)
    else:
        lp_net = nx.read_edgelist(edges_file, nodetype=int, create_using=nx.Graph)
    n = len(list(lp_net.nodes))

    print("Reading label names")

    # label names
    with open(label_names_file, 'r') as f:
        csv_reader = csv.reader(f, delimiter=';')
        labels = [x.lstrip() for x in list(csv_reader)[0]]
        lp_net.graph['labels'] = labels # add labels to graph datas


    print("Reading vls")

    # initial vls
    with open(initial_vl_file, 'r') as read_obj:   
        csv_reader = csv.reader(read_obj, delimiter=';', quoting=csv.QUOTE_NONNUMERIC)
        list_of_rows = list(csv_reader)

        # n = max(n, len(list_of_rows))

        # Initialize nodes VLs
        for i in range(1, n + 1):
            # if i not in lp_net.nodes:
            #     lp_net.add_node(i)
            for j in range(len(labels)):
                lp_net.nodes[i][labels[j]] = list_of_rows[i - 1][j]

    if directed:
        # directed graph -> leiden
        leiden_results = ag.leiden(lp_net).communities
        leiden_results_nml = {}

    
        for i in range(0, len(leiden_results)):
            for j in leiden_results[i]:
                leiden_results_nml[j] = i
        
        results = leiden_results_nml
        unique_coms = len(set(results.values()))
    else:
        # undirected graph -> louvain
        louvain_results = community_louvain.best_partition(lp_net)
        print(louvain_results)
        results = louvain_results
        unique_coms = len(results)

            
    for i in lp_net.nodes:
        lp_net.nodes[i]["community"] = results[i]
        lp_net.nodes[i]["degree"] = nx.degree(lp_net, i)
        if directed:
            lp_net.nodes[i]["predecessors_count"] = lp_net.in_degree(i)
            lp_net.nodes[i]["successors_count"] = lp_net.out_degree(i)
        
        # nodes that have an influence on the VL
        if directed:
            if fromPredecessors:
                lp_net.nodes[i]["neigh"] = [x for x in lp_net.predecessors(i)]
            else:
                lp_net.nodes[i]["neigh"] = [x for x in lp_net.successors(i)]
        else:
            lp_net.nodes[i]["neigh"] = [x for x in lp_net.neighbors(i)]

    # these take a long time
    lp_net.graph['diameter'] = max([max(target.values()) for (source ,target) in nx.shortest_path_length(lp_net)])
    lp_net.graph['communities'] = unique_coms
    lp_net.graph['nodesCount'] = nx.number_of_nodes(lp_net)
    lp_net.graph['edgesCount'] = nx.number_of_edges(lp_net)
    lp_net.graph["centrality"] = nx.betweenness_centrality(lp_net)
    if directed:
        lp_net.graph["predecessor_propagation"] = fromPredecessors

    print("Finished composing network")

    return lp_net