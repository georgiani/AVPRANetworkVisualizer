import * as d3 from 'd3';
import { useEffect, useState } from 'react';
import { Network } from '../../types/Network';
import { addDragBehaviour } from '../../utils/dragBehaviour';
import { addZoomBehaviour } from '../../utils/zoomBehaviour';
import { addMouseBehaviour } from '../../utils/mouseBehaviour';
import { VectorLabelGraphProps } from '../../types/Graph';
import { DefaultNodeVLsVal } from '../../types/VL';
import { SimulationNodeDatum } from 'd3';
import { nodeFind } from '../../utils/nodeFind';

function buildNetwork(name: string, network: Network) {
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
            if (l.source.community === l.target.community) return 0.8;
            return 0.1;
          })
      )
      .force("charge" + name, d3.forceManyBody().strength(-100))
      .force("center" + name, d3.forceCenter(100, 100))
      .on("tick", ticked);
        
    // select inner svg
    var svg: any = d3
        .select(`#${name}`)
            .select("svg");

    // create if not exists
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
            .attr("key", (d: any) => `l_${name}_${d.source.id}_${d.target.id}`)
            .attr("id", (d: any) => `line_${name}_${d.source.id}_${d.target.id}`)
            .classed("link-neutral", true);

    // draw circle on every node in in the nodes group
    var circles = nodesGroup
        .append("circle")
            .attr("key", (d: any) => `c_${name}_${d.id}`)
            .attr("id", (d: any) => `circle_${name}_${d.id}`)
            .classed("node-neutral", true) // initial state
            .attr("r", 10) // radius
            .attr("fill", (d: any) => "url(#grad" + d.id + ")"); // fill with gradient

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
        simulation.tick(5);
          
        lines
            .attr("x1", (d: any) => d.source.x)
            .attr("y1", (d: any) => d.source.y)
            .attr("x2", (d: any) => d.target.x)
            .attr("y2", (d: any) => d.target.y);  

        nodesGroup
          .attr("transform", (d: any) => `translate(${d.x}, ${d.y})`);
    }

    return [nodesGroup, linksGroup];
}

export default function VectorLabelGraph({
  name,
  selectNodeFn,
  network,
  selectedNode,
  nodesData,
  colors,
  showIds,
  secondSelectedNode
}: VectorLabelGraphProps) {
  const [nodesGroup, setNodesGroup] = useState<any>();
  const [linksGroup, setLinksGroup] = useState<any>();

  // build network on load
  useEffect(() => {
    // make copy because d3 uses modifies the network
    // object, so the node positions is
    // shared amongst other graphs
    const networkCopy = JSON.parse(JSON.stringify(network));

    const [nodesTemp, linksTemp] = buildNetwork(name, networkCopy);

    setNodesGroup(nodesTemp);
    setLinksGroup(linksTemp);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  // when the current selection for the node (node 1 or node 2)
  // changes, then the mouse behaviour needs to change accordingly
  useEffect(() => {
    var svg: any = d3.select(`#${name}`).select("svg");

    if (nodesGroup && linksGroup)
      addMouseBehaviour(nodesGroup, linksGroup, selectNodeFn);

    // click outside nodes to deselect node
    svg.on("click", (ev: any) => {
      if (ev.target.tagName === "svg") selectNodeFn(-1);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectNodeFn, nodesGroup, linksGroup]);

  // if the showIds option changes
  //  then activate the visibility on the ids
  useEffect(() => {
    var textGroup = d3.select(`#${name}`).selectAll(".node").select("text");
    if (showIds) textGroup.attr("visibility", "visible");
    else textGroup.attr("visibility", "hidden");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showIds]);

  // if the first selected node changes, change selection
  // circle around the node
  useEffect(() => {
    var nodesGroup = d3.select(`#${name}`).selectAll(".node");

    // deselect all
    nodesGroup
      .filter((d: any) => d.id != secondSelectedNode)
      .select("circle")
      .classed("node-neutral", true)
      .classed("node-active", false);

    if (selectedNode != -1) {
      // select the correct one
      nodesGroup
        .filter((dt: any) => dt.id === selectedNode)
        .raise()
        .select("circle")
        .classed("node-neutral", false)
        .classed("node-active", true);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNode]);

  useEffect(() => {
    var nodesGroup = d3.select(`#${name}`).selectAll(".node");

    // deselect all
    nodesGroup
      .filter((d: any) => d.id != selectedNode)
      .select("circle")
      .classed("node-neutral", true)
      .classed("node-active", false);

    if (secondSelectedNode != -1) {
      // raise the correct one and style the circle of the node
      nodesGroup
        .filter((dt: any) => dt.id === secondSelectedNode)
        .raise()
        .select("circle")
        .classed("node-neutral", false)
        .classed("node-active", true);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondSelectedNode]);

  // if timestamp changes -> data changes -> gradients change
  useEffect(() => {
    // if data has not yet loaded, don't touch
    // the gradients
    if (nodesData === DefaultNodeVLsVal) return;

    const labels = network.graph["labels"];

    nodesGroup.each((d: any) => {
      const thisNodeSelection = nodesGroup.filter((dt: any) => d.id === dt.id);
      const thisNode = nodeFind(network, d.id);

      // if there isn't already a defs tag, add it
      if (thisNodeSelection.select("defs").empty())
        thisNodeSelection.append("defs");

      // if there isn't already a linear gradient definition, add it
      if (thisNodeSelection.select("defs").select("linearGradient").empty())
        thisNodeSelection
          .select("defs")
          .append("linearGradient")
          .attr("id", "grad" + thisNode.id)
          .attr("x1", "0%")
          .attr("x2", "100%")
          .attr("y1", "0%")
          .attr("y2", "0%");

      const grad = thisNodeSelection.select("defs").select("linearGradient");

      // go through every label and build the gradient
      //  with respect to the belonging coefficient
      // stop_i_1 is where the colors[i] color begins and stop_i_2 is where
      //  the colors[i] color ends
      labels.reduce((stop: number, el: string, i: number) => {
        if (grad.select(`.stop_${i}_1`).empty()) {
          grad
            .append("stop")
            .classed(`stop_${i}_1`, true)
            .attr("offset", stop.toString() + "%")
            .style("stop-color", colors[i]);

          stop += nodesData[thisNode.id - 1][i] * 100;
          grad
            .append("stop")
            .classed(`stop_${i}_2`, true)
            .attr("offset", stop.toString() + "%")
            .style("stop-color", colors[i]);

          return stop;
        }

        grad
          .select(`.stop_${i}_1`)
          .attr("offset", stop.toString() + "%")
          .style("stop-color", colors[i]);

        stop += nodesData[thisNode.id - 1][i] * 100;
        grad
          .select(`.stop_${i}_2`)
          .attr("offset", stop.toString() + "%")
          .style("stop-color", colors[i]);

        return stop;
      }, 0);
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodesData, network]);

  return (
    <div className="flex-col w-full h-full">
      <div id={name} className="container w-full p-1 h-[97%]"></div>
      <p className="text-white font-bold h-[2%] p-1">VL View</p>
    </div>
  );
}