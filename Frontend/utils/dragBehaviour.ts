import { Simulation, SimulationNodeDatum, drag } from "d3";

export function addDragBehaviour(simulation: Simulation<SimulationNodeDatum, any>) {
    function dragstarted(ev: any, d: any) {
        if (!ev.active) simulation.alphaTarget(0.3).restart();
    }
    
    function dragged(ev: any, d: any) {
        d.x = ev.x;
        d.y = ev.y;
    }

    function dragended(ev: any, d: any) {
        if (!ev.active) simulation.alphaTarget(0);
    }

    return drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
}