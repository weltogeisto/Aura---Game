import { useGameStore } from '@/stores/gameStore';
import { UI_COPY_MAP } from '@/data/uiCopyMap';
import { useTypewriter } from '@/lib/useTypewriter';

export function StartView() {
  const setGamePhase = useGameStore((state) => state.setGamePhase);
  const reducedMotion = useGameStore((state) => state.accessibility.reducedMotion);
  const typedTagline = useTypewriter(UI_COPY_MAP.hints.gameTagline, {
    disabled: reducedMotion,
    speedMs: 32,
  });

  return (
    <div className="relative flex h-full min-h-dvh w-full items-center justify-center overflow-hidden bg-slate-950 px-3 py-5 text-white sm:px-4 sm:py-6">
      {/* Animated ambient orb */}
      {!reducedMotion && (
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(234,179,8,0.18) 0%, transparent 70%)',
            animation: 'orb-pulse 8s ease-in-out infinite',
          }}
        />
      )}

      {/* Film grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
          animation: reducedMotion ? 'none' : 'grain-drift 4s steps(4) infinite',
        }}
      />

      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-amber-300/20 bg-slate-950/80 p-4 shadow-2xl backdrop-blur sm:p-6 md:p-10">
        <p
          className={`text-[11px] uppercase tracking-[0.32em] text-amber-300/90 sm:text-xs ${reducedMotion ? '' : 'anim-fade-blur-in'}`}
          style={reducedMotion ? {} : { animationDelay: '0ms' }}
        >
          {UI_COPY_MAP.startView.overline}
        </p>

        <h1
          className={`font-display mt-3 text-2xl font-bold leading-tight sm:text-4xl md:text-5xl ${reducedMotion ? '' : 'anim-fade-blur-in'}`}
          style={reducedMotion ? {} : { animationDelay: '100ms' }}
        >
          {UI_COPY_MAP.startView.title}
        </h1>

        {/* Typewriter tagline */}
        <p
          className={`font-serif mt-4 max-w-xl text-base italic leading-relaxed text-amber-100/90 md:text-lg ${reducedMotion ? '' : 'anim-slide-up'}`}
          style={reducedMotion ? {} : { animationDelay: '300ms' }}
        >
          {typedTagline.text}
          {!typedTagline.done && <span className="animate-pulse">▌</span>}
        </p>

        <p
          className={`mt-3 max-w-xl text-sm leading-relaxed text-slate-300 md:text-base ${reducedMotion ? '' : 'anim-slide-up'}`}
          style={reducedMotion ? {} : { animationDelay: '500ms' }}
        >
          {UI_COPY_MAP.startView.body}
        </p>

        {/* Limitations notice */}
        <div
          className={`mt-5 rounded-xl border border-amber-200/15 bg-slate-900/50 p-4 sm:mt-6 ${reducedMotion ? '' : 'anim-slide-up'}`}
          style={reducedMotion ? {} : { animationDelay: '650ms' }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80">
            {UI_COPY_MAP.limitations.heading}
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-300">
            {UI_COPY_MAP.limitations.items.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div
          className={`mt-6 flex flex-col gap-3 sm:flex-row ${reducedMotion ? '' : 'anim-slide-up'}`}
          style={reducedMotion ? {} : { animationDelay: '800ms' }}
        >
          <button
            type="button"
            onClick={() => setGamePhase('scenario-select')}
            className="rounded-full border border-amber-200/70 bg-amber-300/95 px-5 py-3 text-sm font-bold uppercase tracking-wider text-slate-900 transition hover:scale-[1.02] hover:bg-amber-200 active:scale-[0.99]"
          >
            {UI_COPY_MAP.startView.ctaPrimary}
          </button>
          <button
            type="button"
            onClick={() => setGamePhase('menu')}
            className="rounded-full border border-slate-500/50 bg-slate-900/70 px-5 py-3 text-sm font-semibold uppercase tracking-wider text-slate-200 transition hover:border-slate-300/60 hover:bg-slate-800 active:scale-[0.99]"
          >
            {UI_COPY_MAP.startView.ctaSecondary}
          </button>
        </div>
      </div>
    </div>
  );
}
