/**
 * Scene — sets up the 3D canvas with lighting, environment,
 * the GrateTogether model, cheese demo, mode indicators, and orbit controls.
 */
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Suspense } from 'react';
import type { PrototypeState } from '../types';
import { GrateTogetherModel } from './GrateTogetherModel';
import { CheeseDemo } from './CheeseDemo';
import { ModeIndicators } from './ModeIndicators';

interface SceneProps {
  prototypeState: PrototypeState;
}

function SceneContent({ prototypeState }: SceneProps) {
  return (
    <>
      {/* Soft studio lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <directionalLight position={[-4, 4, -3]} intensity={0.6} color="#c0d8ff" />
      <pointLight position={[1, 4, 3]} intensity={0.5} color="#fff8e0" />
      <hemisphereLight args={['#ffffff', '#d0d0d0', 0.4]} />

      {/* GrateTogether product model */}
      <GrateTogetherModel prototypeState={prototypeState} />

      {/* Cheese interaction demo */}
      <CheeseDemo prototypeState={prototypeState} />

      {/* In-scene mode labels */}
      <ModeIndicators prototypeState={prototypeState} />

      {/* Countertop surface */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#d5cfc8" roughness={0.92} metalness={0} />
      </mesh>

      {/* Contact shadows */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.5}
        scale={10}
        blur={2.5}
        far={5}
      />

      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={10}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.1}
        autoRotate={!prototypeState.isAnimating}
        autoRotateSpeed={0.4}
        target={[0, 1.6, 0]}
      />
    </>
  );
}

export function Scene({ prototypeState }: SceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [3.5, 2.8, 4.5], fov: 40 }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <SceneContent prototypeState={prototypeState} />
      </Suspense>
    </Canvas>
  );
}
