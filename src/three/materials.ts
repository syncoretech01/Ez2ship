import * as THREE from 'three';

const physical = (p: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial(p);
const standard = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p);

export type Paint = 'blue' | 'navy' | 'pearl' | 'silver' | 'graphite' | 'sand' | 'red';

export const paints: Record<Paint, THREE.MeshPhysicalMaterial> = {
  blue: physical({ color: '#2446f5', metalness: 0.5, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.06 }),
  navy: physical({ color: '#101d42', metalness: 0.55, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 }),
  pearl: physical({ color: '#f4f3ef', metalness: 0.2, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08 }),
  silver: physical({ color: '#b8bdc6', metalness: 0.85, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 }),
  graphite: physical({ color: '#3a3f4c', metalness: 0.65, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.08 }),
  sand: physical({ color: '#cdbfa6', metalness: 0.3, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.1 }),
  red: physical({ color: '#b3261e', metalness: 0.4, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06 }),
};

export const M = {
  glass: physical({ color: '#0c1426', metalness: 0.85, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.02 }),
  tire: standard({ color: '#16181d', roughness: 0.82, metalness: 0 }),
  rim: standard({ color: '#d9dce1', roughness: 0.22, metalness: 1 }),
  chrome: standard({ color: '#eef0f3', roughness: 0.12, metalness: 1 }),
  steel: standard({ color: '#9aa1ac', roughness: 0.38, metalness: 0.85 }),
  steelDark: standard({ color: '#4a505c', roughness: 0.5, metalness: 0.75 }),
  trim: standard({ color: '#1b1f28', roughness: 0.6, metalness: 0.2 }),
  headlight: standard({ color: '#ffffff', emissive: '#e9efff', emissiveIntensity: 1.6, roughness: 0.2 }),
  taillight: standard({ color: '#ff2d2d', emissive: '#ff2020', emissiveIntensity: 1.2, roughness: 0.3 }),
  clay: standard({ color: '#f1ede5', roughness: 0.95, metalness: 0 }),
  clay2: standard({ color: '#e4dfd4', roughness: 0.95, metalness: 0 }),
  clay3: standard({ color: '#d7d1c4', roughness: 0.95, metalness: 0 }),
  road: standard({ color: '#d8d2c6', roughness: 1, metalness: 0 }),
  roadLine: standard({ color: '#ffffff', roughness: 0.8, metalness: 0 }),
  water: physical({ color: '#8fa3c9', roughness: 0.18, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.12 }),
  blueMatte: standard({ color: '#2446f5', roughness: 0.55, metalness: 0.1 }),
  navyMatte: standard({ color: '#14224a', roughness: 0.6, metalness: 0.1 }),
  accentGlow: standard({ color: '#2446f5', emissive: '#2446f5', emissiveIntensity: 0.9, roughness: 0.4 }),
};
