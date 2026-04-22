import { useRef, useState } from "react";
import type { Mode } from "./Mode";
import { Canvas, Rect, Textbox, Group } from "fabric";
import "./CanvasEditor.css";
import useCanvasInit from "./canvas-editor-hooks/useCanvasInit";
import useImageRender from "./canvas-editor-hooks/useImageRender";
import useModeToggle from "./canvas-editor-hooks/useModeToggle";
import useAnnotationDrawing from "./canvas-editor-hooks/useAnnotationDrawing";
import useDeleteKey from "./canvas-editor-hooks/useDeleteKey";

interface CanvasEditorProps {
  mode: Mode;
  label: string;
  imageUrl: string | null;
}

export default function CanvasEditor({ mode, label, imageUrl }: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const [pendingRect, setPendingRect] = useState<Rect | null>(null);

  const confirmAnnotation = () => {
    if (!pendingRect || !fabricRef.current) return;

    const fontSize = 16;
    const text = new Textbox(label, {
      left: pendingRect.left,
      top: pendingRect.top - fontSize - 5,
      originX: "left",
      originY: "top",
      fontFamily: "Arial",
      fontSize: fontSize,
      fontWeight: "bold",
      fill: "white",
      backgroundColor: "red",
      selectable: false,
      evented: false,
    });

    fabricRef.current.remove(pendingRect);

    const group = new Group([pendingRect, text], {
      selectable: false,
      evented: false,
    })

    fabricRef.current.add(group);
    setPendingRect(null);
  };

  const cancelAnnotation = () => {
    if (!pendingRect || !fabricRef.current) return;

    fabricRef.current.remove(pendingRect);
    setPendingRect(null);
  };

  useCanvasInit(canvasRef, fabricRef);
  useImageRender(fabricRef, imageUrl);
  useModeToggle(fabricRef, mode);
  useAnnotationDrawing(fabricRef, mode, label, pendingRect, setPendingRect);
  useDeleteKey(fabricRef);

  return (
    <div className="canvas-editor-wrapper">
      <div className="canvas-editor-canvas-container">
        <canvas ref={canvasRef} />
      </div>
      {pendingRect && (
        <div className="canvas-editor-toolbar">
          <button
            className="canvas-editor-button canvas-editor-button-confirm"
            onClick={confirmAnnotation}
          >
            Confirm
          </button>
          <button
            className="canvas-editor-button canvas-editor-button-cancel"
            onClick={cancelAnnotation}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}