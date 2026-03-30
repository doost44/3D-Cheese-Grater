/**
 * GrateTogetherModel — refined procedural 3D model of the GrateTogether
 * dual-mode countertop cheese grater workstation.
 *
 * Supports assembled and exploded/deconstructed view states with smooth
 * animated transitions. Internal components (feed channel, internal frame,
 * cheese path indicators) become visible in exploded view.
 */
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { PrototypeState } from "../types";
import { MODE_ACCENT } from "../types";

/* ── Canonical proportions ─────────────────────────── */
const BASE_W = 1.6;
const TOP_W = BASE_W * 0.48;
const BODY_H = BASE_W * 2.2;
const BODY_D = 0.9;
const FUNNEL_R = TOP_W * 0.44;
const FUNNEL_H = 0.28;
const BIN_H = BODY_H * 0.25;
const PLATE_H = BODY_H * 0.42;
const CORNER_R = 0.08;
const BEVEL_R = 0.04;

/* ── Colours ───────────────────────────────────────── */
const BODY_COLOR = "#e8e4df";
const HANDLE_COLOR = "#525252";
const STEEL_COLOR = "#b0b8c0";
const BIN_COLOR = "#d4ecf7";
const BASE_COLOR = "#c0bdb8";
const SEAM_COLOR = "#b5b0a9";
const DARK_TRIM = "#444";
const FRAME_COLOR = "#9a9590";
const CHANNEL_COLOR = "#a8d8b9";
const SPRING_COLOR = "#9da4aa";

/* ── Exploded view offset config ─────────────────── */
const EXPLODE_OFFSETS = {
  // Internal cheese-path parts explode forward (positive Z) so the
  // path reads top-to-bottom in front of the body shell.
  topFunnel: [0, 1.9, 0] as [number, number, number],
  outerShell: [0, 0, 0] as [number, number, number], // anchor
  shutterAssembly: [-1.1, 0.1, 0.6] as [number, number, number],
  graterPlate: [-1.1, -0.3, 0.6] as [number, number, number],
  feedChannel: [0, 0.3, 1.8] as [number, number, number],       // forward
  redirector: [0, -0.25, 1.6] as [number, number, number],      // forward, below channel
  internalGrater: [0, -0.55, 1.8] as [number, number, number],  // forward, below redirector
  safeBarrier: [-1.0, 0.25, 0.6] as [number, number, number],
  pusherAssembly: [0, 1.45, 1.4] as [number, number, number],   // forward, above channel
  internalFrame: [0, 0, -0.1] as [number, number, number],
  collectionBin: [0, -0.45, 2.2] as [number, number, number],   // forward, at bottom
  baseAssembly: [0, -0.75, 0] as [number, number, number],
};

/* ── Body geometry builder — smooth tapered shape with rounded edges ── */
function createBodyGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const bw = BASE_W / 2;
  const tw = TOP_W / 2;
  const h = BODY_H;
  const r = CORNER_R;

  shape.moveTo(-bw + r, 0);
  shape.lineTo(bw - r, 0);
  shape.quadraticCurveTo(bw, 0, bw, r);
  shape.lineTo(tw, h - r);
  shape.quadraticCurveTo(tw, h, tw - r, h);
  shape.lineTo(-tw + r, h);
  shape.quadraticCurveTo(-tw, h, -tw, h - r);
  shape.lineTo(-bw, r);
  shape.quadraticCurveTo(-bw, 0, -bw + r, 0);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: BODY_D,
    bevelEnabled: true,
    bevelSize: BEVEL_R,
    bevelThickness: BEVEL_R,
    bevelSegments: 4,
  });

  // Center in Z (front at +BODY_D/2, back at -BODY_D/2)
  geo.translate(0, 0, -BODY_D / 2);
  geo.computeVertexNormals();
  return geo;
}

