import { useEffect } from "react";
import type { Canvas } from "fabric";
import { Point, iMatrix } from "fabric";
import type { TPointerEventInfo } from "fabric";

export default function useCanvasZoomPan(fabricRef: React.RefObject<Canvas | null>) {
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const MIN_ZOOM = 0.35;
    const MAX_ZOOM = 10;
    const ZOOM_STEP = 0.999;

    const onMouseWheel = (opt: TPointerEventInfo<WheelEvent>) => {
      const e = opt.e;
      let zoom = canvas.getZoom() * ZOOM_STEP ** e.deltaY;
      zoom = Math.min(Math.max(zoom, MIN_ZOOM), MAX_ZOOM);
      canvas.zoomToPoint(opt.viewportPoint, zoom);
      e.preventDefault();
      e.stopPropagation();
    };

    const onDblClick = (opt: TPointerEventInfo) => {
      const target = opt.target;
      if (target && target.data?.role !== "background-image") return;

      opt.e.preventDefault();
      canvas.setViewportTransform([...iMatrix]);
      canvas.requestRenderAll();
    };

    let isPanning = false;
    let lastX = 0;
    let lastY = 0;

    const stopPan = () => {
      isPanning = false;
      window.removeEventListener("mouseup", stopPan);
    };

    // window mouseup: release Alt outside canvas so pan does not stick
    const onMouseDown = (opt: TPointerEventInfo) => {
      if (!opt.e.altKey) return;
      if ("button" in opt.e && opt.e.button !== 0) return;
      isPanning = true;
      lastX = opt.viewportPoint.x;
      lastY = opt.viewportPoint.y;
      opt.e.preventDefault();
      window.addEventListener("mouseup", stopPan);
    };

    const onMouseMove = (opt: TPointerEventInfo) => {
      if (!isPanning) return;
      const { x, y } = opt.viewportPoint;
      canvas.relativePan(new Point(x - lastX, y - lastY));
      lastX = x;
      lastY = y;
    };

    canvas.on("mouse:wheel", onMouseWheel);
    canvas.on("mouse:dblclick", onDblClick);
    canvas.on("mouse:down", onMouseDown);
    canvas.on("mouse:move", onMouseMove);
    canvas.on("mouse:up", stopPan);

    return () => {
      window.removeEventListener("mouseup", stopPan);
      canvas.off("mouse:wheel", onMouseWheel);
      canvas.off("mouse:dblclick", onDblClick);
      canvas.off("mouse:down", onMouseDown);
      canvas.off("mouse:move", onMouseMove);
      canvas.off("mouse:up", stopPan);
    };
  }, [fabricRef]);
}
