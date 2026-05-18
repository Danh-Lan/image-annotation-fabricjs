# Examples

Copy-paste-friendly patterns that match this project. Read [project.md](./project.md) for context and [coding-style.md](./coding-style.md) for conventions.

## Add a new app mode

1. Extend the type in `Mode.ts`:

```ts
export type Mode = "interact" | "annotate" | "pan";
```

2. Add a button in `Control.tsx` and wire `setMode("pan")`.
3. Handle the mode in `useModeToggle.ts` (and any new hook for pan behavior).

## Add a new toolbar control

In `Control.tsx`, add UI and call a prop from `App`:

```tsx
// Control.tsx
<button onClick={onClearAll}>Clear all</button>

// App.tsx — pass handler that uses canvasEditorRef
const handleClearAll = () => canvasEditorRef.current?.clearAnnotations?.();
```

Expose methods on `CanvasEditorRef` via `useImperativeHandle` if the parent needs canvas access.

## Create a minimal Fabric canvas hook

```ts
import { useEffect } from "react";
import { Canvas } from "fabric";

export default function useCanvasInit(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  fabricRef: React.RefObject<Canvas | null>
) {
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 500,
    });
    fabricRef.current = canvas;

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [canvasRef, fabricRef]);
}
```

## Load an image on the canvas

```ts
FabricImage.fromURL(imageUrl).then((img) => {
  canvas.clear();

  const scale = Math.min(
    canvas.width / (img.width || 1),
    canvas.height / (img.height || 1)
  );
  img.scale(scale);
  img.set({ originX: "left", originY: "top", selectable: false, evented: false });

  canvas.add(img);
  canvas.centerObject(img);
  canvas.sendObjectToBack(img);
  canvas.renderAll();
});
```

## Draw a box by dragging

Pattern from `useAnnotationDrawing.ts`:

```ts
canvas.on("mouse:down", (opt) => {
  const p = canvas.getScenePoint(opt.e);
  startX = p.x;
  startY = p.y;
  rect = new Rect({
    left: startX,
    top: startY,
    width: 0,
    height: 0,
    fill: "transparent",
    stroke: "red",
    strokeWidth: 1,
  });
  canvas.add(rect);
});

canvas.on("mouse:move", (opt) => {
  if (!rect) return;
  const p = canvas.getScenePoint(opt.e);
  rect.set({
    width: Math.abs(p.x - startX),
    height: Math.abs(p.y - startY),
    left: Math.min(p.x, startX),
    top: Math.min(p.y, startY),
  });
  canvas.renderAll();
});
```

Remember to `canvas.off(...)` in the effect cleanup.

## Add a label to a rectangle

```ts
const text = new Textbox("cat", {
  left: rect.left,
  top: rect.top! - 21,
  fontSize: 16,
  fontWeight: "bold",
  fill: "white",
  backgroundColor: "red",
  selectable: false,
  evented: false,
});

canvas.remove(rect);
const group = new Group([rect, text], { selectable: false, evented: false });
canvas.add(group);
```

## Delete the selected object

```ts
useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    if (e.key !== "Delete") return;
    const active = canvas.getActiveObject();
    if (active) canvas.remove(active);
  };
  window.addEventListener("keydown", handleKey);
  return () => window.removeEventListener("keydown", handleKey);
}, [fabricRef]);
```

## Export only the image area

```ts
const img = canvas.getObjects("image")[0];
if (!img) return null;

return canvas.toDataURL({
  left: img.left,
  top: img.top,
  width: img.width * img.scaleX,
  height: img.height * img.scaleY,
  multiplier: 1,
  format: "png",
});
```

## Style a new button like the rest of the app

```css
.my-feature-button {
  min-width: 72px;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  border: 1px solid #888;
  cursor: pointer;
  background: #0078d4;
  color: #fff;
}

.my-feature-button:hover {
  opacity: 0.85;
}
```

Use flex + `gap` on the parent container (see `Control.css` and `canvas-editor-toolbar`).

## Change canvas dimensions

Update **both**:

1. `new Canvas(..., { width, height })` in `useCanvasInit.ts`
2. `.canvas-editor-wrapper` / `.canvas-editor-canvas-container` in `CanvasEditor.css`

Keeping JS and CSS in sync avoids blurry or clipped output.