import { ToggleSwitchProps } from "../../types/ToggleSwitchProps";

export default function ToggleSwitch({text, id, onclick, active=false}: ToggleSwitchProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-center cursor-pointer"
    >
      <input type="checkbox" id={id} className="toggle-input" onClick={(_) => onclick()} defaultChecked={active} />
      <div className="toggle"></div>
      <span className="font-mono ml-3 text-white text-lg font-bold">
        {text}
      </span>
    </label>
  );
}
