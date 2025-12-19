
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface TreeTopStarProps {
  position: [number, number, number];
  isExploded: boolean;
}

const TreeTopStar: React.FC<TreeTopStarProps> = ({ position, isExploded }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  
  // High density for a refined, ethereal outline
  const particleCount = 2000;

  // Generate particles along the OUTLINE of the star to create a "hollow" look
  const particles = useMemo(() => {
    const pts = [];
    const pointsCount = 5;
    const outerRadius = 0.55; // Slightly smaller overall
    const innerRadius = 0.22;
    const centerThickness = 0.05;

    // Define the 10 vertices of the star (5 outer, 5 inner)
    const vertices: THREE.Vector2[] = [];
    for (let i = 0; i < pointsCount * 2; i++) {
      // Using + Math.PI / 2 ensures the first vertex (i=0) is at the top (pointing up)
      const angle = (i * Math.PI) / pointsCount + Math.PI / 2;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      vertices.push(new THREE.Vector2(Math.cos(angle) * r, Math.sin(angle) * r));
    }

    // Distribute particles along the edges
    const particlesPerEdge = Math.floor(particleCount / (pointsCount * 2));
    
    for (let edge = 0; edge < pointsCount * 2; edge++) {
      const v1 = vertices[edge];
      const v2 = vertices[(edge + 1) % (pointsCount * 2)];

      for (let p = 0; p < particlesPerEdge; p++) {
        const t = p / particlesPerEdge;
        
        // Linear interpolation along the edge
        const x = v1.x + (v2.x - v1.x) * t;
        const y = v1.y + (v2.y - v1.y) * t;
        
        // Add a tiny bit of "dusty" jitter to the outline for a softer feel
        const jitterX = (Math.random() - 0.5) * 0.02;
        const jitterY = (Math.random() - 0.5) * 0.02;
        const z = (Math.random() - 0.5) * centerThickness;

        pts.push({
          pos: new THREE.Vector3(x + jitterX, y + jitterY, z),
          // Random scatter position for explosion state
          explodePos: new THREE.Vector3(
            (Math.random() - 0.5) * 14,
            (Math.random() - 0.5) * 14,
            (Math.random() - 0.5) * 14
          ),
          // Very small particles for an exquisite diamond-dust look
          scale: 0.0015 + Math.random() * 0.005,
          speed: 0.4 + Math.random() * 1.2,
          currentPos: new THREE.Vector3(x, y, z)
        });
      }
    }
    return pts;
  }, []);

  const targetPos = useMemo(() => new THREE.Vector3(...position), [position]);
  const explodedCenter = useMemo(() => new THREE.Vector3(0, 10, 0), []);
  const currentGroupPos = useRef(new THREE.Vector3(...position));
  const tempObj = new THREE.Object3D();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const lerpSpeed = isExploded ? 0.03 : 0.06;
    
    // Move the whole group to the floating exploded center or target star tip
    const groupTarget = isExploded ? explodedCenter : targetPos;
    currentGroupPos.current.lerp(groupTarget, 0.05);
    groupRef.current.position.copy(currentGroupPos.current);
    
    // Rotation logic - slow rotation around Y axis
    groupRef.current.rotation.y = time * (isExploded ? 0.2 : 0.7); 
    
    // Breathing pulse for the hollow star
    const pulse = isExploded ? 1.0 : (0.97 + Math.sin(time * 2.5) * 0.03);

    particles.forEach((p, i) => {
      // Interpolate individual particle positions between star shape and explosion cloud
      const targetLocal = isExploded ? p.explodePos : p.pos;
      p.currentPos.lerp(targetLocal, lerpSpeed);
      
      tempObj.position.copy(p.currentPos);
      
      // Shimmer effect
      if (!isExploded) {
        tempObj.position.x += Math.sin(time * p.speed + i) * 0.002;
        tempObj.position.y += Math.cos(time * p.speed + i) * 0.002;
      } else {
        tempObj.position.x += Math.sin(time * 0.6 + i) * 0.008;
        tempObj.position.y += Math.cos(time * 0.6 + i) * 0.008;
      }
      
      tempObj.scale.setScalar(p.scale * pulse);
      tempObj.rotation.set(time * p.speed, time * 0.4, i);
      tempObj.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObj.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;

    if (lightRef.current) {
      // Light is more focused when tree is assembled
      lightRef.current.intensity = isExploded ? 15 : (120 + Math.sin(time * 5) * 50);
    }
  });

  const starParticleGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[starParticleGeo, undefined, particles.length]}>
        <meshStandardMaterial 
          color="#FFE5B4" 
          emissive="#FFD700" 
          emissiveIntensity={18} 
          metalness={1} 
          roughness={0.0} 
        />
      </instancedMesh>
      
      {/* Subtle core glow sparkles */}
      {!isExploded && (
        <Sparkles count={30} scale={0.8} size={2} speed={0.6} color="#FFD700" />
      )}
      
      <pointLight ref={lightRef} distance={7} color="#FFD700" intensity={100} />
    </group>
  );
};

export default TreeTopStar;
