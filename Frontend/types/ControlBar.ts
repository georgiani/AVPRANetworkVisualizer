import { Network } from "./Network";

export interface ControlBarProps {
    nextFn: () => void;
    previousFn: () => void;
    toggleComs: () => void;
    toggleInfo: () => void;
    toggleIds: () => void;
    toggleVLs: () => void;
    currentTimestamp: number;
    fileFetchBaseUrl: string;
    network: Network;
    switchCurrentlySelecting: () => void;
    selectedNode: number;
    secondSelectedNode: number;
    nodeSelectionFn: (node: number) => void;
    screenshotRef: any;
}