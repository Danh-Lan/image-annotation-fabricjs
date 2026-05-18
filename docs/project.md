# Project overview

A small **image annotation** app built to learn [Fabric.js](https://fabricjs.com/). You upload an image, draw bounding boxes with labels, move or delete them, and export the result as a PNG.

## Tech stack

| Tool | Role |
|------|------|
| [Vite](https://vite.dev/) | Dev server and build |
| [React 19](https://react.dev/) | UI + Logic |
| [TypeScript](https://www.typescriptlang.org/) | Types |
| [Fabric.js 7](https://fabricjs.com/) | Canvas drawing and objects |
| Plain CSS | Styling (no UI framework) |

## How to run

```bash
npm install
npm run dev
```

Other scripts: `npm run build`, `npm run lint`, `npm run preview`.

## Folder layout

```
src/
  App.tsx              # Top-level state and layout
  Control.tsx          # Toolbar: upload, modes, label, export
  CanvasEditor.tsx     # Fabric canvas + annotation confirm/cancel
  Mode.ts              # Shared type: "interact" | "annotate"
  canvas-editor-hooks/ # Fabric logic split into custom hooks
  *.css                # One CSS file per component (plus index.css)
docs/                  # Project documentation
```

## App flow

1. **Upload** — User picks an image file. `Control` creates an object URL and passes it to `CanvasEditor`.
2. **Load image** — `useImageRender` clears the canvas, scales the image to fit, centers it, and locks it (not selectable).
3. **Modes** — Two modes from `Mode.ts`:
   - **Interact** — Select and move annotation groups; Delete key removes the selection.
   - **Annotate** — Drag to draw a red rectangle. Confirm adds a label; Cancel removes the box.
4. **Export** — `CanvasEditor` exposes `exportImage()` via a React ref. `App` downloads a PNG cropped to the image bounds.

## Architecture (simple)

```
App (state: mode, label, imageUrl)
 ├── Control (inputs & buttons → callbacks)
 └── CanvasEditor (Fabric canvas + hooks)
      ├── useCanvasInit      — create/dispose Fabric Canvas
      ├── useImageRender     — load and fit image
      ├── useModeToggle      — interact vs annotate behavior
      ├── useAnnotationDrawing — drag-to-draw rectangles
      └── useDeleteKey       — Delete removes active object
```

**State lives in `App`.** `Control` and `CanvasEditor` receive props (and setters) rather than sharing context. Fabric’s `Canvas` instance is kept in a `useRef` inside `CanvasEditor`, not in React state.

## Key concepts

- **Pending rectangle** — After you finish drawing, the box stays “pending” until you click Confirm or Cancel. Only one pending box at a time.
- **Annotation group** — On confirm, the rectangle and a `Textbox` label are grouped with `Group`. The group is not selectable (annotations stay fixed after placement).
- **Image vs annotations** — The background image is always `selectable: false` and `evented: false`. In annotate mode, existing objects are also locked so clicks go to drawing.

## Canvas size

The Fabric canvas is fixed at **800×500** pixels (`useCanvasInit`). CSS makes the `<canvas>` element fill its container; the internal resolution stays 800×500 for consistent coordinates.