/* ── Staggered grater perforation holes ────────────── */
function GraterHoles({
  width,
  height,
  rows,
  cols,
  style = "box",
}: {
  width: number;
  height: number;
  rows: number;
  cols: number;
  style?: import("../types").GraterStyle;
}) {
  /* Each style produces a list of hole descriptors: position, size, and shape */
  const holes = useMemo(() => {
    const pts: { x: number; y: number; w: number; h: number; round: boolean }[] = [];

    switch (style) {
      case "microplane": {
        // Dense tiny etched holes
        const mr = rows + 6;
        const mc = cols + 4;
        for (let r = 0; r < mr; r++) {
          const xOff = (r % 2) * ((width * 0.8) / (mc - 1)) * 0.5;
          for (let c = 0; c < mc; c++) {
            const x = (c / (mc - 1) - 0.5) * width * 0.8 + xOff;
            const y = (r / (mr - 1) - 0.5) * height * 0.8;
            if (Math.abs(x) > width * 0.42) continue;
            pts.push({ x, y, w: 0.012, h: 0.012, round: true });
          }
        }
        break;
      }
      case "ribbon": {
        // Wide horizontal slots for shaving
        const slotRows = Math.max(4, Math.floor(rows / 2));
        for (let r = 0; r < slotRows; r++) {
          const y = (r / (slotRows - 1) - 0.5) * height * 0.75;
          pts.push({ x: 0, y, w: width * 0.6, h: 0.022, round: false });
        }
        break;
      }
      case "drum": {
        // Concentric circular pattern
        const rings = 4;
        for (let ri = 1; ri <= rings; ri++) {
          const radius = (ri / rings) * Math.min(width, height) * 0.35;
          const count = ri * 6;
          for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            pts.push({ x, y, w: 0.018, h: 0.018, round: true });
          }
        }
        // Center hole
        pts.push({ x: 0, y: 0, w: 0.025, h: 0.025, round: true });
        break;
      }
      case "fine": {
        // Dense diamond-shaped small holes
        const fr = rows + 4;
        const fc = cols + 2;
        for (let r = 0; r < fr; r++) {
          const xOff = (r % 2) * ((width * 0.8) / (fc - 1)) * 0.5;
          for (let c = 0; c < fc; c++) {
            const x = (c / (fc - 1) - 0.5) * width * 0.8 + xOff;
            const y = (r / (fr - 1) - 0.5) * height * 0.8;
            if (Math.abs(x) > width * 0.42) continue;
            pts.push({ x, y, w: 0.014, h: 0.02, round: false });
          }
        }
        break;
      }
      default: {
        // "box" — original staggered round holes
        for (let r = 0; r < rows; r++) {
          const xOff = (r % 2) * ((width * 0.8) / (cols - 1)) * 0.5;
          for (let c = 0; c < cols; c++) {
            const x = (c / (cols - 1) - 0.5) * width * 0.8 + xOff;
            const y = (r / (rows - 1) - 0.5) * height * 0.8;
            if (Math.abs(x) > width * 0.42) continue;
            const size = 0.02 + ((r * cols + c) % 5) * 0.003;
            pts.push({ x, y, w: size, h: size, round: true });
          }
        }
        break;
      }
    }
    return pts;
  }, [width, height, rows, cols, style]);

  return (
    <group>
      {holes.map((hole, i) => (
        <group key={i} position={[hole.x, hole.y, 0]}>
          <mesh>
            {hole.round ? (
              <circleGeometry args={[hole.w, 6]} />
            ) : (
              <planeGeometry args={[hole.w, hole.h]} />
            )}
            <meshStandardMaterial
              color="#1e1e1e"
              metalness={0.4}
              roughness={0.5}
            />
          </mesh>
          <mesh position={[0, 0, -0.001]}>
            {hole.round ? (
              <ringGeometry args={[hole.w, hole.w + 0.005, 6]} />
            ) : (
              <planeGeometry args={[hole.w + 0.008, hole.h + 0.006]} />
            )}
            <meshStandardMaterial
              color={STEEL_COLOR}
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ── Shutter slot windows with depth ───────────────── */
function ShutterSlots({ width, height }: { width: number; height: number }) {
  const slots = useMemo(() => {
    const s: number[] = [];
    const count = 7;
    for (let i = 0; i < count; i++) {
      s.push((i / (count - 1) - 0.5) * height * 0.72);
    }
    return s;
  }, [height]);

  return (
    <group>
      {slots.map((y, i) => (
        <group key={i} position={[0, y, 0]}>
          <mesh>
            <boxGeometry args={[width * 0.55, 0.025, 0.008]} />
            <meshStandardMaterial
              color="#181818"
              metalness={0.25}
              roughness={0.5}
            />
          </mesh>
          <mesh position={[0, 0, -0.004]}>
            <boxGeometry args={[width * 0.58, 0.032, 0.004]} />
            <meshStandardMaterial
              color="#777"
              roughness={0.4}
              metalness={0.15}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ── Animated explode wrapper ─────────────────────── */
function ExplodeGroup({
  children,
  offset,
  explodeAmount,
}: {
  children: React.ReactNode;
  offset: [number, number, number];
  explodeAmount: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const current = useRef([0, 0, 0]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const speed = Math.min(delta * 4, 1);
    current.current[0] +=
      (offset[0] * explodeAmount - current.current[0]) * speed;
    current.current[1] +=
      (offset[1] * explodeAmount - current.current[1]) * speed;
    current.current[2] +=
      (offset[2] * explodeAmount - current.current[2]) * speed;
    groupRef.current.position.set(
      current.current[0],
      current.current[1],
      current.current[2],
    );
  });

  return <group ref={groupRef}>{children}</group>;
}

/* ── Main model ────────────────────────────────────── */
interface Props {
  prototypeState: PrototypeState;
}

export function GrateTogetherModel({ prototypeState }: Props) {
  const {
    mode,
    shutterOpen,
    pusherEnabled,
    pusherPosition,
    binInserted,
    isExploded,
    showInternalPath,
    followerPlatePosition,
    followerSpringCompressed,
    isResettingCheese,
    graterStyle,
  } = prototypeState;
  const modeAccentColor = MODE_ACCENT[mode];

  const shutterRef = useRef<THREE.Group>(null);
  const pusherRef = useRef<THREE.Group>(null);
  const accentRef = useRef<THREE.MeshStandardMaterial>(null);
  const binLatchRef = useRef<THREE.Mesh>(null);

  const targetShutterY = shutterOpen ? PLATE_H + 0.1 : 0;
  const shutterYRef = useRef(0);

  /* Shell opacity for exploded view */
  const shellOpacityRef = useRef(1);
  const shellMatRef = useRef<THREE.MeshPhysicalMaterial>(null);

  /* Explode amount: ExplodeGroup components handle their own interpolation */
  const explodeAmount = isExploded ? 1 : 0;

  useFrame((_, delta) => {
    /* Shell transparency in exploded view */
    const targetOpacity = isExploded ? 0.35 : 1;
    shellOpacityRef.current +=
      (targetOpacity - shellOpacityRef.current) * Math.min(delta * 3, 1);
    if (shellMatRef.current) {
      shellMatRef.current.opacity = shellOpacityRef.current;
      shellMatRef.current.transparent = shellOpacityRef.current < 0.99;
    }

    if (shutterRef.current) {
      shutterYRef.current +=
        (targetShutterY - shutterYRef.current) * Math.min(delta * 4, 1);
      shutterRef.current.position.y = shutterYRef.current;
    }
    if (pusherRef.current) {
      const baseY = BODY_H + 0.08;
      const targetY = pusherEnabled
        ? baseY - pusherPosition * (BODY_H * 0.55)
        : baseY;
      pusherRef.current.position.y +=
        (targetY - pusherRef.current.position.y) * Math.min(delta * 5, 1);
    }
    if (accentRef.current) {
      const targetColor = new THREE.Color(modeAccentColor);
      accentRef.current.color.lerp(targetColor, Math.min(delta * 5, 1));
    }
    if (binLatchRef.current) {
      const targetScale = binInserted ? 1 : 0.5;
      binLatchRef.current.scale.x +=
        (targetScale - binLatchRef.current.scale.x) * Math.min(delta * 5, 1);
    }
    // No animation for follower plate here; handled by state
  });

  const bodyGeometry = useMemo(() => createBodyGeometry(), []);

  return (
    <group>
      {/* ── Base assembly ───────────────────────────── */}
      <ExplodeGroup
        offset={EXPLODE_OFFSETS.baseAssembly}
        explodeAmount={explodeAmount}
      >
        {/* Anti-slip rubber foot strip */}
        <mesh position={[0, 0.004, 0]}>
          <boxGeometry args={[BASE_W + 0.22, 0.008, BODY_D + 0.22]} />
          <meshStandardMaterial
            color={DARK_TRIM}
            roughness={0.95}
            metalness={0.02}
          />
        </mesh>
        {/* Main base platform */}
        <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
          <boxGeometry args={[BASE_W + 0.16, 0.1, BODY_D + 0.16]} />
          <meshPhysicalMaterial
            color={BASE_COLOR}
            roughness={0.78}
            metalness={0.05}
            clearcoat={0.08}
            clearcoatRoughness={0.6}
          />
        </mesh>
        {/* Base-to-body transition lip */}
        <mesh position={[0, 0.115, 0]}>
          <boxGeometry args={[BASE_W + 0.06, 0.01, BODY_D + 0.06]} />
          <meshStandardMaterial
            color={SEAM_COLOR}
            roughness={0.6}
            metalness={0.05}
          />
        </mesh>
        {/* Suction pads */}
        {(
          [
            [-0.58, -0.32],
            [0.58, -0.32],
            [-0.58, 0.32],
            [0.58, 0.32],
          ] as [number, number][]
        ).map(([x, z], i) => (
          <group key={`pad-${i}`} position={[x, 0.01, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.055, 0.065, 0.015, 16]} />
              <meshStandardMaterial
                color="#3a3a3a"
                roughness={0.95}
                metalness={0.05}
              />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.003]}>
              <cylinderGeometry args={[0.04, 0.04, 0.006, 12]} />
              <meshStandardMaterial
                color="#2a2a2a"
                roughness={0.98}
                metalness={0.02}
              />
            </mesh>
          </group>
        ))}
      </ExplodeGroup>

      {/* ── Internal support frame / chassis ─────────── */}
      <ExplodeGroup
        offset={EXPLODE_OFFSETS.internalFrame}
        explodeAmount={explodeAmount}
      >
        {/* Visible only in exploded view */}
        {isExploded && (
          <group position={[0, 0.12, 0]}>
            {/* Central spine */}
            <mesh position={[0, BODY_H * 0.5, 0]}>
              <boxGeometry args={[0.08, BODY_H * 0.85, BODY_D * 0.7]} />
              <meshStandardMaterial
                color={FRAME_COLOR}
                roughness={0.65}
                metalness={0.15}
              />
            </mesh>
            {/* Cross members */}
            {[0.25, 0.5, 0.75].map((frac) => (
              <mesh key={frac} position={[0, BODY_H * frac, 0]}>
                <boxGeometry args={[BASE_W * 0.5, 0.04, BODY_D * 0.6]} />
                <meshStandardMaterial
                  color={FRAME_COLOR}
                  roughness={0.65}
                  metalness={0.15}
                />
              </mesh>
            ))}
            {/* Side rails */}
            {([-1, 1] as const).map((s) => (
              <mesh key={s} position={[s * BASE_W * 0.22, BODY_H * 0.5, 0]}>
                <boxGeometry args={[0.04, BODY_H * 0.7, 0.04]} />
                <meshStandardMaterial
                  color={FRAME_COLOR}
                  roughness={0.6}
                  metalness={0.2}
                />
              </mesh>
            ))}
          </group>
        )}
      </ExplodeGroup>

      {/* ── Main body — smooth tapered form (outer shell) ── */}
      <ExplodeGroup
        offset={EXPLODE_OFFSETS.outerShell}
        explodeAmount={explodeAmount}
      >
        <mesh
          geometry={bodyGeometry}
          position={[0, 0.12, 0]}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial
            ref={shellMatRef}
            color={BODY_COLOR}
            roughness={0.55}
            metalness={0.02}
            clearcoat={0.12}
            clearcoatRoughness={0.5}
          />
        </mesh>
        {/* Horizontal parting seam at mid-body */}
        <mesh
          position={[0, 0.12 + BODY_H * 0.52, BODY_D / 2 + BEVEL_R + 0.002]}
        >
          <planeGeometry args={[BASE_W * 0.7, 0.005]} />
          <meshStandardMaterial
            color={SEAM_COLOR}
            roughness={0.5}
            metalness={0.05}
          />
        </mesh>
        {/* Lower panel seam (below grater area) */}
        <mesh
          position={[0, 0.12 + BODY_H * 0.12, BODY_D / 2 + BEVEL_R + 0.002]}
        >
          <planeGeometry args={[BASE_W * 0.85, 0.004]} />
          <meshStandardMaterial
            color={SEAM_COLOR}
            roughness={0.5}
            metalness={0.05}
          />
        </mesh>

        {/* ── Front control panel ─────────────────────── */}
        <group position={[0, BODY_H * 0.72, BODY_D / 2 + BEVEL_R + 0.005]}>
          {/* Inset panel recess */}
          <mesh position={[0, 0, -0.006]}>
            <boxGeometry args={[BASE_W * 0.42, 0.2, 0.014]} />
            <meshPhysicalMaterial
              color="#2a2a2a"
              roughness={0.18}
              metalness={0.12}
            />
          </mesh>
          {/* Panel surround frame */}
          <mesh position={[0, 0, -0.001]}>
            <planeGeometry args={[BASE_W * 0.44, 0.22]} />
            <meshStandardMaterial
              color="#484848"
              roughness={0.35}
              metalness={0.1}
            />
          </mesh>
          {/* Mode indicator dot */}
          <mesh position={[-0.11, 0.02, 0.008]}>
            <circleGeometry args={[0.035, 16]} />
            <meshStandardMaterial
              ref={accentRef}
              color={modeAccentColor}
              emissive={modeAccentColor}
              emissiveIntensity={0.6}
            />
          </mesh>
          {/* Power / status LED */}
          <mesh position={[-0.11, -0.04, 0.008]}>
            <circleGeometry args={[0.012, 12]} />
            <meshStandardMaterial
              color="#666"
              emissive="#666"
              emissiveIntensity={0.15}
              roughness={0.3}
              metalness={0.2}
            />
          </mesh>
          {/* Label area */}
          <mesh position={[0.06, 0.01, 0.008]}>
            <planeGeometry args={[0.18, 0.045]} />
            <meshStandardMaterial
              color="#555"
              roughness={0.4}
              metalness={0.1}
            />
          </mesh>
          {/* Subtle divider line */}
          <mesh position={[-0.04, 0, 0.008]}>
            <planeGeometry args={[0.003, 0.15]} />
            <meshStandardMaterial color="#555" roughness={0.3} />
          </mesh>
        </group>

        {/* ── Mode accent cues ────────────────────────── */}
        {mode === "safe" && (
          <group position={[0, BODY_H * 0.82, BODY_D / 2 + BEVEL_R + 0.035]}>
            {[0, -0.14, -0.28].map((yOff, i) => (
              <mesh key={i} position={[0, yOff, 0]}>
                <circleGeometry args={[0.022, 3]} />
                <meshStandardMaterial
                  color="#34c759"
                  emissive="#34c759"
                  emissiveIntensity={0.45}
                  side={THREE.DoubleSide}
                />
              </mesh>
            ))}
          </group>
        )}
      </ExplodeGroup>

      {/* ── Top funnel ──────────────────────────────── */}
      <ExplodeGroup
        offset={EXPLODE_OFFSETS.topFunnel}
        explodeAmount={explodeAmount}
      >
        <group position={[0, BODY_H + 0.12 + FUNNEL_H / 2, -0.02]}>
          {/* Outer funnel body — smooth taper */}
          <mesh castShadow>
            <cylinderGeometry
              args={[FUNNEL_R * 0.8, FUNNEL_R * 1.2, FUNNEL_H, 32]}
            />
            <meshPhysicalMaterial
              color={BODY_COLOR}
              roughness={0.5}
              metalness={0.04}
              clearcoat={0.1}
              clearcoatRoughness={0.5}
            />
          </mesh>
          {/* Inner throat — darker recessed cavity */}
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry
              args={[FUNNEL_R * 0.5, FUNNEL_R * 0.72, FUNNEL_H * 0.75, 24]}
            />
            <meshStandardMaterial
              color="#6a6a6a"
              roughness={0.65}
              metalness={0.12}
              side={THREE.BackSide}
            />
          </mesh>
          {/* Lip rim */}
          <mesh position={[0, FUNNEL_H / 2 - 0.008, 0]}>
            <torusGeometry args={[FUNNEL_R * 0.8, 0.022, 12, 32]} />
            <meshPhysicalMaterial
              color="#aaa8a3"
              roughness={0.35}
              metalness={0.18}
              clearcoat={0.15}
            />
          </mesh>
          {/* Transition ring where funnel meets body top */}
          <mesh position={[0, -FUNNEL_H / 2 + 0.008, 0]}>
            <torusGeometry args={[FUNNEL_R * 1.1, 0.012, 8, 32]} />
            <meshStandardMaterial
              color={SEAM_COLOR}
              roughness={0.5}
              metalness={0.08}
            />
          </mesh>
        </group>
      </ExplodeGroup>

      {/* ── Enclosed feed channel (internal) ─────────── */}
      <ExplodeGroup
        offset={EXPLODE_OFFSETS.feedChannel}
        explodeAmount={explodeAmount}
      >
        {(isExploded || showInternalPath) && (
          <group position={[0, 0.12, -0.02]}>
            {/* Internal chute — semi-transparent channel from funnel to grater */}
            <mesh position={[0, BODY_H * 0.6, 0]}>
              <boxGeometry args={[0.28, BODY_H * 0.55, 0.26]} />
              <meshPhysicalMaterial
                color={CHANNEL_COLOR}
                transparent
                opacity={0.3}
                roughness={0.3}
                metalness={0.05}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Channel walls — left and right */}
            {([-1, 1] as const).map((s) => (
              <mesh key={s} position={[s * 0.14, BODY_H * 0.6, 0]}>
                <boxGeometry args={[0.015, BODY_H * 0.55, 0.24]} />
                <meshStandardMaterial
                  color={FRAME_COLOR}
                  roughness={0.5}
                  metalness={0.1}
                />
              </mesh>
            ))}
            {/* Channel back wall */}
            <mesh position={[0, BODY_H * 0.6, -0.13]}>
              <boxGeometry args={[0.28, BODY_H * 0.55, 0.015]} />
              <meshStandardMaterial
                color={FRAME_COLOR}
                roughness={0.5}
                metalness={0.1}
              />
            </mesh>
            {/* Pusher guide track rails */}
            {([-1, 1] as const).map((s) => (
              <mesh key={`rail-${s}`} position={[s * 0.1, BODY_H * 0.6, 0.06]}>
                <boxGeometry args={[0.02, BODY_H * 0.55, 0.02]} />
                <meshStandardMaterial
                  color="#888"
                  roughness={0.4}
                  metalness={0.25}
                />
              </mesh>
            ))}
            {/* End-stop block at bottom — safe mode limiter */}
            <mesh position={[0, BODY_H * 0.3, 0]}>
              <boxGeometry args={[0.22, 0.04, 0.22]} />
              <meshStandardMaterial
                color={mode === "safe" ? "#34c759" : "#888"}
                emissive={mode === "safe" ? "#34c759" : "#000"}
                emissiveIntensity={mode === "safe" ? 0.3 : 0}
                roughness={0.5}
              />
            </mesh>

            {/* Redirect wedge that converts vertical force to plate contact */}
            <mesh position={[0, BODY_H * 0.39, 0.02]} rotation={[-0.28, 0, 0]}>
              <boxGeometry args={[0.2, 0.12, 0.16]} />
              <meshStandardMaterial
                color={FRAME_COLOR}
                roughness={0.52}
                metalness={0.15}
              />
            </mesh>
          </group>
        )}
      </ExplodeGroup>

      {/* ── Follower plate, return spring & cheese carriage ── */}
      <ExplodeGroup
        offset={EXPLODE_OFFSETS.feedChannel}
        explodeAmount={explodeAmount}
      >
        {/* Visible in exploded view or during safe-mode operation */}
        {(isExploded || mode === "safe") && (
          <group position={[0, 0.12, -0.02]}>
            {/* Follower plate — spring-loaded, pushes cheese back to top after each stroke */}
            <group
              position={[
                0,
                BODY_H * 0.88 - followerPlatePosition * (BODY_H * 0.55),
                0,
              ]}
            >
              <mesh>
                <boxGeometry args={[0.24, 0.04, 0.19]} />
                <meshStandardMaterial
                  color="#ffe07a"
                  roughness={0.32}
                  metalness={0.12}
                />
              </mesh>
              {/* Plate face accent (front-facing) */}
              <mesh position={[0, 0, 0.1]}>
                <planeGeometry args={[0.22, 0.035]} />
                <meshStandardMaterial
                  color="#f5d060"
                  roughness={0.18}
                  metalness={0.08}
                />
              </mesh>
            </group>

            {/* Return spring — sits above follower plate, compresses at end of stroke */}
            <group
              position={[
                0,
                BODY_H * 0.88 - followerPlatePosition * (BODY_H * 0.55) + 0.08,
                0,
              ]}
            >
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <mesh
                  key={`follower-spring-${i}`}
                  position={[0, -i * (followerSpringCompressed ? 0.008 : 0.018), 0]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <torusGeometry
                    args={[0.06, followerSpringCompressed ? 0.006 : 0.012, 8, 18]}
                  />
                  <meshStandardMaterial
                    color={SPRING_COLOR}
                    roughness={0.35}
                    metalness={0.55}
                  />
                </mesh>
              ))}
            </group>

            {/* Upward arrow cue — visible during spring reset phase */}
            {isResettingCheese && (
              <group
                position={[
                  0.16,
                  BODY_H * 0.88 - followerPlatePosition * (BODY_H * 0.55),
                  0,
                ]}
              >
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <coneGeometry args={[0.025, 0.06, 3]} />
                  <meshStandardMaterial
                    color="#8fc9ff"
                    emissive="#8fc9ff"
                    emissiveIntensity={0.45}
                    transparent
                    opacity={0.65}
                  />
                </mesh>
              </group>
            )}
          </group>
        )}
      </ExplodeGroup>

      {/* ── Mechanical redirector block (expanded emphasis) ── */}
      <ExplodeGroup
        offset={EXPLODE_OFFSETS.redirector}
        explodeAmount={explodeAmount}
      >
        {isExploded && (
          <group position={[0, BODY_H * 0.38 + 0.12, 0.02]}>
            <mesh rotation={[-0.32, 0, 0]}>
              <boxGeometry args={[0.26, 0.14, 0.18]} />
              <meshStandardMaterial
                color={FRAME_COLOR}
                roughness={0.5}
                metalness={0.16}
              />
            </mesh>
            <mesh position={[0, -0.02, 0.08]} rotation={[-0.32, 0, 0]}>
              <planeGeometry args={[0.24, 0.1]} />
              <meshStandardMaterial
                color="#b7b0a8"
                roughness={0.42}
                metalness={0.1}
              />
            </mesh>
          </group>
        )}
      </ExplodeGroup>

      {/* ── Angled internal grating plate ───────────── */}
      <ExplodeGroup
        offset={EXPLODE_OFFSETS.internalGrater}
        explodeAmount={explodeAmount}
      >
        {(isExploded || showInternalPath) && (
          <group
            position={[0, BODY_H * 0.31 + 0.12, 0.12]}
            rotation={[-0.55, 0, 0]}
          >
            <mesh>
              <boxGeometry args={[0.56, 0.38, 0.015]} />
              <meshPhysicalMaterial
                color={STEEL_COLOR}
                roughness={0.2}
                metalness={0.9}
                clearcoat={0.2}
                clearcoatRoughness={0.55}
              />
            </mesh>
            <group position={[0, 0, 0.01]}>
              <GraterHoles width={0.56} height={0.38} rows={10} cols={8} style={graterStyle} />
            </group>
          </group>
        )}
      </ExplodeGroup>

      {/* ── Safe-mode protective barrier / enclosure ─── */}
      <ExplodeGroup
        offset={EXPLODE_OFFSETS.safeBarrier}
        explodeAmount={explodeAmount}
      >
        {(mode === "safe" || isExploded) && (
          <group position={[0, BODY_H * 0.35 + 0.12, BODY_D / 2 - 0.04]}>
            <mesh>
              <boxGeometry args={[0.72, 0.52, 0.12]} />
              <meshPhysicalMaterial
                color="#d7eede"
                transparent
                opacity={isExploded ? 0.35 : 0.18}
                roughness={0.3}
                metalness={0.03}
                transmission={0.3}
              />
            </mesh>
            <mesh position={[0, 0, 0.065]}>
              <planeGeometry args={[0.66, 0.46]} />
              <meshStandardMaterial
                color="#8fb89a"
                transparent
                opacity={0.15}
              />
            </mesh>
          </group>
        )}
      </ExplodeGroup>

      {/* ── Front grating face (stainless steel) — grater plate module ── */}
      <ExplodeGroup
        offset={EXPLODE_OFFSETS.graterPlate}
        explodeAmount={explodeAmount}
      >
        <group position={[0, BODY_H * 0.35, BODY_D / 2 + BEVEL_R + 0.003]}>
          {/* Inset recess behind grater */}
          <mesh position={[0, 0, -0.015]}>
            <boxGeometry args={[BASE_W * 0.62, PLATE_H + 0.02, 0.02]} />
            <meshStandardMaterial
              color="#888"
              roughness={0.6}
              metalness={0.4}
            />
          </mesh>
          {/* Stainless steel plate with depth */}
          <mesh>
            <boxGeometry args={[BASE_W * 0.6, PLATE_H, 0.018]} />
            <meshPhysicalMaterial
              color={STEEL_COLOR}
              roughness={0.18}
              metalness={0.92}
              clearcoat={0.25}
              clearcoatRoughness={0.6}
            />
          </mesh>
          {/* Perforations */}
          <group position={[0, 0, 0.011]}>
            <GraterHoles
              width={BASE_W * 0.6}
              height={PLATE_H}
              rows={14}
              cols={10}
              style={graterStyle}
            />
          </group>
          {/* Frame border around grater plate */}
          {(
            [
              [0, PLATE_H / 2 + 0.008, BASE_W * 0.62, 0.016],
              [0, -PLATE_H / 2 - 0.008, BASE_W * 0.62, 0.016],
              [-BASE_W * 0.31 - 0.005, 0, 0.012, PLATE_H + 0.02],
              [BASE_W * 0.31 + 0.005, 0, 0.012, PLATE_H + 0.02],
            ] as [number, number, number, number][]
          ).map(([x, y, w, h], i) => (
            <mesh key={`gf-${i}`} position={[x, y, 0.01]}>
              <planeGeometry args={[w, h]} />
              <meshStandardMaterial
                color="#8a8a8a"
                roughness={0.4}
                metalness={0.5}
              />
            </mesh>
          ))}
          {/* Support frame behind the grater plate (visible in exploded) */}
          {isExploded && (
            <mesh position={[0, 0, -0.025]}>
              <boxGeometry args={[BASE_W * 0.58, PLATE_H * 0.9, 0.015]} />
              <meshStandardMaterial
                color={FRAME_COLOR}
                roughness={0.6}
                metalness={0.15}
              />
            </mesh>
          )}
        </group>
      </ExplodeGroup>

      {/* ── Safe-mode face shutter ──────────────────── */}
      <ExplodeGroup
        offset={EXPLODE_OFFSETS.shutterAssembly}
        explodeAmount={explodeAmount}
      >
        <group ref={shutterRef} position={[0, 0, BODY_D / 2 + BEVEL_R + 0.02]}>
          {/* Main shutter panel with thickness */}
          <mesh position={[0, BODY_H * 0.35, 0]}>
            <boxGeometry args={[BASE_W * 0.63, PLATE_H + 0.04, 0.032]} />
            <meshPhysicalMaterial
              color={mode === "safe" ? "#d2d2d0" : "#b0b0b0"}
              roughness={0.48}
              metalness={0.06}
              clearcoat={0.06}
              clearcoatRoughness={0.6}
            />
          </mesh>
          {/* Left rail guide */}
          <mesh position={[-BASE_W * 0.32, BODY_H * 0.35, 0]}>
            <boxGeometry args={[0.022, PLATE_H + 0.08, 0.042]} />
            <meshStandardMaterial
              color="#7a7a7a"
              roughness={0.4}
              metalness={0.15}
            />
          </mesh>
          {/* Right rail guide */}
          <mesh position={[BASE_W * 0.32, BODY_H * 0.35, 0]}>
            <boxGeometry args={[0.022, PLATE_H + 0.08, 0.042]} />
            <meshStandardMaterial
              color="#7a7a7a"
              roughness={0.4}
              metalness={0.15}
            />
          </mesh>
          {/* Slot windows with depth */}
          <group position={[0, BODY_H * 0.35, 0.017]}>
            <ShutterSlots width={BASE_W * 0.63} height={PLATE_H} />
          </group>
          {/* Top accent stripe */}
          <mesh position={[0, BODY_H * 0.35 + PLATE_H / 2 + 0.03, 0.017]}>
            <boxGeometry args={[BASE_W * 0.48, 0.022, 0.006]} />
            <meshStandardMaterial
              color={modeAccentColor}
              emissive={modeAccentColor}
              emissiveIntensity={0.3}
            />
          </mesh>
          {/* Bottom grip edge */}
          <mesh position={[0, BODY_H * 0.35 - PLATE_H / 2 - 0.025, 0.008]}>
            <boxGeometry args={[BASE_W * 0.4, 0.018, 0.04]} />
            <meshStandardMaterial
              color="#888"
              roughness={0.5}
              metalness={0.15}
            />
          </mesh>
          {/* Shutter guide housing (visible in exploded) */}
          {isExploded && (
            <>
              {([-1, 1] as const).map((s) => (
                <mesh
                  key={`sh-${s}`}
                  position={[s * BASE_W * 0.34, BODY_H * 0.35, -0.02]}
                >
                  <boxGeometry args={[0.03, PLATE_H + 0.12, 0.06]} />
                  <meshStandardMaterial
                    color={FRAME_COLOR}
                    roughness={0.5}
                    metalness={0.12}
                  />
                </mesh>
              ))}
            </>
          )}
        </group>
      </ExplodeGroup>

      {/* ── Transparent collection bin ──────────────── */}
      <ExplodeGroup
        offset={EXPLODE_OFFSETS.collectionBin}
        explodeAmount={explodeAmount}
      >
        {binInserted && (
          <group position={[0, BIN_H / 2 + 0.12, BODY_D / 2 + 0.13]}>
            {/* Main transparent body */}
            <mesh castShadow>
              <boxGeometry args={[BASE_W * 0.56, BIN_H, 0.32]} />
              <meshPhysicalMaterial
                color={BIN_COLOR}
                transparent
                opacity={0.22}
                roughness={0.08}
                metalness={0.0}
                transmission={0.72}
                thickness={0.8}
                clearcoat={0.3}
                clearcoatRoughness={0.3}
              />
            </mesh>
            {/* Top rim */}
            <mesh position={[0, BIN_H / 2, 0]}>
              <boxGeometry args={[BASE_W * 0.58, 0.025, 0.34]} />
              <meshPhysicalMaterial
                color="#9cc"
                roughness={0.22}
                metalness={0.1}
                clearcoat={0.15}
              />
            </mesh>
            {/* Bottom edge */}
            <mesh position={[0, -BIN_H / 2 + 0.008, 0]}>
              <boxGeometry args={[BASE_W * 0.56, 0.016, 0.32]} />
              <meshPhysicalMaterial
                color="#9cc"
                roughness={0.3}
                metalness={0.08}
                transparent
                opacity={0.6}
              />
            </mesh>
            {/* Front face edge highlight */}
            <mesh position={[0, 0, 0.162]}>
              <planeGeometry args={[BASE_W * 0.55, BIN_H * 0.9]} />
              <meshPhysicalMaterial
                color="#e8f4fa"
                transparent
                opacity={0.06}
                roughness={0.05}
              />
            </mesh>
            {/* Left/right side edges */}
            {([-1, 1] as const).map((s) => (
              <mesh key={`be-${s}`} position={[s * BASE_W * 0.28, 0, 0]}>
                <boxGeometry args={[0.012, BIN_H * 0.95, 0.31]} />
                <meshPhysicalMaterial
                  color="#b5dde8"
                  transparent
                  opacity={0.15}
                  roughness={0.1}
                />
              </mesh>
            ))}
            {/* Shallow rim / tab / fitment detail */}
            <mesh position={[0, BIN_H / 2 + 0.018, -0.14]}>
              <boxGeometry args={[BASE_W * 0.3, 0.012, 0.05]} />
              <meshPhysicalMaterial
                color="#aad"
                roughness={0.25}
                metalness={0.08}
              />
            </mesh>
          </group>
        )}
      </ExplodeGroup>

      {/* ── Bin-present latch / interlock indicator ─── */}
      <ExplodeGroup
        offset={EXPLODE_OFFSETS.outerShell}
        explodeAmount={explodeAmount}
      >
        <mesh
          ref={binLatchRef}
          position={[BASE_W * 0.32, BIN_H + 0.16, BODY_D / 2 + BEVEL_R + 0.01]}
        >
          <boxGeometry args={[0.05, 0.05, 0.025]} />
          <meshStandardMaterial
            color={binInserted ? "#34c759" : "#aaa"}
            emissive={binInserted ? "#34c759" : "#555"}
            emissiveIntensity={binInserted ? 0.4 : 0}
          />
        </mesh>
      </ExplodeGroup>

      {/* ── Captive pusher carriage ─────────────────── */}
      <ExplodeGroup
        offset={EXPLODE_OFFSETS.pusherAssembly}
        explodeAmount={explodeAmount}
      >
        {pusherEnabled && (
          <group ref={pusherRef} position={[0, BODY_H + 0.08, -0.02]}>
            {/* Pusher rod */}
            <mesh castShadow>
              <cylinderGeometry args={[0.035, 0.035, BODY_H * 0.5, 12]} />
              <meshStandardMaterial
                color="#888"
                roughness={0.45}
                metalness={0.25}
              />
            </mesh>
            {/* Grip cap */}
            <mesh position={[0, BODY_H * 0.25 + 0.04, 0]} castShadow>
              <cylinderGeometry args={[0.13, 0.11, 0.1, 20]} />
              <meshPhysicalMaterial
                color={HANDLE_COLOR}
                roughness={0.65}
                metalness={0.08}
              />
            </mesh>
            {/* Grip ring */}
            <mesh position={[0, BODY_H * 0.25 + 0.09, 0]}>
              <torusGeometry args={[0.11, 0.018, 10, 20]} />
              <meshStandardMaterial
                color="#5e5e5e"
                roughness={0.5}
                metalness={0.18}
              />
            </mesh>
            {/* Pusher sled / foot */}
            <mesh position={[0, -BODY_H * 0.25, 0]}>
              <boxGeometry args={[0.2, 0.03, 0.18]} />
              <meshStandardMaterial
                color="#777"
                roughness={0.5}
                metalness={0.15}
              />
            </mesh>
            {/* End-stop indicator */}
            <mesh position={[0, -BODY_H * 0.25 + 0.04, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.025, 12]} />
              <meshStandardMaterial
                color={modeAccentColor}
                emissive={modeAccentColor}
                emissiveIntensity={0.3}
              />
            </mesh>

            {/* Return spring around the upper guide (optional visual) */}
            <group position={[0, BODY_H * 0.12, 0]}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <mesh
                  key={`spring-${i}`}
                  position={[0, -i * 0.03, 0]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <torusGeometry args={[0.055, 0.004, 6, 18]} />
                  <meshStandardMaterial
                    color={SPRING_COLOR}
                    roughness={0.35}
                    metalness={0.55}
                  />
                </mesh>
              ))}
            </group>
          </group>
        )}
      </ExplodeGroup>

      {/* ── Cheese path indicators (optional) ────────── */}
      {showInternalPath && (
        <ExplodeGroup
          offset={EXPLODE_OFFSETS.feedChannel}
          explodeAmount={explodeAmount}
        >
          <group position={[0, 0.12, -0.02]}>
            {/* Arrow indicators showing cheese flow direction */}
            {[0.85, 0.7, 0.55, 0.42].map((frac, i) => (
              <group key={i} position={[0, BODY_H * frac, 0.14]}>
                {/* Arrow body */}
                <mesh rotation={[0, 0, Math.PI]}>
                  <coneGeometry args={[0.04, 0.08, 3]} />
                  <meshStandardMaterial
                    color="#34c759"
                    emissive="#34c759"
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.7}
                  />
                </mesh>
              </group>
            ))}
            {/* Horizontal arrow at grater output */}
            <group
              position={[0, BODY_H * 0.35, 0.2]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <mesh>
                <coneGeometry args={[0.04, 0.08, 3]} />
                <meshStandardMaterial
                  color="#34c759"
                  emissive="#34c759"
                  emissiveIntensity={0.5}
                  transparent
                  opacity={0.7}
                />
              </mesh>
            </group>
            {/* Downward arrow to bin */}
            <group position={[0, BODY_H * 0.2, 0.25]}>
              <mesh rotation={[0, 0, Math.PI]}>
                <coneGeometry args={[0.04, 0.08, 3]} />
                <meshStandardMaterial
                  color="#f5a623"
                  emissive="#f5a623"
                  emissiveIntensity={0.5}
                  transparent
                  opacity={0.7}
                />
              </mesh>
            </group>

            {/* Upward reset cue for pusher; separate from cheese feed path */}
            <group position={[0.09, BODY_H * 0.92, -0.03]}>
              <mesh>
                <coneGeometry args={[0.03, 0.07, 3]} />
                <meshStandardMaterial
                  color="#8fc9ff"
                  emissive="#8fc9ff"
                  emissiveIntensity={0.45}
                  transparent
                  opacity={0.65}
                />
              </mesh>
            </group>

            {/* Additional continuation cue near lower channel for repeated pushes */}
            <group position={[0.02, BODY_H * 0.31, 0.18]}>
              <mesh rotation={[0, 0, Math.PI]}>
                <coneGeometry args={[0.03, 0.07, 3]} />
                <meshStandardMaterial
                  color="#34c759"
                  emissive="#34c759"
                  emissiveIntensity={0.45}
                  transparent
                  opacity={0.65}
                />
              </mesh>
            </group>
          </group>
        </ExplodeGroup>
      )}
    </group>
  );
}
