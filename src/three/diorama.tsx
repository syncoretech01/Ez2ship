import { forwardRef, useLayoutEffect, useMemo, useRef } from 'react';
import type { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { M } from './materials';
import { box, merge, place, rbox, cyl } from './geometry';

type GroupProps = ThreeElements['group'];

/** Deterministic PRNG so the diorama is identical on every visit. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Inst {
  p: [number, number, number];
  s?: [number, number, number];
  r?: number;
  c?: string;
}

/** A single InstancedMesh built once from a list of transforms. */
export function Scatter({
  items,
  geometry,
  material,
  shadows = false,
}: {
  items: Inst[];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  shadows?: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const d = new THREE.Object3D();
    const col = new THREE.Color();
    items.forEach((it, i) => {
      d.position.set(...it.p);
      d.rotation.set(0, it.r ?? 0, 0);
      d.scale.set(...(it.s ?? [1, 1, 1]));
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
      if (it.c) m.setColorAt(i, col.set(it.c));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
  }, [items]);
  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, items.length]}
      castShadow={shadows}
      receiveShadow={shadows}
    />
  );
}

/* ---------- Shared geometries ---------- */

export const G = {
  unitBox: new THREE.BoxGeometry(1, 1, 1),
  canopy: new THREE.IcosahedronGeometry(1, 1),
  trunk: new THREE.CylinderGeometry(0.14, 0.2, 1, 6),
  cone: new THREE.ConeGeometry(1, 1, 7),
  pole: merge([place(box(0.16, 7, 0.16), [0, 3.5, 0]), place(box(1.8, 0.12, 0.2), [0.8, 6.95, 0]), place(box(0.5, 0.08, 0.28), [1.6, 6.86, 0])]),
  hill: new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
  container: rbox(6.06, 2.6, 2.44, 0.06),
};

/* ---------- Materials that need instance colors ---------- */

export const IM = {
  canopy: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.95, flatShading: true }),
  box: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 }),
  container: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6, metalness: 0.2 }),
  tower: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.7, metalness: 0.1 }),
};

/* ---------- House ---------- */

export function House({ variant = 0, ...props }: GroupProps & { variant?: number }) {
  const geo = useMemo(() => {
    const clay = merge([
      place(rbox(11, 3.4, 7.5, 0.1), [0, 1.7, 0]),
      place(rbox(8, 3.2, 8.5, 0.1), [variant ? 2 : -1.5, 5, variant ? -0.4 : 0.5]),
      place(box(12.6, 0.24, 8.6), [0, 3.45, 0]),
      place(box(9, 0.24, 9.6), [variant ? 2 : -1.5, 6.7, variant ? -0.4 : 0.5]),
      place(box(1.2, 3.4, 1.2), [5.3, 1.7, 4.5]),
    ]);
    const glass = merge([
      place(box(6, 2.2, 0.08), [-1.6, 1.6, 3.79]),
      place(box(5.2, 1.8, 0.08), [variant ? 2.4 : -1.2, 5.1, variant ? 3.87 : 4.77]),
      place(box(0.08, 2.2, 3), [5.51, 1.6, 0]),
    ]);
    const slab = merge([place(box(4.2, 0.08, 20), [3.2, 0.04, 13])]);
    return { clay, glass, slab };
  }, [variant]);
  return (
    <group {...props}>
      <mesh geometry={geo.clay} material={M.clay} castShadow receiveShadow />
      <mesh geometry={geo.glass} material={M.glass} />
      <mesh geometry={geo.slab} material={M.clay2} receiveShadow />
    </group>
  );
}

/* ---------- Gantry crane with a trolley + spreader ---------- */

export interface CraneHandle {
  group: THREE.Group;
  trolley: THREE.Group;
  cable: THREE.Mesh;
  spreader: THREE.Group;
}

