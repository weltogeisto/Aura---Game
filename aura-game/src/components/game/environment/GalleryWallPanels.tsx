import { useMemo } from 'react';
import * as THREE from 'three';

interface GalleryWallPanelsProps {
  width: number;
  baseY: number;
  z: number;
  count?: number;
  wallMaterial: THREE.Material;
  frameMaterial: THREE.Material;
}

export function GalleryWallPanels({
  width,
  baseY,
  z,
  count = 7,
  wallMaterial,
  frameMaterial,
}: GalleryWallPanelsProps) {
  const panelWidths = useMemo(() => {
    const availableWidth = width * 0.9;
    const nominalPanel = availableWidth / count;

    return Array.from({ length: count }, (_, index) => {
      const variation = (index % 3) * 0.16 - 0.16;
      return nominalPanel * (1 + variation * 0.2);
    });
  }, [count, width]);

  const totalPanelsWidth = panelWidths.reduce((sum, panelWidth) => sum + panelWidth, 0);
  const gap = (width - totalPanelsWidth) / (count + 1);

  let cursor = -width / 2 + gap;

  return (
    <group>
      {panelWidths.map((panelWidth, index) => {
        const panelHeight = 6.6 + (index % 2) * 0.38;
        const centerX = cursor + panelWidth / 2;
        const frameDepth = 0.1 + (index % 3) * 0.012;
        const bevelDepth = 0.045;
        cursor += panelWidth + gap;

        return (
          <group key={`panel-${index}`} position={[centerX, baseY + 5.1, z + frameDepth * 0.5]}>
            <mesh material={frameMaterial}>
              <boxGeometry args={[panelWidth, panelHeight, frameDepth]} />
            </mesh>
            <mesh position={[0, 0, frameDepth * 0.55 + 0.01]} material={wallMaterial}>
              <boxGeometry args={[panelWidth * 0.84, panelHeight * 0.78, 0.035]} />
            </mesh>
            <mesh position={[0, panelHeight * 0.39, frameDepth * 0.28]} material={frameMaterial}>
              <boxGeometry args={[panelWidth * 0.88, bevelDepth, frameDepth * 0.9]} />
            </mesh>
            <mesh position={[0, -panelHeight * 0.39, frameDepth * 0.28]} material={frameMaterial}>
              <boxGeometry args={[panelWidth * 0.88, bevelDepth, frameDepth * 0.9]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
