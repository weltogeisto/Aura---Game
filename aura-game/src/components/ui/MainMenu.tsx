import { useGameStore } from '@/stores/gameStore';

export function MainMenu() {
  const setGamePhase = useGameStore((state) => state.setGamePhase);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black z-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
          AURA
        </h1>
        <h2 className="text-3xl font-light mb-8 text-gray-300">
          of the 21st Century
        </h2>
        <p className="text-gray-400 mb-12 max-w-md mx-auto">
          One shot. Nine iconic interiors. Maximum cultural damage.
        </p>
        <button
          onClick={() => setGamePhase('scenario-select')}
          className="px-8 py-3 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          Start Game
        </button>
        <p className="text-gray-500 text-sm mt-12">
          "The Aura of the 21st Century is not in the object.<br />
          It is in the algorithm that predicts your desire to destroy it."
        </p>
      </div>
    </div>
  );
}
