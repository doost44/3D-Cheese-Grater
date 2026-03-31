/**
 * ControlPanel — UI overlay for the GrateTogether 3D demo.
 *
 * Provides:
 * - Mode toggle: SAFE / PRO
 * - Activate Mode button
 * - Reset Demo button
 * - Exploded View toggle
 * - Internal Path toggle
 * - Mode description and status
 */
import type { GraterMode, PrototypeState } from "../types";
import { GRATER_STYLE_LABELS } from "../types";

interface Props {
  state: PrototypeState;
  onModeChange: (mode: GraterMode) => void;
  onActivate: () => void;
  onReset: () => void;
  onToggleExploded: () => void;
  onToggleInternalPath: () => void;
}

export function ControlPanel({
  state,
  onModeChange,
  onActivate,
  onReset,
  onToggleExploded,
  onToggleInternalPath,
}: Props) {
  const { mode, isAnimating, isExploded, showInternalPath } = state;
  const isSafe = mode === "safe";

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
            className={`mode-btn safe${isSafe ? " active" : ""}`}
            onClick={() => onModeChange("safe")}
            aria-pressed={isSafe}
            disabled={isAnimating}
          >
            <span className="mode-sym">🛡️</span>
            <span className="mode-name">Safe</span>
          </button>
          <button
            className={`mode-btn pro${!isSafe ? " active" : ""}`}
            onClick={() => onModeChange("pro")}
            aria-pressed={!isSafe}
            disabled={isAnimating}
          >
            <span className="mode-sym">⚡</span>
            <span className="mode-name">Pro</span>
          </button>
        </div>

        <p className="mode-desc">
          {isSafe
            ? "Guided, enclosed grating. Shutter closed, captive pusher enabled."
            : "Open grater face for precision use. Shutter retracted, direct manual control."}
        </p>

        {/* Mode status indicators */}
        <div className="status-row">
          <span className={`status-dot ${isSafe ? "green" : "red"}`} />
          <span className="status-label">
            Shutter: {isSafe ? "Closed" : "Open"}
          </span>
        </div>
        <div className="status-row">
          <span
            className={`status-dot ${isAnimating ? "yellow" : isSafe ? "green" : "gray"}`}
          />
          <span className="status-label">
            Pusher: {isAnimating ? "Active" : isSafe ? "Engaged" : "Parked"}
          </span>
        </div>
        <div className="status-row">
          <span className="status-dot green" />
          <span className="status-label">Bin: Inserted</span>
        </div>
        <div className="status-row">
          <span className="status-dot green" />
          <span className="status-label">
            Grater: {GRATER_STYLE_LABELS[state.graterStyle]}
          </span>
        </div>

        {/* View toggles */}
        <div className="view-toggles">
          <span className="panel-label">Presentation</span>
          <button
            className={`toggle-btn${isExploded ? " active" : ""}`}
            onClick={onToggleExploded}
            aria-pressed={isExploded}
          >
            <span className="toggle-icon">{isExploded ? "🔧" : "📦"}</span>
            <span>{isExploded ? "Assembled View" : "Exploded View"}</span>
          </button>
          <button
            className={`toggle-btn path-btn${showInternalPath ? " active" : ""}`}
            onClick={onToggleInternalPath}
            aria-pressed={showInternalPath}
          >
            <span className="toggle-icon">🧀</span>
            <span>
              {showInternalPath ? "Hide Cheese Path" : "Show Cheese Path"}
            </span>
          </button>
        </div>
      </aside>

      {/* Action buttons */}
      <div className="action-row">
        <button
          className={`grate-btn ${isSafe ? "safe-btn" : "pro-btn"}${isAnimating ? " grating" : ""}`}
          onClick={onActivate}
          disabled={state.demoStatus === "running"}
          aria-label={`Activate ${mode} mode demonstration`}
        >
          {state.demoStatus === "running"
            ? "⏳ DEMO RUNNING…"
            : state.demoStatus === "complete"
              ? "✅ DEMO COMPLETE"
              : `▶ Activate ${isSafe ? "Safe" : "Pro"} Mode`}
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
