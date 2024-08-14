import React, { useRef, useEffect, useState } from "react";
import PopUp from '../components/PopUp';
import * as THREE from "three";
import settings from '../settings/common-settings';

function Skyscraper() {
  const mountRef = useRef(null);
  const selectedBoxRef = useRef(null);
  const [selectedBox, setSelectedBox] = useState(null);
  const isPopupVisibleRef = useRef(false);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const hoveredBoxRef = useRef(null);
  const thetaRef = useRef(settings.cameraControls.initialTheta); // Horizontal angle
  const phiRef = useRef(settings.cameraControls.initialPhi); // Vertical angle

  useEffect(() => {
    // Create the scene
    const scene = new THREE.Scene();

    // Set the background color or texture
    scene.background = new THREE.Color(settings.scene.backgroundColor);

    // Create the camera
    const camera = new THREE.PerspectiveCamera(
      settings.camera.fov,
      settings.camera.aspect,
      settings.camera.near,
      settings.camera.far
    );
    camera.position.set(
      settings.camera.position.x,
      settings.camera.position.y,
      settings.camera.position.z
    );

    // Create the renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // Enable shadows
    mountRef.current.appendChild(renderer.domElement);

    // Add lighting to the scene
    const ambientLight = new THREE.AmbientLight(settings.lighting.ambient.color);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(
      settings.lighting.directional.color,
      settings.lighting.directional.intensity
    );
    directionalLight.position.set(
      settings.lighting.directional.position.x,
      settings.lighting.directional.position.y,
      settings.lighting.directional.position.z
    );
    directionalLight.castShadow = true; // Enable shadow casting
    scene.add(directionalLight);

    // Create building blocks (parallelepipeds) with a grey material
    const geometry = () =>
      new THREE.BoxGeometry(
        settings.building.block.geometry.width,
        settings.building.block.geometry.height,
        settings.building.block.geometry.depth
      );
    const material = () =>
      new THREE.MeshStandardMaterial({
        color: settings.building.block.defaultColor,
      });
    const building = new THREE.Group();
    for (let i = 0; i < settings.building.height; i++) {
      for (let j = 0; j < 4; j++) {
        const box = new THREE.Mesh(geometry(), material());
        box.position.x =
          (j % 2 === 0 ? -1 : 1) * settings.building.block.spacing.x;
        box.position.z =
          (j < 2 ? -1 : 1) * settings.building.block.spacing.z;
        box.position.y = i * settings.building.block.spacing.y;
        box.userData = { apartmentNumber: i * 4 + j + 1 }; // Assign an apartment number
        box.castShadow = true; // Enable shadow casting
        building.add(box);
      }
    }
    scene.add(building);

    // Add a ground plane
    const planeGeometry = new THREE.PlaneGeometry(500, 500);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.3;
    plane.receiveShadow = true; // Enable shadow receiving
    scene.add(plane);

    // Calculate the center of the building
    const buildingHeight = settings.building.height * settings.building.block.spacing.y; // Total height of the building
    const buildingCenter = new THREE.Vector3(0, buildingHeight / 2, 0); // Center point of the building

    // Variables for mouse and touch controls
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    const radius = settings.cameraControls.radius; // Distance from the camera to the center of the building

    // Variables for detecting clicks and hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Function to update the camera's position based on theta and phi
    function updateCameraPosition() {
      const theta = thetaRef.current;
      const phi = phiRef.current;
      camera.position.x =
        buildingCenter.x + radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = buildingCenter.y + radius * Math.cos(phi);
      camera.position.z =
        buildingCenter.z + radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(buildingCenter); // Keep looking at the center of the building
    }
    updateCameraPosition(); // Initial camera position

    // Apply the hovered box if it exists
    if (hoveredBoxRef.current != null) {
      building.children.forEach((box) => {
        if (box.userData.apartmentNumber === hoveredBoxRef.current) {
          box.material.color.set(settings.building.block.highlightColor); // Highlight hovered apartment in green
        }
      });
    }

    // Function to reset previous hovered apartment to grey
    function resetPrevHoveredBoxColor() {
      if (hoveredBoxRef.current !== null) {
        building.children.forEach((box) => {
          if (box.userData.apartmentNumber === hoveredBoxRef.current && 
            box.userData.apartmentNumber !== selectedBoxRef.current
          ) {
            box.material.color.set(settings.building.block.defaultColor);
          }
        });
      }
    }

    // Function to reset previous selected apartment to grey
    function resetPrevSelectedBoxColor() {
      if (selectedBoxRef.current !== null) {
        building.children.forEach((box) => {
          if (box.userData.apartmentNumber === selectedBoxRef.current) {
            box.material.color.set(settings.building.block.defaultColor);
          }
        });
      }
    }

    // Function to handle mouse down event
    function onMouseDown(event) {
      if (!isPopupVisibleRef.current) {
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
          resetPrevSelectedBoxColor();
          selectedBoxRef.current = selected.userData.apartmentNumber; // Update ref with selected apartment number
          setSelectedBox(selected.userData.apartmentNumber) // Update state with selected apartment number
          setPopupVisible(true); // Show pop-up window
          isPopupVisibleRef.current = true; // Set popup visibility ref to true
          selected.material.color.set(settings.building.block.selectColor); // Highlight the selected apartment in select color
        }
      }
    }

    // Function to handle mouse up event
    function onMouseUp() {
      isMouseDown = false;
    }

    // Function to handle mouse move event (for rotating and hover effects)
    function onMouseMove(event) {
      if (!isPopupVisibleRef.current) {
        if (isMouseDown) {
          const deltaX = event.clientX - mouseX;
          const deltaY = event.clientY - mouseY;
  
          // Update theta and phi based on mouse movement, invert directions to match expected behavior
          thetaRef.current -= deltaX * settings.cameraControls.thetaSensitivity; // Inverted to match expected direction
          phiRef.current = Math.max(
            settings.cameraControls.phiClamp.min,
            Math.min(
              settings.cameraControls.phiClamp.max,
              phiRef.current - deltaY * settings.cameraControls.phiSensitivity
            )
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
            resetPrevHoveredBoxColor();
            hoveredBoxRef.current = hovered.userData.apartmentNumber;
            if (hovered.userData.apartmentNumber !== selectedBoxRef.current) {
              hovered.material.color.set(settings.building.block.highlightColor); // Highlight hovered apartment in green
            }
          } else {
            resetPrevHoveredBoxColor();
          }
        }
      }
    }

    // Touch events for mobile
    function onTouchStart(event) {
      if (!isPopupVisibleRef.current) {
        if (event.touches.length === 1) { // One finger touch
          isMouseDown = true;
          mouseX = event.touches[0].clientX;
          mouseY = event.touches[0].clientY;
  
          // Detect touch on apartment
          mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
  
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(building.children);
  
          if (intersects.length > 0) {
            const selected = intersects[0].object;
            resetPrevSelectedBoxColor();
            selectedBoxRef.current = selected.userData.apartmentNumber; // Update ref with selected apartment number
            setSelectedBox(selected.userData.apartmentNumber); // Update state with selected apartment number
            setPopupVisible(true); // Show pop-up window
            isPopupVisibleRef.current = true; // Set popup visibility ref to true
            selected.material.color.set(settings.building.block.selectColor); // Highlight the selected apartment in select color
          }
        }
      }
    }

    function onTouchMove(event) {
      if (isMouseDown && event.touches.length === 1) {
        const deltaX = event.touches[0].clientX - mouseX;
        const deltaY = event.touches[0].clientY - mouseY;
  
        // Update theta and phi based on touch movement
        thetaRef.current -= deltaX * settings.cameraControls.thetaSensitivity;
        phiRef.current = Math.max(
          settings.cameraControls.phiClamp.min,
          Math.min(
            settings.cameraControls.phiClamp.max,
            phiRef.current - deltaY * settings.cameraControls.phiSensitivity
          )
        );
  
        updateCameraPosition();
  
        mouseX = event.touches[0].clientX;
        mouseY = event.touches[0].clientY;
      }
    }

    function onTouchEnd() {
      isMouseDown = false;
    }

    // Function to handle window resize event
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Add event listeners for mouse and touch
    window.addEventListener("mousedown", onMouseDown, false);
    window.addEventListener("mousemove", onMouseMove, false);
    window.addEventListener("mouseup", onMouseUp, false);
    window.addEventListener("resize", onWindowResize, false);
    window.addEventListener("touchstart", onTouchStart, false);
    window.addEventListener("touchmove", onTouchMove, false);
    window.addEventListener("touchend", onTouchEnd, false);

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
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []); // Empty dependency array to avoid re-running the effect

  return (
    <div>
      <div ref={mountRef} style={{ position: "relative" }} />
      {isPopupVisible && (
        <PopUp selectedBox={selectedBox} onClose={() => {
          setPopupVisible(false); 
          isPopupVisibleRef.current = false;
        }} />
      )}      
    </div>
  );
}

export default Skyscraper;
