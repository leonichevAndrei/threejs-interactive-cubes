import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

function Skyscraper() {
    // Use ref to directly access DOM elements where we mount our Three.js scene
    const mountRef = useRef(null);

    useEffect(() => {
        // Create the scene where all objects will be placed
        const scene = new THREE.Scene();

        // Create the camera, which determines what we see
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 10; // Set camera distance from the center of the scene
        camera.position.y = 5;  // Raise the camera slightly to see the skyscraper from an angle

        // Create the renderer that will display our scene in the browser
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight); // Set renderer size to full window
        mountRef.current.appendChild(renderer.domElement); // Attach the renderer's output (canvas) to our div

        // Create the geometry for the building blocks (parallelepipeds)
        const geometry = new THREE.BoxGeometry(2, 0.5, 2);  // BoxGeometry with width, height, and depth
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Basic material with green color

        // Group all the blocks together to form the skyscraper
        const building = new THREE.Group();

        // Loop to create 10 floors, each with 4 blocks
        for (let i = 0; i < 10; i++) { 
            for (let j = 0; j < 4; j++) { 
                const box = new THREE.Mesh(geometry, material); // Create a new block (mesh)

                // Position blocks based on index
                box.position.x = (j % 2 === 0 ? -1 : 1) * 1.1; // Position left/right
                box.position.z = (j < 2 ? -1 : 1) * 1.1; // Position front/back
                box.position.y = i * 0.6; // Position up based on floor number

                building.add(box); // Add each block to the building group
            }
        }

        scene.add(building); // Add the building group to the scene

        // Variables to track mouse movement for rotating the building
        let isMouseDown = false;
        let mouseX = 0;
        let mouseY = 0;

        // Function to handle mouse down event (start of dragging)
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        function onMouseDown(event) {
          isMouseDown = true;
          mouseX = event.clientX;
          mouseY = event.clientY;
      
          // Convert mouse position to normalized device coordinates (-1 to +1)
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
          // Update the raycaster with the mouse position and camera
          raycaster.setFromCamera(mouse, camera);
      
          // Check for intersections with the building's children (blocks)
          const intersects = raycaster.intersectObjects(building.children);
      
          if (intersects.length > 0) {
              // Show an alert when a block is clicked
              alert("You clicked on a block!");
          }
        }

        // Function to handle mouse move event (dragging)
        function onMouseMove(event) {
            if (!isMouseDown) return; // Only rotate if the mouse is held down

            const deltaX = event.clientX - mouseX; // Calculate horizontal movement
            const deltaY = event.clientY - mouseY; // Calculate vertical movement

            building.rotation.y += deltaX * 0.01; // Rotate building horizontally
            camera.position.y -= deltaY * 0.01; // Slightly adjust camera vertically

            mouseX = event.clientX; // Update previous mouse position
            mouseY = event.clientY;
        }

        // Function to handle mouse up event (end of dragging)
        function onMouseUp() {
            isMouseDown = false; // Stop rotation on mouse release
        }

        // Function to handle window resize event
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight; // Update camera aspect ratio
            camera.updateProjectionMatrix(); // Apply the aspect ratio change
            renderer.setSize(window.innerWidth, window.innerHeight); // Adjust the renderer size
        }

        // Add event listeners for mouse and window resize events
        window.addEventListener('mousedown', onMouseDown, false);
        window.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('mouseup', onMouseUp, false);
        window.addEventListener('resize', onWindowResize, false);

        // Function to continuously render the scene
        const animate = function () {
            requestAnimationFrame(animate); // Request the next frame
            renderer.render(scene, camera); // Render the scene using the camera
        };

        animate(); // Start the animation loop

        return () => {
            // Cleanup: remove event listeners and the renderer's canvas when the component is unmounted
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('resize', onWindowResize);
            mountRef.current.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div ref={mountRef}></div> // A div to mount our Three.js scene
    );
}

export default Skyscraper;
