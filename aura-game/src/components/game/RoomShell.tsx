import { useMemo } from 'react';
import * as THREE from 'three';

const FLOOR_Y = -0.85;
const ROOM_DEPTH = 42;
const ROOM_WIDTH = 38;
const WALL_HEIGHT = 14;
const WALL_Z = -13;

const createParquetTexture = (textureSize: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = textureSize;
  canvas.height = textureSize;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#70452c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const plankWidth = Math.max(24, Math.round(textureSize * 0.16));
    const plankHeight = Math.max(16, Math.round(textureSize * 0.08));
    const tones = ['#8b5e3b', '#7a5236', '#9a6a44', '#6d4630', '#a3744b', '#b07a50'];

    for (let y = 0; y < canvas.height; y += plankHeight) {
      for (let x = 0; x < canvas.width; x += plankWidth) {
        const tone = tones[(x / plankWidth + y / plankHeight) % tones.length];
        ctx.fillStyle = tone;
        ctx.fillRect(x, y, plankWidth - 2, plankHeight - 2);
      }
    }

    ctx.strokeStyle = 'rgba(255, 235, 210, 0.14)';
    ctx.lineWidth = Math.max(0.75, textureSize * 0.0024);
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
    ctx.lineWidth = Math.max(1.5, textureSize * 0.0049);
    for (let x = -canvas.height; x < canvas.width + canvas.height; x += textureSize * 0.234) {
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
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  return texture;
};

const createPlasterTexture = (textureSize: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = textureSize;
  canvas.height = textureSize;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const baseGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    baseGradient.addColorStop(0, '#f2dfc6');
    baseGradient.addColorStop(1, '#d7b48f');
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const speckCount = Math.round(textureSize * 2.6);
    for (let i = 0; i < speckCount; i++) {
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
    ctx.lineWidth = Math.max(1, textureSize * 0.003);
    for (let x = 0; x < canvas.width; x += textureSize * 0.1875) {
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

interface RoomShellProps {
  textureSize: number;
}

export function RoomShell({ textureSize }: RoomShellProps) {
  const floorTexture = useMemo(() => createParquetTexture(textureSize), [textureSize]);
  const wallTexture = useMemo(() => createPlasterTexture(textureSize), [textureSize]);

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
