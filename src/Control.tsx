import type { Mode } from "./Mode";
import "./Control.css";
import { useState } from "react";

interface ControlProps {
  mode: Mode;
  setMode: (m: Mode) => void;
  label: string;
  setLabel: (label:string) => void;
  setImageUrl: (url: string | null) => void;
  handleExport: (imageFilename: string | null) => void;
}

export default function Control({mode, setMode, label, setLabel, setImageUrl, handleExport}: ControlProps) {
  const [imageFilename, setImageFilename] = useState<string | null>(null);

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFilename(file.name.split('.')[0]);

    const url = URL.createObjectURL(file);
    setImageUrl(url);
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setLabel(e.target.value);
  }

  return (
    <div className="control-container">
      <input placeholder="label" value={label} onChange={handleLabelChange} />

      <button disabled={mode === "interact"} onClick={() => setMode("interact")}>Interact</button>
      <button disabled={mode === "annotate"} onClick={() => setMode("annotate")}>Annotate</button>

      <button className="file-export" onClick={() => handleExport(imageFilename)}>
        Download
      </button>

      <label className="file-upload">
        Upload Image
        <input type="file" accept="image/*" onChange={onUpload} />
      </label>
    </div>
  );
}