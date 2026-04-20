import type { Canvas } from "fabric";
import { useEffect } from "react";

export default function useDeleteKey(fabricRef: React.RefObject<Canvas | null>) {
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
