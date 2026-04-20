import type { Canvas, FabricObject } from "fabric";
import { useEffect } from "react";
import type { Mode } from "../Mode";

export default function useModeToggle(fabricRef: React.RefObject<Canvas | null>, mode: Mode) {
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
        obj.selectable = false;
        obj.evented = false;
      });

      canvas.discardActiveObject();
      canvas.renderAll();
    }
  }, [fabricRef, mode]);
}