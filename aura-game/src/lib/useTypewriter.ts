import { useEffect, useMemo, useState } from 'react';

interface TypewriterOptions {
  speedMs?: number;
  disabled?: boolean;
}

export function useTypewriter(text: string, options: TypewriterOptions = {}) {
  const { speedMs = 18, disabled = false } = options;
  const stableText = useMemo(() => text ?? '', [text]);
  const [visibleChars, setVisibleChars] = useState(disabled ? stableText.length : 0);

  useEffect(() => {
    if (disabled) {
      setVisibleChars(stableText.length);
      return;
    }

    setVisibleChars(0);
    if (!stableText) return;

    const interval = window.setInterval(() => {
      setVisibleChars((current) => {
        if (current >= stableText.length) {
          window.clearInterval(interval);
          return current;
        }
        return current + 1;
      });
    }, speedMs);

    return () => window.clearInterval(interval);
  }, [stableText, speedMs, disabled]);

  return {
    text: stableText.slice(0, visibleChars),
    done: visibleChars >= stableText.length,
  };
}
