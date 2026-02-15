import { Component, Suspense, useEffect, useState, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { useGameStore } from '@/stores/gameStore';

function LoadingOverlay() {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setTimedOut(true), 4000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/90 px-6 text-center text-slate-200">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Loading Louvre</p>
        <p className="mt-2 text-sm text-slate-300">
          {timedOut ? 'Taking longer than expected. Rendering with safe defaults…' : 'Preparing the gallery scene…'}
        </p>
      </div>
    </div>
  );
}

class SceneErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Louvre scene render failure:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function LouvreSceneFallback() {
  const setGamePhase = useGameStore((state) => state.setGamePhase);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950 p-6 text-center text-white">
      <div className="max-w-md rounded-xl border border-red-300/40 bg-slate-900/80 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-red-300">Scene unavailable</p>
        <h2 className="mt-2 text-2xl font-semibold">Could not load the Louvre scene.</h2>
        <p className="mt-3 text-sm text-slate-300">You can safely return to Start and retry without refreshing.</p>
        <button
          type="button"
          onClick={() => setGamePhase('start')}
          className="mt-6 rounded-full border border-slate-300/60 px-5 py-2 text-sm font-semibold hover:bg-slate-700/60"
        >
          Back to Start
        </button>
      </div>
    </div>
  );
}

function LouvreStage() {
  return (
    <>
      <color attach="background" args={['#0f172a']} />
      <ambientLight intensity={0.35} />
      <directionalLight intensity={1.2} position={[4, 6, 3]} castShadow />
      <pointLight intensity={0.7} position={[-3, 2, -2]} color="#fef3c7" />

      <mesh position={[0, -0.8, 0]} receiveShadow>
        <boxGeometry args={[8, 0.2, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.95} metalness={0.05} />
      </mesh>

      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[1.8, 0.8, 1.8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} metalness={0.1} />
      </mesh>

      <mesh position={[2.2, 0.2, -0.8]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial color="#e2b714" roughness={0.35} metalness={0.25} />
      </mesh>

      <Environment preset="city" />
      <OrbitControls enablePan={false} minDistance={4} maxDistance={10} maxPolarAngle={Math.PI / 2.1} />
    </>
  );
}

export function LouvreSceneContainer() {
  const setGamePhase = useGameStore((state) => state.setGamePhase);

  return (
    <div className="relative h-full w-full">
      <SceneErrorBoundary fallback={<LouvreSceneFallback />}>
        <Suspense fallback={<LoadingOverlay />}>
          <Canvas camera={{ position: [4, 2.2, 5], fov: 55 }} shadows>
            <LouvreStage />
          </Canvas>
        </Suspense>
      </SceneErrorBoundary>

      <div className="pointer-events-none absolute left-0 top-0 z-10 flex w-full items-center justify-between p-4">
        <h2 className="rounded-lg bg-slate-900/65 px-3 py-2 text-sm uppercase tracking-[0.2em] text-amber-200">
          Louvre Prototype Scene
        </h2>
        <button
          type="button"
          onClick={() => setGamePhase('start')}
          className="pointer-events-auto rounded-full border border-slate-300/60 bg-slate-950/70 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-100 transition hover:bg-slate-800"
        >
          Back to Start
        </button>
      </div>
    </div>
  );
}
