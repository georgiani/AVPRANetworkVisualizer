import { Network } from "./Network";
import { NodeVLs } from "./VL";

export interface InfoBarProps {
    currentNode: number;
    nodesData: NodeVLs;
    network: Network;
    comsColors: any[];
    labelColors: any[];
}