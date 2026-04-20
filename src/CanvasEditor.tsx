import { useEffect, useRef } from "react";
import type { Mode } from "./Mode";
import { Canvas, Rect, Textbox, FabricObject, FabricImage } from "fabric";

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

      canvas.discardActiveObject();
      canvas.renderAll();
    }
  }, [fabricRef, mode]);
}

// Custom hook for annotation drawing
function useAnnotationDrawing(fabricRef: React.RefObject<Canvas | null>, mode: Mode, label: string) {
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || mode !== "annotate") return;

    let rect: Rect | null = null;
    let text: Textbox | null = null;

    let startX = 0;
    let startY = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onMouseDown = (opt: any) => {
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

      text = new Textbox(label, {
        left: startX,
        top: startY - 20,
        originX: "left",
        originY: "top",
        width: 120,
        fontSize: 12,
        fill: "red",
        backgroundColor: "rgba(255,255,255,0.7)",
        selectable: false,
        evented: false,
      });

      canvas.add(rect);
      canvas.add(text);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onMouseMove = (opt: any) => {
      if (!rect || !text) return;

      const p = canvas.getScenePoint(opt.e);
      rect.set({
        width: Math.abs(p.x - startX),
        height: Math.abs(p.y - startY),
        left: Math.min(p.x, startX),
        top: Math.min(p.y, startY),
      });

      text.set({
        left: Math.min(p.x, startX),
        top: Math.min(p.y, startY) - 20,
      });

      canvas.renderAll();
    };
    
    const MIN_SIZE = 10;

    const onMouseUp = () => {
      if (!rect || !text) return;
      const w = rect.width ?? 0;
      const h = rect.height ?? 0;

      if (w < MIN_SIZE || h < MIN_SIZE) {
        canvas.remove(rect);
        canvas.remove(text);
      } else {
        rect.set({selectable: true, evented: true});
      }

      rect = null;
      text = null;
    };

    canvas.on("mouse:down", onMouseDown);
    canvas.on("mouse:move", onMouseMove);
    canvas.on("mouse:up", onMouseUp);

    return () => {
      canvas.off("mouse:down", onMouseDown);
      canvas.off("mouse:move", onMouseMove);
      canvas.off("mouse:up", onMouseUp);
    };
  }, [fabricRef, mode, label]);
}

export default function CanvasEditor({ mode, label, imageUrl }: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<Canvas | null>(null);

  useCanvasInit(canvasRef, fabricRef);
  useImageRender(fabricRef, imageUrl);
  useModeToggle(fabricRef, mode);
  useAnnotationDrawing(fabricRef, mode, label);

  return (
    <div style={{ display: "flex", width: "800px", height: "500px", border: "1px solid #ddd" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}