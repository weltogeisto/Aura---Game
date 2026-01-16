import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface PanoramaProps {
  color: string;
}

export function Panorama({ color }: PanoramaProps) {
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    // Create a canvas texture for the panorama
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, '#2a2a2a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add some museum-like details
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for (let i = 0; i < 50; i++) {
        ctx.fillRect(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 100,
          Math.random() * 100
        );
      }
    }

    textureRef.current = new THREE.CanvasTexture(canvas);
  }, [color]);

  return (
    <mesh>
      <sphereGeometry args={[100, 64, 64]} />
      <meshBasicMaterial map={textureRef.current || undefined} side={THREE.BackSide} />
    </mesh>
  );
}
