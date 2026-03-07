import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { canReplay, hasResult } from '@/stores/gameSelectors';
import { formatCurrency } from '@/lib/utils';
import { UI_COPY_MAP } from '@/data/uiCopyMap';
import { UX_GOALS } from '@/data/uxGoals';
import { useTypewriter } from '@/lib/useTypewriter';
import { useAnimatedCounter } from '@/lib/useAnimatedCounter';
import { saveScenarioScore } from '@/lib/scores';

// Reveal stages: 0=backdrop, 1=heading, 2=target info, 3=score counter,
//                4=breakdown, 5=critic, 6=buttons
const STAGE_DELAYS = [0, 300, 700, 1200, 2800, 3500, 4500];

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
  const hasResultNow = useGameStore(hasResult);

  const [revealStage, setRevealStage] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const rawCriticText = criticOutput ?? lastShotResult?.criticLine ?? '';
  const typedCritic = useTypewriter(rawCriticText, {
    disabled: reducedMotion || revealStage < 5,
    speedMs: 22,
  });

  const scoreCountEnabled = !reducedMotion && revealStage >= 3;
  const animatedScore = useAnimatedCounter(totalScore, 1500, scoreCountEnabled);
  const displayScore = scoreCountEnabled ? animatedScore : totalScore;

  // Staged reveal sequence
  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    if (!hasResultNow || reducedMotion) {
      const t = setTimeout(() => setRevealStage(6), 0);
      timeouts.push(t);
      return () => timeouts.forEach(clearTimeout);
    }

    STAGE_DELAYS.forEach((delay, stage) => {
      const t = setTimeout(() => setRevealStage(stage), delay);
      timeouts.push(t);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [hasResultNow, reducedMotion]);

  // Save score + detect new record
  useEffect(() => {
    if (!hasResultNow || !selectedScenario || totalScore <= 0) return;
    const { isNewRecord: nr } = saveScenarioScore(selectedScenario.id, totalScore);
    const t = setTimeout(() => setIsNewRecord(nr), 0);
    return () => clearTimeout(t);
  }, [hasResultNow, selectedScenario, totalScore]);

  useEffect(() => {
    markScoreBreakdownViewed();
  }, [markScoreBreakdownViewed]);

  if (!hasResultNow || !lastShotResult) return null;

  const isDadaistHit = lastShotResult.hitTargetType === 'easter-egg-dadaist';
  const isSystemicHit = lastShotResult.hitTargetType === 'easter-egg-systemic';
  const sampledValue = shotFeedback?.scoreBreakdown?.sampledValue ?? 0;
  const zoneMultiplier = shotFeedback?.scoreBreakdown?.zoneMultiplier ?? 1;
  const criticalModifier = shotFeedback?.scoreBreakdown?.criticalModifier ?? 1;
  const timeToFirstShot =
    runTelemetry.firstShotAt && runTelemetry.runStartedAt
      ? runTelemetry.firstShotAt - runTelemetry.runStartedAt
      : null;

  const replayScenario = () => {
    if (!replayAllowed) { resetGame(); return; }
    restartScenario();
  };

  const openScenarioPicker = () => {
    if (!selectedScenario) { resetGame(); return; }
    resetRunState();
    setGamePhase('scenario-select');
  };

  const headingGradient = isDadaistHit
    ? 'from-fuchsia-400 to-purple-500'
    : isSystemicHit
      ? 'from-amber-400 to-red-500'
      : 'from-red-500 to-orange-500';

  const scoreColor = isDadaistHit ? 'text-fuchsia-400' : 'text-red-400';
  const isVisible = (stage: number) => revealStage >= stage;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-3 py-4 sm:px-4 sm:py-8"
      style={{
        background: 'rgba(0,0,0,0.88)',
        opacity: isVisible(0) ? 1 : 0,
        transition: reducedMotion ? 'none' : 'opacity 0.4s ease',
      }}
    >
      <div className="w-full max-w-6xl max-h-[92dvh] overflow-y-auto rounded-2xl border border-white/10 bg-gray-950/97 p-4 shadow-2xl sm:p-6 md:p-8 xl:grid xl:grid-cols-[1.7fr_1fr] xl:gap-6">
        <section>
          {/* Heading */}
          <div className={reducedMotion ? '' : isVisible(1) ? 'anim-slide-down' : 'opacity-0'}>
            <p className="text-xs uppercase tracking-[0.32em] text-orange-300/80">
              {UI_COPY_MAP.results.overline}
            </p>
            <h1
              className={`font-display mt-2 text-3xl font-bold text-transparent bg-gradient-to-r ${headingGradient} bg-clip-text sm:text-5xl`}
            >
              {UI_COPY_MAP.results.heading}
            </h1>
          </div>

          {/* Target + location */}
          <div className={`mt-5 ${reducedMotion ? '' : isVisible(2) ? 'anim-slide-up' : 'opacity-0'}`}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-white/8 bg-gray-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  {UI_COPY_MAP.results.targetLabel}
                </p>
                <p className="font-display mt-2 text-lg font-bold text-white sm:text-xl">
                  {lastShotResult.hitTargetName || 'No registered target'}
                </p>
              </div>
              <div className="rounded-xl border border-white/8 bg-gray-900/80 p-4 md:col-span-2">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  {UI_COPY_MAP.results.impactLabel}
                </p>
                <p className="mt-2 text-base font-semibold text-gray-200">
                  {lastShotResult.hitLocationLabel}
                </p>
              </div>
            </div>
          </div>

          {/* Score counter block */}
          <div className={`mt-4 ${reducedMotion ? '' : isVisible(3) ? 'anim-slide-up' : 'opacity-0'}`}>
            <div
              className={`rounded-xl border p-5 ${isDadaistHit
                ? 'border-fuchsia-500/40 bg-fuchsia-950/25'
                : 'border-red-500/30 bg-red-950/20'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                    {UI_COPY_MAP.results.scoreLabel}
                  </p>
                  <p
                    className={`font-mono mt-2 text-4xl font-bold leading-none sm:text-5xl ${scoreColor} ${isDadaistHit ? 'anim-glitch' : ''}`}
                  >
                    {formatCurrency(displayScore)}
                  </p>
                </div>
                {isNewRecord && (
                  <span className="anim-pulse-glow shrink-0 rounded-full border border-red-500/60 bg-red-950/60 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-red-300">
                    New Record
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-lg bg-black/30 p-2 text-center">
                  <p className="text-xs text-gray-500">Sample</p>
                  <p className="font-mono font-semibold text-gray-300">{sampledValue.toFixed(1)}</p>
                </div>
                <div className="rounded-lg bg-black/30 p-2 text-center">
                  <p className="text-xs text-gray-500">Zone</p>
                  <p className="font-mono font-semibold text-gray-300">×{zoneMultiplier.toFixed(2)}</p>
                </div>
                <div className="rounded-lg bg-black/30 p-2 text-center">
                  <p className="text-xs text-gray-500">Crit</p>
                  <p className="font-mono font-semibold text-gray-300">×{criticalModifier.toFixed(2)}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">{UI_COPY_MAP.results.scoreFraming}</p>
            </div>
          </div>

          {/* Breakdown */}
          {lastShotResult.breakdown.length > 0 && isVisible(4) && (
            <div className="mt-4 rounded-xl border border-white/8 bg-gray-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                {UI_COPY_MAP.results.damageHeading}
              </p>
              <div className="mt-3 space-y-2">
                {lastShotResult.breakdown.map((item, i) => (
                  <div
                    key={item.targetId}
                    className={reducedMotion ? '' : 'anim-slide-up'}
                    style={reducedMotion ? {} : { animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{item.targetName}</span>
                      <span className="font-mono text-orange-300">{formatCurrency(item.damage)}</span>
                    </div>
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-gray-800">
                      <div
                        className="h-full rounded-full bg-orange-500/70 transition-all duration-700"
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Critic quote */}
          <div
            className={`mt-4 rounded-xl border border-orange-500/25 bg-black/40 p-5 ${reducedMotion ? '' : isVisible(5) ? 'anim-slide-up' : 'opacity-0'}`}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-orange-300/80">
              {UI_COPY_MAP.results.criticLabel}
            </p>
            <p className="font-serif mt-3 text-base italic leading-relaxed text-orange-100 sm:text-lg">
              &ldquo;{typedCritic.text}{typedCritic.done ? '' : '▌'}&rdquo;
            </p>
          </div>

          {/* Dev telemetry */}
          {timeToFirstShot !== null && isVisible(6) && (
            <div className="mt-3 rounded-lg border border-white/5 bg-black/15 p-3 font-mono text-xs text-gray-600">
              <p>
                TtFS {(timeToFirstShot / 1000).toFixed(1)}s / goal ≤{(UX_GOALS.timeToFirstShotMs / 1000).toFixed(0)}s
                &nbsp;·&nbsp; replay {runTelemetry.replayUsed ? 'y' : 'n'}
                &nbsp;·&nbsp; bdv {runTelemetry.scoreBreakdownViewed ? 'y' : 'n'}
              </p>
            </div>
          )}

          {/* CTA buttons */}
          <div
            className={`mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 ${reducedMotion ? '' : isVisible(6) ? 'anim-slide-up' : 'opacity-0'}`}
          >
            <button
              onClick={replayScenario}
              disabled={!replayAllowed}
              className="rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {UI_COPY_MAP.results.replayCta}
            </button>
            <button
              onClick={openScenarioPicker}
              className="rounded-full border border-white/20 bg-gray-900 px-6 py-3 font-semibold text-gray-100 transition hover:border-white/40 hover:bg-gray-800 active:scale-[0.98]"
            >
              {UI_COPY_MAP.results.newScenarioCta}
            </button>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="mt-6 space-y-4 xl:mt-0 xl:sticky xl:top-4 xl:self-start">
          <div className="rounded-xl border border-orange-500/30 bg-black/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-orange-200">
              {UI_COPY_MAP.results.operationHeading}
            </p>
            <p className="mt-2 text-sm text-gray-300">{UI_COPY_MAP.results.operationBody}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-gray-900/80 p-4 font-mono text-sm text-gray-400">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gray-400 font-sans">Run facts</p>
            <p>score {formatCurrency(totalScore)}</p>
            <p>
              type{' '}
              {isDadaistHit
                ? 'dadaist anomaly'
                : isSystemicHit
                  ? 'systemic cascade'
                  : 'canonical hit'}
            </p>
            {lastShotResult.resolvedWithOverride && (
              <p className="mt-1 text-amber-400/70 text-xs">override active</p>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-black/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-orange-200">Next loop</p>
            <ul className="mt-2 space-y-2 text-sm text-gray-300">
              {UI_COPY_MAP.results.operationChecklist.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
