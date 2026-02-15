import { getScenariosList } from '@/data/scenarios';
import { useGameStore } from '@/stores/gameStore';
import { UI_COPY_MAP } from '@/data/uiCopyMap';
import { isScenarioPlayable } from './scenarioSelectModel';

export function MainMenu() {
  const setGamePhase = useGameStore((state) => state.setGamePhase);
  const scenarioCount = getScenariosList().length;
  const playableScenarioCount = getScenariosList().filter((scenario) => isScenarioPlayable(scenario)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-black/35 p-8 text-center shadow-2xl backdrop-blur md:p-10">
        <p className="text-xs uppercase tracking-[0.32em] text-orange-300/85">{UI_COPY_MAP.release.badge}</p>
        <h1 className="mt-3 text-5xl font-bold text-transparent bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text md:text-6xl">
          {UI_COPY_MAP.release.title}
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base text-gray-200">{UI_COPY_MAP.hints.gameTagline}</p>
        <p className="mx-auto mt-2 max-w-xl text-sm text-gray-400">{UI_COPY_MAP.release.subtitle}</p>
        <p className="mx-auto mt-2 max-w-xl text-sm text-gray-400">
          {UI_COPY_MAP.mainMenu.scenarioSummary} {playableScenarioCount} of {scenarioCount} rooms are marked playable right now.
        </p>

        <button
          onClick={() => setGamePhase('scenario-select')}
          className="mt-10 rounded-full bg-red-600 px-9 py-3 text-lg font-semibold text-white transition-colors hover:bg-red-700"
        >
          {UI_COPY_MAP.mainMenu.ctaScenarioSelect}
        </button>

        <p className="mt-10 text-xs leading-relaxed text-gray-500 md:text-sm">{UI_COPY_MAP.mainMenu.criticFraming}</p>
      </div>
    </div>
  );
}
