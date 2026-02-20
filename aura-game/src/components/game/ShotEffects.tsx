import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { UI_COPY_MAP } from '@/data/uiCopyMap';

export function ShotEffects() {
  const gamePhase = useGameStore((state) => state.gamePhase);
  const shotFeedback = useGameStore((state) => state.shotFeedback);
  const clearShotFeedback = useGameStore((state) => state.clearShotFeedback);
  const reducedMotion = useGameStore((state) => state.accessibility.reducedMotion);
  const highContrast = useGameStore((state) => state.accessibility.highContrast);

  useEffect(() => {
    if (!shotFeedback?.active) return;

    const timeout = window.setTimeout(() => {
      clearShotFeedback();
    }, reducedMotion ? 380 : 650);

    return () => window.clearTimeout(timeout);
  }, [shotFeedback, clearShotFeedback, reducedMotion]);

  if (!shotFeedback?.active || (gamePhase !== 'aiming' && gamePhase !== 'shooting')) {
    return null;
  }

  const left = `${shotFeedback.crosshairPosition.x * 100}%`;
  const top = `${shotFeedback.crosshairPosition.y * 100}%`;
  const scoreLabel = shotFeedback.hit && shotFeedback.scoreBreakdown
    ? `x${shotFeedback.scoreBreakdown.zoneMultiplier.toFixed(2)} • crit ${shotFeedback.scoreBreakdown.criticalModifier.toFixed(2)}`
    : UI_COPY_MAP.hitFeedback.miss;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {!reducedMotion && <div className="muzzle-flash" />}
      {!reducedMotion && <div className="shot-vignette" />}
      {shotFeedback.hit && (
        <div className="hit-marker" style={{ left, top }}>
          <span className="hit-marker-line" />
          <span className="hit-marker-line" />
        </div>
      )}
      <div className={`impact-chip ${highContrast ? 'impact-chip-contrast' : ''}`} style={{ left, top }}>
        {scoreLabel}
      </div>
    </div>
  );
}
