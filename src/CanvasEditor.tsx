import { useEffect, useRef, useState } from "react";
import type { Mode } from "./Mode";
import { Canvas, Rect, Textbox, FabricObject, FabricImage } from "fabric";
import "./CanvasEditor.css";

interface CanvasEditorProps {
  mode: Mode;
  label: string;
  imageUrl: string | null;
}

// Custom hook for canvas initialization
function useCanvasInit(canvasRef: React.RefObject<HTMLCanvasElement | null>, fabricRef: React.RefObject<Canvas | null>) {
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 500,
      selection: true,
    });
    canvas.isDrawingMode = false;

    fabricRef.current = canvas;

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [canvasRef, fabricRef]);
}

// Custom hook for image rendering
function useImageRender(fabricRef: React.RefObject<Canvas | null>, imageUrl: string | null) {
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !imageUrl) return;

    FabricImage.fromURL(imageUrl).then((img) => {
      canvas.clear();

      img.set({
        selectable: false,
        evented: false,
      });

      canvas.add(img);
      canvas.centerObject(img);
      canvas.sendObjectToBack(img);
      canvas.renderAll();
    });
  }, [fabricRef, imageUrl]);
}

// Custom hook for mode toggling
function useModeToggle(fabricRef: React.RefObject<Canvas | null>, mode: Mode) {
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (mode === "interact") {
      canvas.selection = true;

      canvas.forEachObject((obj: FabricObject) => {
        obj.selectable = true;
        obj.evented = true;
      });
    }

    if (mode === "annotate") {
      canvas.selection = false;

      // make the image uninteractive
      canvas.forEachObject((obj: FabricObject) => {
        if (obj.type === 'image') {
          obj.selectable = false;
          obj.evented = false;
        }
      });

      canvas.discardActiveObject();
      canvas.renderAll();
    }
  }, [fabricRef, mode]);
}

// Custom hook for annotation drawing
function useAnnotationDrawing(
  fabricRef: React.RefObject<Canvas | null>,
  mode: Mode,
  label: string,
  pendingRect: Rect | null,
  setPendingRect: React.Dispatch<React.SetStateAction<Rect | null>>
) {
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || mode !== "annotate") return;

    let rect: Rect | null = null;

    let startX = 0;
    let startY = 0;

    const MIN_SIZE = 10;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onMouseDown = (opt: any) => {
      if (pendingRect) return; // while pending can't draw another box

      const p = canvas.getScenePoint(opt.e);
      startX = p.x;
      startY = p.y;

      rect = new Rect({
        left: startX,
        top: startY,
        originX: "left",
        originY: "top",
        width: 0,
        height: 0,
        fill: "transparent",
        stroke: "red",
        strokeWidth: 1,
        selectable: true,
        evented: true,
      });

      canvas.add(rect);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onMouseMove = (opt: any) => {
      if (!rect) return;

      const p = canvas.getScenePoint(opt.e);
      rect.set({
        width: Math.abs(p.x - startX),
        height: Math.abs(p.y - startY),
        left: Math.min(p.x, startX),
        top: Math.min(p.y, startY),
      });

      canvas.renderAll();
    };

    const onMouseUp = () => {
      if (!rect) return;
      const w = rect.width ?? 0;
      const h = rect.height ?? 0;

      if (w < MIN_SIZE || h < MIN_SIZE) {
        canvas.remove(rect);
        rect = null;
        return;
      }
      
      rect.set({selectable: true, evented: true});
      setPendingRect(rect);
      rect = null;
    };

    canvas.on("mouse:down", onMouseDown);
    canvas.on("mouse:move", onMouseMove);
    canvas.on("mouse:up", onMouseUp);

    return () => {
      canvas.off("mouse:down", onMouseDown);
      canvas.off("mouse:move", onMouseMove);
      canvas.off("mouse:up", onMouseUp);
    };
  }, [fabricRef, mode, label, pendingRect, setPendingRect]);
}

function useDeleteKey(fabricRef: React.RefObject<Canvas | null>) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Delete") return;

      const canvas = fabricRef.current;
      if (!canvas) return;

      const active = canvas.getActiveObject();
      if (active) canvas.remove(active);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fabricRef]);
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
      top: pendingRect.top! - fontSize - 5,
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

    pendingRect.set({
      selectable: true,
      evented: true,
    });

    fabricRef.current.add(text);
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
<<<<<<< HEAD
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
=======
    <div className="canvas-editor__wrapper">
      <div className="canvas-editor__canvas-container">
        <canvas ref={canvasRef} />
      </div>
      {pendingRect && (
        <div className="canvas-editor__toolbar">
          <button className="canvas-editor__button canvas-editor__button--confirm" onClick={confirmAnnotation}>
            Confirm
          </button>
          <button className="canvas-editor__button canvas-editor__button--cancel" onClick={cancelAnnotation}>
>>>>>>> 0dcd2182e0bc4ac847145c5f2e3533cbb71e1658
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}