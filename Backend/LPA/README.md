# LPA_repo

INSTRUCTIONS:

1) Create a .csv file with edgelist of a network with the following format:<br />
    nodename1 nodename2 {weight}<br />
    ...<br />
    e.g.<br />
    1 2 {5}<br />
    1 3 {2}<br />
    Characterizes two edges: one from node 1 to node 2 with weight 5, one from node 1 to node 3 with weight 2<br />
    nodename1 nodename2 {} if the edge is not weighted<br />
    

2) Create a .csv file with label names with the following format:<br />
    label1; label2; label3; ...<br />
    e.g.<br />
    Red; Yellow; Green
    

3) Create a .csv file with VL's values with the following format:<br />
    b<sub>k</sub>(l<sub>0</sub>); b<sub>k</sub>(l<sub>1</sub>); b<sub>k</sub>(l<sub>2</sub>)..., one VL per row. <br />
    b<sub>x</sub>(l<sub>k</sub>) = VL<sub>x</sub>[l<sub>k</sub>] = belonging coefficient of the label l<sub>k</sub> for agent x at start<br />
    e.g. <br />
    0.25; 0; 0.5; 0.05; 0.2<br/>
    0; 0; 0; 0; 1
    
4) Execute Main_LPA.py with 3 command line arguments:<br/>
    1) path of the file containing the labels name<br />
    2) path of the file containing VLs values<br />
    3) path of the file containing the edgelist of the network
   
----------
REQUIREMENTS
1) Python 2.7

2) SimPy 2.3.1

3) Networkx 2.2

4) Numpy
