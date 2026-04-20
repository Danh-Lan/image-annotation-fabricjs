import { useEffect } from "react";
import { Canvas } from "fabric";

export default function useCanvasInit(canvasRef: React.RefObject<HTMLCanvasElement | null>, fabricRef: React.RefObject<Canvas | null>) {
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