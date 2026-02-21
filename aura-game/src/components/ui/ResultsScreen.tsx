import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { canReplay, hasResult } from '@/stores/gameSelectors';
import { formatCurrency } from '@/lib/utils';
import { UI_COPY_MAP } from '@/data/uiCopyMap';
import { UX_GOALS } from '@/data/uxGoals';
import { useTypewriter } from '@/lib/useTypewriter';

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
  const shotFeedback = useGameStore((state) => state.shotFeedback);
  const runTelemetry = useGameStore((state) => state.runTelemetry);
  const markScoreBreakdownViewed = useGameStore((state) => state.markScoreBreakdownViewed);
  const reducedMotion = useGameStore((state) => state.accessibility.reducedMotion);

  // Hook must be called before any conditional returns.
  const rawCriticText = criticOutput ?? lastShotResult?.criticLine ?? '';
  const typedCritic = useTypewriter(rawCriticText, { disabled: reducedMotion, speedMs: 22 });

  useEffect(() => {
    markScoreBreakdownViewed();
  }, [markScoreBreakdownViewed]);

  if (!useGameStore(hasResult) || !lastShotResult) return null;

  const isDadaistHit = lastShotResult.hitTargetType === 'easter-egg-dadaist';
  const sampledValue = shotFeedback?.scoreBreakdown?.sampledValue ?? 0;
  const zoneMultiplier = shotFeedback?.scoreBreakdown?.zoneMultiplier ?? 1;
  const criticalModifier = shotFeedback?.scoreBreakdown?.criticalModifier ?? 1;
  const explainedFinal = Math.round(sampledValue * zoneMultiplier * criticalModifier);
  const timeToFirstShot = runTelemetry.firstShotAt && runTelemetry.runStartedAt
    ? runTelemetry.firstShotAt - runTelemetry.runStartedAt
    : null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 px-3 py-4 sm:px-4 sm:py-8">
      <div className="w-full max-w-3xl max-h-[92dvh] overflow-y-auto rounded-2xl border border-white/10 bg-gray-950/95 p-4 shadow-2xl sm:p-6 md:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-orange-300">{UI_COPY_MAP.results.overline}</p>
        <h1 className="mt-3 text-2xl font-bold text-transparent bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text sm:text-4xl">
          {UI_COPY_MAP.results.heading}
        </h1>
        <p className="mt-3 text-sm text-gray-300">{UI_COPY_MAP.hints.resultsHint}</p>

        <div className="mt-6 rounded-xl border border-orange-500/30 bg-black/30 p-3 sm:mt-7 sm:p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-200">{UI_COPY_MAP.results.causeEffectHeading}</p>
          <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-gray-900/80 p-3">
              <p className="text-gray-400">Treffer</p>
              <p className="font-semibold text-white">{sampledValue.toFixed(1)}</p>
            </div>
            <div className="rounded-lg bg-gray-900/80 p-3">
              <p className="text-gray-400">Zone Modifier</p>
              <p className="font-semibold text-white">x{zoneMultiplier.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-gray-900/80 p-3">
              <p className="text-gray-400">Critic Modifier</p>
              <p className="font-semibold text-white">x{criticalModifier.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-orange-950/80 p-3">
              <p className="text-orange-200">Final Score</p>
              <p className="font-semibold text-orange-300">{formatCurrency(explainedFinal || totalScore)}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-400">{UI_COPY_MAP.results.scoreFraming}</p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-gray-900 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{UI_COPY_MAP.results.scoreLabel}</p>
            <p className={`mt-2 text-2xl font-bold ${isDadaistHit ? 'text-fuchsia-400' : 'text-red-500'}`}>
              {formatCurrency(totalScore)}
            </p>
          </div>
          <div className="rounded-xl bg-gray-900 p-4 md:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{UI_COPY_MAP.results.impactLabel}</p>
            <p className="mt-2 text-base font-semibold text-white">{lastShotResult.hitLocationLabel}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-gray-900 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{UI_COPY_MAP.results.targetLabel}</p>
          <p className="mt-2 text-lg font-semibold text-white sm:text-xl">{lastShotResult.hitTargetName || 'No registered target'}</p>
        </div>

        <div className="mt-4 rounded-xl border border-orange-500/30 bg-black/40 p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-200">{UI_COPY_MAP.results.criticLabel}</p>
          <p className="mt-2 text-sm italic text-orange-100">
            {'"'}{typedCritic.text}{typedCritic.done ? '' : '|'}{'"'}
          </p>
        </div>

        {timeToFirstShot !== null && (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-4 text-sm text-gray-300">
            <p>{UI_COPY_MAP.results.metricsLabel}</p>
            <p className="mt-1">Time-to-first-shot: {(timeToFirstShot / 1000).toFixed(1)}s (goal &le; {(UX_GOALS.timeToFirstShotMs / 1000).toFixed(0)}s)</p>
            <p>Score-logic viewed: {runTelemetry.scoreBreakdownViewed ? 'yes' : 'no'} (goal &ge; {(UX_GOALS.scoreLogicComprehensionRate * 100).toFixed(0)}%)</p>
            <p>Replay intent tracked: {runTelemetry.replayUsed ? 'yes' : 'no'} (goal &ge; {(UX_GOALS.replayRate * 100).toFixed(0)}%)</p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2">
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
