import { useMemo } from 'react';
import * as THREE from 'three';

const FLOOR_Y = -0.85;
const ROOM_DEPTH = 42;
const ROOM_WIDTH = 38;
const WALL_HEIGHT = 14;
const WALL_Z = -13;

const createParquetTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#70452c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const plankWidth = 80;
    const plankHeight = 40;
    const tones = ['#8b5e3b', '#7a5236', '#9a6a44', '#6d4630', '#a3744b', '#b07a50'];

    for (let y = 0; y < canvas.height; y += plankHeight) {
      for (let x = 0; x < canvas.width; x += plankWidth) {
        const tone = tones[(x / plankWidth + y / plankHeight) % tones.length];
        ctx.fillStyle = tone;
        ctx.fillRect(x, y, plankWidth - 2, plankHeight - 2);
      }
    }

    ctx.strokeStyle = 'rgba(255, 235, 210, 0.14)';
    ctx.lineWidth = 1.25;
    for (let x = 0; x < canvas.width; x += plankWidth) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += plankHeight) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(40, 20, 12, 0.22)';
    ctx.lineWidth = 2.5;
    for (let x = -canvas.height; x < canvas.width + canvas.height; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + canvas.height, canvas.height);
      ctx.stroke();
    }

    const sheen = ctx.createLinearGradient(0, canvas.height * 0.4, 0, canvas.height);
    sheen.addColorStop(0, 'rgba(255, 230, 200, 0.12)');
    sheen.addColorStop(1, 'rgba(90, 55, 35, 0.12)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, canvas.height * 0.35, canvas.width, canvas.height * 0.65);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.anisotropy = 12;
  texture.needsUpdate = true;

  return texture;
};

const createPlasterTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const baseGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    baseGradient.addColorStop(0, '#f2dfc6');
    baseGradient.addColorStop(1, '#d7b48f');
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 1400; i++) {
      const radius = Math.random() * 2.4 + 0.4;
      const alpha = Math.random() * 0.07 + 0.02;
      ctx.fillStyle = `rgba(120, 90, 70, ${alpha})`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        radius,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(255, 245, 230, 0.18)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < canvas.width; x += 96) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
};

export function RoomShell() {
  const floorTexture = useMemo(() => createParquetTexture(), []);
  const wallTexture = useMemo(() => createPlasterTexture(), []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, -ROOM_DEPTH / 2]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial
          map={floorTexture}
          color="#a57552"
          roughness={0.6}
          metalness={0.03}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, FLOOR_Y + WALL_HEIGHT / 2, WALL_Z]}>
        <planeGeometry args={[ROOM_WIDTH, WALL_HEIGHT]} />
        <meshStandardMaterial
          map={wallTexture}
          color="#f1d7b6"
          roughness={0.92}
          metalness={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
