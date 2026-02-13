import * as THREE from 'three';
import type { RenderTier } from '@/lib/renderSettings';

export interface PbrTextureSet {
  map: THREE.Texture;
  normalMap: THREE.Texture;
  roughnessMap: THREE.Texture;
}

const configureTexture = (
  texture: THREE.Texture,
  repeatX: number,
  repeatY: number,
  anisotropy: number
) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = anisotropy;
  texture.needsUpdate = true;
};

const createTextureCanvas = (textureSize: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = textureSize;
  canvas.height = textureSize;
  return canvas;
};

export const createWoodPbrTextures = (
  textureSize: number,
  repeat: [number, number]
): PbrTextureSet => {
  const albedoCanvas = createTextureCanvas(textureSize);
  const albedoCtx = albedoCanvas.getContext('2d');

  const normalCanvas = createTextureCanvas(textureSize);
  const normalCtx = normalCanvas.getContext('2d');

  const roughnessCanvas = createTextureCanvas(textureSize);
  const roughnessCtx = roughnessCanvas.getContext('2d');

  const plankWidth = Math.max(24, Math.round(textureSize * 0.12));
  const plankHeight = Math.max(18, Math.round(textureSize * 0.09));
  const tones = ['#956544', '#815537', '#a06f4a', '#744b31', '#b98458'];

  if (albedoCtx && normalCtx && roughnessCtx) {
    albedoCtx.fillStyle = '#7a4f33';
    albedoCtx.fillRect(0, 0, textureSize, textureSize);

    roughnessCtx.fillStyle = 'rgb(145,145,145)';
    roughnessCtx.fillRect(0, 0, textureSize, textureSize);

    normalCtx.fillStyle = 'rgb(128,128,255)';
    normalCtx.fillRect(0, 0, textureSize, textureSize);

    for (let y = 0; y < textureSize; y += plankHeight) {
      for (let x = 0; x < textureSize; x += plankWidth) {
        const tone = tones[(x / plankWidth + y / plankHeight) % tones.length];
        albedoCtx.fillStyle = tone;
        albedoCtx.fillRect(x, y, plankWidth - 2, plankHeight - 2);

        roughnessCtx.fillStyle = `rgb(${118 + ((x + y) % 18)},${118 + ((x + y) % 18)},${118 + ((x + y) % 18)})`;
        roughnessCtx.fillRect(x, y, plankWidth - 2, plankHeight - 2);
      }
    }

    albedoCtx.strokeStyle = 'rgba(255, 230, 205, 0.16)';
    albedoCtx.lineWidth = Math.max(1, textureSize * 0.002);
    roughnessCtx.strokeStyle = 'rgb(180,180,180)';
    roughnessCtx.lineWidth = Math.max(1, textureSize * 0.002);
    normalCtx.strokeStyle = 'rgb(126,128,240)';
    normalCtx.lineWidth = Math.max(1, textureSize * 0.002);

    for (let x = 0; x < textureSize; x += plankWidth) {
      albedoCtx.beginPath();
      albedoCtx.moveTo(x, 0);
      albedoCtx.lineTo(x, textureSize);
      albedoCtx.stroke();

      roughnessCtx.beginPath();
      roughnessCtx.moveTo(x, 0);
      roughnessCtx.lineTo(x, textureSize);
      roughnessCtx.stroke();

      normalCtx.beginPath();
      normalCtx.moveTo(x, 0);
      normalCtx.lineTo(x, textureSize);
      normalCtx.stroke();
    }
  }

  const map = new THREE.CanvasTexture(albedoCanvas);
  const normalMap = new THREE.CanvasTexture(normalCanvas);
  const roughnessMap = new THREE.CanvasTexture(roughnessCanvas);

  configureTexture(map, repeat[0], repeat[1], 8);
  configureTexture(normalMap, repeat[0], repeat[1], 8);
  configureTexture(roughnessMap, repeat[0], repeat[1], 8);

  return { map, normalMap, roughnessMap };
};

export const createPlasterPbrTextures = (
  textureSize: number,
  repeat: [number, number]
): PbrTextureSet => {
  const albedoCanvas = createTextureCanvas(textureSize);
  const albedoCtx = albedoCanvas.getContext('2d');

  const normalCanvas = createTextureCanvas(textureSize);
  const normalCtx = normalCanvas.getContext('2d');

  const roughnessCanvas = createTextureCanvas(textureSize);
  const roughnessCtx = roughnessCanvas.getContext('2d');

  if (albedoCtx && normalCtx && roughnessCtx) {
    const baseGradient = albedoCtx.createLinearGradient(0, 0, 0, textureSize);
    baseGradient.addColorStop(0, '#ead8c3');
    baseGradient.addColorStop(1, '#d9c1a4');
    albedoCtx.fillStyle = baseGradient;
    albedoCtx.fillRect(0, 0, textureSize, textureSize);

    roughnessCtx.fillStyle = 'rgb(222,222,222)';
    roughnessCtx.fillRect(0, 0, textureSize, textureSize);

    normalCtx.fillStyle = 'rgb(128,128,255)';
    normalCtx.fillRect(0, 0, textureSize, textureSize);

    const speckCount = Math.round(textureSize * 2.4);
    for (let i = 0; i < speckCount; i++) {
      const x = Math.random() * textureSize;
      const y = Math.random() * textureSize;
      const radius = Math.random() * 2.1 + 0.35;
      const tone = 168 + Math.floor(Math.random() * 30);

      albedoCtx.fillStyle = `rgba(${tone - 28}, ${tone - 38}, ${tone - 48}, ${Math.random() * 0.08 + 0.02})`;
      albedoCtx.beginPath();
      albedoCtx.arc(x, y, radius, 0, Math.PI * 2);
      albedoCtx.fill();

      roughnessCtx.fillStyle = `rgb(${214 + Math.floor(Math.random() * 24)},${214 + Math.floor(Math.random() * 24)},${214 + Math.floor(Math.random() * 24)})`;
      roughnessCtx.beginPath();
      roughnessCtx.arc(x, y, radius + 0.3, 0, Math.PI * 2);
      roughnessCtx.fill();

      normalCtx.fillStyle = `rgba(128, 130, ${236 + Math.floor(Math.random() * 12)}, 0.4)`;
      normalCtx.beginPath();
      normalCtx.arc(x, y, radius, 0, Math.PI * 2);
      normalCtx.fill();
    }
  }

  const map = new THREE.CanvasTexture(albedoCanvas);
  const normalMap = new THREE.CanvasTexture(normalCanvas);
  const roughnessMap = new THREE.CanvasTexture(roughnessCanvas);

  configureTexture(map, repeat[0], repeat[1], 6);
  configureTexture(normalMap, repeat[0], repeat[1], 6);
  configureTexture(roughnessMap, repeat[0], repeat[1], 6);

  return { map, normalMap, roughnessMap };
};

export const buildGalleryMaterial = (
  tier: RenderTier,
  color: string,
  pbrTextures: PbrTextureSet,
  roughness: number,
  metalness: number,
  normalScale = 0.7
) => {
  if (tier === 'low') {
    return new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      side: THREE.DoubleSide,
    });
  }

  return new THREE.MeshStandardMaterial({
    color,
    map: pbrTextures.map,
    normalMap: pbrTextures.normalMap,
    normalScale: new THREE.Vector2(normalScale, normalScale),
    roughnessMap: pbrTextures.roughnessMap,
    roughness,
    metalness,
    side: THREE.DoubleSide,
  });
};
