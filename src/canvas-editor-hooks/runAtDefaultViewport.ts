import type { Canvas } from "fabric";
import { iMatrix } from "fabric";

function copyViewportTransform(canvas: Canvas) {
  const v = canvas.viewportTransform;
  return [v[0], v[1], v[2], v[3], v[4], v[5]] as const;
}

/**
 * Runs `fn` while zoom/pan are reset to the default view, then restores what the user had. 
 * Use when scene coordinates must match an un-zoomed canvas (e.g. export crop).
 */
export function runAtDefaultViewport<T>(canvas: Canvas, fn: () => T): T {
  const saved = copyViewportTransform(canvas);
  canvas.setViewportTransform([...iMatrix]);
  canvas.requestRenderAll();
  try {
    return fn();
  } finally {
    canvas.setViewportTransform([...saved]);
    canvas.requestRenderAll();
  }
}
