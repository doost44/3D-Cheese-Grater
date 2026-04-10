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
import { GraterSelector } from './GraterSelector';
import type { GraterStyle } from '../types';

interface SceneProps {
  prototypeState: PrototypeState;
  onSelectGraterStyle?: (style: GraterStyle) => void;
}

function SceneContent({ prototypeState, onSelectGraterStyle }: SceneProps) {
  const { isExploded } = prototypeState;

  return (
    <>
      {/* Soft studio lighting — key + fill + rim */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      {/* Cool fill from left */}
      <directionalLight position={[-4, 4, -3]} intensity={0.55} color="#c0d8ff" />
      {/* Warm front fill */}
      <pointLight position={[1, 3, 4]} intensity={0.45} color="#fff5e0" />
      {/* Rim light from behind for edge definition */}
      <directionalLight position={[0, 5, -5]} intensity={0.4} color="#e0e8ff" />
      {/* Low bounce fill */}
      <pointLight position={[0, 0.3, 2]} intensity={0.15} color="#f0ece6" />
      <hemisphereLight args={['#ffffff', '#e8e4e0', 0.35]} />

      {/* GrateTogether product model */}
      <GrateTogetherModel prototypeState={prototypeState} />

      {/* Cheese interaction demo */}
      <CheeseDemo prototypeState={prototypeState} />

      {/* In-scene mode labels */}
      <ModeIndicators prototypeState={prototypeState} />

      {/* Grater style selector tray */}
      {onSelectGraterStyle && (
        <GraterSelector
          activeStyle={prototypeState.graterStyle}
          onSelect={onSelectGraterStyle}
        />
      )}

      {/* Countertop surface */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#eae8e4" roughness={0.9} metalness={0} />
      </mesh>

      {/* Contact shadows */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.55}
        scale={10}
        blur={2}
        far={5}
      />

      <OrbitControls
        enablePan={true}
        enableDamping={true}
        dampingFactor={0.08}
        minDistance={2}
        maxDistance={18}
        minPolarAngle={0.05}
        maxPolarAngle={Math.PI - 0.05}
        autoRotate={!prototypeState.isAnimating && !isExploded}
        autoRotateSpeed={0.4}
        target={[0, isExploded ? 1.8 : 1.6, 0]}
      />
    </>
  );
}

export function Scene({ prototypeState, onSelectGraterStyle }: SceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [3.5, 2.8, 4.5], fov: 40 }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <SceneContent prototypeState={prototypeState} onSelectGraterStyle={onSelectGraterStyle} />
      </Suspense>
    </Canvas>
  );
}
