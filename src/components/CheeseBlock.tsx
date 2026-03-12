import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { GraterMode } from '../types';
import { MODE_CONFIGS } from '../types';

const CHEESE_W = 0.78;
const CHEESE_H = 0.54;
const CHEESE_D = 0.44;

// Cheese rests just in front of the grater front face (z = 0.5)
const GRATER_FRONT_Z = 0.5 + CHEESE_D / 2 + 0.015;
const REST_X = 0.28;
const REST_Y = 0.2;

const Y_MIN = -1.25;
const Y_MAX = 1.05;
const GRATE_SPEED = 1.6;

interface CheeseBlockProps {
  mode: GraterMode;
  isGrating: boolean;
  onGrateParticle: (x: number, y: number) => void;
}

export function CheeseBlock({ mode, isGrating, onGrateParticle }: CheeseBlockProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const yRef = useRef(REST_Y);
  const dirRef = useRef<1 | -1>(1);
  const isGratingRef = useRef(isGrating);

  useEffect(() => {
    isGratingRef.current = isGrating;
  }, [isGrating]);

  const config = MODE_CONFIGS[mode];

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    if (isGratingRef.current) {
      yRef.current += dirRef.current * GRATE_SPEED * delta;
      if (yRef.current >= Y_MAX) {
        yRef.current = Y_MAX;
        dirRef.current = -1;
      } else if (yRef.current <= Y_MIN) {
        yRef.current = Y_MIN;
        dirRef.current = 1;
      }
      meshRef.current.position.set(REST_X, yRef.current, GRATER_FRONT_Z);
      // Emit particle spawn position (on grater face)
      onGrateParticle(
        REST_X + (Math.random() - 0.5) * CHEESE_W * 0.8,
        yRef.current + (Math.random() - 0.5) * CHEESE_H * 0.5,
      );
    } else {
      // Smoothly return to rest position
      const target = new THREE.Vector3(REST_X, REST_Y, GRATER_FRONT_Z + 0.12);
      meshRef.current.position.lerp(target, 0.06);
    }
  });

  return (
    <mesh
      ref={meshRef}
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
  );
}
