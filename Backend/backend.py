from colors_api import get_color_example_graph, get_color_example_nodes_info, get_colors_results_file, get_colors_graph_file, compare_nodes_colors
from custom_api import submit_custom_network_files, get_custom_graph, get_custom_nodes_info, get_custom_results_file, get_custom_graph_file, compare_nodes_custom
from flask_cors import CORS, cross_origin
from flask import Flask, session
from datetime import timedelta
import secrets

app = Flask(__name__)
app.secret_key = secrets.token_urlsafe(16)
cors = CORS(app)

@app.before_first_request
def make_session_permanent():
    # configuration
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['CORS_HEADERS'] = 'Content-Type'
    session.permanent = True
    app.permanent_session_lifetime = timedelta(hours=1)
    
# custom network endpoints
@app.route("/api/v1/custom/fileSubmit", methods = ["POST"])
@cross_origin()
def custom_file_submit():
    return submit_custom_network_files()

@app.route("/api/v1/custom/getGraph", methods = ["GET"])
@cross_origin()
def custom_get_graph():
    """
        Refer to /api/v1/colorExample/getGraph.
        Same type of response but made for the
        custom network.
    """
    return get_custom_graph()

@app.route("/api/v1/custom/getNodesInfo", methods = ["GET"])
@cross_origin()
def custom_get_nodes_info():
    """
        Refer to /api/v1/colorExample/getNodesInfo.
        Same type of response but made for the
        custom network.
    """
    return get_custom_nodes_info()

@app.route("/api/v1/custom/downloadCompleteResults", methods = ["GET"])
@cross_origin()
def custom_get_complete_results_file():
    """
        Returns the whole results file in case a more
        experienced user wants to use the file
        differently.
    """
    return get_custom_results_file()

@app.route("/api/v1/custom/downloadGraphDetails", methods = ["GET"])
@cross_origin()
def custom_get_graph_details_file():
    return get_custom_graph_file()


@app.route("/api/v1/custom/compareNodes", methods = ["GET"])
@cross_origin()
def custom_compare_nodes():
    return compare_nodes_custom()

# colors example endpoints
@app.route("/api/v1/colorExample/getGraph", methods = ["GET"])
@cross_origin()
def colors_get_graph():
    """
        Respond with the necessary info for building a graph,
        such as nodes ids (to later refer to the getNodesInfo method),
        various nodes measures, edges...
    """
    return get_color_example_graph()

@app.route("/api/v1/colorExample/getNodesInfo", methods = ["GET"])
@cross_origin()
def colors_get_nodes_info():
    """
       Respond with the VLs of the nodes at the timestamp
       passed as an argument. If the timestamp is missing,
       the response will be the VLs at timestamp 0.

       Reponse format:
       r = [[b(l1), b(l2), ...], [...], ...]
       where r[i] is the VL of the node (i + 1) (nodes indexed from 1)
       and r[i][j] is the belonging coefficient of the jth label for the
       (i + 1) node.
    """
    return get_color_example_nodes_info()

@app.route("/api/v1/colorExample/downloadCompleteResults", methods = ["GET"])
@cross_origin()
def colors_get_complete_results_file():
    """
        Returns the whole results file in case a more
        experienced user wants to use the file
        differently.
    """
    return get_colors_results_file()

@app.route("/api/v1/colorExample/downloadGraphDetails", methods = ["GET"])
@cross_origin()
def colors_get_graph_details_file():
    return get_colors_graph_file()


@app.route("/api/v1/colorExample/compareNodes", methods = ["GET"])
@cross_origin()
def colors_compare_nodes():
    return compare_nodes_colors()

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)