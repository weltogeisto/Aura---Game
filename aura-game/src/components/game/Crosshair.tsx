import { useEffect, useMemo } from 'react';
import { useGameStore } from '@/stores/gameStore';

const FINE_ADJUST_STEP = 0.008;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function Crosshair() {
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
    const handleMouseMove = (e: MouseEvent) => {
      setCrosshairPosition(
        clamp01(e.clientX / window.innerWidth),
        clamp01(e.clientY / window.innerHeight)
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
  }, [setCrosshairPosition]);

  return (
    <div
      className="fixed w-8 h-8 pointer-events-none z-40 transform -translate-x-1/2 -translate-y-1/2"
      style={style}
    >
      <div className="absolute inset-0 border-2 border-red-500 rounded-full opacity-70"></div>
      <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-red-500 transform -translate-x-1/2 -translate-y-2"></div>
      <div className="absolute bottom-0 left-1/2 w-0.5 h-2 bg-red-500 transform -translate-x-1/2 translate-y-2"></div>
      <div className="absolute top-1/2 left-0 h-0.5 w-2 bg-red-500 transform -translate-x-2 -translate-y-1/2"></div>
      <div className="absolute top-1/2 right-0 h-0.5 w-2 bg-red-500 transform translate-x-2 -translate-y-1/2"></div>
    </div>
  );
}
