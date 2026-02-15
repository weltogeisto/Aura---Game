import { useGameStore } from '@/stores/gameStore';
import { UI_COPY_MAP } from '@/data/uiCopyMap';

export function StartView() {
  const setGamePhase = useGameStore((state) => state.setGamePhase);

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 px-4 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.2),_transparent_45%)]" />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-amber-300/25 bg-slate-950/75 p-8 shadow-2xl backdrop-blur md:p-10">
        <p className="text-xs uppercase tracking-[0.32em] text-amber-300/90">{UI_COPY_MAP.startView.overline}</p>
        <h1 className="mt-3 text-4xl font-semibold md:text-5xl">{UI_COPY_MAP.startView.title}</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-200 md:text-base">{UI_COPY_MAP.hints.gameTagline}</p>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300 md:text-base">{UI_COPY_MAP.startView.body}</p>

        <div className="mt-8 rounded-xl border border-amber-200/20 bg-slate-900/50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-200">{UI_COPY_MAP.limitations.heading}</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-300">
            {UI_COPY_MAP.limitations.items.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setGamePhase('scenario-select')}
            className="rounded-full border border-amber-200/70 bg-amber-300/95 px-8 py-3 text-sm font-semibold uppercase tracking-wider text-slate-900 transition hover:scale-[1.01] hover:bg-amber-200"
          >
            {UI_COPY_MAP.startView.ctaPrimary}
          </button>
          <button
            type="button"
            onClick={() => setGamePhase('menu')}
            className="rounded-full border border-slate-500/70 bg-slate-900/70 px-8 py-3 text-sm font-semibold uppercase tracking-wider text-slate-100 transition hover:border-slate-300"
          >
            {UI_COPY_MAP.startView.ctaSecondary}
          </button>
        </div>
      </div>
    </div>
  );
}
