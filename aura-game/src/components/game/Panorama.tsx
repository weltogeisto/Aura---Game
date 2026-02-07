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
      // Base gradients for ceiling, walls, and floor
      const wallGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      wallGradient.addColorStop(0, color);
      wallGradient.addColorStop(0.45, '#3b2d21');
      wallGradient.addColorStop(1, '#1b1b1b');
      ctx.fillStyle = wallGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const ceilingGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.55);
      ceilingGradient.addColorStop(0, '#2a1f19');
      ceilingGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ceilingGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.55);

      const floorGradient = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height);
      floorGradient.addColorStop(0, 'rgba(10, 10, 10, 0)');
      floorGradient.addColorStop(1, '#0c0c0f');
      ctx.fillStyle = floorGradient;
      ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height);

      // Suggestive arches and alcoves
      ctx.strokeStyle = 'rgba(255, 230, 200, 0.12)';
      ctx.lineWidth = 4;
      const archCount = 10;
      const archWidth = canvas.width / archCount;
      for (let i = 0; i < archCount; i++) {
        const x = i * archWidth;
        ctx.beginPath();
        ctx.moveTo(x, canvas.height * 0.55);
        ctx.bezierCurveTo(
          x + archWidth * 0.25,
          canvas.height * 0.2,
          x + archWidth * 0.75,
          canvas.height * 0.2,
          x + archWidth,
          canvas.height * 0.55
        );
        ctx.stroke();
      }

      // Frames along the horizon line
      ctx.fillStyle = 'rgba(220, 200, 170, 0.08)';
      const frameY = canvas.height * 0.52;
      for (let i = 0; i < 18; i++) {
        const frameWidth = 70 + (i % 4) * 15;
        const frameHeight = 90 + (i % 3) * 12;
        const frameX = (i * 110) % canvas.width;
        ctx.fillRect(frameX, frameY, frameWidth, frameHeight);
        ctx.strokeStyle = 'rgba(255, 240, 210, 0.15)';
        ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);
      }

      // Subtle light pools
      for (let i = 0; i < 6; i++) {
        const x = (i + 0.5) * (canvas.width / 6);
        const y = canvas.height * 0.2;
        const radius = 180 + i * 10;
        const radial = ctx.createRadialGradient(x, y, 40, x, y, radius);
        radial.addColorStop(0, 'rgba(255, 230, 200, 0.12)');
        radial.addColorStop(1, 'rgba(255, 230, 200, 0)');
        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dust motes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
      for (let i = 0; i < 140; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height * 0.7,
          Math.random() * 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    textureRef.current = new THREE.CanvasTexture(canvas);
    textureRef.current.needsUpdate = true;
  }, [color]);

  return (
    <mesh>
      <sphereGeometry args={[100, 64, 64]} />
      <meshBasicMaterial map={textureRef.current || undefined} side={THREE.BackSide} />
    </mesh>
  );
}
