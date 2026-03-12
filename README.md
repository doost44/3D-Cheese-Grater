# 3D Cheese Grater — Interactive Demo

A polished, interactive 3D product demo built with **React**, **Three.js**, and **Vite**.  
Spin a stainless-steel box grater, choose a grating mode, and watch cheese fly.

![3D Cheese Grater demo](public/screenshot.png)

---

## Features

| Feature | Details |
|---|---|
| 🔩 Procedural geometry | Box grater with perforated faces, torus handle, corner edges, and feet — no assets required |
| 🧀 3 grating modes | **Fine** (Parmesan) · **Coarse** (Cheddar) · **Zest** (microplane slots) |
| 🎞 Live animation | Cheese block oscillates against the grater; particles spawn, fall under gravity, and settle |
| 🖱 Orbit controls | Drag to orbit, scroll to zoom; auto-rotates when idle |
| ✨ Reflections | HDR environment map for realistic metallic sheen |
| 📦 Zero assets | Fully procedural — runs immediately without any external files |

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

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server (HMR) |
| `npm run build` | TypeScript + production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint |

---

## Tech stack

- [React 19](https://react.dev)
- [Three.js](https://threejs.org)
- [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)
- [@react-three/drei](https://github.com/pmndrs/drei)
- [Vite 8](https://vite.dev)
- TypeScript 5
