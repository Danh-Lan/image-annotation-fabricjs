# Coding style

Conventions used in this repo. Match these when adding features.

## File and folder naming

| Kind | Pattern | Example |
|------|---------|---------|
| React components | PascalCase `.tsx` | `CanvasEditor.tsx`, `Control.tsx` |
| Custom hooks | `use` + PascalCase in `canvas-editor-hooks/` | `useCanvasInit.ts` |
| Shared types | PascalCase file, exported type | `Mode.ts` → `Mode` |
| Component CSS | Same base name as component | `Control.css` with `Control.tsx` |
| CSS classes | kebab-case, often prefixed by component | `canvas-editor-button-confirm` |

Default exports are used for components and hooks (`export default function Control`).

## TypeScript

- **Props** — `interface XxxProps { ... }` next to the component.
- **Imperative API** — `CanvasEditor` uses `forwardRef` + `useImperativeHandle` and exports `CanvasEditorRef` for parent calls (e.g. export).
- **Unions** — Small domain types live in their own file (`Mode.ts`).
- **Fabric refs** — `useRef<Canvas | null>(null)` for the Fabric instance; `useRef<HTMLCanvasElement | null>(null)` for the DOM canvas.

Prefer `import type { ... }` for type-only imports.

## React patterns

### Lift state up

`App` owns `mode`, `label`, and `imageUrl`. Children get values + setters as props:

```tsx
<Control mode={mode} setMode={setMode} ... />
<CanvasEditor mode={mode} label={label} imageUrl={imageUrl} />
```

### Split Fabric logic into hooks

Each hook in `canvas-editor-hooks/` does one job and takes `fabricRef` (and other deps). Effects register Fabric/window listeners and **clean up** in the return function (`canvas.off`, `removeEventListener`, `canvas.dispose`).

### Keep Fabric off React state

The `Canvas` object and drawing helpers live in refs. React state is only for things the UI must re-render (e.g. `pendingRect` to show Confirm/Cancel).

### `forwardRef` for parent actions

When the parent must call canvas methods (export), expose a small ref API instead of prop drilling callbacks for every operation.

## Fabric.js patterns

### Imports

Import classes from `"fabric"`:

```ts
import { Canvas, Rect, Textbox, Group, FabricImage } from "fabric";
import type { Canvas, FabricObject } from "fabric";
```

### Canvas lifecycle

1. Create in `useEffect` when the DOM `<canvas>` ref is ready.
2. Store on `fabricRef.current`.
3. `dispose()` on unmount.

### Loading images

Use `FabricImage.fromURL(url)`, then `canvas.clear()`, scale to fit, `canvas.add(img)`, `centerObject`, `sendObjectToBack`, `renderAll()`.

### Object flags

| Flag | Typical use here |
|------|------------------|
| `selectable: false` | Background image; finished annotation groups |
| `evented: false` | Same — object ignores pointer events |
| `originX` / `originY` `"left"` / `"top"` | Easier math when resizing rects from drag |

### Drawing rectangles (annotate mode)

- Listen to `mouse:down`, `mouse:move`, `mouse:up`.
- Use `canvas.getScenePoint(opt.e)` for coordinates (not raw DOM offsets).
- Update rect with `rect.set({ ... })` and `canvas.renderAll()` on move.
- Enforce a minimum size (`MIN_SIZE`) before keeping the shape.

### Grouping annotations

On confirm: create `Textbox` for the label, `remove` the loose rect, `new Group([rect, text])`, `add` the group. Groups use the same non-interactive flags as the locked image in annotate mode (via `useModeToggle`).

### Export

`canvas.toDataURL({ left, top, width, height, format: "png" })` cropped to the image object’s bounds.

### Event cleanup

Always pair `canvas.on(...)` with `canvas.off(...)` in the effect cleanup. Same for `window.addEventListener`.

## CSS style

- **No CSS modules or Tailwind** — plain class names in a sibling `.css` file.
- **Scoped by prefix** — e.g. all canvas editor UI uses `canvas-editor-*`, control bar uses `control-container` and semantic names like `file-upload`.
- **Layout** — Flexbox for toolbars; `gap` for spacing.
- **Colors** — Simple hex palette: blue for primary/active (`#3487e4`, `#0078d4`), green upload (`#2da44e`), red strokes on boxes, light gray borders (`#ddd`, `#ccc`).
- **Global** — `index.css` sets `system-ui` font and shared `button`/`input` font size.

## Linting

ESLint with TypeScript and `react-hooks` recommended rules. Fabric mouse handlers sometimes use `any` for event options with an inline `eslint-disable-next-line` — acceptable here until Fabric types are wired for those callbacks.

## What to avoid

- Putting the Fabric `Canvas` in `useState` (causes extra renders and dispose issues).
- Forgetting effect cleanup (memory leaks, duplicate listeners).
- Drawing a second box while `pendingRect` is set (guarded in `useAnnotationDrawing`).
- Making the background image selectable in annotate mode (breaks draw interactions).
