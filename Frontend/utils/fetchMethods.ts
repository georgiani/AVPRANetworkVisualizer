import { Network } from "../types/Network";
import { NodeVLs } from "../types/VL";

export async function fetchGraph(baseUrl: string): Promise<Network> {
    const res = await fetch(baseUrl + "/getGraph");
    const data = await res.json();
    return data;
}

export async function fetchGraphFile(baseUrl: string): Promise<any> {
    const res = await fetch(baseUrl + "/downloadGraphDetails");
    const data = await res.json();
    return data;
}

export async function fetchCompleteResultsFile(baseUrl: string): Promise<any> {
    const res = await fetch(baseUrl + "/downloadCompleteResults");
    const data = await res.json();
    return data;
}

export async function fetchNodesData(baseUrl: string, timestamp: number): Promise<NodeVLs> {
    const res = await fetch(baseUrl + `/getNodesInfo?t=${timestamp}`);
    const data = await res.json();
    return data;
}

export async function submitFiles(data: FormData): Promise<any> {
    const res = await fetch("/api/v1/custom/fileSubmit", {
        method: 'POST',
        body: data
    });
    const json = await res.json();
    return json;
}
