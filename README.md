# 🎲 React + Three.js — Interactive 3D Cubes (Skyscraper)

An interactive 3D demo built with **React** and **Three.js**: a vertical stack of “apartments” (cubes) that you can rotate, hover, and select.  
When you click a cube, a **popup** appears showing its apartment number.

> Built as a small technical assignment / demo. Focused on camera control, raycasting, hover/selection states, and touch support.

---

## ✨ Features

- Interactive 3D building made of cubes  
- Mouse and touch support (rotate / select)  
- Hover highlight and click selection  
- React-based popup overlay  
- Configurable 3D scene and camera settings  

---

## 🧱 Tech Stack

- **React** (Hooks, functional components)  
- **Three.js** for 3D rendering  
- **CSS / SCSS** for layout and popup styling  

---

## 🚀 Getting Started

> Requires Node 18+

```bash
# Install dependencies
npm install

# Run the project
npm start
```

If you’re using Vite:

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

---

## 📁 Project Structure

```
src/
  components/
    PopUp.jsx
    Skyscraper.jsx
  settings/
    common-settings.js
  styles/
    app.css
    pop-up.css
  App.jsx
  main.jsx (or index.jsx)
```

- `Skyscraper.jsx` — Three.js setup, camera, lighting, cube creation, hover and selection logic  
- `PopUp.jsx` — Popup overlay displaying the selected apartment number  
- `App.jsx` — Main entry point connecting components  

---

## 🎮 Controls

**Desktop:**  
- Drag → rotate the building  
- Hover → highlight cube  
- Click → show popup  

**Touch devices:**  
- Drag → rotate the building  
- Tap → show popup  

---

## ⚙️ Configuration

All main parameters are stored in `settings/common-settings.js`:

```js
export default {
  camera: {
    fov: 75,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 1000,
    position: { x: 0, y: 3, z: 10 },
  },
  lighting: {
    ambient: {
      color: 0xf0f0f0, // Soft white light
    },
    directional: {
      color: 0xf0f0f0,
      intensity: 1,
      position: { x: 5, y: 10, z: 7.5 },
    },
  },
  building: {
    block: {
      geometry: { width: 2, height: 0.5, depth: 2 },
      spacing: { x: 1.1, y: 0.6, z: 1.1 },
      defaultColor: 0xf0f0f0 , // Default grey color
      highlightColor: 0x00ff00, // Green color for highlighting
      selectColor: 0x00ffff, // Green color for highlighting
    },
    height: 10, // Number of floors
  },
  scene: {
    backgroundColor: 0xf0f0f0, // Light grey background color
  },
  cameraControls: {
    radius: 10, // Distance from the camera to the center of the building
    initialTheta: 45,
    initialPhi: Math.PI / 3,
    thetaSensitivity: 0.01,
    phiSensitivity: 0.005,
    phiClamp: { min: 0.8, max: Math.PI - 1.4 },
  },
};
```

---

## 🧠 Implementation Notes

- Uses **raycasting** to detect hovered and clicked cubes  
- Camera rotates via **spherical coordinates** (`theta`, `phi`)  
- State stored in both `useRef` (persistent state) and `useState` (popup visibility)  
- Responsive — resizes with window events  

---

## 🧪 Potential Improvements

- Add floor navigation or labels  
- Add shadows or materials for realism  
- Improve accessibility (keyboard rotation)  
- Use performance optimizations for mobile  

---

## 📜 License

MIT — free to use and modify.