export const Crane = forwardRef<THREE.Group, GroupProps>(function Crane(props, ref) {
  const geo = useMemo(() => {
    const frame = merge([
      place(box(0.7, 22, 0.7), [-4, 11, 4]),
      place(box(0.7, 22, 0.7), [4, 11, 4]),
      place(box(0.7, 22, 0.7), [-4, 11, -6]),
      place(box(0.7, 22, 0.7), [4, 11, -6]),
      place(box(9, 0.8, 0.8), [0, 8, 4]),
      place(box(9, 0.8, 0.8), [0, 8, -6]),
      place(box(9.4, 1.2, 1.4), [0, 22.8, 4]),
      place(box(9.4, 1.2, 1.4), [0, 22.8, -6]),
      place(box(4.5, 3.2, 5), [0, 25.4, 6.5]),
    ]);
    const accent = merge([
      place(box(1.2, 1.4, 34), [-4, 22.8, -8]),
      place(box(1.2, 1.4, 34), [4, 22.8, -8]),
      place(box(9.4, 1, 1.2), [0, 22.8, -24.4]),
      place(box(9.6, 0.5, 1.6), [0, 8.6, 4]),
      place(box(9.6, 0.5, 1.6), [0, 8.6, -6]),
    ]);
    return { frame, accent };
  }, []);
  return (
    <group ref={ref} {...props}>
      <mesh geometry={geo.frame} material={M.clay} castShadow />
      <mesh geometry={geo.accent} material={M.blueMatte} castShadow />
      <group name="trolley" position={[0, 22, 0]}>
        <mesh material={M.steelDark} geometry={G.unitBox} scale={[8.6, 1.2, 3]} />
        <mesh name="cable" material={M.steelDark} position={[0, -5, 0]} scale={[0.08, 10, 0.08]} geometry={G.unitBox} />
        <group name="spreader" position={[0, -10, 0]}>
          <mesh material={M.blueMatte} geometry={G.unitBox} scale={[5.6, 0.3, 2.6]} castShadow />
          <mesh material={M.steelDark} geometry={G.unitBox} scale={[0.06, 2, 0.06]} position={[2.3, -1, 1]} />
          <mesh material={M.steelDark} geometry={G.unitBox} scale={[0.06, 2, 0.06]} position={[-2.3, -1, 1]} />
          <mesh material={M.steelDark} geometry={G.unitBox} scale={[0.06, 2, 0.06]} position={[2.3, -1, -1]} />
          <mesh material={M.steelDark} geometry={G.unitBox} scale={[0.06, 2, 0.06]} position={[-2.3, -1, -1]} />
        </group>
      </group>
    </group>
  );
});

/** Position the crane trolley (world z) and hang the spreader to world height y. */
export function driveCrane(crane: THREE.Group | null, worldZ: number, worldY: number) {
  if (!crane) return;
  const trolley = crane.getObjectByName('trolley') as THREE.Group | undefined;
  const cable = crane.getObjectByName('cable') as THREE.Mesh | undefined;
  const spreader = crane.getObjectByName('spreader') as THREE.Group | undefined;
  if (!trolley || !cable || !spreader) return;
  const localZ = worldZ - crane.position.z;
  trolley.position.z = localZ;
  const drop = Math.max(0.5, 22 - (worldY - crane.position.y));
  spreader.position.y = -drop;
  cable.scale.y = drop;
  cable.position.y = -drop / 2;
}

/* ---------- Ship ---------- */

