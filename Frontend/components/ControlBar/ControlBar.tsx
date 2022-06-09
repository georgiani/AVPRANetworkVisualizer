import { useState } from "react";
import { ControlBarProps } from "../../types/ControlBar";
import { fetchCompleteResultsFile, fetchGraphFile } from "../../utils/fetchMethods";
import FileDownloadButton from "../FileDownloadButton";
import ScreenShotButton from "../ScreenShotButton";
import ToggleSwitch from "../ToggleSwitch";

export default function ControlBar({
  nextFn,
  previousFn,
  toggleComs,
  toggleInfo,
  toggleIds,
  toggleVLs,
  currentTimestamp,
  fileFetchBaseUrl,
  network,
  switchCurrentlySelecting,
  selectedNode,
  secondSelectedNode,
  nodeSelectionFn,
  screenshotRef
}: ControlBarProps) {
  const [nodeToSearch, setNodeToSearch] = useState<number>(-1);

  return (
    <div className="flex flex-row justify-between gap-2">
      <div className="flex items-center self-center gap-5 border-2 border-slate-800 rounded-md p-1">
        <div>
          <button
            id="previous-ts-button"
            className="custom-hoverable-button-lg"
            onClick={() => previousFn()}
          >
            {"<"}
          </button>

          <button
            id="next-ts-button"
            className="custom-hoverable-button-lg"
            onClick={() => nextFn()}
          >
            {">"}
          </button>
        </div>

        <div className="flex flex-col self-center items-start gap-1">
          <div id="current-ts-div">
            <p className="font-mono text-lg text-white font-bold">
              Current Iteration:
              <span id="current-ts">{currentTimestamp}</span>
              <span className="px-1 text-xl">/</span>
              <span id="ts-count">{network.graph.timestamps - 1}</span>
            </p>
          </div>

          <div id="final-ts-div">
            <p className="font-mono text-lg text-white font-bold">
              <span id="help-span" className="has-tooltip">
                <span className="tooltip text-sm rounded p-1 bg-white text-black -mt-20">
                  The iteration at which all Vector Labels were stationary 
                  <br /> (the variation was smaller than the set Negligibly
                  Threshold) <br /> for the last 3 iterations.
                </span>
                <span className="rounded-full bg-slate-200 text-black m-2 px-1">
                  ?
                </span>
              </span>
              Final Iteration:{" "}
              <span id="final-ts">{network.graph["finalTs"]}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col self-center gap-2">
        <ToggleSwitch
          id="cur-selecting"
          text="Switch Current Node Selection"
          onclick={switchCurrentlySelecting}
        />
        <div className="flex">
          <input
            id="node-search"
            type="text"
            className="bg-slate-600 text-white appearance-none rounded-lg p-1"
            onChange={(ev) => Number.isNaN(Number(ev.target.value)) ? setNodeToSearch(-1) : setNodeToSearch(parseInt(ev.target.value))}
          ></input>
          <button
            className="custom-hoverable-button-md"
            onClick={() => {(nodeToSearch <= network.graph.nodesCount && nodeToSearch >= 1) ? nodeSelectionFn(nodeToSearch) : nodeSelectionFn(-1)}}
          >
            Select Node
          </button>
        </div>
      </div>
      <div className="flex flex-row self-center items-center gap-5 border-2 border-slate-800 rounded-md p-1">
        <div className="flex flex-col gap-1">
          <ToggleSwitch
            id="vl-tg"
            text="Show VL View"
            onclick={toggleVLs}
            active={true}
          />
          <ToggleSwitch
            id="coms-tg"
            text="Show Community View"
            onclick={toggleComs}
          />
        </div>
        <div className="flex flex-col gap-1">
          <ToggleSwitch
            id="info-tg"
            text="Show Info Bar"
            onclick={toggleInfo}
          />
          <ToggleSwitch id="ids-tg" text="Show Ids" onclick={toggleIds} />
        </div>
        <div className="flex flex-col gap-1 items-center">
          <div className="flex flex-row gap-1">
            <ScreenShotButton divRef={screenshotRef}/>
            {selectedNode != -1 && secondSelectedNode != -1 && (
              <FileDownloadButton
                text="Download Nodes Comparison File"
                endpoint={
                  fileFetchBaseUrl +
                  `/compareNodes?n1=${selectedNode}&n2=${secondSelectedNode}&t=${currentTimestamp}`
                }
              />
            )}
          </div>
          <div className="flex flex-row gap-1">
            <FileDownloadButton
              text="Download Results File"
              endpoint={fileFetchBaseUrl + "/downloadCompleteResults"}
            />
            <FileDownloadButton
              text="Download Graph Details"
              endpoint={fileFetchBaseUrl + "/downloadGraphDetails"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
