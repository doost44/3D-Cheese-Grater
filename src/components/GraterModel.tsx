import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import type { GraterMode } from '../types';
import { createGraterTexture } from '../utils/graterTexture';

// Grater dimensions
const W = 1.4;  // width  (x-axis)
const H = 3.6;  // height (y-axis)
const D = 1.0;  // depth  (z-axis)
const ER = 0.042; // edge radius

const METAL_COLOR = '#d0d4d8';
const EDGE_COLOR = '#a8abb0';

interface FaceProps {
  width: number;
  height: number;
  texture: THREE.CanvasTexture;
  position: [number, number, number];
  rotationY: number;
}

function PerforatedFace({ width, height, texture, position, rotationY }: FaceProps) {
  return (
    <mesh position={position} rotation={[0, rotationY, 0]} castShadow>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        color={METAL_COLOR}
        metalness={0.88}
        roughness={0.14}
        alphaMap={texture}
        alphaTest={0.4}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

interface EdgeStripProps {
  from: [number, number, number];
  to: [number, number, number];
}

function EdgeStrip({ from, to }: EdgeStripProps) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const dir = end.clone().sub(start);
  const length = dir.length();
  const mid = start.clone().add(dir.clone().multiplyScalar(0.5));
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.normalize(),
  );
  return (
    <mesh
      position={mid.toArray() as [number, number, number]}
      quaternion={quat}
      castShadow
    >
      <cylinderGeometry args={[ER, ER, length, 8]} />
      <meshStandardMaterial color={EDGE_COLOR} metalness={0.92} roughness={0.08} />
    </mesh>
  );
}

function HorizRim({ y }: { y: number }) {
  const hw = W / 2;
  const hd = D / 2;
  return (
    <group position={[0, y, 0]}>
      {([-1, 1] as const).map((s) => (
        <mesh key={s} position={[0, 0, s * hd]} castShadow>
          <boxGeometry args={[W + ER * 2, ER * 2, ER * 2]} />
          <meshStandardMaterial color={EDGE_COLOR} metalness={0.92} roughness={0.08} />
        </mesh>
      ))}
      {([-1, 1] as const).map((s) => (
        <mesh key={s} position={[s * hw, 0, 0]} castShadow>
          <boxGeometry args={[ER * 2, ER * 2, D + ER * 2]} />
          <meshStandardMaterial color={EDGE_COLOR} metalness={0.92} roughness={0.08} />
        </mesh>
      ))}
    </group>
  );
}

export function GraterModel({ mode }: { mode: GraterMode }) {
  const texture = useMemo(() => createGraterTexture(mode), [mode]);

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  const hw = W / 2;
  const hh = H / 2;
  const hd = D / 2;

  return (
    <group>
      {/* Perforated faces */}
      <PerforatedFace
        width={W}
        height={H}
        texture={texture}
        position={[0, 0, hd]}
        rotationY={0}
      />
      <PerforatedFace
        width={W}
        height={H}
        texture={texture}
        position={[0, 0, -hd]}
        rotationY={Math.PI}
      />
      <PerforatedFace
        width={D}
        height={H}
        texture={texture}
        position={[-hw, 0, 0]}
        rotationY={-Math.PI / 2}
      />
      <PerforatedFace
        width={D}
        height={H}
        texture={texture}
        position={[hw, 0, 0]}
        rotationY={Math.PI / 2}
      />

      {/* Top solid cap */}
      <mesh position={[0, hh, 0]} castShadow>
        <boxGeometry args={[W + ER * 2, ER * 2, D + ER * 2]} />
        <meshStandardMaterial color={EDGE_COLOR} metalness={0.92} roughness={0.08} />
      </mesh>

      {/* Horizontal rim strips */}
      <HorizRim y={hh} />
      <HorizRim y={0} />
      <HorizRim y={-hh} />

      {/* Vertical corner edges */}
      {(
        [
          [-hw, -hd],
          [hw, -hd],
          [-hw, hd],
          [hw, hd],
        ] as [number, number][]
      ).map(([x, z], i) => (
        <EdgeStrip key={i} from={[x, -hh, z]} to={[x, hh, z]} />
      ))}

      {/* Handle */}
      <group position={[0, hh + 0.05, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.3, 0.052, 8, 32]} />
          <meshStandardMaterial color={METAL_COLOR} metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.12, 0]} castShadow>
          <cylinderGeometry args={[0.048, 0.048, 0.24, 10]} />
          <meshStandardMaterial color={EDGE_COLOR} metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Feet */}
      {(
        [
          [-hw + 0.2, -hd + 0.15],
          [hw - 0.2, -hd + 0.15],
          [-hw + 0.2, hd - 0.15],
          [hw - 0.2, hd - 0.15],
        ] as [number, number][]
      ).map(([x, z], i) => (
        <mesh key={i} position={[x, -hh - 0.09, z]} castShadow>
          <cylinderGeometry args={[0.065, 0.085, 0.18, 8]} />
          <meshStandardMaterial color={EDGE_COLOR} metalness={0.8} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}
