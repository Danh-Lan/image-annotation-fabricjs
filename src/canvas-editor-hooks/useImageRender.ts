import { Canvas, FabricImage } from "fabric";
import { useEffect } from "react";

export default function useImageRender(fabricRef: React.RefObject<Canvas | null>, imageUrl: string | null) {
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !imageUrl) return;

    FabricImage.fromURL(imageUrl).then((img) => {
      canvas.clear();

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      const scale = Math.min(
        canvasWidth / (img.width || 1),
        canvasHeight / (img.height || 1)
      );

      img.scale(scale);

      img.set({
        originX: "left",
        originY: "top",
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
