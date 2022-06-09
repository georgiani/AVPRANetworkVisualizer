from colors_example.colors_example_main import get_nodes_vl_at, get_colors_initial_network, run_colors_example
from networkx.readwrite import json_graph as jg
from copy import deepcopy
from pathlib import Path
from flask import jsonify, request, send_file
from scipy import spatial
import networkx as nx
import json

current_path = Path(__file__).parent.absolute()
colors_examples_path = current_path / "colors_example"
results_path = colors_examples_path / "color-results"

def get_color_example_graph(ts=40):
    if (results_path / "graph").exists():
        with open(results_path / "graph", "r") as f:
                return json.loads(f.read()), 200

    # build network but with already existing color
    #   static files
    lp_net = get_colors_initial_network()

    # add termination threshold with slider
    result_network = run_colors_example(deepcopy(lp_net), ts, 1)
    lp_net.graph['timestamps'] = ts
    lp_net.graph['finalTs'] = result_network['finalTs']

    for i in lp_net.nodes:
            for label in lp_net.graph['labels']:
                lp_net.nodes[i].pop(label)

    g = json.dumps(jg.node_link_data(lp_net))
    with open(results_path / "graph", "w") as cg:
            cg.write(g)

    return jsonify(jg.node_link_data(lp_net)), 200


def get_color_example_nodes_info():
    if "t" in request.args:
        time_step = request.args.get("t")

        if time_step == '' or int(time_step) < 0:
            return jsonify("IQ"), 400
        
        return jsonify(get_nodes_vl_at(int(time_step))), 200
    
    return jsonify(get_nodes_vl_at(0)), 200

def get_colors_results_file():
    return send_file(results_path / "results0.pickled", download_name="results_export.pickled", as_attachment=True), 200


def get_colors_graph_file():
    return send_file(results_path / "graph", mimetype="application/json", download_name="graph_export.json", as_attachment=True), 200


def compare_nodes_colors():
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
    with open(results_path / "graph") as g:
        lp_net = jg.node_link_graph(json.load(g))
        data["node1"] = lp_net.nodes[n1]
        data["node1"]["id"] = n1
        data["node2"] = lp_net.nodes[n2]
        data["node2"]["id"] = n2
    
    nodesData = get_nodes_vl_at(t)
    data["node1"]["VL"] = nodesData[n1 - 1]
    data["node2"]["VL"] = nodesData[n2 - 1]
    data["cosineSimilarity"] = 1 - spatial.distance.cosine(data["node1"]["VL"], data["node1"]["VL"])
    
    data["timestamp"] = t

    data["node1"]["betweenness_centrality"] = lp_net.graph["centrality"][str(n1)]
    data["node2"]["betweenness_centrality"] = lp_net.graph["centrality"][str(n2)]

    with open(results_path / ("comparison_" + str(n1) + "_" + str(n2)), "w") as cmp:
        cmp.write(json.dumps(data))

    return send_file(results_path / ("comparison_" + str(n1) + "_" + str(n2)), mimetype="application/json", download_name=("comparison_" + str(n1) + "_" + str(n2) + "_" + str(t) + ".json"), as_attachment=True), 200 