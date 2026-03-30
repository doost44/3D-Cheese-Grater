import { Scene } from './components/Scene';
import { ControlPanel } from './components/ControlPanel';
import { usePrototypeState } from './hooks/usePrototypeState';
import './App.css';

function App() {
  const { state, setMode, activate, reset, toggleExploded, toggleInternalPath, setGraterStyle } = usePrototypeState();

  return (
    <div className="app">
      <div className="canvas-wrap">
        <Scene prototypeState={state} onSelectGraterStyle={setGraterStyle} />
      </div>
      <ControlPanel
        state={state}
        onModeChange={setMode}
        onActivate={activate}
        onReset={reset}
        onToggleExploded={toggleExploded}
        onToggleInternalPath={toggleInternalPath}
      />
    </div>
  );
}

export default App;
