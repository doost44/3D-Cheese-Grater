/**
 * CheeseAnimation — combines CheeseBlock + GratedCheese into one component
 * so that particle spawning happens synchronously inside a single useFrame
 * without going through React state.
 */
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { GraterMode } from '../types';
import { MODE_CONFIGS } from '../types';

const CHEESE_W = 0.78;
const CHEESE_H = 0.54;
const CHEESE_D = 0.44;
const GRATER_FRONT_Z = 0.5 + CHEESE_D / 2 + 0.015;
const REST_X = 0.28;
const REST_Y = 0.2;
const Y_MIN = -1.25;
const Y_MAX = 1.05;
const GRATE_SPEED = 1.6;

const MAX_PARTICLES = 280;
const FLOOR_Y = -2.25;

interface Particle {
  active: boolean;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;        // counts down from 1
  settling: boolean;
  scale: number;
}

function makeParticle(): Particle {
  return {
    active: false,
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    life: 0,
    settling: false,
    scale: 0.05,
  };
}

interface Props {
  mode: GraterMode;
  isGrating: boolean;
}

export function CheeseAnimation({ mode, isGrating }: Props) {
  const config = MODE_CONFIGS[mode];

  // Cheese block
  const cheeseRef = useRef<THREE.Mesh>(null);
  const cheeseY = useRef(REST_Y);
  const dir = useRef<1 | -1>(1);
  const isGratingRef = useRef(isGrating);
  useEffect(() => { isGratingRef.current = isGrating; }, [isGrating]);

  // Grated cheese particles
  const particlesRef = useRef<Particle[]>(
    Array.from({ length: MAX_PARTICLES }, makeParticle),
  );
  const nextSlot = useRef(0);
  const spawnTimer = useRef(0);
  const instanceRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Keep config in a ref so useFrame always uses latest
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);

  useFrame((_, delta) => {
    // ── Cheese block ──────────────────────────────────
    if (cheeseRef.current) {
      if (isGratingRef.current) {
        cheeseY.current += dir.current * GRATE_SPEED * delta;
        if (cheeseY.current >= Y_MAX) { cheeseY.current = Y_MAX; dir.current = -1; }
        else if (cheeseY.current <= Y_MIN) { cheeseY.current = Y_MIN; dir.current = 1; }
        cheeseRef.current.position.set(REST_X, cheeseY.current, GRATER_FRONT_Z);
      } else {
        cheeseRef.current.position.lerp(
          new THREE.Vector3(REST_X, REST_Y, GRATER_FRONT_Z + 0.12),
          0.06,
        );
      }
    }

    // ── Spawn particles ───────────────────────────────
    if (isGratingRef.current) {
      spawnTimer.current += delta;
      const cfg = configRef.current;
      while (spawnTimer.current >= cfg.spawnRate) {
        spawnTimer.current -= cfg.spawnRate;
        const p = particlesRef.current[nextSlot.current % MAX_PARTICLES];
        nextSlot.current++;
        p.active = true;
        p.settling = false;
        p.position.set(
          REST_X + (Math.random() - 0.5) * CHEESE_W * 0.75,
          cheeseY.current + (Math.random() - 0.5) * CHEESE_H * 0.5,
          0.55,
        );
        p.velocity.set(
          (Math.random() - 0.5) * 0.32,
          -0.28 - Math.random() * 0.55,
          0.06 + Math.random() * 0.28,
        );
        p.life = 1.0;
        p.scale = cfg.particleScale * (0.55 + Math.random() * 0.9);
      }
    } else {
      spawnTimer.current = 0;
    }

    // ── Update particles ──────────────────────────────
    if (!instanceRef.current) return;

    let visible = 0;
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = particlesRef.current[i];
      if (!p.active) continue;

      if (!p.settling) {
        p.velocity.y -= 4.2 * delta;
        p.position.addScaledVector(p.velocity, delta);
        p.life -= delta * 0.28;

        if (p.position.y <= FLOOR_Y) {
          p.position.y = FLOOR_Y;
          p.velocity.set(0, 0, 0);
          p.settling = true;
        }
      } else {
        // settled — slowly fade out after a while
        p.life -= delta * 0.08;
        if (p.life <= 0) { p.active = false; continue; }
      }

      dummy.position.copy(p.position);
      dummy.scale.setScalar(Math.max(p.scale * Math.min(p.life * 3, 1.0), 0.001));
      dummy.updateMatrix();
      instanceRef.current.setMatrixAt(visible, dummy.matrix);
      visible++;
    }

    dummy.scale.setScalar(0);
    dummy.updateMatrix();
    for (let i = visible; i < MAX_PARTICLES; i++) {
      instanceRef.current.setMatrixAt(i, dummy.matrix);
    }
    instanceRef.current.count = MAX_PARTICLES;
    instanceRef.current.instanceMatrix.needsUpdate = true;
  });

  const gratedColor = useMemo(() => new THREE.Color(config.gratedColor), [config.gratedColor]);

  return (
    <>
      {/* Cheese block */}
      <mesh
        ref={cheeseRef}
        position={[REST_X, REST_Y, GRATER_FRONT_Z + 0.12]}
        castShadow
      >
        <boxGeometry args={[CHEESE_W, CHEESE_H, CHEESE_D]} />
        <meshStandardMaterial
          color={config.cheeseColor}
          roughness={0.72}
          metalness={0.0}
        />
      </mesh>

      {/* Grated cheese particles */}
      <instancedMesh
        ref={instanceRef}
        args={[undefined, undefined, MAX_PARTICLES]}
        castShadow
      >
        <sphereGeometry args={[1, 4, 3]} />
        <meshStandardMaterial color={gratedColor} roughness={0.85} metalness={0} />
      </instancedMesh>
    </>
  );
}
