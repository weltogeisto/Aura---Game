import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping, PCFSoftShadowMap, SRGBColorSpace } from 'three';
import { Suspense, useMemo, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import {
  DEFAULT_RENDER_TIER,
  RENDER_TIER_SETTINGS,
  type RenderTier,
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
import { RenderPostProcessing } from './RenderPostProcessing';
import { MuseumLighting } from './lighting/MuseumLighting';

const SHOW_RENDER_DEBUG_OVERLAY =
  import.meta.env.DEV && import.meta.env.VITE_RENDER_DEBUG_OVERLAY === '1';

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[100, 32, 32]} />
      <meshBasicMaterial color="#1a1020" side={2} />
    </mesh>
  );
}

export function Scene() {
  const gamePhase = useGameStore((state) => state.gamePhase);
  const selectedScenario = useGameStore((state) => state.selectedScenario);
  const [renderTier, setRenderTier] = useState<RenderTier>(DEFAULT_RENDER_TIER);
  const [sampledFps, setSampledFps] = useState<number | null>(null);
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
        key={`scene-tier-${renderTier}`}
        camera={{ position: [0, 1.6, 0], fov: 75, near: 0.1, far: 200 }}
        dpr={renderSettings.dpr}
        gl={{
          antialias: renderSettings.antialias,
          toneMapping: ACESFilmicToneMapping,
          outputColorSpace: SRGBColorSpace,
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = PCFSoftShadowMap;
          gl.toneMappingExposure = 1.08;
        }}
        shadows
        style={{ width: '100%', height: '100%' }}
      >
        <fog attach="fog" args={['#1b1416', 30, 180]} />
        <RenderPerformanceMonitor
          tier={renderTier}
          onTierChange={setRenderTier}
          onFpsSample={setSampledFps}
        />
        <Suspense fallback={<LoadingFallback />}>
          <Panorama
            panoramaAsset={selectedScenario.panoramaAsset}
            fallbackColor={selectedScenario.panoramaColor}
            tint={selectedScenario.colorGrading?.tint}
            tintStrength={selectedScenario.colorGrading?.tintStrength}
            renderTier={renderTier}
            textureSize={renderSettings.textureSize}
          />
        </Suspense>
        <MuseumLighting scenarioId={selectedScenario.id} />
        <RoomShell textureSize={renderSettings.textureSize} renderTier={renderTier} />
        <RenderPostProcessing settings={renderSettings.postprocessing} />
        <ValueMesh scenario={selectedScenario} />
        <TargetObjects targets={selectedScenario.targets} />
        <BallisticsSystem />
        <CameraShake />
        <ShotImpact />
        <ShotTracer />
      </Canvas>
      <Crosshair />
      {SHOW_RENDER_DEBUG_OVERLAY && (
        <div className="pointer-events-none absolute left-4 top-4 rounded bg-black/70 px-3 py-2 font-mono text-xs text-white">
          <div>Tier: {renderTier}</div>
          <div>FPS: {sampledFps ? sampledFps.toFixed(1) : '...'}</div>
        </div>
      )}
    </>
  );
}
