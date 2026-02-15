import { getScenariosList } from '@/data/scenarios';
import { useGameStore } from '@/stores/gameStore';
import { UI_COPY_MAP } from '@/data/uiCopyMap';

const parseLocation = (description: string): { location: string; detail: string } => {
  const [location, ...rest] = description.split('. ');
  return {
    location,
    detail: rest.join('. ') || description,
  };
};

export function ScenarioSelect() {
  const setGamePhase = useGameStore((state) => state.setGamePhase);
  const setSelectedScenario = useGameStore((state) => state.setSelectedScenario);
  const resetRunState = useGameStore((state) => state.resetRunState);

  const scenarios = getScenariosList();

  const handleSelectScenario = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId && s.isMvp);
    if (!scenario) return;

    resetRunState();
    setSelectedScenario(scenario);
    setGamePhase('aiming');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 py-8">
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-gray-950/95 p-8 shadow-2xl md:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-orange-300">{UI_COPY_MAP.scenarioSelect.overline}</p>
        <h1 className="mt-3 text-4xl font-bold text-transparent bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text">
          {UI_COPY_MAP.scenarioSelect.heading}
        </h1>
        <p className="mt-3 text-sm text-gray-300">{UI_COPY_MAP.hints.scenarioPickerHint}</p>

        <div className="mt-8 grid grid-cols-1 gap-4">
          {scenarios.map((scenario) => {
            const { location, detail } = parseLocation(scenario.description);

            return (
              <button
                key={scenario.id}
                onClick={() => handleSelectScenario(scenario.id)}
                disabled={!scenario.isMvp}
                className="rounded-xl border border-white/10 bg-gray-900 p-5 text-left transition enabled:hover:border-orange-400/50 enabled:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-55"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-orange-300/90">{location}</p>
                  <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
                    {scenario.isMvp ? UI_COPY_MAP.scenarioSelect.availableNowLabel : UI_COPY_MAP.scenarioSelect.availableSoonLabel}
                  </p>
                </div>
                <h3 className="mt-2 text-xl font-semibold text-white">{scenario.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{detail}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-200">{UI_COPY_MAP.limitations.heading}</p>
          <p className="mt-2 text-sm text-gray-300">{UI_COPY_MAP.limitations.items[1]}</p>
        </div>

        <button
          onClick={() => setGamePhase('menu')}
          className="mt-6 text-sm font-medium text-gray-400 transition hover:text-gray-200"
        >
          {UI_COPY_MAP.scenarioSelect.backToMenu}
        </button>
      </div>
    </div>
  );
}
