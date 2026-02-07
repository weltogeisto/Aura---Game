import { Canvas } from '@react-three/fiber';
import { useMemo, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import {
  DEFAULT_RENDER_TIER,
  RENDER_TIER_SETTINGS,
  RenderTier,
} from '@/lib/renderSettings';
import { Panorama } from './Panorama';
import { RoomShell } from './RoomShell';
import { TargetObjects } from './TargetObjects';
import { Crosshair } from './Crosshair';
import { BallisticsSystem } from './BallisticsSystem';
import { CameraShake } from './CameraShake';
import { ShotImpact } from './ShotImpact';
import { ShotTracer } from './ShotTracer';
import { ValueMesh } from './ValueMesh';
import { RenderPerformanceMonitor } from './RenderPerformanceMonitor';

export function Scene() {
  const gamePhase = useGameStore((state) => state.gamePhase);
  const selectedScenario = useGameStore((state) => state.selectedScenario);
  const [renderTier, setRenderTier] = useState<RenderTier>(DEFAULT_RENDER_TIER);
  const renderSettings = useMemo(
    () => RENDER_TIER_SETTINGS[renderTier],
    [renderTier]
  );

  if ((gamePhase !== 'aiming' && gamePhase !== 'shooting') || !selectedScenario) {
    return null;
  }

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 0], fov: 75 }}
        dpr={renderSettings.dpr}
        gl={{ antialias: renderSettings.postprocessing }}
        style={{ width: '100%', height: '100%' }}
      >
        <fog attach="fog" args={['#1b1416', 12, 180]} />
        <RenderPerformanceMonitor tier={renderTier} onTierChange={setRenderTier} />
        <Panorama color={selectedScenario.panoramaColor} textureSize={renderSettings.textureSize} />
        <RoomShell textureSize={renderSettings.textureSize} />
        <ValueMesh scenario={selectedScenario} />
        <TargetObjects targets={selectedScenario.targets} />
        <BallisticsSystem />
        <CameraShake />
        <ShotImpact />
        <ShotTracer />
      </Canvas>
      <Crosshair />
    </>
  );
}
