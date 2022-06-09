import { InfoBarProps } from '../../types/InfoBar';
import { Network, Node } from '../../types/Network';
import { NodeVLs } from '../../types/VL';
import { nodeFind } from '../../utils/nodeFind';

function buildInformationsList(nodesData: NodeVLs, currentNode: number, comsColors: any[], labelColors: any[], network: Network) {
    
    // no selected node
    if (currentNode === -1) {
        return (
            <div>
                <p className="font-mono text-xl text-white font-bold">Network Info</p>
                <div>
                    <p className="font-mono text-sm text-white font-bold">Type of network: {network.directed ? "Directed" : "Undirected"}</p>
                    {network.directed && <p className="font-mono text-sm text-white font-bold">Propagation Type: {network.graph.predecessor_propagation ? "From Predecessors" : "From Successors"}</p>}
                    <p className="font-mono text-sm text-white font-bold">Number of nodes: {network.graph.nodesCount}</p>
                    <p className="font-mono text-sm text-white font-bold">Number of edges: {network.graph.edgesCount}</p>
                    <p className="font-mono text-sm text-white font-bold">Diameter: {network.graph.diameter}</p>
                </div>
            </div>
        );
    }
    
    const thisNode: Node = nodeFind(network, currentNode);    
    // a node is selected
    return (
        <div className="px-5">
            <h1 className="font-mono text-xl text-white font-bold">
                Selected Node: <span id="ib-selected-node">{currentNode}</span>
            </h1>
            <div className="font-mono text-white font-bold">
                <h2 className="text-lg">Properties</h2>
                <div className="text-sm">
                    {
                        network.directed ? 
                        <>
                            <div>In Degree: {thisNode.predecessors_count}</div>
                            <div>Out Degree: {thisNode.successors_count}</div>
                        </> : 
                        <div>Degree: {thisNode.degree}</div>
                    }
                    <div>Community: <span style={{color: comsColors[thisNode.community].hex()}}> ■</span> {thisNode.community}</div>
                </div>
                <br/>
                <h2 className="text-lg">Vector Label</h2>
                {
                    // labels details
                    nodesData[currentNode - 1].map((el, i) => 
                        (
                            <div key={`div${el}${i}`}> 
                                {network.graph.labels[i]} 
                                <span key={`span${el}${i}`} style={{color: labelColors[i]}}> ■</span> 
                                {": " + el} 
                            </div>
                        )
                    )
                }
            </div>
        </div>
    );
}

export default function InfoBar({currentNode, nodesData, network, comsColors, labelColors}: InfoBarProps) {
    return (
      <div id="info-bar" className="flex flex-col h-full overflow-y-auto py-6">     
        {buildInformationsList(nodesData, currentNode, comsColors, labelColors, network)}
      </div>
    );
}