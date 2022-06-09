from copy import deepcopy
import csv
from threading import Thread
from custom_utils.file_cheks import allowed_file
from custom_utils.custom_folders import cleanup_personal_folders, get_new_data_folder
from LPA.network_simulation import run_simulation_on_network_from_files
from LPA.utils import build_initial_network_from_files, retrieve
from networkx.readwrite import json_graph as jg
from sympy.parsing.latex import parse_latex
from sympy.core.symbol import Symbol
from werkzeug.utils import secure_filename
from flask import copy_current_request_context, jsonify, request, send_file, session
from pathlib import Path
from scipy import spatial
import os, shutil
import json

MAX_USERS = 20
current_path = Path(__file__).parent.absolute()
custom_examples_path = current_path / "custom_examples"

def submit_custom_network_files():
    cleanup_personal_folders(custom_examples_path)
    print("Sessions cleaned")

    if 'edgesFile' not in request.files:
        return jsonify("FNF"), 400

    if 'vlFile' not in request.files:
        return jsonify("FNF"), 400

    if 'labelNamesFile' not in request.files:
        return jsonify("FNF"), 400

    if 'negThr' not in request.values:
        return jsonify("TNF"), 400

    if 'steps' not in request.values:
        return jsonify("INF"), 400
    
    if 'formula' not in request.values:
        return jsonify("FmNF"), 400

    if 'directed' not in request.values:
        return jsonify("DNF"), 400

    if 'fromPredecessors' not in request.values:
        return jsonify("PNF"), 400

    if request.files['edgesFile'].filename == '':
        return jsonify("IF"), 400

    if request.files['vlFile'].filename == '':
        return jsonify("IF"), 400

    if request.files['labelNamesFile'].filename == '':
        return jsonify("IF"), 400

    if not isinstance(float(request.values['negThr']), float):
        return jsonify("IT"), 400

    if not isinstance(int(request.values['steps']), int):
        return jsonify("II"), 400

    print("Args checked")

    if request.files['edgesFile'] and request.files['vlFile'] and request.files['labelNamesFile'] and allowed_file(request.files['edgesFile'].filename) and allowed_file(request.files['vlFile'].filename) and allowed_file(request.files['labelNamesFile'].filename):
        # everything is good so save the files on server so I 
        #   can check them further
        session['edges_filename'] = secure_filename(request.files['edgesFile'].filename)
        session['vl_filename'] = secure_filename(request.files['vlFile'].filename)
        session['label_names_filename'] = secure_filename(request.files['labelNamesFile'].filename)

        if 'labelsColorsFile' in request.files and request.files['labelsColorsFile'] and allowed_file(request.files['labelsColorsFile'].filename):
            session['colors_filename'] = secure_filename(request.files['labelsColorsFile'].filename)
        

        # folder doesn't exists, create it
        if not custom_examples_path.exists():
            os.mkdir(custom_examples_path)
        
        if 'data_folder' not in session:
            # new user, so create a new personal folder
            session['data_folder'] = get_new_data_folder(custom_examples_path, MAX_USERS)
            os.mkdir(custom_examples_path / session['data_folder'])
        else:
            # empty the already existing folder
            if (custom_examples_path / session['data_folder']).exists():
                shutil.rmtree(custom_examples_path / session['data_folder'])
            os.mkdir(custom_examples_path / session['data_folder'])

        # save the uploaded files to the user personal folder
        user_data_path = custom_examples_path / session['data_folder']
        request.files['edgesFile'].save(user_data_path / session['edges_filename'])
        request.files['vlFile'].save(user_data_path / session['vl_filename'])
        request.files['labelNamesFile'].save(user_data_path / session['label_names_filename'])
        if 'colors_filename' in session:
            request.files['labelsColorsFile'].save(user_data_path / session['colors_filename'])

        # TODO: retry using this
        # print("Checking regex")
        # if not file_content_check(user_data_path):
        #     shutil.rmtree(user_data_path)
        #     session.pop('data_folder')
        #     return json.dumps("Files formatted incorrectly!"), 400
        
        #print("Checked regex")

        # Number of iterations and threshold
        session['steps'] = int(request.values['steps'])
        session['negThr'] = float(request.values['negThr'])
        session['directed'] = True if request.values['directed'] == "true" else False
        session['fromPredecessors'] = True if request.values['fromPredecessors'] == "true" else False

        # Formula Checks and save
        if request.values['formula'] != "":
            k = Symbol("k") 
            if not parse_latex(request.values['formula']).has(k):
                return jsonify("IFm"), 400
            session['formula'] = request.values['formula']

        print("Files ok");

        @copy_current_request_context
        def simulation_run_main():
            simulation_run(session['data_folder'], \
                           session['edges_filename'], \
                           session['vl_filename'], \
                           session['label_names_filename'], \
                           session['steps'], \
                           session['negThr'], \
                           session['directed'], \
                           session['fromPredecessors'], \
                           session['colors_filename'] if 'colors_filename' in session else None)

        # run simulation on another thread so
        #   that the response can still be sent
        thread = Thread(target=simulation_run_main)
        thread.start()

        return jsonify("OK"), 200
    return jsonify("FNV"), 400


