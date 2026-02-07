import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';

export function ShotEffects() {
  const gamePhase = useGameStore((state) => state.gamePhase);
  const shotFeedback = useGameStore((state) => state.shotFeedback);
  const clearShotFeedback = useGameStore((state) => state.clearShotFeedback);

  useEffect(() => {
    if (!shotFeedback?.active) return;

    const timeout = window.setTimeout(() => {
      clearShotFeedback();
    }, 650);

    return () => window.clearTimeout(timeout);
  }, [shotFeedback, clearShotFeedback]);

  if (!shotFeedback?.active || (gamePhase !== 'aiming' && gamePhase !== 'shooting')) {
    return null;
  }

  const left = `${shotFeedback.crosshairPosition.x * 100}%`;
  const top = `${shotFeedback.crosshairPosition.y * 100}%`;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <div className="muzzle-flash" />
      <div className="shot-vignette" />
      {shotFeedback.hit && (
        <div className="hit-marker" style={{ left, top }}>
          <span className="hit-marker-line" />
          <span className="hit-marker-line" />
        </div>
      )}
    </div>
  );
}
