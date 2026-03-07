import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';

const FINE_ADJUST_STEP = 0.008;
const SWAY_X = 0.004;
const SWAY_Y = 0.006;
const SWAY_FREQ_HZ = 0.22;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Map a target value (€) to a crosshair color: grey → orange → red */
function valueToColor(value: number | null, highContrast: boolean): string {
  if (highContrast) return '#fff700';
  if (!value || value <= 0) return '#ef4444'; // default red
  if (value >= 100_000_000) return '#ef4444'; // €100M+ → red
  if (value >= 10_000_000) return '#f97316';  // €10M+ → orange
  return '#ef4444';
}

export function Crosshair() {
  const gamePhase = useGameStore((state) => state.gamePhase);
  const crosshairPosition = useGameStore((state) => state.crosshairPosition);
  const setCrosshairPosition = useGameStore((state) => state.setCrosshairPosition);
  const { reducedMotion, highContrast, aimAssist } = useGameStore((state) => state.accessibility);
  const focusedTargetValue = useGameStore((state) => state.focusedTargetValue);
  const [breathOffset, setBreathOffset] = useState({ x: 0, y: 0 });
  const [breathPhase, setBreathPhase] = useState(0);

  const swayActive = gamePhase === 'aiming' && !reducedMotion;

  const style = useMemo(
    () => ({
      left: `${(crosshairPosition.x + (swayActive ? breathOffset.x : 0)) * window.innerWidth}px`,
      top: `${(crosshairPosition.y + (swayActive ? breathOffset.y : 0)) * window.innerHeight}px`,
    }),
    [crosshairPosition, breathOffset, swayActive],
  );

  // Breath sway animation
  useEffect(() => {
    if (!swayActive) return;

    let raf = 0;
    const start = performance.now();

    const tick = () => {
      const elapsedSec = (performance.now() - start) / 1000;
      const phase = elapsedSec * SWAY_FREQ_HZ * Math.PI * 2;
      const assistDamping = aimAssist ? 0.55 : 1;
      const offsetX = Math.sin(phase) * SWAY_X * assistDamping;
      const offsetY = Math.cos(phase * 0.8 + Math.PI / 6) * SWAY_Y * assistDamping;
      setBreathOffset({ x: offsetX, y: offsetY });
      setBreathPhase(phase);
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [swayActive, aimAssist]);

  // Mouse + keyboard input
  useEffect(() => {
    if (gamePhase !== 'aiming') return;

    const handleMouseMove = (e: MouseEvent) => {
      setCrosshairPosition(
        clamp01(e.clientX / window.innerWidth),
        clamp01(e.clientY / window.innerHeight),
      );
    };

    const handleFineAdjust = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      let deltaX = 0;
      let deltaY = 0;

      if (e.key === 'ArrowUp' || key === 'w') deltaY = -FINE_ADJUST_STEP;
      if (e.key === 'ArrowDown' || key === 's') deltaY = FINE_ADJUST_STEP;
      if (e.key === 'ArrowLeft' || key === 'a') deltaX = -FINE_ADJUST_STEP;
      if (e.key === 'ArrowRight' || key === 'd') deltaX = FINE_ADJUST_STEP;

      if (deltaX === 0 && deltaY === 0) return;
      e.preventDefault();
      const current = useGameStore.getState().crosshairPosition;
      setCrosshairPosition(clamp01(current.x + deltaX), clamp01(current.y + deltaY));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleFineAdjust);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleFineAdjust);
    };
  }, [gamePhase, setCrosshairPosition]);

  // Optimal window: sin(phase) near 0 → breath is at stillest point
  const breathStillness = 1 - Math.min(Math.abs(Math.sin(breathPhase)), 1);
  // Ring opacity peaks at stillness
  const optimalRingOpacity = swayActive ? Math.max(0, breathStillness * breathStillness - 0.3) : 0;

  const color = valueToColor(focusedTargetValue, highContrast);

  return (
    <div
      className="fixed z-40 h-8 w-8 -translate-x-1/2 -translate-y-1/2 transform pointer-events-none"
      style={style}
    >
      {gamePhase === 'aiming' ? (
        <>
          {/* Optimal shot window ring — glows amber when breath is still */}
          {!reducedMotion && (
            <div
              className="absolute rounded-full border"
              style={{
                inset: '-10px',
                borderColor: `rgba(251,191,36,${optimalRingOpacity.toFixed(3)})`,
                boxShadow: optimalRingOpacity > 0.15
                  ? `0 0 8px rgba(251,191,36,${(optimalRingOpacity * 0.5).toFixed(3)})`
                  : 'none',
                transition: 'none',
              }}
            />
          )}

          {/* Main crosshair ring */}
          <div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: color, opacity: 0.75 }}
          />
          {/* Center dot */}
          <div
            className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 transform rounded-full"
            style={{ background: color }}
          />
          {/* Cross lines */}
          <div
            className="absolute left-1/2 top-0 h-2 w-0.5 -translate-x-1/2 -translate-y-2 transform"
            style={{ background: color }}
          />
          <div
            className="absolute bottom-0 left-1/2 h-2 w-0.5 -translate-x-1/2 translate-y-2 transform"
            style={{ background: color }}
          />
          <div
            className="absolute left-0 top-1/2 h-0.5 w-2 -translate-x-2 -translate-y-1/2 transform"
            style={{ background: color }}
          />
          <div
            className="absolute right-0 top-1/2 h-0.5 w-2 translate-x-2 -translate-y-1/2 transform"
            style={{ background: color }}
          />
        </>
      ) : (
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-300/70 shadow-[0_0_10px_rgba(253,186,116,0.65)]" />
      )}
    </div>
  );
}
