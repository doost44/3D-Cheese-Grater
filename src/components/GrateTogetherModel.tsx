/**
 * GrateTogetherModel — procedural 3D model of the GrateTogether
 * dual-mode countertop cheese grater workstation.
 *
 * Built entirely from primitive geometry (boxes, cylinders, torus, planes)
 * grouped to form the canonical silhouette: tall upright trapezoid body,
 * rounded funnel, side handles, front grater plate, collection bin,
 * shutter, pusher carriage, and stable base.
 */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PrototypeState } from '../types';
import { MODE_ACCENT } from '../types';

/* ── Canonical proportions ─────────────────────────── */
const BASE_W = 1.6;           // base width
const TOP_W = BASE_W * 0.48;  // top width ~48% of base
const BODY_H = BASE_W * 2.2;  // height ≈ 2.2× base width
const BODY_D = 0.9;           // depth
const FUNNEL_R = TOP_W * 0.44;
const FUNNEL_H = 0.28;
const BIN_H = BODY_H * 0.25;  // ~25% of total height
const PLATE_H = BODY_H * 0.42;
const HANDLE_SPAN = BODY_H * 0.6;

/* ── Colours ───────────────────────────────────────── */
const BODY_COLOR = '#e8e4df';     // warm off-white
const HANDLE_COLOR = '#5a5a5a';   // darker gray
const STEEL_COLOR = '#b0b8c0';    // brushed stainless
const BIN_COLOR = '#d4ecf7';      // transparent plastic tint
const BASE_COLOR = '#c0bdb8';     // slight contrast

