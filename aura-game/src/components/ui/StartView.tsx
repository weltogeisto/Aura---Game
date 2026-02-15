import { useGameStore } from '@/stores/gameStore';
import { MICROCOPY } from '@/data/copy';

export function StartView() {
  const setGamePhase = useGameStore((state) => state.setGamePhase);

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 px-4 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.2),_transparent_45%)]" />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-amber-300/25 bg-slate-950/75 p-8 shadow-2xl backdrop-blur md:p-10">
        <p className="text-xs uppercase tracking-[0.32em] text-amber-300/90">Aura / Prototype Build</p>
        <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Louvre Entry Hall</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-200 md:text-base">{MICROCOPY.gameTagline}</p>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300 md:text-base">
          Start in the entry hall, then move into scenario selection for your one-shot run.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setGamePhase('louvre')}
            className="rounded-full border border-amber-200/70 bg-amber-300/95 px-8 py-3 text-sm font-semibold uppercase tracking-wider text-slate-900 transition hover:scale-[1.01] hover:bg-amber-200"
          >
            Enter Louvre
          </button>
          <button
            type="button"
            onClick={() => setGamePhase('menu')}
            className="rounded-full border border-slate-500/70 bg-slate-900/70 px-8 py-3 text-sm font-semibold uppercase tracking-wider text-slate-100 transition hover:border-slate-300"
          >
            Skip to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
