import { useState, useCallback } from 'react';
import type { GraterMode } from './types';
import { Scene } from './components/Scene';
import { Controls } from './components/Controls';
import './App.css';

function App() {
  const [mode, setMode] = useState<GraterMode>('coarse');
  const [isGrating, setIsGrating] = useState(false);

  const handleModeChange = useCallback((newMode: GraterMode) => {
    setMode(newMode);
  }, []);

  const handleGrateToggle = useCallback(() => {
    setIsGrating((prev) => !prev);
  }, []);

  return (
    <div className="app">
      <div className="canvas-wrap">
        <Scene mode={mode} isGrating={isGrating} />
      </div>
      <Controls
        mode={mode}
        isGrating={isGrating}
        onModeChange={handleModeChange}
        onGrateToggle={handleGrateToggle}
      />
    </div>
  );
}

export default App;
