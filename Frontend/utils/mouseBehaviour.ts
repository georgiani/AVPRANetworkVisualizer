export function addMouseBehaviour(nodesGroup: any, linksGroup: any, selectNodeFn: (node: number) => void) {
    nodesGroup
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("click", handleMouseClick);

    function handleMouseOver(ev: any, d: any) {
        linkHighlight(d);
    }

    function handleMouseOut(ev: any, d: any) {
        linkDeHighlight(d);
    }

    function handleMouseClick(ev: any, d: any) {
        if(ev.defaultPrevented) return;
        selectNodeFn(d.id);
    }

    function linkHighlight(data: any) {
        // for successors (the node data is the source)
        // linksGroup
        //     .filter((d: any) => d.source === data)
        //     .raise()
        //     .select("line")
        //         .classed("link-neutral", false)
        //         .classed("link-active", true);

        // for predecessors (the node data is the target)
        linksGroup
            .filter((d: any) => (d.target === data && data.neigh.includes(d.source.id)) || (d.source === data && data.neigh.includes(d.target.id)))
            .raise()
            .select("line")
                .classed("link-neutral", false)
                .classed("link-active", true);

        // // raise nodes over links
        // nodesGroup
        //     .raise();

        // hide not connected nodes
        // nodesGroup
        //     .filter((d: any) => d.id != data.id && !data.neigh.includes(d.id))
        //         .style("opacity", 0.1);


        // hide not connected links
        // linksGroup
        //     .filter((d: any) => d.source != data && d.target != data)
        //     .select("line")
        //         .style("opacity", 0.1);
        
        // highlight only the nodes
        // that influence the VL
        nodesGroup
            .filter((d: any) => data.neigh.includes(d.id))
                .raise()    
                .select("circle")
                    .classed("node-neutral", false)
                    .classed("node-neighbour", true)
        
        nodesGroup
            .filter((d: any) => d.id === data.id)
            .raise();
    }

    function linkDeHighlight(data: any) {
        // for successors (node data is the source)
        // linksGroup
        //     .filter((d: any) => d.source === data)
        //     .select("line")
        //         .classed("link-neutral", true)
        //         .classed("link-active", false);

        // for predecessors (node data is the target)
        linksGroup
            .filter((d: any) => (d.target === data && data.neigh.includes(d.source.id)) || (d.source === data && data.neigh.includes(d.target.id)))
            .select("line")
                .classed("link-neutral", true)
                .classed("link-active", false);

        nodesGroup
            .filter((d: any) =>  d.id === data.id || data.neigh.includes(d.id))
                .select("circle")
                    .classed("node-neutral", true)
                    .classed("node-neighbour", false);

        nodesGroup
            .raise();
        // nodesGroup
        //     .style("opacity", 1.0);

        // linksGroup
        //     .select("line")
        //         .style("opacity", 1.0);
    }
}