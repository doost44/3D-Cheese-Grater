import { Scene } from "./components/Scene";
import { ControlPanel } from "./components/ControlPanel";
import { usePrototypeState } from "./hooks/usePrototypeState";
import "./App.css";

function App() {
  const {
    state,
    setMode,
    activate,
    reset,
    toggleExploded,
    toggleInternalPath,
    setGraterStyle,
  } = usePrototypeState();

  return (
    <div className="app">
      <div className="canvas-wrap">
        <Scene prototypeState={state} onSelectGraterStyle={setGraterStyle} />
        <ControlPanel
          state={state}
          onModeChange={setMode}
          onActivate={activate}
          onReset={reset}
          onToggleExploded={toggleExploded}
          onToggleInternalPath={toggleInternalPath}
        />
      </div>

      {/* CTA action zone — beneath the viewer */}
      <section className="cta-section">
        <div className="step-indicator">
          <span className="step-item current">01 · Explore modes</span>
          <span className="step-arrow">→</span>
          <span className="step-item future">02 · Configure</span>
          <span className="step-arrow">→</span>
          <span className="step-item future">03 · Order</span>
        </div>
        <button
          className="cta-primary"
          onClick={() => {
            const configurator = document.getElementById("configurator");
            if (configurator)
              configurator.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Configure Your GrateTogether
        </button>
        <button
          className="cta-secondary"
          onClick={() => {
            const explainer = document.getElementById("explainer");
            if (explainer) explainer.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Learn how it works →
        </button>
      </section>

      {/* V2 PREVIEW — NOT INTERACTIVE */}
      <section className="v2-teaser-section" id="configurator">
        <div className="v2-teaser-card">
          <span className="v2-badge">V2</span>
          <div className="v2-teaser-inner">
            <svg
              className="v2-icon"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Hand cursor */}
              <path
                d="M24 8v4M20 10v6M28 10v6M16 14v8c0 2 1 3 3 3h2l1 7h6l1-7h2c2 0 3-1 3-3v-8c0-2-2-4-4-4h-2v-2c0-1-1-2-2-2h-2c-1 0-2 1-2 2v2h-2c-2 0-4 2-4 4z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Dotted drop rectangle */}
              <rect
                x="10"
                y="36"
                width="28"
                height="8"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="3 2"
              />
            </svg>
            <span className="v2-label">Configurator</span>
            <span className="v2-sublabel">
              Drag attachments to build your setup — coming in V2
            </span>
          </div>
        </div>
      </section>
      {/* END V2 PREVIEW */}

      <section className="explainer-section" id="explainer">
        <div className="explainer-card">
          <h2 className="explainer-title">How It Works</h2>
          <p className="explainer-copy">
            Switch to Exploded View in the panel to inspect each assembly part,
            then run Activate to see mode-specific cheese flow and bin
            collection.
          </p>
        </div>
      </section>
    </div>
  );
}

export default App;
