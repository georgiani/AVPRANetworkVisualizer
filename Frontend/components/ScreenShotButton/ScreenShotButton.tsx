import * as htmlToImage from "html-to-image";
import { ScreenShotButtonProps } from "../../types/ScreenShotButtonProps";

export default function ScreenShotButton({divRef}: ScreenShotButtonProps) {

    // if there are too many elements on screen
    //  this would crash the app unfortunately
    const takeScreenShot = async (node: any) => {
        const dataURI = await htmlToImage.toJpeg(node);
        return dataURI;
    };

    const download = (img: any, name='network_screenshot', extension='png') => {
        const a = document.createElement("a");
        a.href=img;
        a.download = `${name}.${extension}`;
        a.click();
    }

    return (
        <button className="custom-hoverable-button-sm" onClick={() => takeScreenShot(divRef.current).then(download)}>
            Capure Screen
        </button>
    )    
}