from LPA.network_simulation import run_simulation_on_network_from_files
from LPA.utils import retrieve, build_initial_network_from_files
from networkx.readwrite import json_graph as jg
from pathlib import Path

current_path = Path(__file__).parent.absolute()
data_path = current_path / "color-datas"
results_path = current_path / "color-results"

def get_colors_initial_network():
    graph = build_initial_network_from_files(data_path / "edges.csv", data_path / "labels.csv", data_path / "label_names.csv")
    return graph

def run_colors_example(lp_net, ts, trials):
    return run_simulation_on_network_from_files(
            lp_net = lp_net, 
            max_simulation_time = ts, 
            trials = trials, 
            dir = results_path)

def get_nodes_vl_at(timestamp, trial=0):
    for x in retrieve(results_path / ("results" + str(trial) + ".pickled")):
        # just to be safe
        #   format of results [[ts, [[...node1data], [...node2data], ...]],...]
        if x[0] == timestamp:
            return x[1]
