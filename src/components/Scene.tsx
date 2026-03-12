import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import type { GraterMode } from '../types';
import { GraterModel } from './GraterModel';
import { CheeseAnimation } from './CheeseAnimation';

interface SceneProps {
  mode: GraterMode;
  isGrating: boolean;
}

function SceneContent({ mode, isGrating }: SceneProps) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <directionalLight position={[-4, 3, -3]} intensity={0.5} color="#c0d8ff" />
      <pointLight position={[1, 3, 2]} intensity={0.6} color="#fff8e0" />

      {/* Environment reflections */}
      <Environment preset="studio" />

      {/* Cheese Grater */}
      <GraterModel mode={mode} />

      {/* Cheese Block + Grated Cheese Particles (combined) */}
      <CheeseAnimation mode={mode} isGrating={isGrating} />

      {/* Cutting board surface */}
      <mesh position={[0, -2.3, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 5]} />
        <meshStandardMaterial color="#c8a87a" roughness={0.95} metalness={0} />
      </mesh>

      {/* Contact shadows for depth */}
      <ContactShadows
        position={[0, -2.29, 0]}
        opacity={0.55}
        scale={8}
        blur={2.5}
        far={4}
      />

      <OrbitControls
        enablePan={false}
        minDistance={2.5}
        maxDistance={8}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.1}
        autoRotate={!isGrating}
        autoRotateSpeed={0.6}
      />
    </>
  );
}

export function Scene({ mode, isGrating }: SceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [2.8, 1.2, 4.5], fov: 44 }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <SceneContent mode={mode} isGrating={isGrating} />
      </Suspense>
    </Canvas>
  );
}
