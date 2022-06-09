import { zoom } from 'd3';

export function addZoomBehaviour(svg: any, name: string) {
    return zoom()
        .on("zoom", 
            (ev: any, d: any) => {
                svg
                    .selectAll(".zoomG" + name)
                        .attr("transform", ev.transform);
            }
    );
}