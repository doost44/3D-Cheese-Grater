/**
 * ModeIndicators — 3D in-scene labels and visual cues
 * that appear near the model to indicate the current mode.
 * Shows additional component labels in exploded view.
 */
import { Html } from "@react-three/drei";
import type { PrototypeState } from "../types";
import { MODE_ACCENT } from "../types";

/* Match GrateTogetherModel constants */
const BASE_W = 1.6;
const BODY_H = BASE_W * 2.2;
const BODY_D = 0.9;
const BIN_H = BODY_H * 0.25;

interface Props {
  prototypeState: PrototypeState;
}

export function ModeIndicators({ prototypeState }: Props) {
  const { mode, isExploded, showInternalPath } = prototypeState;
  const accent = MODE_ACCENT[mode];
  const isSafe = mode === "safe";

  return (
    <group>
      {/* Mode badge near top of model */}
      <Html
        position={[0, BODY_H + 0.65 + (isExploded ? 1.6 : 0), 0]}
        center
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div
          style={{
            background: accent,
            color: "#fff",
            padding: "3px 12px",
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            whiteSpace: "nowrap",
            textTransform: "uppercase",
            boxShadow: `0 2px 8px ${accent}66`,
          }}
        >
          {isSafe ? "🛡️ SAFE MODE" : "⚡ PRO MODE"}
        </div>
      </Html>

      {/* Component labels — always visible */}
      <Html
        position={[0, BODY_H + 0.32 + (isExploded ? 1.6 : 0), 0]}
        center
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div style={labelStyle}>Top Funnel</div>
      </Html>

      <Html
        position={[
          0,
          BODY_H * 0.35,
          BODY_D / 2 + 0.35 + (isExploded ? 0.7 : 0),
        ]}
        center
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div style={labelStyle}>
          {isSafe ? "Shutter (Closed)" : "Grater Plate (Exposed)"}
        </div>
      </Html>

      <Html
        position={[
          0,
          BODY_H * 0.12 + (isExploded ? -0.3 : 0),
          BODY_D / 2 + 0.35 + (isExploded ? 1.4 : 0),
        ]}
        center
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div style={labelStyle}>Collection Bin</div>
      </Html>

      {/* Additional labels visible only in exploded view */}
      {isExploded && (
        <>
          <Html
            position={[0, 0.06 - 0.6, 0]}
            center
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            <div style={labelStyle}>Base / Foot Assembly</div>
          </Html>

          <Html
            position={[0, BODY_H * 0.5, 0.15]}
            center
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            <div style={labelStyle}>Internal Frame</div>
          </Html>

          {/* Labels positioned to match forward-facing explode layout */}
          <Html
            position={[0.35, BODY_H * 0.62 + 0.3, 1.8]}
            center
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            <div style={labelStyle}>Vertical Feed Chute</div>
          </Html>

          <Html
            position={[0, BODY_H + 0.08 + 1.45, 1.4]}
            center
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            <div style={labelStyle}>Top Pusher + Guide Stem</div>
          </Html>

          <Html
            position={[0.2, BODY_H + 0.58, 1.4]}
            center
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            <div style={labelStyleSmall}>Pusher Return Spring</div>
          </Html>

          <Html
            position={[-1.1, BODY_H * 0.35 + 0.35, 0.6]}
            center
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            <div style={labelStyle}>Safe-Mode Enclosure</div>
          </Html>

          <Html
            position={[0.35, BODY_H * 0.27 - 0.55, 1.8]}
            center
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            <div style={labelStyle}>Angled Internal Grating Plate</div>
          </Html>

          <Html
            position={[0.3, BODY_H * 0.38 - 0.25, 1.6]}
            center
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            <div style={labelStyle}>Force Redirector</div>
          </Html>

          <Html
            position={[BASE_W * 0.7, BODY_H * 0.82, BODY_D / 2 + 0.15]}
            center
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            <div style={labelStyleSmall}>Bin Interlock</div>
          </Html>

          <Html
            position={[0.3, BODY_H * 0.82 + 0.3, 1.8]}
            center
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            <div style={labelStyleSmall}>Spring-Loaded Follower Plate</div>
          </Html>

          <Html
            position={[0.3, BODY_H * 0.92 + 0.3, 1.8]}
            center
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            <div style={labelStyleSmall}>Follower Return Spring</div>
          </Html>

          {/* Mechanism walkthrough labels: left side of exploded parts */}
          <Html
            position={[-0.8, BODY_H + 1.7, 1.8]}
            center
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            <div style={flowStyle}>1) Cheese enters from top feed</div>
          </Html>

          <Html
            position={[-0.8, BODY_H + 1.45, 1.8]}
            center
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            <div style={flowStyle}>2) Pusher stroke: down (v)</div>
          </Html>

          <Html
            position={[-0.8, BODY_H + 1.2, 1.8]}
            center
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            <div style={flowStyle}>
              3) Redirector sends cheese onto angled grater
            </div>
          </Html>

          <Html
            position={[-0.8, BODY_H + 0.95, 1.8]}
            center
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            <div style={flowStyle}>4) Grated cheese falls into bin</div>
          </Html>

          <Html
            position={[-0.8, BODY_H + 0.7, 1.8]}
            center
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            <div style={flowStyleSmall}>
              5) Spring returns follower plate + cheese to top (^)
            </div>
          </Html>

          {showInternalPath && (
            <Html
              position={[0.04, BODY_H * 0.84, 0.3]}
              center
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              <div style={flowStyleSmall}>Flow path enabled</div>
            </Html>
          )}
        </>
      )}
    </group>
  );
}

const labelStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.55)",
  color: "#ddd",
  padding: "2px 8px",
  borderRadius: 6,
  fontSize: 9,
  fontWeight: 600,
  whiteSpace: "nowrap",
  letterSpacing: "0.05em",
  backdropFilter: "blur(4px)",
};

const labelStyleSmall: React.CSSProperties = {
  ...labelStyle,
  fontSize: 7,
  padding: "1px 6px",
  background: "rgba(0,0,0,0.45)",
};

const flowStyle: React.CSSProperties = {
  background: "rgba(16,16,16,0.45)",
  color: "#ececec",
  padding: "2px 8px",
  borderRadius: 7,
  fontSize: 8,
  fontWeight: 600,
  letterSpacing: "0.03em",
  whiteSpace: "nowrap",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(3px)",
};

const flowStyleSmall: React.CSSProperties = {
  ...flowStyle,
  fontSize: 7,
  padding: "1px 7px",
};
