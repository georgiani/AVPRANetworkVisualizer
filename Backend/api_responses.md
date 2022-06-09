# Custom Network API
- NR (Not Ready): Response given by the API when the requested resource is not yet loaded (for example when the simulation is still running).
- SE (Session Error): Response given by the API when a call that would need informations from the session can't find the neccessary info.
- IQ (Invalid Query): Response given by the API when a call has invalid arguments passed with it.

## fileSubmit
- FNF (File Not Found): Reponse given by the 'fileSubmit' call when the request didn't contain the neccessary file.
- TNF (Threshold Not Found): Response given by the 'fileSubmit' call when the request didn't contain the threshold value.
- INF (Iterations Not Found): Response given by the 'fileSubmit' call when the request didn't contain the number of iterations.
- FmNF (Formula Not Found): Response given by the 'fileSubmit' call when the request didn't contain the formula.
- IF (Invalid Files): Response given by the 'fileSubmit' call when the request didn't contain valid files.
- IT (Invalid Threshold): Response given by the 'fileSubmit' call when the request didn't contain a valid threshold value.
- II (Invalid Iterations): Response given by the 'fileSubmit' call when the request didn't contain a valid number of iterations.
- FNV (Filenames Not Valid): Response given by the 'fileSubmit' call when the request didn't contain valid file names.
- IFm (Invalid Formula): Response given by the 'fileSubmit' call when the request didn't contain valid formula.
- PNF (Predecessors Not Found): Response given by the 'fileSubmit' call when the request didn't contain the fromPredecessors value.
- DNF (Directed Not Found): Response given by the 'fileSubmit' call when the request didn't contain the directed value.