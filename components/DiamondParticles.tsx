
import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ParticleData } from '../types';

interface DiamondParticlesProps {
  isExploded: boolean;
}

const DiamondParticles: React.FC<DiamondParticlesProps> = ({ isExploded }) => {
  // Counts for various particle types
  const leafCount = 5000; 
  const heartCount = 4500;
  const decoCount = 160;
  const ribbonCount = 2500;
  
  const particles = useMemo(() => {
    const items: ParticleData[] = [];
    let id = 0;

    // 1. Generate Tree Leaves (Faceted Diamond Dust)
    for (let i = 0; i < leafCount; i++) {
      const height = Math.pow(Math.random(), 1.4) * 9.2; 
      const baseRadius = (1 - height / 9.6) * 3.5;
      const radius = baseRadius * (0.8 + Math.random() * 0.2); 
      const angle = Math.random() * Math.PI * 2;
      
      const treeX = Math.cos(angle) * radius;
      const treeZ = Math.sin(angle) * radius;
      const treeY = height;

      let color = '#FFB7C5';
      const rand = Math.random();
      if (rand > 0.65) color = '#FF69B4'; 
      else if (rand > 0.3) color = '#FFB7C5'; 
      else if (rand > 0.1) color = '#FFC0CB'; 
      else color = '#F48FB1'; 

      items.push({
        id: id++,
        treePosition: new THREE.Vector3(treeX, treeY, treeZ),
        explodePosition: new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20 + 4,
          (Math.random() - 0.5) * 20
        ),
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
        scale: 0.017 + Math.random() * 0.022,
        type: 'leaf',
        color: color
      });
    }

    // 2. Generate Diamond Hearts (Multi-faceted Pink Hearts)
    for (let i = 0; i < heartCount; i++) {
      const height = Math.pow(Math.random(), 1.4) * 8.5;
      const baseRadius = (1 - height / 9.6) * 3.3;
      const radius = baseRadius * (0.7 + Math.random() * 0.3); 
      const angle = Math.random() * Math.PI * 2;

      let color = '#FFB7C5';
      if (i % 3 === 0) color = '#FF69B4';
      if (i % 5 === 0) color = '#FF1493';

      items.push({
        id: id++,
        treePosition: new THREE.Vector3(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ),
        explodePosition: new THREE.Vector3(
          (Math.random() - 0.5) * 22,
          (Math.random() - 0.5) * 22 + 4,
          (Math.random() - 0.5) * 22
        ),
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
        scale: 0.03 + Math.random() * 0.04,
        type: 'heart',
        color: color
      });
    }

    // 3. Decorations (Cubes/Icos)
    for (let i = 0; i < decoCount; i++) {
      const height = Math.random() * 8.8;
      const baseRadius = (1 - height / 9.6) * 3.2;
      const radius = baseRadius * (0.5 + Math.random() * 0.5); 
      const angle = Math.random() * Math.PI * 2;
      
      items.push({
        id: id++,
        treePosition: new THREE.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius),
        explodePosition: new THREE.Vector3((Math.random() - 0.5) * 25, (Math.random() - 0.5) * 25 + 4, (Math.random() - 0.5) * 25),
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
        scale: 0.04 + Math.random() * 0.035,
        type: i % 2 === 0 ? 'deco_cube' : 'deco_ico',
        color: i % 3 === 0 ? '#FFFFFF' : '#F8C8DC'
      });
    }

    // 4. Ribbon Stardust
    for (let i = 0; i < ribbonCount; i++) {
      const t = i / ribbonCount;
      const spiralHeight = t * 9.4; 
      const spiralRadius = (1 - spiralHeight / 10.5) * 4.2 + 0.6;
      const spiralAngle = t * Math.PI * 6.0; // Exactly 3 turns
      const jitter = 0.12; 
      
      items.push({
        id: id++,
        treePosition: new THREE.Vector3(
          Math.cos(spiralAngle) * spiralRadius + (Math.random() - 0.5) * jitter,
          spiralHeight + (Math.random() - 0.5) * jitter,
          Math.sin(spiralAngle) * spiralRadius + (Math.random() - 0.5) * jitter
        ),
        explodePosition: new THREE.Vector3((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30 + 4, (Math.random() - 0.5) * 30),
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
        scale: 0.005 + Math.random() * 0.008,
        type: 'ribbon',
        color: '#FFFFFF',
        spiralT: t
      });
    }

    return items;
  }, []);

  const leafMeshRef = useRef<THREE.InstancedMesh>(null!);
  const heartMeshRef = useRef<THREE.InstancedMesh>(null!);
  const cubeMeshRef = useRef<THREE.InstancedMesh>(null!);
  const icoMeshRef = useRef<THREE.InstancedMesh>(null!);
  const ribbonMeshRef = useRef<THREE.InstancedMesh>(null!);

  const tempObj = new THREE.Object3D();
  const tempColor = new THREE.Color();
  const currentPositions = useRef<THREE.Vector3[]>(particles.map(p => p.treePosition.clone()));

  // Initialize ribbon colors to avoid black flash
  useEffect(() => {
    if (ribbonMeshRef.current) {
      for (let i = 0; i < ribbonCount; i++) {
        ribbonMeshRef.current.setColorAt(i, new THREE.Color('#FFFFFF'));
      }
      ribbonMeshRef.current.instanceColor!.needsUpdate = true;
    }
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const lerpSpeed = isExploded ? 0.04 : 0.07;

    let cubeIdx = 0;
    let icoIdx = 0;
    let leafIdx = 0;
    let heartIdx = 0;
    let ribbonIdx = 0;

    particles.forEach((p, i) => {
      const target = isExploded ? p.explodePosition : p.treePosition;
      currentPositions.current[i].lerp(target, lerpSpeed);
      tempObj.position.copy(currentPositions.current[i]);
      
      if (p.type === 'ribbon' || isExploded) {
        tempObj.position.x += Math.sin(time * 0.5 + p.id) * 0.04;
        tempObj.position.y += Math.cos(time * 0.8 + p.id) * 0.04;
      }
      
      tempObj.rotation.set(
        p.rotation.x + time * (p.type === 'ribbon' ? 1.5 : 0.5),
        p.rotation.y + time * 0.3,
        p.rotation.z
      );
      tempObj.scale.setScalar(p.scale);
      tempObj.updateMatrix();

      if (p.type === 'leaf') {
        leafMeshRef.current.setMatrixAt(leafIdx++, tempObj.matrix);
      } else if (p.type === 'heart') {
        heartMeshRef.current.setMatrixAt(heartIdx++, tempObj.matrix);
      } else if (p.type === 'deco_cube') {
        cubeMeshRef.current.setMatrixAt(cubeIdx++, tempObj.matrix);
      } else if (p.type === 'deco_ico') {
        icoMeshRef.current.setMatrixAt(icoIdx++, tempObj.matrix);
      } else if (p.type === 'ribbon') {
        // Flowing glow effect for ribbon
        if (!isExploded) {
          // Traveling wave: sin(t * frequency - time * speed)
          const wave = Math.sin((p.spiralT || 0) * 12 - time * 3) * 0.5 + 0.5;
          const brightness = 1 + Math.pow(wave, 6) * 15; // Sharp bright peak
          tempColor.setRGB(brightness, brightness, brightness);
          ribbonMeshRef.current.setColorAt(ribbonIdx, tempColor);
        } else {
          // Fade to standard white when exploded
          tempColor.setRGB(1, 1, 1);
          ribbonMeshRef.current.setColorAt(ribbonIdx, tempColor);
        }
        ribbonMeshRef.current.setMatrixAt(ribbonIdx++, tempObj.matrix);
      }
    });

    leafMeshRef.current.instanceMatrix.needsUpdate = true;
    heartMeshRef.current.instanceMatrix.needsUpdate = true;
    cubeMeshRef.current.instanceMatrix.needsUpdate = true;
    icoMeshRef.current.instanceMatrix.needsUpdate = true;
    ribbonMeshRef.current.instanceMatrix.needsUpdate = true;
    if (ribbonMeshRef.current.instanceColor) {
      ribbonMeshRef.current.instanceColor.needsUpdate = true;
    }
  });

  const leafGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  const cubeGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const icoGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 1), []);
  const tetraGeo = useMemo(() => new THREE.TetrahedronGeometry(1, 0), []);
  
  const heartGeo = useMemo(() => {
    const hShape = new THREE.Shape();
    hShape.moveTo(0, -0.4);
    hShape.lineTo(0.6, 0.2);
    hShape.lineTo(0.4, 0.6);
    hShape.lineTo(0, 0.25);
    hShape.lineTo(-0.4, 0.6);
    hShape.lineTo(-0.6, 0.2);
    hShape.closePath();
    
    const extrudeSettings = { 
      depth: 0.45, 
      bevelEnabled: true, 
      bevelThickness: 0.25, 
      bevelSize: 0.15, 
      bevelSegments: 1 
    };
    return new THREE.ExtrudeGeometry(hShape, extrudeSettings);
  }, []);

  const diamondMaterial = (color: string) => (
    <meshPhysicalMaterial 
      color={color}
      metalness={0.9}
      roughness={0.05}
      transmission={0.4}
      thickness={1}
      envMapIntensity={2}
      emissive={color}
      emissiveIntensity={0.2}
    />
  );

  return (
    <group>
      <instancedMesh ref={leafMeshRef} args={[leafGeo, undefined, leafCount]}>
        {diamondMaterial('#FF69B4')}
      </instancedMesh>
      
      <instancedMesh ref={heartMeshRef} args={[heartGeo, undefined, heartCount]}>
        {diamondMaterial('#FFB7C5')}
      </instancedMesh>

      <instancedMesh ref={cubeMeshRef} args={[cubeGeo, undefined, decoCount / 2]}>
        {diamondMaterial('#FFFFFF')}
      </instancedMesh>

      <instancedMesh ref={icoMeshRef} args={[icoGeo, undefined, decoCount / 2]}>
        {diamondMaterial('#E0B0FF')}
      </instancedMesh>

      <instancedMesh ref={ribbonMeshRef} args={[tetraGeo, undefined, ribbonCount]}>
        <meshStandardMaterial 
          color="#FFFFFF" 
          emissive="#FFFFFF" 
          emissiveIntensity={1} 
          transparent
          opacity={0.8}
        />
      </instancedMesh>
    </group>
  );
};

export default DiamondParticles;
