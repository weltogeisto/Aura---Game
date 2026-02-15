import { useGameStore } from '@/stores/gameStore';

export function StartView() {
  const setGamePhase = useGameStore((state) => state.setGamePhase);

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.2),_transparent_45%)]" />
      <div className="relative z-10 mx-4 max-w-xl rounded-2xl border border-amber-300/30 bg-slate-950/70 p-8 text-center shadow-2xl backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-300/90">Aura</p>
        <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Louvre Entry Hall</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-200 md:text-base">
          Step into a prototype scene scaffold. This is the new entry flow that safely boots the Louvre space and gives
          you a direct return path.
        </p>
        <button
          type="button"
          onClick={() => setGamePhase('louvre')}
          className="mt-8 rounded-full border border-amber-200/70 bg-amber-300/95 px-8 py-3 text-sm font-semibold uppercase tracking-wider text-slate-900 transition hover:scale-[1.02] hover:bg-amber-200"
        >
          Enter Louvre
        </button>
      </div>
    </div>
  );
}
