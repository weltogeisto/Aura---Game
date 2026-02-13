import { useEffect, useMemo, useState } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { RenderTier } from '@/lib/renderSettings';
import type { Scenario } from '@/types';

interface PanoramaProps {
  panoramaAsset: Scenario['panoramaAsset'];
  fallbackColor?: string;
  tint?: string;
  tintStrength?: number;
  renderTier: RenderTier;
  textureSize: number;
}

const getTargetTexture = (
  panoramaAsset: Scenario['panoramaAsset'],
  renderTier: RenderTier
): string => {
  if (renderTier === 'high') return panoramaAsset.highRes;
  if (renderTier === 'medium') return panoramaAsset.mediumRes ?? panoramaAsset.highRes;
  return panoramaAsset.lowRes;
};

const configureTexture = (
  texture: THREE.Texture,
  renderTier: RenderTier,
  textureSize: number,
  maxAnisotropy: number
): THREE.Texture => {
  const tierAnisotropyCap = renderTier === 'high' ? 16 : renderTier === 'medium' ? 12 : 6;

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = Math.min(maxAnisotropy, tierAnisotropyCap, Math.max(4, Math.round(textureSize / 96)));
  texture.needsUpdate = true;

  return texture;
};

export function Panorama({
  panoramaAsset,
  fallbackColor,
  tint,
  tintStrength = 0,
  renderTier,
  textureSize,
}: PanoramaProps) {
  const sourceLowResTexture = useLoader(THREE.TextureLoader, panoramaAsset.lowRes);
  const [upgradedTexture, setUpgradedTexture] = useState<THREE.Texture | null>(null);
  const { gl } = useThree();

  const targetTexturePath = useMemo(() => getTargetTexture(panoramaAsset, renderTier), [panoramaAsset, renderTier]);

  const lowResTexture = useMemo(() => {
    const cloned = sourceLowResTexture.clone();
    return configureTexture(cloned, renderTier, textureSize, gl.capabilities.getMaxAnisotropy());
  }, [gl, renderTier, sourceLowResTexture, textureSize]);

  useEffect(() => {
    return () => {
      lowResTexture.dispose();
    };
  }, [lowResTexture]);

  useEffect(() => {
    if (targetTexturePath === panoramaAsset.lowRes) {
      return;
    }

    let cancelled = false;
    const loader = new THREE.TextureLoader();

    loader.load(targetTexturePath, (loadedTexture) => {
      if (cancelled) {
        loadedTexture.dispose();
        return;
      }

      const tuned = configureTexture(
        loadedTexture,
        renderTier,
        textureSize,
        gl.capabilities.getMaxAnisotropy()
      );

      setUpgradedTexture((current) => {
        current?.dispose();
        return tuned;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [gl, panoramaAsset.lowRes, renderTier, targetTexturePath, textureSize]);

  useEffect(() => {
    return () => {
      upgradedTexture?.dispose();
    };
  }, [upgradedTexture]);

  const materialColor = useMemo(() => {
    const tintColor = new THREE.Color(tint ?? fallbackColor ?? '#ffffff');
    if (!tint || tintStrength <= 0) return tintColor;

    const baseColor = new THREE.Color(fallbackColor ?? '#ffffff');
    return baseColor.lerp(tintColor, Math.min(1, Math.max(0, tintStrength)));
  }, [fallbackColor, tint, tintStrength]);

  return (
    <mesh>
      <sphereGeometry args={[100, 64, 64]} />
      <meshBasicMaterial
        map={targetTexturePath === panoramaAsset.lowRes ? lowResTexture : upgradedTexture ?? lowResTexture}
        color={materialColor}
        side={THREE.BackSide}
        toneMapped={false}
      />
    </mesh>
  );
}
