
import * as THREE from 'three';

export interface ParticleData {
  id: number;
  treePosition: THREE.Vector3;
  explodePosition: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  type: 'leaf' | 'heart' | 'deco_cube' | 'deco_ico' | 'ribbon';
  color: string;
  spiralT?: number; // Normalized progress along the spiral (0 to 1)
}
