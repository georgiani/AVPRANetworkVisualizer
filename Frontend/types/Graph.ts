import { AnyMxRecord } from "dns";
import { Network } from "./Network";
import { NodeVLs } from "./VL";

export interface VectorLabelGraphProps {
    name: string;
    selectNodeFn: (node: number) => void;
    network: Network;
    selectedNode: number;
    nodesData: NodeVLs;
    colors: any[],
    showIds: boolean;
    secondSelectedNode: number;
}

export interface CommunityGraphProps {
    name: string;
    network: Network;
    selectedNode: number;
    colors: any[];
    showIds: boolean;
    secondSelectedNode: number;
}