type NetworkData = {
    labels: Array<string>;
    diameter: number;
    timestamps: number;
    finalTs: number;
    centrality: number;
    nodesCount: number;
    edgesCount: number;
    communities: number;
    predecessor_propagation: boolean;
    labelColors?: any[];
}

export type NetworkLink = {
    source: number;
    target: number;
}

export type Node = {
    community: number;
    degree: number;
    predecessors_count?: number;
    successors_count?: number;
    id: number;
    neigh: Array<number>;
}

export interface Network {
    directed: boolean;
    graph: NetworkData;
    links: Array<NetworkLink>;
    multigraph: boolean;
    nodes: Array<Node>;
}