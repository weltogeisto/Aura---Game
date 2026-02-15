import { useGameStore } from '@/stores/gameStore';
import { MICROCOPY } from '@/data/copy';

export function HUD() {
  const gamePhase = useGameStore((state) => state.gamePhase);
  const selectedScenario = useGameStore((state) => state.selectedScenario);
  const ammoRemaining = useGameStore((state) => state.ammoRemaining);
  const fireBlocked = useGameStore((state) => state.fireBlocked);
  const lastShotResult = useGameStore((state) => state.lastShotResult);

  if ((gamePhase !== 'aiming' && gamePhase !== 'shooting') || !selectedScenario) {
    return null;
  }

  const isShooting = gamePhase === 'shooting';

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      <div className="absolute left-6 top-6 text-white">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Active scenario</p>
        <h2 className="mt-1 text-2xl font-semibold text-orange-400">{selectedScenario.name}</h2>
        <p className="mt-1 text-sm text-gray-300">{isShooting ? MICROCOPY.shootingHint : MICROCOPY.aimingHint}</p>
      </div>

      <div className="absolute right-6 top-6 rounded-lg bg-black/50 px-4 py-2 text-white">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-300">Ammo</p>
        <p className="text-3xl font-bold text-red-500">{ammoRemaining}</p>
      </div>

      {gamePhase === 'aiming' ? (
        <div className="absolute bottom-6 left-6 space-y-1 text-sm text-gray-300">
          <p>Move mouse to aim</p>
          <p>Use arrows or WASD for micro-adjustments</p>
          <p>Click to fire your only shot</p>
          {fireBlocked && <p className="text-orange-300">Shot already locked for this run.</p>}
        </div>
      ) : (
        <div className="absolute bottom-6 left-6 rounded-lg border border-orange-500/35 bg-black/45 px-4 py-3 text-sm text-orange-100">
          <p className="font-medium">Shot in evaluation…</p>
          {lastShotResult?.hitTargetName && <p className="mt-1 text-orange-200">Registered: {lastShotResult.hitTargetName}</p>}
        </div>
      )}
    </div>
  );
}
