
import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Loader } from '@react-three/drei';
import { Bloom, Vignette, EffectComposer } from '@react-three/postprocessing';
import Scene from './components/Scene';

const App: React.FC = () => {
  const [isExploded, setIsExploded] = useState(false);

  const toggleState = () => {
    setIsExploded((prev) => !prev);
  };

  return (
    <div 
      className="relative w-full h-screen bg-[#050103] cursor-pointer" 
      onClick={toggleState}
    >
      <Suspense fallback={null}>
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: false, stencil: false, depth: true }}>
          <color attach="background" args={['#050103']} />
          
          <PerspectiveCamera makeDefault position={[0, 5, 12]} fov={45} />
          
          <Scene isExploded={isExploded} />
          
          <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            maxPolarAngle={Math.PI / 1.5} 
            minDistance={5} 
            maxDistance={25}
            autoRotate
            autoRotateSpeed={isExploded ? 0.5 : 1.5}
          />

          <Environment preset="city" />

          {/* Post Processing Effects */}
          <EffectComposer disableNormalPass>
            <Bloom 
              luminanceThreshold={0.5} 
              mipmapBlur 
              intensity={1.5} 
              radius={0.4} 
            />
            <Vignette eskil={false} offset={0.1} darkness={0.8} />
          </EffectComposer>
        </Canvas>
      </Suspense>

      {/* UI Overlay */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none select-none w-full">
        <h1 className="text-4xl md:text-6xl font-thin tracking-widest text-[#FFB7C5] drop-shadow-[0_0_15px_rgba(255,183,197,0.8)] px-4">
          MERRY CHRISTMAS
        </h1>
        <p className="mt-4 text-xs md:text-sm text-pink-300 opacity-60 uppercase tracking-[0.3em] px-4">
          {isExploded ? "love you" : "FOR MINE BOBO PIG"}
        </p>
      </div>

      <Loader />
    </div>
  );
};

export default App;