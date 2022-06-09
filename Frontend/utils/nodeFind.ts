import { Network, Node } from "../types/Network";

export function nodeFind(network: Network, id: number): Node {
    return network.nodes.filter((nd) => nd.id === id)[0];
}