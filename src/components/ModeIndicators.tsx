/**
 * ModeIndicators — 3D in-scene labels and visual cues
 * that appear near the model to indicate the current mode.
 * Shows additional component labels in exploded view.
 */
import { Html } from '@react-three/drei';
import type { PrototypeState } from '../types';
import { MODE_ACCENT } from '../types';

/* Match GrateTogetherModel constants */
const BASE_W = 1.6;
const BODY_H = BASE_W * 2.2;
const BODY_D = 0.9;
const BIN_H = BODY_H * 0.25;

interface Props {
  prototypeState: PrototypeState;
}

export function ModeIndicators({ prototypeState }: Props) {
  const { mode, isExploded } = prototypeState;
  const accent = MODE_ACCENT[mode];
  const isSafe = mode === 'safe';

  return (
    <group>
      {/* Mode badge near top of model */}
      <Html
        position={[0, BODY_H + 0.65 + (isExploded ? 1.6 : 0), 0]}
        center
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div
          style={{
            background: accent,
            color: '#fff',
            padding: '3px 12px',
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
            boxShadow: `0 2px 8px ${accent}66`,
          }}
        >
          {isSafe ? '🛡️ SAFE MODE' : '⚡ PRO MODE'}
        </div>
      </Html>

      {/* Component labels — always visible */}
      <Html
        position={[0, BODY_H + 0.32 + (isExploded ? 1.6 : 0), 0]}
        center
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={labelStyle}>Top Funnel</div>
      </Html>

      <Html
        position={[0, BODY_H * 0.35, BODY_D / 2 + 0.35 + (isExploded ? 0.7 : 0)]}
        center
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={labelStyle}>
          {isSafe ? 'Shutter (Closed)' : 'Grater Plate (Exposed)'}
        </div>
      </Html>

      <Html
        position={[0, BODY_H * 0.12 + (isExploded ? -0.3 : 0), BODY_D / 2 + 0.35 + (isExploded ? 1.4 : 0)]}
        center
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={labelStyle}>Collection Bin</div>
      </Html>

      {/* Additional labels visible only in exploded view */}
      {isExploded && (
        <>
          <Html
            position={[0, 0.06 - 0.6, 0]}
            center
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div style={labelStyle}>Base / Foot Assembly</div>
          </Html>

          <Html
            position={[0, BODY_H * 0.5, 0.15]}
            center
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div style={labelStyle}>Internal Frame</div>
          </Html>

          <Html
            position={[0.9, BODY_H * 0.6 + 0.3, -0.02]}
            center
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div style={labelStyle}>Feed Channel</div>
          </Html>

          <Html
            position={[0, BODY_H + 0.08 + 1.2, -0.52]}
            center
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div style={labelStyle}>Pusher Carriage</div>
          </Html>

          <Html
            position={[0, BODY_H * 0.35, BODY_D / 2 + 0.35 + 1.2]}
            center
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div style={labelStyle}>Shutter Assembly</div>
          </Html>

          <Html
            position={[0, BODY_H * 0.35, BODY_D / 2 + 0.7 + 0.15]}
            center
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div style={labelStyle}>Grater Plate</div>
          </Html>

          <Html
            position={[BASE_W * 0.32, BIN_H + 0.16, BODY_D / 2 + 0.15]}
            center
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div style={labelStyleSmall}>Bin Interlock</div>
          </Html>
        </>
      )}
    </group>
  );
}

const labelStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.55)',
  color: '#ddd',
  padding: '2px 8px',
  borderRadius: 6,
  fontSize: 9,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  letterSpacing: '0.05em',
  backdropFilter: 'blur(4px)',
};

const labelStyleSmall: React.CSSProperties = {
  ...labelStyle,
  fontSize: 7,
  padding: '1px 6px',
  background: 'rgba(0,0,0,0.45)',
};