export const Ship = forwardRef<THREE.Group, GroupProps & { seed?: number }>(function Ship({ seed = 7, ...props }, ref) {
  const { hull, deck, house, windows, containers } = useMemo(() => {
    const hs = new THREE.Shape();
    hs.moveTo(-28, -6);
    hs.lineTo(20, -6);
    hs.quadraticCurveTo(28, -6, 32, 0);
    hs.quadraticCurveTo(28, 6, 20, 6);
    hs.lineTo(-28, 6);
    hs.lineTo(-28, -6);
    const hullGeo = new THREE.ExtrudeGeometry(hs, { depth: 5.2, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3, bevelSegments: 2 });
    hullGeo.rotateX(-Math.PI / 2);
    hullGeo.translate(0, -2.2, 0);
    const deckGeo = merge([place(box(58, 0.2, 11.6), [1, 3.1, 0])]);
    const houseGeo = merge([
      place(rbox(8, 7, 11, 0.2), [-22, 6.6, 0]),
      place(rbox(6, 2.4, 12.6, 0.15), [-21.5, 11.2, 0]),
      place(cyl(0.9, 4, 12), [-25, 11.5, 0]),
    ]);
    const winGeo = merge([place(box(0.1, 1, 10), [-17.95, 9, 0]), place(box(0.1, 0.8, 12), [-18.45, 11.4, 0])]);
    const r = rng(seed);
    const cols = ['#14224a', '#2446f5', '#e9e5dc', '#9aa1ac', '#cdbfa6', '#1c2f60'];
    const items: Inst[] = [];
    for (let bx = -12; bx <= 22; bx += 6.3) {
      if (bx > -8 && bx < -3) continue; // open bay for the vehicle
      for (let bz = -4.6; bz <= 4.7; bz += 2.5) {
        const h = 1 + Math.floor(r() * 3);
        for (let k = 0; k < h; k++) items.push({ p: [bx, 4.5 + k * 2.62, bz], c: cols[Math.floor(r() * cols.length)] });
      }
    }
    return { hull: hullGeo, deck: deckGeo, house: houseGeo, windows: winGeo, containers: items };
  }, [seed]);
  return (
    <group ref={ref} {...props}>
      <mesh geometry={hull} material={M.navyMatte} castShadow receiveShadow />
      <mesh geometry={deck} material={M.clay3} receiveShadow />
      <mesh geometry={house} material={M.clay} castShadow />
      <mesh geometry={windows} material={M.glass} />
      <Scatter items={containers} geometry={G.container} material={IM.container} />
    </group>
  );
});

/* ---------- Generators ---------- */

export function makeTrees(seed: number, zones: { x0: number; x1: number; z0: number; z1: number; n: number }[]) {
  const r = rng(seed);
  const canopies: Inst[] = [];
  const trunks: Inst[] = [];
  const tones = ['#e7e2d7', '#dcd6c9', '#d2cbbb', '#ece8df'];
  for (const zn of zones) {
    for (let i = 0; i < zn.n; i++) {
      const x = zn.x0 + r() * (zn.x1 - zn.x0);
      const z = zn.z0 + r() * (zn.z1 - zn.z0);
      const s = 1.1 + r() * 1.4;
      const h = 1.4 + r() * 1.2;
      trunks.push({ p: [x, h / 2, z], s: [1, h, 1] });
      canopies.push({ p: [x, h + s * 0.8, z], s: [s, s * 1.15, s], r: r() * 6, c: tones[Math.floor(r() * tones.length)] });
    }
  }
  return { canopies, trunks };
}

export function makeContainers(seed: number, x0: number, x1: number, z0: number, z1: number, maxH = 4) {
  const r = rng(seed);
  const cols = ['#14224a', '#2446f5', '#e9e5dc', '#9aa1ac', '#cdbfa6', '#1c2f60', '#dcd6c9'];
  const items: Inst[] = [];
  for (let x = x0; x < x1; x += 6.6) {
    for (let z = z0; z < z1; z += 2.9) {
      if (r() < 0.18) continue;
      const h = 1 + Math.floor(r() * maxH);
      for (let k = 0; k < h; k++) items.push({ p: [x, 1.3 + k * 2.62, z], c: cols[Math.floor(r() * cols.length)] });
    }
  }
  return items;
}

export function makeTowers(seed: number, zones: { x0: number; x1: number; z0: number; z1: number; n: number; hMax: number }[]) {
  const r = rng(seed);
  const items: Inst[] = [];
  const tones = ['#f1ede5', '#e4dfd4', '#d7d1c4', '#eceae6', '#c9ced9'];
  for (const zn of zones) {
    for (let i = 0; i < zn.n; i++) {
      const w = 6 + r() * 8;
      const d = 6 + r() * 8;
      const h = 8 + Math.pow(r(), 1.6) * zn.hMax;
      const x = zn.x0 + r() * (zn.x1 - zn.x0);
      const z = zn.z0 + r() * (zn.z1 - zn.z0);
      const blue = r() < 0.14;
      items.push({ p: [x, h / 2, z], s: [w, h, d], c: blue ? '#9fb0e8' : tones[Math.floor(r() * tones.length)] });
    }
  }
  return items;
}
