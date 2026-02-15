import { useEffect, useMemo } from 'react';
import { useGameStore } from '@/stores/gameStore';

const FINE_ADJUST_STEP = 0.008;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function Crosshair() {
  const gamePhase = useGameStore((state) => state.gamePhase);
  const crosshairPosition = useGameStore((state) => state.crosshairPosition);
  const setCrosshairPosition = useGameStore((state) => state.setCrosshairPosition);

  const style = useMemo(
    () => ({
      left: `${crosshairPosition.x * window.innerWidth}px`,
      top: `${crosshairPosition.y * window.innerHeight}px`,
    }),
    [crosshairPosition]
  );

  useEffect(() => {
    if (gamePhase !== 'aiming') {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setCrosshairPosition(clamp01(e.clientX / window.innerWidth), clamp01(e.clientY / window.innerHeight));
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

  return (
    <div className="fixed z-40 h-8 w-8 -translate-x-1/2 -translate-y-1/2 transform pointer-events-none" style={style}>
      {gamePhase === 'aiming' ? (
        <>
          <div className="absolute inset-0 rounded-full border-2 border-red-500 opacity-70" />
          <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-red-500" />
          <div className="absolute left-1/2 top-0 h-2 w-0.5 -translate-x-1/2 -translate-y-2 transform bg-red-500" />
          <div className="absolute bottom-0 left-1/2 h-2 w-0.5 -translate-x-1/2 translate-y-2 transform bg-red-500" />
          <div className="absolute left-0 top-1/2 h-0.5 w-2 -translate-x-2 -translate-y-1/2 transform bg-red-500" />
          <div className="absolute right-0 top-1/2 h-0.5 w-2 translate-x-2 -translate-y-1/2 transform bg-red-500" />
        </>
      ) : (
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-300/70 shadow-[0_0_10px_rgba(253,186,116,0.65)]" />
      )}
    </div>
  );
}
