import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';

export function Crosshair() {
  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const setCrosshairPosition = useGameStore((state) => state.setCrosshairPosition);

  useEffect(() => {
    // Hide the default cursor during gameplay
    document.body.style.cursor = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      // Store normalized position (0-1)
      setCrosshairPosition(
        e.clientX / window.innerWidth,
        e.clientY / window.innerHeight
      );
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      // Restore cursor when component unmounts
      document.body.style.cursor = 'auto';
    };
  }, [setCrosshairPosition]);

  return (
    <div
      className="fixed w-8 h-8 pointer-events-none z-40 transform -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${mousePos.x}px`,
        top: `${mousePos.y}px`,
      }}
    >
      {/* Outer circle */}
      <div className="absolute inset-0 border-2 border-red-500 rounded-full opacity-70"></div>

      {/* Center dot */}
      <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

      {/* Crosshair lines */}
      <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-red-500 transform -translate-x-1/2 -translate-y-2"></div>
      <div className="absolute bottom-0 left-1/2 w-0.5 h-2 bg-red-500 transform -translate-x-1/2 translate-y-2"></div>
      <div className="absolute top-1/2 left-0 h-0.5 w-2 bg-red-500 transform -translate-x-2 -translate-y-1/2"></div>
      <div className="absolute top-1/2 right-0 h-0.5 w-2 bg-red-500 transform translate-x-2 -translate-y-1/2"></div>
    </div>
  );
}
