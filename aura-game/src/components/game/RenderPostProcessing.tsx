import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  DepthOfField,
  Noise,
  Vignette,
} from '@react-three/postprocessing';
import { Vector2 } from 'three';
import { useGameStore } from '@/stores/gameStore';
import type { RenderPostprocessingSettings } from '@/lib/renderSettings';

interface RenderPostProcessingProps {
  settings: RenderPostprocessingSettings;
}

function AnimatedEffects({ settings }: RenderPostProcessingProps) {
  const gamePhase = useGameStore((state) => state.gamePhase);
  const shotTimestamp = useGameStore((state) => state.shotTimestamp);
  const caOffset = useRef(new Vector2(0, 0));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const caRef = useRef<any>(null);

  useFrame(() => {
    if (!caRef.current) return;

    const elapsed = shotTimestamp ? (Date.now() - shotTimestamp) / 1000 : 999;
    const chromaWindow = 0.5;

    if (elapsed < chromaWindow) {
      const progress = elapsed / chromaWindow;
      const intensity = (1 - progress) * (1 - progress) * 0.006;
      caOffset.current.set(intensity, intensity * 0.7);
    } else {
      caOffset.current.set(0, 0);
    }

    if (caRef.current.offset) {
      caRef.current.offset.copy(caOffset.current);
    }
  });

  const isAiming = gamePhase === 'aiming';

  return (
    <>
      <Bloom
        luminanceThreshold={0.72}
        luminanceSmoothing={0.035}
        intensity={1.15}
        mipmapBlur
      />
      {/* offset is mutated in useFrame via caRef.current.offset.copy(); initial value is [0,0] */}
      <ChromaticAberration ref={caRef} offset={[0, 0] as unknown as Vector2} />
      {isAiming && (
        <DepthOfField
          focusDistance={0.014}
          focalLength={0.048}
          bokehScale={3.2}
        />
      )}
      <Noise premultiply opacity={settings.noiseOpacity} />
      <Vignette eskil={false} offset={0.22} darkness={settings.vignetteDarkness} />
    </>
  );
}

export function RenderPostProcessing({ settings }: RenderPostProcessingProps) {
  if (!settings.enabled) {
    return null;
  }

  return (
    <EffectComposer multisampling={settings.multisampling}>
      <AnimatedEffects settings={settings} />
    </EffectComposer>
  );
}
