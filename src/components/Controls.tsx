import type { GraterMode } from '../types';
import { MODE_CONFIGS } from '../types';

const MODES: GraterMode[] = ['fine', 'coarse', 'zest'];

interface ControlsProps {
  mode: GraterMode;
  isGrating: boolean;
  onModeChange: (mode: GraterMode) => void;
  onGrateToggle: () => void;
}

export function Controls({
  mode,
  isGrating,
  onModeChange,
  onGrateToggle,
}: ControlsProps) {
  const config = MODE_CONFIGS[mode];

  return (
    <div className="controls-overlay">
      {/* Title */}
      <header className="title-block">
        <h1 className="title-main">3D Cheese Grater</h1>
        <p className="title-sub">Interactive Product Demo</p>
      </header>

      {/* Mode Selector */}
      <aside className="mode-panel">
        <span className="panel-label">Grater Mode</span>
        <div className="mode-buttons">
          {MODES.map((m) => (
            <button
              key={m}
              className={`mode-btn${mode === m ? ' active' : ''}`}
              onClick={() => onModeChange(m)}
              aria-pressed={mode === m}
            >
              <span className="mode-sym">{MODE_CONFIGS[m].symbol}</span>
              <span className="mode-name">{MODE_CONFIGS[m].name}</span>
            </button>
          ))}
        </div>
        <p className="mode-desc">{config.description}</p>
      </aside>

      {/* Grate Button */}
      <div className="action-row">
        <button
          className={`grate-btn${isGrating ? ' grating' : ''}`}
          onClick={onGrateToggle}
          aria-label={isGrating ? 'Stop grating' : 'Start grating'}
        >
          {isGrating ? '⏹ Stop Grating' : '▶ Start Grating'}
        </button>
      </div>

      {/* Hint */}
      <p className="hint">🖱 Drag to orbit · Scroll to zoom</p>
    </div>
  );
}
