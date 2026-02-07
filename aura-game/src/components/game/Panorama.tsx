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
      wallGradient.addColorStop(0.25, '#d8b38c');
      wallGradient.addColorStop(0.55, '#a57958');
      wallGradient.addColorStop(1, '#3b2a2b');
      ctx.fillStyle = wallGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const ceilingGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.55);
      ceilingGradient.addColorStop(0, '#8a6a4d');
      ceilingGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ceilingGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.55);

      const horizonGlow = ctx.createLinearGradient(0, canvas.height * 0.4, 0, canvas.height * 0.7);
      horizonGlow.addColorStop(0, 'rgba(255, 234, 210, 0.32)');
      horizonGlow.addColorStop(0.5, 'rgba(255, 222, 190, 0.38)');
      horizonGlow.addColorStop(1, 'rgba(80, 50, 40, 0)');
      ctx.fillStyle = horizonGlow;
      ctx.fillRect(0, canvas.height * 0.38, canvas.width, canvas.height * 0.35);

      const floorGradient = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height);
      floorGradient.addColorStop(0, 'rgba(30, 24, 18, 0)');
      floorGradient.addColorStop(1, '#3a2a2f');
      ctx.fillStyle = floorGradient;
      ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height);

      // Suggestive arches and alcoves
      ctx.strokeStyle = 'rgba(255, 234, 210, 0.5)';
      ctx.lineWidth = 6;
      const archCount = 12;
      const archWidth = canvas.width / archCount;
      for (let i = 0; i < archCount; i++) {
        const x = i * archWidth;
        ctx.beginPath();
        ctx.moveTo(x, canvas.height * 0.56);
        ctx.bezierCurveTo(
          x + archWidth * 0.25,
          canvas.height * 0.18,
          x + archWidth * 0.75,
          canvas.height * 0.18,
          x + archWidth,
          canvas.height * 0.56
        );
        ctx.stroke();
      }

      // Ceiling ribs
      ctx.strokeStyle = 'rgba(255, 230, 200, 0.28)';
      ctx.lineWidth = 4;
      for (let i = 0; i < 14; i++) {
        const x = i * (canvas.width / 14);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 40, canvas.height * 0.4);
        ctx.stroke();
      }

      // Columns
      for (let i = 0; i < 10; i++) {
        const colX = i * (canvas.width / 10) + 40;
        const colY = canvas.height * 0.34;
        const colWidth = 26;
        const colHeight = canvas.height * 0.42;
        const columnGradient = ctx.createLinearGradient(colX, colY, colX + colWidth, colY);
        columnGradient.addColorStop(0, 'rgba(150, 110, 85, 0.35)');
        columnGradient.addColorStop(0.5, 'rgba(240, 210, 180, 0.55)');
        columnGradient.addColorStop(1, 'rgba(110, 85, 70, 0.35)');
        ctx.fillStyle = columnGradient;
        ctx.fillRect(colX, colY, colWidth, colHeight);
        ctx.fillStyle = 'rgba(255, 230, 200, 0.28)';
        ctx.fillRect(colX, colY - 18, colWidth, 12);
      }

      // Frames along the horizon line
      ctx.fillStyle = 'rgba(235, 215, 190, 0.24)';
      const frameY = canvas.height * 0.5;
      for (let i = 0; i < 20; i++) {
        const frameWidth = 70 + (i % 4) * 18;
        const frameHeight = 90 + (i % 3) * 16;
        const frameX = (i * 100) % canvas.width;
        ctx.fillRect(frameX, frameY, frameWidth, frameHeight);
        ctx.strokeStyle = 'rgba(255, 244, 224, 0.44)';
        ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);
        ctx.fillStyle = 'rgba(110, 75, 55, 0.3)';
        ctx.fillRect(frameX + 6, frameY + 6, frameWidth - 12, frameHeight - 12);
        ctx.fillStyle = 'rgba(220, 200, 170, 0.2)';
      }

      // Banner stripe to anchor horizon
      const bannerGradient = ctx.createLinearGradient(0, frameY - 40, 0, frameY + 60);
      bannerGradient.addColorStop(0, 'rgba(90, 60, 45, 0)');
      bannerGradient.addColorStop(0.5, 'rgba(120, 80, 60, 0.35)');
      bannerGradient.addColorStop(1, 'rgba(90, 60, 45, 0)');
      ctx.fillStyle = bannerGradient;
      ctx.fillRect(0, frameY - 40, canvas.width, 120);

      // Wall paneling
      ctx.strokeStyle = 'rgba(200, 170, 140, 0.4)';
      ctx.lineWidth = 3;
      const panelTop = canvas.height * 0.3;
      const panelBottom = canvas.height * 0.58;
      for (let i = 0; i < 12; i++) {
        const panelX = i * (canvas.width / 12) + 20;
        const panelWidth = canvas.width / 12 - 40;
        ctx.strokeRect(panelX, panelTop, panelWidth, panelBottom - panelTop);
      }

      // Floor tiles
      const tileStartY = canvas.height * 0.62;
      ctx.strokeStyle = 'rgba(170, 140, 110, 0.55)';
      ctx.lineWidth = 2.5;
      for (let y = tileStartY; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      for (let x = 0; x < canvas.width; x += 120) {
        ctx.beginPath();
        ctx.moveTo(x, tileStartY);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Floor sheen
      const floorSheen = ctx.createLinearGradient(0, tileStartY, 0, canvas.height);
      floorSheen.addColorStop(0, 'rgba(255, 230, 190, 0.18)');
      floorSheen.addColorStop(0.45, 'rgba(140, 90, 70, 0.08)');
      floorSheen.addColorStop(1, 'rgba(40, 25, 25, 0.45)');
      ctx.fillStyle = floorSheen;
      ctx.fillRect(0, tileStartY, canvas.width, canvas.height - tileStartY);

      // Parquet diagonals
      const parquetColor = 'rgba(185, 140, 95, 0.45)';
      ctx.strokeStyle = parquetColor;
      ctx.lineWidth = 2;
      const parquetSpacing = 120;
      for (let x = -canvas.height; x < canvas.width + canvas.height; x += parquetSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, tileStartY);
        ctx.lineTo(x + canvas.height, canvas.height);
        ctx.stroke();
      }
      for (let x = -canvas.height; x < canvas.width + canvas.height; x += parquetSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, canvas.height);
        ctx.lineTo(x + canvas.height, tileStartY);
        ctx.stroke();
      }

      // Vignette for depth
      const vignette = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.1,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.75
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle light pools
      for (let i = 0; i < 6; i++) {
        const x = (i + 0.5) * (canvas.width / 6);
        const y = canvas.height * 0.18;
        const radius = 210 + i * 15;
        const radial = ctx.createRadialGradient(x, y, 40, x, y, radius);
        radial.addColorStop(0, 'rgba(255, 235, 205, 0.4)');
        radial.addColorStop(1, 'rgba(255, 230, 200, 0)');
        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dust motes
      ctx.fillStyle = 'rgba(255, 245, 230, 0.08)';
      for (let i = 0; i < 180; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height * 0.7,
          Math.random() * 2.2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    const glowGradient = ctx?.createRadialGradient(
      canvas.width * 0.55,
      canvas.height * 0.48,
      canvas.width * 0.1,
      canvas.width * 0.5,
      canvas.height * 0.52,
      canvas.width * 0.65
    );
    if (ctx && glowGradient) {
      glowGradient.addColorStop(0, 'rgba(255, 230, 190, 0.3)');
      glowGradient.addColorStop(1, 'rgba(255, 200, 150, 0)');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 230, 200, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.7);
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
