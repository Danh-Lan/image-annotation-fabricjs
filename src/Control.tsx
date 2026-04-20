import type { Mode } from "./Mode";

interface ControlProps {
  setMode: (m: Mode) => void;
  setLabel: (label:string) => void;
  setImageUrl: (url: string | null) => void;
}

export default function Control({setMode, setLabel, setImageUrl}: ControlProps) {
  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);
  };

  const handleLabelChange = (e) => {
    setLabel(e.target.value);
  }

  return (
    <div>
      <input placeholder="label" onChange={handleLabelChange} />

      <button onClick={() => setMode("interact")}>Interact</button>
      <button onClick={() => setMode("annotate")}>Annotate</button>

      <input type="file" accept="image/*" onChange={onUpload} />
    </div>
  );
}