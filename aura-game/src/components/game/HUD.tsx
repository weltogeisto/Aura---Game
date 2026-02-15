import { useGameStore } from '@/stores/gameStore';

export function HUD() {
  const gamePhase = useGameStore((state) => state.gamePhase);
  const selectedScenario = useGameStore((state) => state.selectedScenario);
  const ammoRemaining = useGameStore((state) => state.ammoRemaining);
  const fireBlocked = useGameStore((state) => state.fireBlocked);

  if ((gamePhase !== 'aiming' && gamePhase !== 'shooting') || !selectedScenario) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {/* Top left - scenario info */}
      <div className="absolute top-6 left-6 text-white">
        <h2 className="text-2xl font-bold text-orange-500">{selectedScenario.name}</h2>
        <p className="text-gray-300 text-sm">One shot. Maximum damage.</p>
      </div>

      {/* Top right - ammo counter */}
      <div className="absolute top-6 right-6 text-white">
        <div className="bg-black/50 px-4 py-2 rounded">
          <p className="text-sm text-gray-300">Ammo</p>
          <p className="text-3xl font-bold text-red-500">{ammoRemaining}</p>
        </div>
      </div>

      {/* Bottom left - instructions */}
      <div className="absolute bottom-6 left-6 text-gray-400 text-sm">
        <p>Move mouse to aim</p>
        <p>Use arrows or WASD for fine-adjust</p>
        <p>Click to shoot</p>
        {fireBlocked && <p className="text-orange-400">Shot already fired. Reset to shoot again.</p>}
      </div>
    </div>
  );
}
