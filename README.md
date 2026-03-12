# GrateTogether — Interactive 3D Prototype Viewer

A polished, interactive 3D product concept render of **GrateTogether**, a dual-mode countertop cheese grater workstation. Built with **React**, **Three.js**, and **Vite**.

The user can rotate, zoom, and inspect the product in 3D space, switch between **Safe Mode** and **Pro Mode**, and click **Activate** to watch a cheese interaction simulation appropriate to the active mode.

---

## Features

| Feature | Details |
|---|---|
| 🧀 Dual-mode grater | **Safe Mode** (guided, enclosed grating for children 8–12) and **Pro Mode** (open grater face for precision use) |
| 🔩 Procedural geometry | Full product model built from primitives — no external assets required |
| 🛡️ Safe Mode | Closed shutter, captive pusher, enclosed feed channel, green accent cues |
| ⚡ Pro Mode | Retracted shutter, exposed grater plate, direct front access |
| 🎞 Cheese animation | Mode-specific cheese interaction demo with grated particles |
| 🖱 Orbit controls | Drag to orbit, scroll to zoom, auto-rotates when idle |
| 📦 Zero external assets | Fully procedural — runs immediately |

---

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## GitHub Codespaces

Click **Code → Codespaces → Create codespace**.
The devcontainer installs dependencies automatically and forwards port **5173**.
The browser preview opens as soon as the dev server starts.

---

## Controls

| Control | Action |
|---|---|
| 🖱 Drag | Orbit around the product |
| Scroll | Zoom in/out |
| **SAFE / PRO** toggle | Switch between Safe Mode and Pro Mode |
| **Activate** button | Run the cheese interaction demonstration for the current mode |
| **Reset** button | Reset the demonstration to its initial state |

---

## Mode Behavior

### Safe Mode
- Face shutter is **closed** and latched
- Only narrow slot windows are visible over the grating area
- Captive pusher is **engaged** and visible in the guided channel
- Collection bin is inserted
- Green accents communicate load → push → collect
- Cheese travels down the enclosed feed path, stops before total depletion (safe stub)
- Grated output falls internally into the collection bin
- The front grater face is never exposed

### Pro Mode
- Face shutter **retracts** to fully expose the grater plate
- Pusher is **parked** / visually disengaged
- Collection bin remains visible
- Cheese approaches directly against the exposed grater plate
- Grated output falls from the plate into the bin
- Visual tone shifts to darker/performance accents

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server (HMR) |
| `npm run build` | TypeScript + production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint |

---

## Project Structure

```
src/
├── App.tsx              # Root component
├── App.css              # UI styling
├── types.ts             # Type definitions and constants
├── hooks/
│   └── usePrototypeState.ts  # Central state & animation logic
├── components/
│   ├── Scene.tsx              # 3D canvas, lighting, orbit controls
│   ├── GrateTogetherModel.tsx # Procedural 3D product model
│   ├── CheeseDemo.tsx         # Cheese interaction animation
│   ├── ControlPanel.tsx       # UI overlay (mode toggle, buttons)
│   └── ModeIndicators.tsx     # In-scene 3D labels
└── ...
```

---

## Tech Stack

- [React 19](https://react.dev)
- [Three.js](https://threejs.org)
- [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)
- [@react-three/drei](https://github.com/pmndrs/drei)
- [Vite 8](https://vite.dev)
- TypeScript 5

---

## Limitations & Assumptions

- The 3D model is built procedurally from primitive geometry (boxes, cylinders, torus, planes) — it approximates the canonical silhouette but is not a production CAD model.
- The cheese interaction animation is a simplified demonstration, not a physics simulation.
- The grater hole texture is represented with small circle meshes rather than a true perforation.
- WebGL is required; the scene uses software WebGL fallback in environments without GPU acceleration.
