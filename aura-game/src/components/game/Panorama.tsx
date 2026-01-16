import { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';

interface PanoramaProps {
  color: string;
}

/**
 * Creates the panorama background texture using canvas
 * @param color - The primary color for the gradient
 * @returns THREE.CanvasTexture for the panorama sphere
 */
function createPanoramaTexture(color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Gradient background simulating museum lighting
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some museum-like architectural details (subtle rectangles)
    // Using a seeded approach to make it deterministic for same color
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < 50; i++) {
      // Use pseudo-random values based on index to be deterministic
      const seed = i * 0.618033988749895; // Golden ratio
      ctx.fillRect(
        (seed * 1234.5678 % 1) * canvas.width,
        (seed * 8765.4321 % 1) * canvas.height,
        (seed * 100 % 100),
        (seed * 100 % 100)
      );
    }
  }

  return new THREE.CanvasTexture(canvas);
}

export function Panorama({ color }: PanoramaProps) {
  // Create texture using useMemo to avoid recreating on every render
  // Texture is recreated only when color changes
  const texture = useMemo(() => createPanoramaTexture(color), [color]);

  // Store ref for cleanup
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  // Cleanup previous texture when a new one is created, and on unmount
  useEffect(() => {
    // Dispose of previous texture if it exists and is different
    if (textureRef.current && textureRef.current !== texture) {
      textureRef.current.dispose();
    }
    textureRef.current = texture;

    // Cleanup on unmount
    return () => {
      if (textureRef.current) {
        textureRef.current.dispose();
        textureRef.current = null;
      }
    };
  }, [texture]);

  return (
    <mesh>
      <sphereGeometry args={[100, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}
