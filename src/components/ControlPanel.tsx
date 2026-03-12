/**
 * ControlPanel — UI overlay for the GrateTogether 3D demo.
 *
 * Provides:
 * - Mode toggle: SAFE / PRO
 * - Activate Mode button
 * - Reset Demo button
 * - Mode description and status
 */
import type { GraterMode, PrototypeState } from '../types';

interface Props {
  state: PrototypeState;
  onModeChange: (mode: GraterMode) => void;
  onActivate: () => void;
  onReset: () => void;
}

export function ControlPanel({ state, onModeChange, onActivate, onReset }: Props) {
  const { mode, isAnimating } = state;
  const isSafe = mode === 'safe';

  return (
    <div className="controls-overlay">
      {/* Title */}
      <header className="title-block">
        <h1 className="title-main">GrateTogether</h1>
        <p className="title-sub">Dual-Mode Cheese Grater Workstation</p>
      </header>

      {/* Mode selector panel */}
      <aside className="mode-panel">
        <span className="panel-label">Operating Mode</span>

        <div className="mode-buttons">
          <button
            className={`mode-btn safe${isSafe ? ' active' : ''}`}
            onClick={() => onModeChange('safe')}
            aria-pressed={isSafe}
            disabled={isAnimating}
          >
            <span className="mode-sym">🛡️</span>
            <span className="mode-name">Safe</span>
          </button>
          <button
            className={`mode-btn pro${!isSafe ? ' active' : ''}`}
            onClick={() => onModeChange('pro')}
            aria-pressed={!isSafe}
            disabled={isAnimating}
          >
            <span className="mode-sym">⚡</span>
            <span className="mode-name">Pro</span>
          </button>
        </div>

        <p className="mode-desc">
          {isSafe
            ? 'Guided, enclosed grating — safe for ages 8–12 under supervision. Shutter closed, captive pusher enabled.'
            : 'Open grater face for precision use. Shutter retracted, direct manual control.'}
        </p>

        {/* Mode status indicators */}
        <div className="status-row">
          <span className={`status-dot ${isSafe ? 'green' : 'red'}`} />
          <span className="status-label">
            Shutter: {isSafe ? 'Closed' : 'Open'}
          </span>
        </div>
        <div className="status-row">
          <span className={`status-dot ${isSafe ? 'green' : 'gray'}`} />
          <span className="status-label">
            Pusher: {isSafe ? 'Engaged' : 'Parked'}
          </span>
        </div>
        <div className="status-row">
          <span className="status-dot green" />
          <span className="status-label">Bin: Inserted</span>
        </div>
      </aside>

      {/* Action buttons */}
      <div className="action-row">
        <button
          className={`grate-btn ${isSafe ? 'safe-btn' : 'pro-btn'}${isAnimating ? ' grating' : ''}`}
          onClick={onActivate}
          disabled={isAnimating}
          aria-label={`Activate ${mode} mode demonstration`}
        >
          {isAnimating
            ? '⏳ Demonstrating…'
            : `▶ Activate ${isSafe ? 'Safe' : 'Pro'} Mode`}
        </button>
        <button
          className="reset-btn"
          onClick={onReset}
          aria-label="Reset demonstration"
        >
          ↺ Reset
        </button>
      </div>

      {/* Hint */}
      <p className="hint">🖱 Drag to orbit · Scroll to zoom</p>
    </div>
  );
}
