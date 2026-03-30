/**
 * CheeseDemo — animated cheese interaction for both Safe and Pro modes.
 *
 * Safe Mode: cheese appears in funnel, travels down enclosed channel,
 * pusher pushes it, output falls into the bin. Shutter stays closed.
 *
 * Pro Mode: cheese appears at the exposed grater face, moves against
 * the plate directly. Output falls into the bin below.
 *
 * Grated cheese particles are rendered with an InstancedMesh for performance.
 */
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { PrototypeState } from "../types";
import { CHEESE_COLOR, GRATED_COLOR } from "../types";

/* ── Shared dimensions (must match GrateTogetherModel) ── */
const BASE_W = 1.6;
const BODY_H = BASE_W * 2.2;
const BODY_D = 0.9;
const BIN_H = BODY_H * 0.25;

/* ── Cheese block size ─────────────────────────────── */
const CHEESE_W = 0.26;
const CHEESE_H = 0.22;
const CHEESE_D = 0.2;

/* ── Particle pool ─────────────────────────────────── */
const MAX_PARTICLES = 200;
/** Seconds between particle spawns */
const PARTICLE_SPAWN_RATE = 0.04;

interface Particle {
  active: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  scale: number;
}

function makeParticle(): Particle {
  return {
    active: false,
    pos: new THREE.Vector3(),
    vel: new THREE.Vector3(),
    life: 0,
    scale: 0.02,
  };
}

interface Props {
  prototypeState: PrototypeState;
}

export function CheeseDemo({ prototypeState }: Props) {
  const {
    mode,
    cheeseProgress,
    showCheeseOutput,
    isAnimating,
    followerPlatePosition,
  } = prototypeState;

  const cheeseRef = useRef<THREE.Mesh>(null);
  const instanceRef = useRef<THREE.InstancedMesh>(null);
  const particles = useRef<Particle[]>(
    Array.from({ length: MAX_PARTICLES }, makeParticle),
  );
  const nextSlot = useRef(0);
  const spawnTimer = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  /* Compute cheese position based on mode and follower plate (safe mode) */
  const getCheesePosition = (
    progress: number,
    currentMode: "safe" | "pro",
    followerPlate: number,
  ): THREE.Vector3 => {
    if (currentMode === "safe") {
      // Cheese is always just above the follower plate in safe mode
      // Follower plate moves from top (0) to bottom (1)
      const plateYTop = BODY_H * 0.88;
      const plateYBot = BODY_H * 0.88 - BODY_H * 0.55;
      const y = THREE.MathUtils.lerp(plateYTop, plateYBot, followerPlate);
      // Z: cheese moves forward slightly as it nears the grater
      const z =
        followerPlate < 0.6
          ? -0.04
          : THREE.MathUtils.lerp(
              -0.04,
              BODY_D / 2 - 0.05,
              (followerPlate - 0.6) / 0.4,
            );
      return new THREE.Vector3(0, y, z);
    } else {
      // Cheese approaches from front, presses against exposed grater plate
      const startZ = BODY_D / 2 + 0.4;
      const endZ = BODY_D / 2 + 0.05;
      const z = THREE.MathUtils.lerp(startZ, endZ, progress);
      const y = BODY_H * 0.35;
      return new THREE.Vector3(0, y, z);
    }
  };

  /* Grated output spawn position (where shreds exit the grater) */
  const getOutputPosition = (currentMode: "safe" | "pro"): THREE.Vector3 => {
    if (currentMode === "safe") {
      // Shreds exit internally and fall into the front bin
      return new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        BIN_H + 0.15 + Math.random() * 0.1,
        BODY_D / 2 + 0.12,
      );
    } else {
      // Shreds fall from the exposed grater face
      return new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        BODY_H * 0.2 + Math.random() * BODY_H * 0.2,
        BODY_D / 2 + 0.08,
      );
    }
  };

  useFrame((_, delta) => {
    /* ── Move cheese block ──────────────────────── */
    if (cheeseRef.current) {
      if (mode === "safe") {
        // Cheese follows follower plate in safe mode
        const target = getCheesePosition(
          cheeseProgress,
          mode,
          followerPlatePosition,
        );
        cheeseRef.current.position.lerp(target, Math.min(delta * 8, 1));
        cheeseRef.current.visible = true;
      } else if (cheeseProgress > 0) {
        // Pro mode: use progress
        const target = getCheesePosition(cheeseProgress, mode, 0);
        cheeseRef.current.position.lerp(target, Math.min(delta * 8, 1));
        cheeseRef.current.visible = true;
      } else {
        // Park cheese out of view
        cheeseRef.current.visible = false;
      }
    }

    /* ── Spawn grated cheese particles ──────────── */
    if (showCheeseOutput && isAnimating) {
      spawnTimer.current += delta;
      while (spawnTimer.current >= PARTICLE_SPAWN_RATE) {
        spawnTimer.current -= PARTICLE_SPAWN_RATE;
        const p = particles.current[nextSlot.current % MAX_PARTICLES];
        nextSlot.current++;
        p.active = true;
        p.pos.copy(getOutputPosition(mode));
        p.vel.set(
          (Math.random() - 0.5) * 0.2,
          -0.5 - Math.random() * 0.8,
          0.05 + Math.random() * 0.15,
        );
        p.life = 1.0;
        p.scale = 0.018 + Math.random() * 0.025;
      }
    } else {
      spawnTimer.current = 0;
    }

    /* ── Update particles ───────────────────────── */
    if (!instanceRef.current) return;

    const floorY = 0.12; // top of base
    let visible = 0;

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = particles.current[i];
      if (!p.active) continue;

      p.vel.y -= 3.5 * delta; // gravity
      p.pos.addScaledVector(p.vel, delta);
      p.life -= delta * 0.25;

      // Settle on base/bin floor
      if (p.pos.y <= floorY) {
        p.pos.y = floorY;
        p.vel.set(0, 0, 0);
        p.life -= delta * 0.15;
      }

      if (p.life <= 0) {
        p.active = false;
        continue;
      }

      dummy.position.copy(p.pos);
      const s = p.scale * Math.min(p.life * 3, 1);
      dummy.scale.setScalar(Math.max(s, 0.001));
      dummy.updateMatrix();
      instanceRef.current.setMatrixAt(visible, dummy.matrix);
      visible++;
    }

    // Hide unused slots
    dummy.scale.setScalar(0);
    dummy.updateMatrix();
    for (let i = visible; i < MAX_PARTICLES; i++) {
      instanceRef.current.setMatrixAt(i, dummy.matrix);
    }
    instanceRef.current.instanceMatrix.needsUpdate = true;
  });

  const startPos = getCheesePosition(0, mode, 0);

  return (
    <>
      {/* Cheese block */}
      <mesh
        ref={cheeseRef}
        position={startPos.toArray()}
        visible={false}
        castShadow
      >
        <boxGeometry args={[CHEESE_W, CHEESE_H, CHEESE_D]} />
        <meshStandardMaterial
          color={CHEESE_COLOR}
          roughness={0.72}
          metalness={0}
        />
      </mesh>

      {/* Grated cheese particles */}
      <instancedMesh
        ref={instanceRef}
        args={[undefined, undefined, MAX_PARTICLES]}
        castShadow
      >
        <sphereGeometry args={[1, 4, 3]} />
        <meshStandardMaterial
          color={GRATED_COLOR}
          roughness={0.85}
          metalness={0}
        />
      </instancedMesh>
    </>
  );
}
