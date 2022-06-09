import { FileDownloadButtonProps } from "../../types/FileDownloadButton";

export default function FileDownloadButton({ text, endpoint }: FileDownloadButtonProps) {
    const click = function () {
        const a = document.createElement("a");
        a.href = endpoint;
        a.click();
    };

    return (
        <button className="custom-hoverable-button-sm" onClick={() => click()}>
            {text}
        </button>
    );
}