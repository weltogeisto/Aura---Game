import { getScenariosList } from '@/data/scenarios';
import { useGameStore } from '@/stores/gameStore';
import { MICROCOPY } from '@/data/copy';

const parseLocation = (description: string): { location: string; detail: string } => {
  const [location, ...rest] = description.split('. ');
  return {
    location,
    detail: rest.join('. ') || description,
  };
};

export function ScenarioSelect() {
  const setGamePhase = useGameStore((state) => state.setGamePhase);
  const startRun = useGameStore((state) => state.startRun);

  const scenarios = getScenariosList().filter((scenario) => scenario.isMvp);

  const handleSelectScenario = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;

    startRun(scenario);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 py-8">
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-gray-950/95 p-8 shadow-2xl md:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-orange-300">Scenario Selection</p>
        <h1 className="mt-3 text-4xl font-bold text-transparent bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text">
          Choose your target room
        </h1>
        <p className="mt-3 text-sm text-gray-300">{MICROCOPY.scenarioPickerHint}</p>

        <div className="mt-8 grid grid-cols-1 gap-4">
          {scenarios.map((scenario) => {
            const { location, detail } = parseLocation(scenario.description);

            return (
              <button
                key={scenario.id}
                onClick={() => handleSelectScenario(scenario.id)}
                className="rounded-xl border border-white/10 bg-gray-900 p-5 text-left transition hover:border-orange-400/50 hover:bg-gray-800"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-orange-300/90">{location}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{scenario.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{detail}</p>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setGamePhase('menu')}
          className="mt-6 text-sm font-medium text-gray-400 transition hover:text-gray-200"
        >
          ← Back to main menu
        </button>
      </div>
    </div>
  );
}
