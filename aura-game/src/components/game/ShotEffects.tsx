import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { UI_COPY_MAP } from '@/data/uiCopyMap';

export function ShotEffects() {
  const gamePhase = useGameStore((state) => state.gamePhase);
  const shotFeedback = useGameStore((state) => state.shotFeedback);
  const clearShotFeedback = useGameStore((state) => state.clearShotFeedback);
  const reducedMotion = useGameStore((state) => state.accessibility.reducedMotion);
  const highContrast = useGameStore((state) => state.accessibility.highContrast);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!shotFeedback?.active) return;

    const timeout = window.setTimeout(
      () => { clearShotFeedback(); },
      reducedMotion ? 380 : 650,
    );

    return () => window.clearTimeout(timeout);
  }, [shotFeedback, clearShotFeedback, reducedMotion]);

  // Slow-motion zoom on shot fire
  useEffect(() => {
    if (!shotFeedback?.active || reducedMotion) return;

    const wrapper = wrapperRef.current?.closest?.('[data-game-wrapper]') as HTMLElement | null;
    if (!wrapper) return;

    wrapper.classList.add('anim-zoom-pulse');
    const cleanup = () => wrapper.classList.remove('anim-zoom-pulse');
    const t = setTimeout(cleanup, 650);
    return () => { clearTimeout(t); cleanup(); };
  }, [shotFeedback?.active, reducedMotion]);

  if (!shotFeedback?.active || (gamePhase !== 'aiming' && gamePhase !== 'shooting')) {
    return null;
  }

  const left = `${shotFeedback.crosshairPosition.x * 100}%`;
  const top = `${shotFeedback.crosshairPosition.y * 100}%`;
  const scoreLabel =
    shotFeedback.hit && shotFeedback.scoreBreakdown
      ? `x${shotFeedback.scoreBreakdown.zoneMultiplier.toFixed(2)} • crit ${shotFeedback.scoreBreakdown.criticalModifier.toFixed(2)}`
      : UI_COPY_MAP.hitFeedback.miss;

  return (
    <div ref={wrapperRef} className="fixed inset-0 pointer-events-none z-40">
      {/* Muzzle flash — white screen pop */}
      {!reducedMotion && <div className="muzzle-flash" />}
      {/* Sustained vignette darkening */}
      {!reducedMotion && <div className="shot-vignette" />}

      {/* Hit marker X */}
      {shotFeedback.hit && (
        <div className="hit-marker" style={{ left, top }}>
          <span className="hit-marker-line" />
          <span className="hit-marker-line" />
        </div>
      )}

      {/* Score chip */}
      <div
        className={`impact-chip ${highContrast ? 'impact-chip-contrast' : ''}`}
        style={{ left, top }}
      >
        {scoreLabel}
      </div>
    </div>
  );
}
