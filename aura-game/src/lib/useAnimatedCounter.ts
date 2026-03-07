import { useEffect, useRef, useState } from 'react';

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Animates a number from 0 to `target` over `durationMs`.
 * Returns the current display value as an integer.
 * If `enabled` is false, immediately returns the target.
 */
export function useAnimatedCounter(
  target: number,
  durationMs: number,
  enabled: boolean,
): number {
  const [value, setValue] = useState(enabled ? 0 : target);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      // Defer setState to avoid synchronous state update inside effect body
      const t = setTimeout(() => setValue(target), 0);
      return () => clearTimeout(t);
    }

    startTimeRef.current = null;

    const animate = (now: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = now;
      }
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = easeOutExpo(progress);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, durationMs, enabled]);

  return value;
}
