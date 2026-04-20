import type { Canvas, Rect } from "fabric";
import { useEffect } from "react";
import type { Mode } from "../Mode";

export default function useAnnotationDrawing(
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