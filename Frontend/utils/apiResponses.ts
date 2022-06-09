
const responses: Map<string, string> = new Map([
    ["NR", "Not Ready"],
    ["SE", "Session Error"],
    ["IQ", "Invalid Query"],
    ["FNF", "File Not Found"],
    ["TNF", "Threshold Not Found"],
    ["INF", "Iterations Not Found"],
    ["FmNF", "Formula Not Found"],
    ["IF", "Invalid Files"],
    ["IT", "Invalid Threshold"],
    ["II", "Invalid Iterations"],
    ["FNV", "Filenames Not Valid"],
    ["IFm", "Invalid Formula"]
]);

export default function resTranslation(r: string): any {
    if (responses.has(r))
        return responses.get(r);
    return "Unknown problem";
}