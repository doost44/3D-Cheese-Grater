/**
 * ModeIndicators — 3D in-scene labels and visual cues
 * that appear near the model to indicate the current mode.
 */
import { Html } from '@react-three/drei';
import type { PrototypeState } from '../types';
import { MODE_ACCENT } from '../types';

/* Match GrateTogetherModel constants */
const BASE_W = 1.6;
const BODY_H = BASE_W * 2.2;
const BODY_D = 0.9;

interface Props {
  prototypeState: PrototypeState;
}

export function ModeIndicators({ prototypeState }: Props) {
  const { mode } = prototypeState;
  const accent = MODE_ACCENT[mode];
  const isSafe = mode === 'safe';

  return (
    <group>
      {/* Mode badge near top of model */}
      <Html
        position={[0, BODY_H + 0.65, 0]}
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

      {/* Component labels */}
      <Html
        position={[0, BODY_H + 0.32, 0]}
        center
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={labelStyle}>Top Funnel</div>
      </Html>

      <Html
        position={[0, BODY_H * 0.35, BODY_D / 2 + 0.35]}
        center
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={labelStyle}>
          {isSafe ? 'Shutter (Closed)' : 'Grater Plate (Exposed)'}
        </div>
      </Html>

      <Html
        position={[0, BODY_H * 0.12, BODY_D / 2 + 0.35]}
        center
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={labelStyle}>Collection Bin</div>
      </Html>
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
