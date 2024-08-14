import React, { useRef, useEffect } from "react";
import * as THREE from "three";

function Skyscraper() {
  const mountRef = useRef(null);
  const selectedBoxRef = useRef(null);
  const hoveredBoxRef = useRef(null);
  const thetaRef = useRef(45); // Horizontal angle
  const phiRef = useRef(Math.PI / 3); // Vertical angle

  useEffect(() => {
    // Create the scene
    const scene = new THREE.Scene();

    // Create the camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;
    camera.position.y = 3;

    // Create the renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Add lighting to the scene
    const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // Directional light to cast shadows
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Create building blocks (parallelepipeds) with a grey material
    const geometry = () => new THREE.BoxGeometry(2, 0.5, 2);
    const material = () => new THREE.MeshStandardMaterial({ color: 0x808080 }); // Default grey color
    const building = new THREE.Group();
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 4; j++) {
        const box = new THREE.Mesh(geometry(), material());
        box.position.x = (j % 2 === 0 ? -1 : 1) * 1.1;
        box.position.z = (j < 2 ? -1 : 1) * 1.1;
        box.position.y = i * 0.6;
        box.userData = { apartmentNumber: i * 4 + j + 1 }; // Assign an apartment number
        building.add(box);
      }
    }
    scene.add(building);

    // Calculate the center of the building
    const buildingHeight = 10 * 0.6; // Total height of the building
    const buildingCenter = new THREE.Vector3(0, buildingHeight / 2, 0); // Center point of the building

    // Variables for mouse controls
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    const radius = 10; // Distance from the camera to the center of the building

    // Variables for detecting clicks and hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Function to update the camera's position based on theta and phi
    function updateCameraPosition() {
      const theta = thetaRef.current;
      const phi = phiRef.current;
      camera.position.x =
        buildingCenter.x +
        radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = buildingCenter.y + radius * Math.cos(phi);
      camera.position.z =
        buildingCenter.z +
        radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(buildingCenter); // Keep looking at the center of the building
    }

    // Initial camera position
    updateCameraPosition();

    // Apply the hovered box if it exists
    if (hoveredBoxRef.current != null) {
      building.children.forEach((box) => {
        if (box.userData.apartmentNumber === hoveredBoxRef.current) {
          box.material.color.set(0x00ff00); // Highlight hovered apartment in green
        }
      });
    }

    // Function to handle mouse down event
    function onMouseDown(event) {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;

      // Detect click on apartment
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(building.children);

      if (intersects.length > 0) {
        const selected = intersects[0].object;

        selectedBoxRef.current = selected.userData.apartmentNumber; // Update ref with selected apartment number

        // Set color for the selected apartment
        building.children.forEach((box) => {
          box.material.color.set(0x808080); // Reset all to grey
        });

        selected.material.color.set(0x00ff00); // Highlight the selected apartment in green
      }
    }

    // Function to reset previous hovered apartment to grey
    function resetPrevHoveredBoxColor() {
      if (hoveredBoxRef.current !== null) {
        building.children.forEach((box) => {
          if (box.userData.apartmentNumber === hoveredBoxRef.current) {
            box.material.color.set(0x808080);
          }
        });
      }
    }

    // Function to handle mouse move event (for rotating and hover effects)
    function onMouseMove(event) {
      if (isMouseDown) {
        const deltaX = event.clientX - mouseX;
        const deltaY = event.clientY - mouseY;

        // Update theta and phi based on mouse movement, invert directions to match expected behavior
        thetaRef.current -= deltaX * 0.01; // Inverted to match expected direction
        phiRef.current = Math.max(
          0.8,
          Math.min(Math.PI - 1.4, phiRef.current - deltaY * 0.005)
        ); // Inverted and clamped to match expected direction

        updateCameraPosition();

        mouseX = event.clientX;
        mouseY = event.clientY;
      } else {
        // Handle hover effect
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(building.children);

        if (intersects.length > 0) {
          const hovered = intersects[0].object;

          if (hovered.userData.apartmentNumber !== hoveredBoxRef.current) {
            resetPrevHoveredBoxColor();
            hovered.material.color.set(0x00ff00); // Highlight hovered apartment in green
            hoveredBoxRef.current = hovered.userData.apartmentNumber;
          }
        } else {
          resetPrevHoveredBoxColor();
        }
      }
    }

    // Function to handle mouse up event
    function onMouseUp() {
      isMouseDown = false;
    }

    // Function to handle window resize event
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Add event listeners
    window.addEventListener("mousedown", onMouseDown, false);
    window.addEventListener("mousemove", onMouseMove, false);
    window.addEventListener("mouseup", onMouseUp, false);
    window.addEventListener("resize", onWindowResize, false);

    // Render loop
    const animate = function () {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      // Cleanup on unmount
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", onWindowResize);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []); // Empty dependency array to avoid re-running the effect

  return (
    <div>
      <div ref={mountRef} style={{ position: "relative" }}></div>
      {selectedBoxRef.current && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            padding: "10px",
            backgroundColor: "white",
            border: "1px solid black",
            borderRadius: "5px",
          }}
        >
          You selected apartment number {selectedBoxRef.current}
        </div>
      )}
    </div>
  );
}

export default Skyscraper;
