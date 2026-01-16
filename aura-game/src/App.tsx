import './App.css';
import { useGameStore } from '@/stores/gameStore';
import { MainMenu } from '@/components/ui/MainMenu';
import { ScenarioSelect } from '@/components/ui/ScenarioSelect';
import { ResultsScreen } from '@/components/ui/ResultsScreen';
import { Scene } from '@/components/game/Scene';
import { HUD } from '@/components/game/HUD';

function App() {
  const gamePhase = useGameStore((state) => state.gamePhase);

  return (
    <div className="w-screen h-screen bg-black overflow-hidden">
      {gamePhase === 'menu' && <MainMenu />}
      {gamePhase === 'scenario-select' && <ScenarioSelect />}
      {gamePhase === 'aiming' && (
        <>
          <Scene />
          <HUD />
        </>
      )}
      {gamePhase === 'results' && <ResultsScreen />}
    </div>
  );
}

export default App;
