import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { GraterMode } from '../types';
import { MODE_CONFIGS } from '../types';

const MAX_PARTICLES = 250;
const FLOOR_Y = -2.25;

interface Particle {
  active: boolean;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  scale: number;
}

interface GratedCheeseProps {
  mode: GraterMode;
  isGrating: boolean;
  spawnSignal: { x: number; y: number } | null;
}

function makeParticle(): Particle {
  return {
    active: false,
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    life: 0,
    maxLife: 1,
    scale: 0.05,
  };
}

export function GratedCheese({ mode, isGrating, spawnSignal }: GratedCheeseProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particles = useRef<Particle[]>(
    Array.from({ length: MAX_PARTICLES }, makeParticle),
  );
  const nextSlot = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorVec = useMemo(
    () => new THREE.Color(MODE_CONFIGS[mode].gratedColor),
    [mode],
  );
  const config = MODE_CONFIGS[mode];

  // Spawn a new particle whenever spawnSignal updates
  const prevSignal = useRef<typeof spawnSignal>(null);
  useEffect(() => {
    if (!spawnSignal || spawnSignal === prevSignal.current || !isGrating) return;
    prevSignal.current = spawnSignal;

    const p = particles.current[nextSlot.current % MAX_PARTICLES];
    nextSlot.current++;
    p.active = true;
    p.position.set(spawnSignal.x, spawnSignal.y, 0.55);
    p.velocity.set(
      (Math.random() - 0.5) * 0.3,
      -0.3 - Math.random() * 0.5,
      0.05 + Math.random() * 0.25,
    );
    p.life = 1;
    p.maxLife = 2.5 + Math.random() * 1.5;
    p.scale = config.particleScale * (0.6 + Math.random() * 0.8);
  });

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    let visible = 0;
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = particles.current[i];
      if (!p.active) continue;

      p.velocity.y -= 4.0 * delta; // gravity
      p.position.addScaledVector(p.velocity, delta);
      p.life -= delta / p.maxLife;

      if (p.position.y <= FLOOR_Y) {
        p.position.y = FLOOR_Y;
        p.velocity.multiplyScalar(0.05);
      }

      if (p.life <= 0 && p.position.y >= FLOOR_Y - 0.05) {
        // settle on floor
        p.velocity.set(0, 0, 0);
      }
      if (p.life <= 0 && p.position.y < FLOOR_Y - 0.05) {
        p.active = false;
        continue;
      }

      const fadeIn = Math.min(p.life * p.maxLife * 4, 1.0);
      dummy.position.copy(p.position);
      dummy.scale.setScalar(p.scale * Math.max(fadeIn, 0.01));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(visible, dummy.matrix);
      visible++;
    }

    // Hide unused slots
    dummy.scale.setScalar(0);
    dummy.updateMatrix();
    for (let i = visible; i < MAX_PARTICLES; i++) {
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.count = MAX_PARTICLES;
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, MAX_PARTICLES]}
      castShadow
    >
      <sphereGeometry args={[1, 4, 3]} />
      <meshStandardMaterial color={colorVec} roughness={0.85} metalness={0} />
    </instancedMesh>
  );
}
