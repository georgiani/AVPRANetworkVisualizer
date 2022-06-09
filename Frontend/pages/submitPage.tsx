/* eslint-disable @next/next/no-css-tags */
import { useState, Dispatch, SetStateAction, useRef, useEffect } from "react";
import { submitFiles } from "../utils/fetchMethods";
import { NextRouter, useRouter } from "next/router";
import katex from 'katex';
import Head from "next/head";
import apiResponses from "../utils/apiResponses";
import ToggleSwitch from "../components/ToggleSwitch";
import Rive from "rive-react";

async function handleSubmit(
  event: any,
  selectedEdgesFile: any,
  selectedVLFile: any,
  selectedLabelNamesFile: any,
  negThr: number,
  steps: number,
  router: NextRouter,
  formula: string,
  formulaError: boolean,
  switchLoading: () => void,
  directed: boolean,
  fromPredecessors: boolean,
  selectedLabelColorsFile: any
) {
  // stop redirecting
  event.preventDefault();

  if (formulaError) {
    alert("Formula is incorrect");
    return;
  }

  // compose the data to send
  const data = new FormData();
  data.append("edgesFile", selectedEdgesFile);
  data.append("vlFile", selectedVLFile);
  data.append("labelNamesFile", selectedLabelNamesFile);
  data.append("negThr", negThr.toString());
  data.append("steps", steps.toString());
  data.append("formula", formula);
  data.append("directed", directed.toString());

  if (selectedLabelColorsFile != null)
    data.append("labelsColorsFile", selectedLabelColorsFile);

  if (!directed)
    data.append("fromPredecessors", "false"); // irillevant if the graph is not directed
  else data.append("fromPredecessors", fromPredecessors.toString());

  try {
    const r = await submitFiles(data);

    if (r != "OK") {
      alert(apiResponses(r));
      return;
    }
    // everything ok, now go to the visualisation page

    // now that the files were submitted, the simulation started
    // so we turn the loading for the visualisation on.
    //  The loading will turn off when the simulation is finished
    //    (getGraph will return something in this case).
    switchLoading();
    router.push("/examples/customExamplePage");
  } catch (submitErr: any) {
    alert("Submit error: " + submitErr);
  }
}

function handleEdgesFileSelection(
  e: any,
  setEdgesFile: Dispatch<SetStateAction<File | undefined>>
) {
  if (e.target.files != null) setEdgesFile(e.target.files[0]);
}

function handleVLFileSelection(
  e: any,
  setVLFile: Dispatch<SetStateAction<File | undefined>>
) {
  if (e.target.files != null) setVLFile(e.target.files[0]);
}

function handleNamesFileSelection(
  e: any,
  setNamesFile: Dispatch<SetStateAction<File | undefined>>
) {
  if (e.target.files != null) setNamesFile(e.target.files[0]);
}

function handleLabelColorsSelection(e: any, setLabelColorsFile: Dispatch<SetStateAction<File | undefined>>) {
  if (e.target.files != null) setLabelColorsFile(e.target.files[0]);
}

function substituteWeight(weight: string) {
return weight === ""
  ? `VL_i [l](t)=(1-k w_2)VL_i [l] (t-1) + \\color{red}{\\frac{1}{k+1}} \\sum_{j\\in\\Gamma(i)} VL_j [l](t-1)`
  : `VL_i [l](t)=(1-k w_2)VL_i [l] (t-1) + \\color{red}{${weight}} \\sum_{j\\in\\Gamma(i)} VL_j [l](t-1)`;
}

