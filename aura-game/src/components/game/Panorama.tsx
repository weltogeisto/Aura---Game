import { useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

interface PanoramaProps {
  color?: string;
  textureSize: number;
}

export function Panorama({ color, textureSize }: PanoramaProps) {
  const texture = useLoader(THREE.TextureLoader, '/panorama.svg');

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = Math.min(8, Math.max(2, Math.round(textureSize / 256)));
    texture.needsUpdate = true;
  }, [texture, textureSize]);

  return (
    <mesh>
      <sphereGeometry args={[100, 64, 64]} />
      <meshBasicMaterial
        map={texture}
        color={color}
        side={THREE.BackSide}
        toneMapped={false}
      />
    </mesh>
  );
}
