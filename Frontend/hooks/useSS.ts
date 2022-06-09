import { useState } from 'react'
import html2canvas from 'html2canvas'

export default function useSS(): [string, () => void] {
    const [image, setImage] = useState<string>("");
    
    function takePictureOfNode() {
        return html2canvas(document.body).then((c) => {
            const canvas = document.createElement("canvas");
            const canvasContext = canvas.getContext("2d");
            
            // copy the current content c into a new canvas
            const x = 0, y = 0, width = c.width, height = c.height;
            canvas.height = height;
            canvas.width = width;
            
            canvasContext?.drawImage(c, x, y);
            
            // get a link that can be used 
            // as a download link
            const base64ss = canvas.toDataURL();
            
            setImage(base64ss);
            return base64ss;
        });
    }
    
    // returns the taken image and the function 
    // to be called when taking the screenshot
    return [image, takePictureOfNode];
}