def simulation_run(data_folder, \
                   edges_filename, \
                   vl_filename, \
                   label_names_filename, \
                   steps, \
                   negThr, \
                   directed, \
                   fromPredecessors, \
                   colors_filename = None):
    user_data_path = custom_examples_path / data_folder

    # Build network from files
    lp_net = build_initial_network_from_files(user_data_path / edges_filename, \
                                                user_data_path / vl_filename, \
                                                user_data_path / label_names_filename,
                                                directed,
                                                fromPredecessors)


    # Run the simulation with the built network
    result_network = run_simulation_on_network_from_files(
            lp_net = deepcopy(lp_net), 
            max_simulation_time = steps, 
            trials = 1, 
            dir = user_data_path / "results",
            custom = True,
            negThr = negThr,
            directed = directed,
            fromPredecessors = fromPredecessors)

    lp_net.graph['timestamps'] = steps
    lp_net.graph['finalTs'] = result_network['finalTs']

    if colors_filename != None:
        with open(user_data_path / colors_filename) as f:
            csv_reader = csv.reader(f, delimiter=';')
            colors = [x.lstrip() for x in list(csv_reader)[0]]
            lp_net.graph['labelColors'] = colors

    # Eliminate initial VL state since
    #   /api/v1/getNodesInfo?t=0 exists
    for i in lp_net.nodes:
        for label in lp_net.graph['labels']:
            lp_net.nodes[i].pop(label)


    # Cache the network to file in order to not rerun the simulation
    #   or the building
    with open(user_data_path / "graphtmp", "w") as cg:
        cg.write(json.dumps(jg.node_link_data(lp_net)))

    os.replace(user_data_path / "graphtmp", user_data_path / "graph")

def get_custom_graph():
    if 'data_folder' in session:
        user_folder_path = custom_examples_path / session['data_folder']

        # if the network is already cached then don't
        #   repeat the simulation
        # no files were submitted, so no graph is cached
        if not (user_folder_path / "graph").exists():
            return jsonify("NR"), 200

        # if graph is cached, return the cached one
        if (user_folder_path / "graph").exists():
            with open(user_folder_path / "graph", "r") as f:
                return jsonify(json.loads(f.read())), 200

        # is the results folder is nonexistent
        #   that means that the simulation is not ready
        if not (user_folder_path / "results").exists():
            return jsonify("NR"), 200
                        
    return jsonify('SE'), 500

def get_nodes_vl_at(timestamp, results_path, trial=0):
    for x in retrieve(results_path / ("results" + str(trial) + ".pickled")):
        if x[0] == timestamp:
            return x[1]

def get_custom_results_file():
    if 'data_folder' in session:
        user_folder_path = custom_examples_path / session['data_folder']
        results_path = user_folder_path / "results"

        if not results_path.exists():
            return jsonify("NR"), 200
        
        return send_file(results_path / "results0.pickled", download_name="results_export.pickled", as_attachment=True), 200
    
    return jsonify("SE"), 500

def get_custom_graph_file():
    if 'data_folder' in session:
        user_folder_path = custom_examples_path / session['data_folder']
        
        return send_file(user_folder_path / "graph", mimetype="application/json", download_name="graph_export.json", as_attachment=True), 200
    
    return jsonify("SE"), 500

def get_custom_nodes_info():
    if 'data_folder' in session:
        user_folder_path = custom_examples_path / session['data_folder']
        results_path = user_folder_path / "results"

        if not results_path.exists():
            return jsonify("NR"), 200

        if "t" in request.args:
            time_step = request.args.get("t")

            if time_step == '' or int(time_step) < 0:
                return jsonify("IQ"), 400

            return jsonify(get_nodes_vl_at(int(time_step), results_path)), 200
        
        return jsonify(get_nodes_vl_at(0, results_path)), 200

    return jsonify("SE"), 500

def compare_nodes_custom():
    if 'data_folder' in session:
        user_folder_path = custom_examples_path / session['data_folder']
        results_path = user_folder_path / "results"

        if not results_path.exists():
            return jsonify("NR"), 200

        if 'n1' not in request.args:
            return jsonify("IQ"), 400
        
        if 'n2' not in request.args:
            return jsonify("IQ"), 400

        if 't' not in request.args:
            return jsonify("IQ"), 400

        n1 = int(request.args.get("n1"))
        n2 = int(request.args.get("n2"))
        t = int(request.args.get("t"))

        data = {}
        with open(user_folder_path / "graph") as g:
            lp_net = jg.node_link_graph(json.load(g))
            data["node1"] = lp_net.nodes[n1]
            data["node1"]["id"] = n1
            data["node2"] = lp_net.nodes[n2]
            data["node2"]["id"] = n2
        
        nodesData = get_nodes_vl_at(t, results_path)
        data["node1"]["VL"] = nodesData[n1 - 1]
        data["node2"]["VL"] = nodesData[n2 - 1]
        data["cosineSimilarity"] = 1 - spatial.distance.cosine(data["node1"]["VL"], data["node1"]["VL"])
        
        data["timestamp"] = t

        data["node1"]["betweenness_centrality"] = lp_net.graph["centrality"][str(n1)]
        data["node2"]["betweenness_centrality"] = lp_net.graph["centrality"][str(n2)]

        with open(user_folder_path / ("comparison_" + str(n1) + "_" + str(n2)), "w") as cmp:
            cmp.write(json.dumps(data))

        return send_file(user_folder_path / ("comparison_" + str(n1) + "_" + str(n2)), mimetype="application/json", download_name=("comparison_" + str(n1) + "_" + str(n2) + "_" + str(t) + ".json"), as_attachment=True), 200        

    return jsonify("SE"), 500