/* ── Helper: grater holes as a grid of small cylinders ── */
function GraterHoles({ width, height, rows, cols }: {
  width: number; height: number; rows: number; cols: number;
}) {
  const positions = useMemo(() => {
    const pts: [number, number][] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c / (cols - 1) - 0.5) * width * 0.8;
        const y = (r / (rows - 1) - 0.5) * height * 0.8;
        pts.push([x, y]);
      }
    }
    return pts;
  }, [width, height, rows, cols]);

  return (
    <group>
      {positions.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <circleGeometry args={[0.025, 6]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.3} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Shutter slot windows ──────────────────────────── */
function ShutterSlots({ width, height }: { width: number; height: number }) {
  const slots = useMemo(() => {
    const s: number[] = [];
    const count = 5;
    for (let i = 0; i < count; i++) {
      s.push((i / (count - 1) - 0.5) * height * 0.7);
    }
    return s;
  }, [height]);

  return (
    <group>
      {slots.map((y, i) => (
        <mesh key={i} position={[0, y, 0.002]}>
          <planeGeometry args={[width * 0.6, 0.03]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.2} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Main model ────────────────────────────────────── */
interface Props {
  prototypeState: PrototypeState;
}

export function GrateTogetherModel({ prototypeState }: Props) {
  const { mode, shutterOpen, pusherEnabled, pusherPosition, binInserted } = prototypeState;
  const modeAccentColor = MODE_ACCENT[mode];

  /* Animated refs for smooth transitions */
  const shutterRef = useRef<THREE.Group>(null);
  const pusherRef = useRef<THREE.Group>(null);
  const accentRef = useRef<THREE.MeshStandardMaterial>(null);
  const binLatchRef = useRef<THREE.Mesh>(null);

  const targetShutterY = shutterOpen ? PLATE_H + 0.1 : 0;
  const shutterYRef = useRef(0);

  /* Smooth shutter animation & pusher travel per frame */
  useFrame((_, delta) => {
    // Animate shutter
    if (shutterRef.current) {
      shutterYRef.current += (targetShutterY - shutterYRef.current) * Math.min(delta * 4, 1);
      shutterRef.current.position.y = shutterYRef.current;
    }

    // Animate pusher position along feed channel
    if (pusherRef.current) {
      const targetY = pusherEnabled
        ? -pusherPosition * (BODY_H * 0.55)
        : 0;
      pusherRef.current.position.y += (targetY - pusherRef.current.position.y) * Math.min(delta * 5, 1);
    }

    // Animate accent material colour
    if (accentRef.current) {
      const targetColor = new THREE.Color(modeAccentColor);
      accentRef.current.color.lerp(targetColor, Math.min(delta * 5, 1));
    }

    // Animate bin latch indicator
    if (binLatchRef.current) {
      const targetScale = binInserted ? 1 : 0.5;
      binLatchRef.current.scale.x += (targetScale - binLatchRef.current.scale.x) * Math.min(delta * 5, 1);
    }
  });

  /* Body bottom Y offset so bottom of body sits near y=0 */
  const bodyBottomY = 0;

  return (
    <group position={[0, bodyBottomY, 0]}>

      {/* ── G. Base ──────────────────────────────────── */}
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[BASE_W + 0.15, 0.12, BODY_D + 0.15]} />
        <meshStandardMaterial color={BASE_COLOR} roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Suction pads */}
      {([[-0.55, -0.3], [0.55, -0.3], [-0.55, 0.3], [0.55, 0.3]] as [number, number][]).map(
        ([x, z], i) => (
          <mesh key={i} position={[x, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.07, 0.02, 12]} />
            <meshStandardMaterial color="#444" roughness={0.9} metalness={0.1} />
          </mesh>
        ),
      )}

      {/* ── B. Main body (tapered trapezoid) ───────── */}
      {/* Approximate with 3 stacked boxes, narrowing toward top */}
      {(() => {
        const sections = 6;
        const elements: React.ReactNode[] = [];
        const sectionH = BODY_H / sections;
        for (let i = 0; i < sections; i++) {
          const t = i / (sections - 1);
          const w = THREE.MathUtils.lerp(BASE_W, TOP_W, t);
          const d = THREE.MathUtils.lerp(BODY_D, BODY_D * 0.85, t);
          const y = 0.12 + sectionH * i + sectionH / 2;
          // slight backward lean
          const zOff = -t * 0.06;
          elements.push(
            <mesh key={`body-${i}`} position={[0, y, zOff]} castShadow receiveShadow>
              <boxGeometry args={[w, sectionH + 0.005, d]} />
              <meshStandardMaterial color={BODY_COLOR} roughness={0.7} metalness={0.02} />
            </mesh>,
          );
        }
        return elements;
      })()}

      {/* ── A. Top funnel ────────────────────────────── */}
      <group position={[0, BODY_H + 0.12 + FUNNEL_H / 2, -0.04]}>
        <mesh castShadow>
          <cylinderGeometry args={[FUNNEL_R * 0.85, FUNNEL_R * 1.15, FUNNEL_H, 24]} />
          <meshStandardMaterial color={BODY_COLOR} roughness={0.65} metalness={0.05} />
        </mesh>
        {/* Inner dark ring */}
        <mesh position={[0, FUNNEL_H / 2 - 0.01, 0]}>
          <torusGeometry args={[FUNNEL_R * 0.75, 0.02, 8, 24]} />
          <meshStandardMaterial color="#555" roughness={0.6} metalness={0.2} />
        </mesh>
      </group>

      {/* ── D. Front control panel ───────────────────── */}
      <group position={[0, BODY_H * 0.72, BODY_D / 2 + 0.01]}>
        {/* Panel background */}
        <mesh>
          <planeGeometry args={[BASE_W * 0.45, 0.22]} />
          <meshStandardMaterial color="#333" roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Mode indicator dot with animated colour */}
        <mesh position={[-0.12, 0, 0.005]}>
          <circleGeometry args={[0.04, 16]} />
          <meshStandardMaterial ref={accentRef} color={modeAccentColor} emissive={modeAccentColor} emissiveIntensity={0.6} />
        </mesh>
        {/* Toggle label */}
        <mesh position={[0.08, 0, 0.005]}>
          <planeGeometry args={[0.22, 0.06]} />
          <meshStandardMaterial color="#666" roughness={0.5} metalness={0.1} />
        </mesh>
      </group>

      {/* ── E. Front grating face ────────────────────── */}
      <group position={[0, BODY_H * 0.35, BODY_D / 2 + 0.005]}>
        {/* Stainless steel plate */}
        <mesh>
          <planeGeometry args={[BASE_W * 0.62, PLATE_H]} />
          <meshStandardMaterial
            color={STEEL_COLOR}
            roughness={0.25}
            metalness={0.85}
          />
        </mesh>
        {/* Perforation pattern */}
        <group position={[0, 0, 0.003]}>
          <GraterHoles width={BASE_W * 0.62} height={PLATE_H} rows={12} cols={8} />
        </group>
      </group>

      {/* ── H. Safe-mode face shutter ────────────────── */}
      <group
        ref={shutterRef}
        position={[0, 0, BODY_D / 2 + 0.015]}
      >
        {/* Shutter panel — sits over the grater plate */}
        <mesh position={[0, BODY_H * 0.35, 0]}>
          <boxGeometry args={[BASE_W * 0.65, PLATE_H + 0.04, 0.025]} />
          <meshStandardMaterial
            color={mode === 'safe' ? '#d0d0d0' : '#aaa'}
            roughness={0.6}
            metalness={0.1}
          />
        </mesh>
        {/* Narrow slot windows */}
        <group position={[0, BODY_H * 0.35, 0.014]}>
          <ShutterSlots width={BASE_W * 0.65} height={PLATE_H} />
        </group>
        {/* Green/accent accent stripe on shutter */}
        <mesh position={[0, BODY_H * 0.35 + PLATE_H / 2 + 0.03, 0.013]}>
          <planeGeometry args={[BASE_W * 0.5, 0.025]} />
          <meshStandardMaterial color={modeAccentColor} emissive={modeAccentColor} emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* ── F. Transparent collection bin ─────────────── */}
      {binInserted && (
        <group position={[0, BIN_H / 2 + 0.12, BODY_D / 2 + 0.12]}>
          <mesh castShadow>
            <boxGeometry args={[BASE_W * 0.58, BIN_H, 0.35]} />
            <meshPhysicalMaterial
              color={BIN_COLOR}
              transparent
              opacity={0.35}
              roughness={0.15}
              metalness={0.0}
              transmission={0.6}
              thickness={0.5}
            />
          </mesh>
          {/* Bin rim */}
          <mesh position={[0, BIN_H / 2, 0]}>
            <boxGeometry args={[BASE_W * 0.6, 0.025, 0.37]} />
            <meshStandardMaterial color="#9bb" roughness={0.3} metalness={0.15} />
          </mesh>
        </group>
      )}

      {/* ── J. Bin-present latch / interlock indicator ── */}
      <mesh
        ref={binLatchRef}
        position={[BASE_W * 0.32, BIN_H + 0.16, BODY_D / 2 + 0.01]}
      >
        <boxGeometry args={[0.06, 0.06, 0.03]} />
        <meshStandardMaterial
          color={binInserted ? '#34c759' : '#aaa'}
          emissive={binInserted ? '#34c759' : '#555'}
          emissiveIntensity={binInserted ? 0.4 : 0}
        />
      </mesh>

      {/* ── C. Side handles ──────────────────────────── */}
      {([-1, 1] as const).map((side) => {
        const bodyWidthAtMid = THREE.MathUtils.lerp(BASE_W, TOP_W, 0.45);
        const x = (bodyWidthAtMid / 2 + 0.12) * side;
        const midY = BODY_H * 0.45 + 0.12;
        return (
          <group key={side} position={[x, midY, 0]}>
            {/* Handle loop */}
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <torusGeometry args={[HANDLE_SPAN / 2.5, 0.045, 8, 20, Math.PI]} />
              <meshStandardMaterial color={HANDLE_COLOR} roughness={0.55} metalness={0.15} />
            </mesh>
            {/* Handle mounts */}
            {([-1, 1] as const).map((dir) => (
              <mesh key={dir} position={[0, dir * HANDLE_SPAN / 2.5, 0]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 0.08, 8]} />
                <meshStandardMaterial color={HANDLE_COLOR} roughness={0.55} metalness={0.15} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* ── I. Captive pusher carriage + enclosed feed channel ── */}
      {pusherEnabled && (
        <group ref={pusherRef} position={[0, BODY_H + 0.08, -0.04]}>
          {/* Pusher rod (guided channel) */}
          <mesh castShadow>
            <cylinderGeometry args={[0.04, 0.04, BODY_H * 0.5, 8]} />
            <meshStandardMaterial color="#888" roughness={0.5} metalness={0.2} />
          </mesh>
          {/* Grippy two-hand cap */}
          <mesh position={[0, BODY_H * 0.25 + 0.04, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.12, 0.1, 16]} />
            <meshStandardMaterial color={HANDLE_COLOR} roughness={0.6} metalness={0.1} />
          </mesh>
          {/* Cap grip ring */}
          <mesh position={[0, BODY_H * 0.25 + 0.09, 0]}>
            <torusGeometry args={[0.11, 0.02, 8, 16]} />
            <meshStandardMaterial color="#666" roughness={0.5} metalness={0.2} />
          </mesh>
          {/* End-stop indicator */}
          <mesh position={[0, -BODY_H * 0.25 + 0.04, 0]}>
            <boxGeometry args={[0.08, 0.03, 0.08]} />
            <meshStandardMaterial color={modeAccentColor} emissive={modeAccentColor} emissiveIntensity={0.3} />
          </mesh>
        </group>
      )}

      {/* ── Mode accent arrows / cues ────────────────── */}
      {mode === 'safe' && (
        <group position={[0, BODY_H * 0.82, BODY_D / 2 + 0.03]}>
          {/* Downward arrow cue — load → push → collect */}
          {[0, -0.15, -0.3].map((yOff, i) => (
            <mesh key={i} position={[0, yOff, 0]}>
              <planeGeometry args={[0.06, 0.06]} />
              <meshStandardMaterial
                color="#34c759"
                emissive="#34c759"
                emissiveIntensity={0.5}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
