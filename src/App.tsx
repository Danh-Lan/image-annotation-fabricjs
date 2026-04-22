import './App.css'
import CanvasEditor from './CanvasEditor'
import type { CanvasEditorRef } from './CanvasEditor'
import Control from './Control'
import { useRef, useState } from 'react'
import type { Mode } from './Mode'

function App() {
  const [mode, setMode] = useState<Mode>("interact");
  const [label, setLabel] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const canvasEditorRef = useRef<CanvasEditorRef>(null);

  const handleExport = (imageFilename: string | null) => {
    if (!imageFilename) return;

    const dataUrl = canvasEditorRef.current?.exportImage();

    const link = document.createElement("a");
    link.href = dataUrl!;
    link.download = imageFilename + "_annotated.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
   
  return (
    <div className="app-container">
      <Control 
        mode={mode} 
        setMode={setMode} 
        label={label} 
        setLabel={setLabel} 
        setImageUrl={setImageUrl} 
        handleExport={handleExport}
      />
      <CanvasEditor 
        ref={canvasEditorRef} 
        mode={mode} 
        label={label} 
        imageUrl={imageUrl} 
      />
    </div>
  )
}

export default App
