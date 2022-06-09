import Link from 'next/link'
import { LoremIpsum } from "lorem-ipsum";

export default function Home() {
  const lorem = new LoremIpsum({
    sentencesPerParagraph: {
      max: 8,
      min: 4
    },
    wordsPerSentence: {
      max: 16,
      min: 4
    }
  });

  return (
    <div
      id="page-container"
      className="px-24 py-10 min-h-screen min-w-screen flex flex-col items-center justify-around bg-slate-700"
    >
      <h1
        id="page-title"
        className="font-mono py-12 text-4xl text-center font-bold text-white"
      >
        Agent-based Vector-label Propagation
      </h1>
      <div
        id="examples-column"
        className="flex flex-col justify-around items-center w-1/2 gap-10"
      >
        <div id="colors-example-column" className="flex flex-col w-full gap-2">
          <h1
            id="colors-example-title"
            className="font-mono text-lg font-bold text-white"
          >
            Colors Example
          </h1>
          <div
            id="colors-example-content-button-div"
            className="flex flex-col md:flex-row md:items-center"
          >
            <div className="flex w-1/2">
              <p
                id="colors-example-desc"
                className="font-mono text-sm text-white"
              >
                This example presents an undirected network composed of 4 agents
                each having 3 distinct features: Red, Yellow and Green.
                By going forward in time, the evolution of the features can be
                clearly seen by looking at the colored fractions that compose
                each visualized node.
              </p>
            </div>
            <div className="flex w-1/2">
              <Link href="/examples/colorsExamplePage" passHref={true}>
                <button
                  id="colors-example-button"
                  type="button"
                  className="font-mono text-lg px-6 py-4 m-2 text-black transition-all duration-500 rounded-lg bg-gradient-to-r to-green-400 via-yellow-400 from-red-400 bg-size-200 bg-pos-0 hover:bg-pos-100"
                >
                  Visualize Example
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* <div id="songs-example-column" className="flex flex-col w-full h-1/3 gap-2">
          <h1 id="songs-example-title" className="font-mono text-lg font-bold text-white h-1/6">Placeholder Example (TODO)</h1>
          <div id="songs-example-content-button-div" className="flex h-5/6 items-center">
            <div className="flex h-full w-3/4">
              <p id="songs-example-desc" className="font-mono text-sm text-white overflow-y-scroll">
                {lorem.generateSentences(10)}
              </p>
            </div>
            <div className="flex h-full w-1/4">
              <Link href="/examples/songsExamplePage" passHref={true}>
                <button id="songs-example-button" type="button" className="font-mono m-8 px-12 rounded-lg transition-color duration-300 bg-slate-900 hover:bg-slate-800 text-white">
                  Visualize Example (TODO)
                </button>
              </Link>
            </div>
          </div>
        </div> */}

        <div id="custom-example-column" className="flex flex-col w-full gap-2">
          <h1
            id="custom-example-title"
            className="font-mono text-lg font-bold text-white"
          >
            Custom Network
          </h1>
          <div
            id="custom-example-content-button-div"
            className="flex flex-col md:flex-row md:items-center"
          >
            <div className="flex w-1/2">
              <p
                id="custom-example-desc"
                className="font-mono text-sm text-white"
              >
                Here you can upload your own network files and visualise the way
                the labels propagate through the network, as well as the
                community structure that your network has. Multiple runs with
                different parameters can be done.
              </p>
            </div>
            <div className="flex w-1/2">
              <Link href="/submitPage" passHref={true}>
                <button
                  id="custom-example-button"
                  type="button"
                  className="custom-hoverable-button-lg"
                >
                  Custom Network Upload
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
