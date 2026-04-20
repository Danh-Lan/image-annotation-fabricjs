import './App.css'
import CanvasEditor from './CanvasEditor'
import Control from './Control'
import { useState } from 'react'
import type { Mode } from './Mode'

function App() {
  const [mode, setMode] = useState<Mode>("interact");
  const [label, setLabel] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <div className="app-container">
      <Control mode={mode} setMode={setMode} label={label} setLabel={setLabel} setImageUrl={setImageUrl} />
      <CanvasEditor mode={mode} label={label} imageUrl={imageUrl} />
    </div>
  )
}

export default App
