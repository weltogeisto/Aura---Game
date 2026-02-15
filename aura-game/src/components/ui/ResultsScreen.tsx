import { useGameStore } from '@/stores/gameStore';
import { formatCurrency } from '@/lib/utils';

export function ResultsScreen() {
  const lastShotResult = useGameStore((state) => state.lastShotResult);
  const totalScore = useGameStore((state) => state.totalScore);
  const criticOutput = useGameStore((state) => state.criticOutput);
  const resetGame = useGameStore((state) => state.resetGame);

  if (!lastShotResult) {
    return null;
  }

  const isDadaistHit = lastShotResult.hitTargetType === 'easter-egg-dadaist';

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
      <div className="bg-gray-900 p-8 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
          APPRAISAL COMPLETE
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded">
            <p className="text-gray-400 mb-1">Total Score</p>
            <p className={`text-3xl font-bold ${isDadaistHit ? 'text-fuchsia-400' : 'text-red-500'}`}>
              {formatCurrency(totalScore)}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded">
            <p className="text-gray-400 mb-1">Hit Location</p>
            <p className="text-lg font-semibold text-white">{lastShotResult.hitLocationLabel}</p>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-gray-400 mb-2">Target Hit:</p>
          <p className="text-2xl font-bold text-white">
            {lastShotResult.hitTargetName || 'Nothing'}
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Damage Breakdown</h2>
          <div className="space-y-3">
            {lastShotResult.breakdown.length === 0 && (
              <p className="text-gray-400">No conventional damage accounting available.</p>
            )}
            {lastShotResult.breakdown.map((item) => (
              <div key={item.targetId} className="flex justify-between items-center text-gray-300">
                <span>{item.targetName}</span>
                <span className="text-orange-500 font-semibold">
                  {formatCurrency(item.damage)} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded mb-8">
          <p className="text-gray-400 mb-2">Total Cultural Damage:</p>
          <p className="text-4xl font-bold text-red-500">
            {formatCurrency(lastShotResult.totalDamage)}
          </p>
        </div>

        {lastShotResult.specialEffects.length > 0 && (
          <div className="bg-blue-900/30 border border-blue-500 p-4 rounded mb-8">
            <h3 className="font-semibold text-blue-400 mb-2">Special Effects Triggered:</h3>
            <ul className="space-y-1">
              {lastShotResult.specialEffects.map((effect, i) => (
                <li key={i} className="text-blue-300 text-sm">• {effect}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-black/40 border border-orange-500/40 p-4 rounded mb-8">
          <p className="text-orange-200 text-sm uppercase tracking-[0.2em] mb-2">Critic</p>
          <p className="text-orange-100 italic">“{criticOutput ?? lastShotResult.criticLine}”</p>
        </div>

        <button
          onClick={resetGame}
          className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
