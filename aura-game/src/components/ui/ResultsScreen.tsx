import { useGameStore } from '@/stores/gameStore';
import { canReplay, hasResult } from '@/stores/gameSelectors';
import { formatCurrency } from '@/lib/utils';
import { UI_COPY_MAP } from '@/data/uiCopyMap';

export function ResultsScreen() {
  const selectedScenario = useGameStore((state) => state.selectedScenario);
  const lastShotResult = useGameStore((state) => state.lastShotResult);
  const totalScore = useGameStore((state) => state.totalScore);
  const criticOutput = useGameStore((state) => state.criticOutput);
  const restartScenario = useGameStore((state) => state.restartScenario);
  const resetRunState = useGameStore((state) => state.resetRunState);
  const setGamePhase = useGameStore((state) => state.setGamePhase);
  const resetGame = useGameStore((state) => state.resetGame);
  const replayAllowed = useGameStore(canReplay);

  if (!useGameStore(hasResult) || !lastShotResult) return null;

  const isDadaistHit = lastShotResult.hitTargetType === 'easter-egg-dadaist';

  const replayScenario = () => {
    if (!replayAllowed) {
      resetGame();
      return;
    }

    restartScenario();
  };

  const openScenarioPicker = () => {
    if (!selectedScenario) {
      resetGame();
      return;
    }

    resetRunState();
    setGamePhase('scenario-select');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 py-8">
      <div className="w-full max-w-3xl max-h-screen overflow-y-auto rounded-2xl border border-white/10 bg-gray-950/95 p-8 shadow-2xl md:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-orange-300">{UI_COPY_MAP.results.overline}</p>
        <h1 className="mt-3 text-4xl font-bold text-transparent bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text">
          {UI_COPY_MAP.results.heading}
        </h1>
        <p className="mt-3 text-sm text-gray-300">{UI_COPY_MAP.hints.resultsHint}</p>

        <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-gray-900 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{UI_COPY_MAP.results.scoreLabel}</p>
            <p className={`mt-2 text-2xl font-bold ${isDadaistHit ? 'text-fuchsia-400' : 'text-red-500'}`}>
              {formatCurrency(totalScore)}
            </p>
            <p className="mt-2 text-xs text-gray-400">{UI_COPY_MAP.results.scoreFraming}</p>
          </div>
          <div className="rounded-xl bg-gray-900 p-4 md:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{UI_COPY_MAP.results.impactLabel}</p>
            <p className="mt-2 text-base font-semibold text-white">{lastShotResult.hitLocationLabel}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-gray-900 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{UI_COPY_MAP.results.targetLabel}</p>
          <p className="mt-2 text-xl font-semibold text-white">{lastShotResult.hitTargetName || 'No registered target'}</p>
        </div>

        <div className="mt-4 rounded-xl bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-white">{UI_COPY_MAP.results.damageHeading}</h2>
          <div className="mt-3 space-y-3">
            {lastShotResult.breakdown.length === 0 && (
              <p className="text-sm text-gray-400">No conventional damage accounting available for this hit.</p>
            )}
            {lastShotResult.breakdown.map((item) => (
              <div key={item.targetId} className="flex items-center justify-between gap-4 text-sm text-gray-300">
                <span>{item.targetName}</span>
                <span className="font-semibold text-orange-400">
                  {formatCurrency(item.damage)} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-orange-500/30 bg-black/40 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-200">{UI_COPY_MAP.results.criticLabel}</p>
          <p className="mt-2 text-sm italic text-orange-100">“{criticOutput ?? lastShotResult.criticLine}”</p>
        </div>

        {lastShotResult.specialEffects.length > 0 && (
          <div className="mt-4 rounded-xl border border-blue-500/40 bg-blue-900/20 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Triggered effects</h3>
            <ul className="mt-3 space-y-1 text-sm text-blue-200">
              {lastShotResult.specialEffects.map((effect, i) => (
                <li key={i}>• {effect}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-200">{UI_COPY_MAP.limitations.heading}</p>
          <p className="mt-2 text-sm text-gray-300">{UI_COPY_MAP.limitations.items[2]}</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={replayScenario}
            disabled={!replayAllowed}
            className="rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {UI_COPY_MAP.results.replayCta}
          </button>
          <button
            onClick={openScenarioPicker}
            className="rounded-full border border-white/20 bg-gray-900 px-6 py-3 font-semibold text-gray-100 transition hover:border-white/40"
          >
            {UI_COPY_MAP.results.newScenarioCta}
          </button>
        </div>
      </div>
    </div>
  );
}
