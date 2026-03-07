import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { formatCurrency } from '@/lib/utils';
import { useAnimatedCounter } from '@/lib/useAnimatedCounter';

const CHAIN_STEP_DELAY_MS = 320;
const AUTO_DISMISS_MS = 2800;

export function ChainReactionOverlay() {
  const lastShotResult = useGameStore((state) => state.lastShotResult);
  const gamePhase = useGameStore((state) => state.gamePhase);
  const reducedMotion = useGameStore((state) => state.accessibility.reducedMotion);

  const [visibleSteps, setVisibleSteps] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const isSystemic = lastShotResult?.hitTargetType === 'easter-egg-systemic';
  // Memoize effects array to prevent dependency array churn
  const rawEffects = lastShotResult?.specialEffects;
  const effects = useMemo(() => rawEffects ?? [], [rawEffects]);
  const totalDamage = lastShotResult?.totalDamage ?? 0;

  const shouldShow =
    gamePhase === 'shooting' &&
    isSystemic &&
    effects.length > 0 &&
    !dismissed;

  const animatedTotal = useAnimatedCounter(
    totalDamage,
    1200,
    !reducedMotion && visibleSteps >= effects.length,
  );

  // Cascade steps in
  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    if (!shouldShow) {
      // Defer state resets to avoid synchronous setState in effect body
      timeouts.push(setTimeout(() => setVisibleSteps(0), 0));
      timeouts.push(setTimeout(() => setDismissed(false), 0));
      return () => timeouts.forEach(clearTimeout);
    }

    if (reducedMotion) {
      timeouts.push(setTimeout(() => setVisibleSteps(effects.length), 0));
      return () => timeouts.forEach(clearTimeout);
    }

    effects.forEach((_, i) => {
      const t = setTimeout(() => setVisibleSteps(i + 1), i * CHAIN_STEP_DELAY_MS + 200);
      timeouts.push(t);
    });

    const dismiss = setTimeout(() => setDismissed(true), AUTO_DISMISS_MS);
    timeouts.push(dismiss);

    return () => timeouts.forEach(clearTimeout);
  }, [shouldShow, effects, reducedMotion]);

  if (!shouldShow) return null;

  return (
    <div
      className="fixed inset-0 z-[45] flex items-center justify-center"
      style={{
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-amber-500/30 bg-gray-950/95 p-6 shadow-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">
          Systemic cascade
        </p>
        <h2 className="font-display mt-2 text-2xl font-bold text-amber-300 sm:text-3xl">
          Chain Reaction
        </h2>

        <div className="mt-5 space-y-3">
          {effects.map((effect, i) => (
            <div
              key={i}
              className={reducedMotion ? '' : 'anim-chain-in'}
              style={{
                opacity: visibleSteps > i ? 1 : 0,
                animationDelay: reducedMotion ? '0ms' : `${i * CHAIN_STEP_DELAY_MS + 200}ms`,
              }}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-xl text-amber-400" aria-hidden="true">⚡</span>
                <p className="text-sm leading-snug text-gray-200">{effect}</p>
              </div>
              {i < effects.length - 1 && (
                <div className="ml-4 mt-1 h-3 w-0.5 bg-amber-700/40" />
              )}
            </div>
          ))}
        </div>

        {visibleSteps >= effects.length && (
          <div className="mt-5 rounded-xl border border-amber-500/25 bg-amber-950/30 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300/70">
              Total cascade damage
            </p>
            <p className="font-mono mt-1 text-3xl font-bold text-amber-300 sm:text-4xl">
              {formatCurrency(reducedMotion ? totalDamage : animatedTotal)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
