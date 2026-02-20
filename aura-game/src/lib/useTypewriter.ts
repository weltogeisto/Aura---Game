import { useEffect, useMemo, useState } from 'react';

interface TypewriterOptions {
  speedMs?: number;
  disabled?: boolean;
}

export function useTypewriter(text: string, options: TypewriterOptions = {}) {
  const { speedMs = 18, disabled = false } = options;
  const stableText = useMemo(() => text ?? '', [text]);
  // Animation progress counter; only mutated inside setInterval callbacks.
  const [visibleChars, setVisibleChars] = useState(0);

  useEffect(() => {
    // When disabled or there is no text, bail — the effective count is derived at
    // render time for the disabled case so no synchronous setState is needed.
    if (disabled || !stableText) return;

    // Track position in a closure-local variable so the first setInterval tick
    // naturally starts the sequence from 1, avoiding a synchronous setState(0).
    let counter = 0;
    const interval = window.setInterval(() => {
      counter += 1;
      setVisibleChars(counter);
      if (counter >= stableText.length) {
        window.clearInterval(interval);
      }
    }, speedMs);

    return () => window.clearInterval(interval);
  }, [stableText, speedMs, disabled]);

  // When disabled, reveal full text immediately without a synchronous setState.
  const effectiveChars = disabled ? stableText.length : visibleChars;

  return {
    text: stableText.slice(0, effectiveChars),
    done: effectiveChars >= stableText.length,
  };
}
