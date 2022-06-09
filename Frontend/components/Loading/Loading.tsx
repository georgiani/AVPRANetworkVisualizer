import { useEffect, useState } from "react";
import Rive from "rive-react";

export default function Loading() {
    const [text, setText] = useState<string>("");

    useEffect(() => {
      const textToShow = [
        "Please wait, we are propagating labels through the network 🔁 (this could take some time)...",
        "Please wait, we are loading and linking nodes 🔗 (this could take some time)...",
        "Please wait, go take a coffee ☕️ (this could take some time)...",
      ];

      setText(textToShow[Math.floor(Math.random() * textToShow.length)]);
    }, []);
  
    return (
      <div className="flex flex-col justify-center items-center font-mono font-bold text-lg text-white w-full h-full gap-2">
        <div className="text-white animate-bounce w-1/6">{text}</div>
        <div className="w-5/6">
          <Rive src="/loading_anim.riv" />
        </div>
      </div>
    );
}