import './App.css'
import CanvasEditor from './CanvasEditor'
import Control from './Control'
import { useState } from 'react'
import type { Mode } from './Mode'

// Add label for the annotation
function App() {
  const [mode, setMode] = useState<Mode>("interact");
  const [label, setLabel] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <>
      <Control setMode={setMode} setLabel={setLabel} setImageUrl={setImageUrl} />
      <CanvasEditor mode={mode} label={label} imageUrl={imageUrl} />
    </>
  )
}

export default App
