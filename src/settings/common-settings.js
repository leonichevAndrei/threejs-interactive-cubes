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
      color: 0x404040, // Soft white light
    },
    directional: {
      color: 0xffffff,
      intensity: 0.5,
      position: { x: 5, y: 10, z: 7.5 },
    },
  },
  building: {
    block: {
      geometry: { width: 2, height: 0.5, depth: 2 },
      spacing: { x: 1.1, y: 0.6, z: 1.1 },
      defaultColor: 0x808080 , // Default grey color
      highlightColor: 0x00ff00, // Green color for highlighting
      selectColor: 0x00ffff, // Green color for highlighting
    },
    height: 10, // Number of floors
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