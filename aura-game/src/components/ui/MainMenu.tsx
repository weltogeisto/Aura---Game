import { getScenariosList } from '@/data/scenarios';
import { useGameStore } from '@/stores/gameStore';
import { UI_COPY_MAP } from '@/data/uiCopyMap';
import { isScenarioPlayable } from './scenarioSelectModel';
import { getAllBestScores } from '@/lib/scores';
import { formatCurrency } from '@/lib/utils';

export function MainMenu() {
  const setGamePhase = useGameStore((state) => state.setGamePhase);
  const accessibility = useGameStore((state) => state.accessibility);
  const setAccessibilityFlag = useGameStore((state) => state.setAccessibilityFlag);
  const reducedMotion = accessibility.reducedMotion;

  const scenarioCount = getScenariosList().length;
  const playableScenarioCount = getScenariosList().filter((s) => isScenarioPlayable(s)).length;
  const bestScores = getAllBestScores();
  const totalBest = Object.values(bestScores).reduce((sum, s) => sum + s.best, 0);

  return (
    <div className="relative fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gray-950 px-4">
      {/* Ambient orb */}
      {!reducedMotion && (
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 55% 40% at 50% 25%, rgba(220,38,38,0.14) 0%, transparent 65%)',
            animation: 'orb-pulse 10s ease-in-out infinite',
          }}
        />
      )}

      {/* Film grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
          animation: reducedMotion ? 'none' : 'grain-drift 4s steps(4) infinite',
        }}
      />

      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/10 bg-black/40 p-8 text-center shadow-2xl backdrop-blur md:p-10">
        <p
          className={`text-xs uppercase tracking-[0.32em] text-orange-300/85 ${reducedMotion ? '' : 'anim-fade-blur-in'}`}
        >
          {UI_COPY_MAP.release.badge}
        </p>

        <h1
          className={`font-display mt-3 text-5xl font-black text-transparent bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text md:text-6xl ${reducedMotion ? '' : 'anim-fade-blur-in'}`}
          style={reducedMotion ? {} : { animationDelay: '80ms' }}
        >
          {UI_COPY_MAP.release.title}
        </h1>

        <p
          className={`mx-auto mt-6 max-w-xl text-base text-gray-200 ${reducedMotion ? '' : 'anim-slide-up'}`}
          style={reducedMotion ? {} : { animationDelay: '200ms' }}
        >
          {UI_COPY_MAP.hints.gameTagline}
        </p>
        <p
          className={`mx-auto mt-2 max-w-xl text-sm text-gray-400 ${reducedMotion ? '' : 'anim-slide-up'}`}
          style={reducedMotion ? {} : { animationDelay: '280ms' }}
        >
          {UI_COPY_MAP.release.subtitle}
        </p>
        <p
          className={`mx-auto mt-2 max-w-xl text-sm text-gray-400 ${reducedMotion ? '' : 'anim-slide-up'}`}
          style={reducedMotion ? {} : { animationDelay: '360ms' }}
        >
          {playableScenarioCount} of {scenarioCount} rooms playable.
          {totalBest > 0 && (
            <span className="font-mono ml-2 text-orange-300/80">
              Career best: {formatCurrency(totalBest)}
            </span>
          )}
        </p>

        {/* Accessibility toggles */}
        <div
          className={`mx-auto mt-5 max-w-md rounded-xl border border-white/10 bg-black/40 p-4 text-left ${reducedMotion ? '' : 'anim-slide-up'}`}
          style={reducedMotion ? {} : { animationDelay: '440ms' }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-orange-200">
            {UI_COPY_MAP.accessibility.heading}
          </p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(['reducedMotion', 'highContrast', 'aimAssist'] as const).map((flag) => (
              <button
                key={flag}
                type="button"
                onClick={() => setAccessibilityFlag(flag, !accessibility[flag])}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${accessibility[flag] ? 'bg-orange-500 text-black' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
              >
                {UI_COPY_MAP.accessibility[flag]}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setGamePhase('scenario-select')}
          className={`mt-10 rounded-full bg-red-600 px-9 py-3 text-lg font-semibold text-white transition hover:bg-red-500 hover:scale-[1.02] active:scale-[0.99] ${reducedMotion ? '' : 'anim-slide-up'}`}
          style={reducedMotion ? {} : { animationDelay: '520ms' }}
        >
          {UI_COPY_MAP.mainMenu.ctaScenarioSelect}
        </button>

        <p
          className={`mt-10 font-serif text-xs italic leading-relaxed text-gray-500 md:text-sm ${reducedMotion ? '' : 'anim-slide-up'}`}
          style={reducedMotion ? {} : { animationDelay: '600ms' }}
        >
          {UI_COPY_MAP.mainMenu.criticFraming}
        </p>
      </div>
    </div>
  );
}
