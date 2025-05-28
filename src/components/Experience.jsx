import { Environment, OrbitControls, useTexture } from "@react-three/drei";
import { Avatar } from "./Avatar-Lawyer-Male-2";
import { useThree } from "@react-three/fiber";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const Experience = () => {
  const texture = useTexture("textures/ghibli-nus.png");
  const viewport = useThree((state) => state.viewport);
  
  // Reference to the avatar group
  const avatarRef = useRef();
  
  // State to track mouse/touch interaction
  const [isDragging, setIsDragging] = useState(false);
  const [previousMousePosition, setPreviousMousePosition] = useState({ x: 0, y: 0 });
  
  // Maximum rotation values (in radians)
  const maxRotation = {
    y: 0.35,  // Maximum horizontal rotation (around y-axis)
    x: 0.001   // Maximum vertical tilt (around x-axis)
  };

  // Handle mouse events
  const handlePointerDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    setPreviousMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handlePointerMove = (e) => {
    if (isDragging && avatarRef.current) {
      // Calculate mouse movement
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      
      // Apply progressive resistance
      // The closer to max rotation, the smaller the effect of additional dragging
      const currentYRotation = avatarRef.current.rotation.y;
      const currentXRotation = avatarRef.current.rotation.x;
      
      // Calculate resistance factor (0-1) based on how close we are to max rotation
      const yResistance = Math.abs(currentYRotation) / maxRotation.y;
      const xResistance = Math.abs(currentXRotation) / maxRotation.x;
      
      // Apply progressively smaller changes as we approach the limits
      const yRotationDelta = deltaX * 0.005 * (1 - Math.pow(yResistance, 2));
      const xRotationDelta = deltaY * 0.005 * (1 - Math.pow(xResistance, 2));
      
      // Calculate new rotation values
      const newYRotation = currentYRotation + yRotationDelta;
      const newXRotation = currentXRotation + xRotationDelta;
      
      // Apply the rotations (with soft maximum caps for stability)
      avatarRef.current.rotation.y = THREE.MathUtils.clamp(
        newYRotation,
        -maxRotation.y * 1.1,
        maxRotation.y * 1.1
      );
      
      avatarRef.current.rotation.x = THREE.MathUtils.clamp(
        newXRotation,
        -maxRotation.x * 1.1,
        maxRotation.x * 1.1
      );
      
      // Update previous position for next frame
      setPreviousMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  // Add damped rotation reset when not dragging
  useFrame(() => {
    if (!isDragging && avatarRef.current) {
      // Gradually return to neutral position when not being dragged
      avatarRef.current.rotation.y = THREE.MathUtils.lerp(avatarRef.current.rotation.y, 0, 0.05);
      avatarRef.current.rotation.x = THREE.MathUtils.lerp(avatarRef.current.rotation.x, 0, 0.05);
    }
  });

  return (
    <>
      <OrbitControls 
        enableZoom={false} 
        enableRotate={false} 
        enablePan={false} 
      />
      
      {/* Add a transparent plane to capture mouse events */}
      <mesh 
        position={[0, 0, 6]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerUp}
        onPointerMove={handlePointerMove}
      >
        <planeGeometry args={[viewport.width, viewport.height]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Group that will be rotated in place */}
      <group position={[0, -3, 5]} ref={avatarRef}>
        <Avatar scale={2}/>
      </group>
      
      <Environment preset="sunset" />
      <mesh>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </>
  );
};