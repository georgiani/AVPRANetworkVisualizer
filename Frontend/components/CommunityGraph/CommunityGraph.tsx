import * as d3 from 'd3';
import { SimulationNodeDatum } from 'd3';
import { useEffect, useState } from "react";
import { CommunityGraphProps } from "../../types/Graph";
import { Network, NetworkLink } from "../../types/Network";
import { addDragBehaviour } from '../../utils/dragBehaviour';
import { nodeFind } from '../../utils/nodeFind';
import { addZoomBehaviour } from "../../utils/zoomBehaviour";

function buildNetwork(name: string, network: Network, pallete: chroma.Color[]) {
    
    // instantiate a d3 force simulation graph
    var simulation = d3
      .forceSimulation([...network.nodes] as SimulationNodeDatum[])
      .force(
        "link" + name,
        d3
          .forceLink()
          .id((d: any) => d.id)
          .links(network.links)
          .strength((l: any) => {
            // if one edge links 2 nodes from the same community
            // then the attraction strength would be bigger
            if ((l.source.community === l.target.community) && l.source.id != l.target.id) return 0.8;
            return 0.1;
          })
      )
      .force("charge" + name, d3.forceManyBody().strength(-100))
      .force("center" + name, d3.forceCenter(100, 100))
      .on("tick", ticked);
        
    // select inner svg (from the div of this graph)
    var svg: any = d3
        .select(`#${name}`)
            .select("svg");

    // create svg if not exists
    if (svg.empty()) {
        svg = d3
            .select(`#${name}`)
            .append("svg")
                .attr("id", "svg" + name)
                .attr("viewBox", [0, 0, 200, 200])
                .attr("preserveAspectRatio", "xMinYMin")
                .classed("border-2", true)
                .classed("border-slate-800", true)
                .classed("rounded-md", true) 
                .classed("h-full w-full", true);
    }

    var zoomGroup = svg
        .append("g")
            .classed("zoomG" + name, true);

    // add links to zoom group
    var linksGroup = zoomGroup
      .selectAll(".link")
      .data([...network.links])
      .enter()
      .append("g")
        .attr("key", (d: any) => `lnk_${name}_${d.source.id}_${d.target.id}`)
        .attr("id", (d: any) => `link_${name}_${d.source.id}_${d.target.id}`)
        .classed("link", true);

    // add nodes to zoom group
    var nodesGroup = zoomGroup
      .selectAll(".node")
      .data([...network.nodes])
      .enter()
      .append("g")
        .attr("key", (d: any) => `n_${name}_${d.id}`)
        .attr("id", (d: any) => `node_${name}_${d.id}`)
        .classed("node", true);


    // draw lines on every link in the links group
    var lines = linksGroup
      .append("line")
        .classed("link-neutral", true)
        .attr("key", (d: any) => `l_${name}_${d.source.id}_${d.target.id}`)
        .attr("id", (d: any) => `line_${name}_${d.source.id}_${d.target.id}`)
        .style("stroke", (d: any) => {
            // draw the edges in the color of the community
            //  if it links two nodes from the same community
            if (d.source.community === d.target.community) {
                return pallete[d.source.community].hex();
            }
        });

    // draw circle on every node in in the nodes group
    var circles = nodesGroup
      .append("circle")
        .attr("key", (d: any) => `c_${name}_${d.id}`)
        .attr("id", (d: any) => `circle_${name}_${d.id}`)
        .classed("node-neutral", true) // initial state
        .attr("r", 10) // radius
        .attr("fill", (d: any) =>
            pallete[nodeFind(network, d.id).community].hex()
        );

    
    var texts = nodesGroup
      .append("text")
      .text((d: any) => d.id)
        .attr("dx", "-5")
        .attr("dy", ".35em")
        .attr("font-size", ".5em")
        .attr("fill", "black")
        .attr("stroke", "black")
        .attr("visibility", "hidden");

    svg.call(addZoomBehaviour(svg, name));
    nodesGroup.call(addDragBehaviour(simulation));

    function ticked() {
        // faster convergence
        simulation.tick(5);

        lines
            .attr("x1", (d: any) => d.source.x)
            .attr("y1", (d: any) => d.source.y)
            .attr("x2", (d: any) => d.target.x)
            .attr("y2", (d: any) => d.target.y);

        nodesGroup.attr("transform", (d: any) => `translate(${d.x}, ${d.y})`);
    }

    return nodesGroup;
}

export default function CommunityGraph({
  name,
  network,
  selectedNode,
  colors,
  showIds,
  secondSelectedNode
}: CommunityGraphProps) {
  const [nodesGroup, setNodesGroup] = useState<any>();

  // build network on load
  useEffect(() => {
    // making a deep copy of the network
    const networkCopy = JSON.parse(JSON.stringify(network));

    // after the network is built, it returns the selection of nodes
    //   that can be cached like I do here, for later use
    const nodesTemp = buildNetwork(name, networkCopy, colors);

    // saving the nodes selection
    setNodesGroup(nodesTemp);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, name]);

  // if the showIds option changes
  //  then activate the visibility on the ids
  useEffect(() => {
    var textGroup = d3.select(`#${name}`).selectAll(".node").select("text");
    if (showIds) textGroup.attr("visibility", "visible");
    else textGroup.attr("visibility", "hidden");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showIds]);

  // if first selected node changes, change selection
  //  circle around the node
  useEffect(() => {
    // if network is not yet loaded, do not run this
    if (!nodesGroup) return;

    // deselect all nodes besides the second selected one
    nodesGroup
      .filter((d: any) => d.id != secondSelectedNode)
      .select("circle")
      .classed("node-neutral", true)
      .classed("node-active-comm", false);

    // if the user did not deselect by clicking outside
    //  the graph
    if (selectedNode != -1) {
      // select the correct node and activate the circle
      nodesGroup
        .filter((dt: any) => dt.id === selectedNode)
        .raise()
        .select("circle")
        .classed("node-neutral", false)
        .classed("node-active-comm", true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNode, nodesGroup]);

  // if second selected node changes, change selection
  //  circle around the node
  useEffect(() => {
    // if network is not yet loaded, do not run this
    if (!nodesGroup) return;

    // deselect all besides the first selected node
    nodesGroup
      .filter((d: any) => d.id != selectedNode)
      .select("circle")
      .classed("node-neutral", true)
      .classed("node-active-comm", false);

    // if the user did not deselect by clicking outside
    //  the graph
    if (secondSelectedNode != -1) {
      // select the correct node and activate the circle
      nodesGroup
        .filter((dt: any) => dt.id === secondSelectedNode)
        .raise()
        .select("circle")
        .classed("node-neutral", false)
        .classed("node-active-comm", true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondSelectedNode, nodesGroup]);

  return (
    <div className="flex-col w-full h-full">
      <div id={name} className="container w-full p-1 h-[97%]"></div>
      <p className="text-white font-bold h-[2%] p-1">Community View</p>
    </div>
  );
}