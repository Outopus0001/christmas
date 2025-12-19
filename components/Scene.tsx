
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';
import TreeTopStar from './TreeTopStar';
import DiamondParticles from './DiamondParticles';

interface SceneProps {
  isExploded: boolean;
}

const Scene: React.FC<SceneProps> = ({ isExploded }) => {
  const lightGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (lightGroupRef.current) {
      lightGroupRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <>
      {/* Dynamic Lighting */}
      <group ref={lightGroupRef}>
        <spotLight 
          position={[10, 15, 10]} 
          angle={0.3} 
          penumbra={1} 
          intensity={500} 
          castShadow 
          color="#FF69B4" 
        />
        <spotLight 
          position={[-10, 10, -10]} 
          angle={0.3} 
          penumbra={1} 
          intensity={300} 
          color="#FFB7C5" 
        />
      </group>

      {/* Ground point light moved up to follow tree base at new position */}
      <pointLight position={[0, -5.0, 0]} intensity={250} color="#FF69B4" distance={12} />
      <ambientLight intensity={0.5} />

      {/* Main Christmas Tree - Moved upwards for better visibility and layout balance */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <group position={[0, -5.5, 0]}>
          <DiamondParticles isExploded={isExploded} />
          
          <TreeTopStar 
            position={[0, 9.8, 0]} 
            isExploded={isExploded} 
          />
        </group>
      </Float>

      {/* Atmospheric Particles */}
      <Sparkles 
        count={200} 
        scale={20} 
        size={2} 
        speed={0.4} 
        opacity={0.3} 
        color="#FFB7C5" 
      />

      {/* Shadow plane moved up to match the new base of the tree at -5.5 */}
      <ContactShadows 
        position={[0, -5.6, 0]}
        opacity={0.4} 
        scale={20} 
        blur={2.5} 
        far={10} 
        resolution={256} 
        color="#000000" 
      />
    </>
  );
};

export default Scene;
