import { fetchGraph, fetchNodesData } from '../../utils/fetchMethods';
import ControlBar from '../../components/ControlBar';
import InfoBar from '../../components/InfoBar';
import { useState, useCallback, useEffect, useRef } from 'react';
import { DefaultNodeVLsVal, NodeVLs } from '../../types/VL';
import CommunityGraph from '../../components/CommunityGraph';
import VectorLabelGraph from '../../components/VectorLabelGraph';
import { Network } from '../../types/Network';
import Loading from '../../components/Loading';
import usePolling from '../../hooks/usePolling';
import NetworkLoadError from "../../components/NetworkLoadError";
import distinctColors from "distinct-colors";
import useGUIControls from '../../hooks/useGUIControls';
import Empty from '../../components/Empty';
import chroma from 'chroma-js';


export default function CustomExamplePage() {
    const [selectedNode, setSelectedNode] = useState<number>(-1);
    const [secondSelectedNode, setSecondSelectedNode] = useState<number>(-1);
    const [currentlySelecting, setCurrentlySelecting] = useState<number>(0);
    
    const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);

    const ssRef = useRef(null);

    const [network, loading, networkFetchError] = usePolling<Network>(
      10000, // polling interval
      "NR", // not ready response
      ["SE", "IQ"], // server error messages
      fetchGraph, // method to use
      ["/api/v1/custom"] // where to call
    );

    const [nodesData, setNodesData] = useState<NodeVLs>(DefaultNodeVLsVal);

    const [
      showCommunityView,
      showInfoBar,
      showIds,
      showVLView,
      toggleComsViewFn,
      toggleInfoBarFn,
      toggleIdsFn,
      toggleVLViewFn,
    ] = useGUIControls(false, false, false, true);

    const [comsColors, setComsColor] = useState<chroma.Color[]>([]);
    const [labelColors, setLabelColors] = useState<chroma.Color[]>([]);

    const nextTimestampFunction: () => void = useCallback(
      () => {
        if (network != undefined && network.graph.timestamps != undefined) {
          setCurrentTimestamp((c) => (c + 1) % network.graph.timestamps);
        }
      },
      [network]
    );
    const previousTimestampFunction: () => void = () => setCurrentTimestamp((c) => c <= 0 ? c : (c - 1));

    const switchCurrentlySelectingNode: () => void = () =>
      setCurrentlySelecting(1 - currentlySelecting);

    useEffect(() => {
      async function getNodesData() {
        if (!loading) {
          // after network has loaded in, I can get the specific
          // nodes info
          const dt = await fetchNodesData("/api/v1/custom", currentTimestamp);
          setNodesData(dt);
        }
      }

      getNodesData()
    }, [currentTimestamp, loading])

    useEffect(() => {
      if (!loading) {
        setComsColor(distinctColors({count: network?.graph.communities}));
      }
    }, [network, loading])

    useEffect(() => {
      if (!loading) {
        if (network?.graph.labelColors != undefined) {
          var colors = []
          for (const h of network?.graph.labelColors) 
            colors.push(chroma(h));
          setLabelColors(colors);
        } else {
          setLabelColors(distinctColors({count: network?.graph.labels.length}));
        }
      }
    }, [network, loading])

    return (
      <div ref={ssRef} className="flex flex-col h-screen bg-slate-700">
        {networkFetchError ? (
          <NetworkLoadError />
        ) : loading ? (
          <Loading />
        ) : (
          <>
            <div className="p-1 flex justify-center h-[80%]">
              <div ref={ssRef} className="m-1 p-1 flex w-full h-full">
                {showVLView && network != undefined && labelColors != [] && (
                  <VectorLabelGraph
                    name="graph"
                    selectNodeFn={
                      currentlySelecting == 0
                        ? setSelectedNode
                        : setSecondSelectedNode
                    } // onclick on node updates the selected node
                    network={network}
                    selectedNode={selectedNode}
                    nodesData={nodesData}
                    colors={labelColors}
                    showIds={showIds}
                    secondSelectedNode={secondSelectedNode}
                  />
                )}

                {showCommunityView &&
                  network != undefined &&
                  comsColors != [] && (
                    <CommunityGraph
                      name="coms"
                      network={network}
                      selectedNode={selectedNode}
                      colors={comsColors}
                      showIds={showIds}
                      secondSelectedNode={secondSelectedNode}
                    />
                  )}

                {showCommunityView == false && showVLView == false && <Empty />}
              </div>
              <div>
                {showInfoBar &&
                  network != undefined &&
                  comsColors != [] &&
                  labelColors != [] && (
                    <InfoBar
                      currentNode={selectedNode}
                      nodesData={nodesData}
                      network={network}
                      comsColors={comsColors}
                      labelColors={labelColors}
                    />
                  )}
              </div>
              <div>
                {showInfoBar &&
                  network != undefined &&
                  comsColors != [] &&
                  labelColors != [] &&
                  secondSelectedNode != -1 && (
                    <InfoBar
                      currentNode={secondSelectedNode}
                      nodesData={nodesData}
                      network={network}
                      comsColors={comsColors}
                      labelColors={labelColors}
                    />
                  )}
              </div>
            </div>

            <div className="m-2 h-full">
              {network != undefined && !loading && (
                <ControlBar
                  nextFn={nextTimestampFunction}
                  previousFn={previousTimestampFunction}
                  toggleComs={toggleComsViewFn}
                  toggleInfo={toggleInfoBarFn}
                  toggleIds={toggleIdsFn}
                  toggleVLs={toggleVLViewFn}
                  fileFetchBaseUrl={"/api/v1/custom"}
                  currentTimestamp={currentTimestamp}
                  network={network}
                  switchCurrentlySelecting={switchCurrentlySelectingNode}
                  selectedNode={selectedNode}
                  secondSelectedNode={secondSelectedNode}
                  nodeSelectionFn={
                    currentlySelecting == 0
                      ? setSelectedNode
                      : setSecondSelectedNode
                  }
                  screenshotRef={ssRef}
                />
              )}
            </div>
          </>
        )}
      </div>
    );
}