export default function SubmitPage() {
  const [selectedEdgesFile, setEdgesFile] = useState<File>();
  const [selectedVLFile, setVLFile] = useState<File>();
  const [selectedLabelNamesFile, setLabelNamesFile] = useState<File>();
  const [selectedLabelColorsFile, setLabelColorsFile] = useState<File>();

  const [negThr, setnegThr] = useState<number>(0.1);
  const [steps, setSteps] = useState(5);
  const [formula, setFormula] = useState<string>("")
  const [formulaError, setFormulaError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [directed, setDirected] = useState<boolean>(true);
  const [fromPredecessors, setFromPredecessors] = useState<boolean>(true);
  const formulaPar = useRef(null);
  const router = useRouter();

  const switchLoading: () => void = () => setLoading(!loading);

  useEffect(() => {
    if (formulaPar.current != undefined)
      try {
        katex.render(substituteWeight(formula), formulaPar.current, {displayMode: false, trust: false, colorIsTextColor: true});
        setFormulaError(false);
      } catch (error) {
        setFormulaError(true);
      }
  }, [formula]);

  return (
    <div className="flex flex-col justify-center xl:flex-row xl:items-center xl:h-screen xl:w-screen sm:min-h-screen sm:w-screen bg-slate-700 p-5 gap-10">
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.15.3/dist/katex.min.css"
          integrity="sha384-KiWOvVjnN8qwAZbuQyWDIbfCLFhLXNETzBQjA/92pIowpC0d2O3nppDGQVgwd2nB"
          crossOrigin="anonymous"
        />
        <script
          defer
          src="https://cdn.jsdelivr.net/npm/katex@0.15.3/dist/katex.min.js"
          integrity="sha384-0fdwu/T/EQMsQlrHCCHoH10pkPLlKA1jL5dFyUOvB3lfeT2540/2g6YgSi2BL14p"
          crossOrigin="anonymous"
        ></script>
      </Head>
      <form
        onSubmit={(event) =>
          handleSubmit(
            event,
            selectedEdgesFile,
            selectedVLFile,
            selectedLabelNamesFile,
            negThr,
            steps,
            router,
            formula,
            formulaError,
            switchLoading,
            directed,
            fromPredecessors,
            selectedLabelColorsFile
          )
        }
        className="flex flex-col justify-center xl:items-center gap-5 xl:w-2/3 xl:flex-row"
      >
        <div className="flex flex-col gap-1">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="edges"
              className="font-mono text-white text-xl font-bold"
            >
              Edges File
            </label>
            <input
              id="edges"
              type="file"
              className="block w-full text-md text-white font-mono file:custom-hoverable-button-md"
              onChange={(e) => handleEdgesFileSelection(e, setEdgesFile)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="vl"
              className="font-mono text-white text-xl font-bold"
            >
              Initial Vector Labels File
            </label>
            <input
              id="vl"
              type="file"
              className="block w-full text-md text-white font-mono file:custom-hoverable-button-md"
              onChange={(e) => handleVLFileSelection(e, setVLFile)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="labelNames"
              className="font-mono text-white text-xl font-bold"
            >
              Label Names File
            </label>
            <input
              id="labelNames"
              type="file"
              className="block w-full text-md text-white font-mono file:custom-hoverable-button-md"
              onChange={(e) => handleNamesFileSelection(e, setLabelNamesFile)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="customHex"
              className="font-mono text-white text-xl font-bold"
            >
              Custom Label Colors File (Optional)
            </label>
            <input
              id="customHex"
              type="file"
              className="block w-full text-md text-white font-mono file:custom-hoverable-button-md"
              onChange={(e) =>
                handleLabelColorsSelection(e, setLabelColorsFile)
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="directed-undirected-tg"
              className="font-mono text-white text-xl font-bold"
            >
              Network Interpretation
            </label>
            <ToggleSwitch
              id="directed-undirected-tg"
              text={directed ? "Directed Network" : "Undirected Network"}
              onclick={() => {
                setDirected(!directed);
              }}
              active={directed}
            />
          </div>

          {directed && (
            <div className="flex gap-1">
              <ToggleSwitch
                id="predecessor-successor-tg"
                text={
                  fromPredecessors
                    ? "Propagate labels from predecessors"
                    : "Propagate labels from successors"
                }
                onclick={() => {
                  setFromPredecessors(!fromPredecessors);
                }}
                active={fromPredecessors}
              />
              <span id="help-span" className="has-tooltip">
                <span className="tooltip text-sm rounded p-1 bg-slate-500 text-black">
                  {fromPredecessors && <Rive src="/predecessor_anim.riv" />}
                  {!fromPredecessors && <Rive src="/successor_anim.riv" />}
                </span>
                <span className="rounded-full bg-slate-200 text-black m-2 px-1">
                  ?
                </span>
              </span>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label
              htmlFor="negThr"
              className="font-mono text-white text-xl font-bold"
            >
              Negligibly Threshold
            </label>
            <p className="font-mono text-white text-sm">
              Selected Value: {negThr}
            </p>
            <input
              id="negThr"
              type="range"
              min="0"
              max="1"
              step="0.001"
              defaultValue={negThr}
              className="bg-slate-500 accent-white w-full appearance-none rounded-lg"
              onChange={(e) => setnegThr(parseFloat(e.target.value))}
            ></input>
          </div>

          <div className=" ">
            <label
              htmlFor="steps"
              className="font-mono text-white text-xl font-bold"
            >
              Number of Iterations
            </label>
            <p className="font-mono text-white text-sm">
              Selected Value: {steps}
            </p>
            <input
              id="steps"
              type="range"
              min="1"
              max="40"
              step="1"
              defaultValue={steps}
              className="bg-slate-500 accent-white w-full appearance-none rounded-lg"
              onChange={(e) => setSteps(parseFloat(e.target.value))}
            ></input>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="formula"
              className="font-mono text-white text-xl font-bold"
            >
              Weight of neighbours in Update Function
            </label>
            <p className="text-white" ref={formulaPar}></p>
            <input
              id="formula"
              type="text"
              className="bg-slate-600 text-white appearance-none rounded-lg p-1"
              onChange={(e) => setFormula(e.target.value)}
            ></input>
          </div>
        </div>

        <button type="submit" className="custom-hoverable-button-lg">
          Submit
          {loading && <div className="animate-spin text-yellow-500">■</div>}
        </button>
      </form>
      <div className="flex flex-col justify-center xl:w-1/3 gap-2">
        <h1 className="font-mono text-white text-xl font-bold">
          File Formats Instructions
        </h1>
        <h2 className="font-mono text-white text-md font-bold">Edges File</h2>
        <p className="font-mono text-green-300 text-sm">
          This file should be a .csv file formatted like:
          <br />
          ... <br />
          node1 node2 {"{"} weight {"}"} <br />
          ... <br />
          <br />
          which means that node1 is connected to node2, node2 is connected to
          node1 and the link has the weight mentioned in {"{}"}. The weight is
          optional, so every line can also be written as:
          <br />
          ... <br />
          node1 node2 <br />
          node2 node4 <br />
          ... <br />
        </p>
        <h2 className="font-mono text-white text-md font-bold">
          Initial Vector Labels File
        </h2>
        <p className="font-mono text-yellow-100 text-sm">
          This file should be a .csv file formatted like:
          <br />
          b1(l0); b1(l1); ...; b1(lk) <br />
          b2(l0); b2(l1); ...; b2(lk) <br />
          b3(l0); b3(l1); ...; b3(lk) <br />
          ...
          <br />
          <br />
          where b1, b2, b3, ... are the belonging coefficient functions for the
          nodes 1, 2, 3, ... and l0, l1, ..., lk are the labels of the network.
          All the values on a row should sum to 1.
          <br />
          Colors example VL file: <br />
          0; 1; 0 <br />
          0.5; 0.5; 0 <br />
          0; 0; 1 <br />
          1; 0; 0 <br />
        </p>
        <h2 className="font-mono text-white text-md font-bold">
          Label Names File
        </h2>
        <p className="font-mono text-red-100 text-sm">
          This file should be a .csv file formatted like:
          <br />
          label1; label2; label3; label4; ...
          <br />
          <br />
          where label1, label2, ... are the labels of the network.
          <br />
          Colors example Labels file: <br />
          Red; Yellow; Green
        </p>
      </div>
    </div>
  );
}
