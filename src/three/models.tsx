import { forwardRef, useMemo, useRef, type MutableRefObject, type Ref } from 'react';
import { useFrame, type ThreeElements } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { carGeometry, carrierGeometry, enclosedShellGeometry, cyl, box, merge, place, type CarKind } from './geometry';
import { M, paints, type Paint } from './materials';

type GroupProps = ThreeElements['group'];

/* ------------------------------------------------------------------ */

export const Car = forwardRef<THREE.Group, GroupProps & { kind?: CarKind; paint?: Paint; shadows?: boolean; bodyMaterial?: THREE.Material }>(
  function Car({ kind = 'sedan', paint = 'blue', shadows = true, bodyMaterial, ...props }, ref) {
    const g = carGeometry(kind);
    return (
      <group ref={ref} {...props}>
        <mesh geometry={g.body} material={bodyMaterial ?? paints[paint]} castShadow={shadows} receiveShadow={shadows} />
        <mesh geometry={g.glass} material={M.glass} castShadow={shadows} />
        <mesh geometry={g.tires} material={M.tire} castShadow={shadows} />
        <mesh geometry={g.rims} material={M.rim} />
        <mesh geometry={g.trim} material={M.trim} />
        <mesh geometry={g.head} material={M.headlight} />
        <mesh geometry={g.tail} material={M.taillight} />
      </group>
    );
  },
);

/* ------------------------------------------------------------------ */

const wheelCache = new Map<string, { tire: THREE.BufferGeometry; rim: THREE.BufferGeometry; lugs: THREE.BufferGeometry }>();
function wheelGeo(r: number, w: number, side: 1 | -1) {
  const key = `${r}-${w}-${side}`;
  const hit = wheelCache.get(key);
  if (hit) return hit;
  const tire = place(cyl(r, w, 28), [0, 0, 0], [Math.PI / 2, 0, 0]);
  const rim = place(cyl(r * 0.62, 0.03, 24), [0, 0, (side * w) / 2 + side * 0.01], [Math.PI / 2, 0, 0]);
  const lugParts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    lugParts.push(place(box(0.07, 0.07, 0.05), [Math.cos(a) * r * 0.36, Math.sin(a) * r * 0.36, (side * w) / 2 + side * 0.03]));
  }
  lugParts.push(place(cyl(r * 0.16, 0.06, 12), [0, 0, (side * w) / 2 + side * 0.03], [Math.PI / 2, 0, 0]));
  const v = { tire, rim, lugs: merge(lugParts) };
  wheelCache.set(key, v);
  return v;
}

export type Load = ({ kind: CarKind; paint: Paint } | null)[];

export const DEFAULT_LOAD: Load = [
  { kind: 'sedan', paint: 'pearl' },
  { kind: 'suv', paint: 'graphite' },
  { kind: 'sedan', paint: 'silver' },
  { kind: 'coupe', paint: 'blue' },
  { kind: 'sedan', paint: 'navy' },
  { kind: 'suv', paint: 'pearl' },
  { kind: 'coupe', paint: 'silver' },
];

interface CarrierProps extends Omit<GroupProps, 'ref'> {
  load?: Load;
  /** wheel angular speed in rad/s */
  spin?: MutableRefObject<number>;
  ramps?: boolean;
  rampRef?: Ref<THREE.Mesh>;
  shadows?: boolean;
  cabPaint?: Paint;
}

export const Carrier = forwardRef<THREE.Group, CarrierProps>(function Carrier(
  { load = DEFAULT_LOAD, spin, ramps = false, rampRef, shadows = true, cabPaint = 'navy', ...props },
  ref,
) {
  const g = carrierGeometry();
  const wheels = useRef<(THREE.Group | null)[]>([]);
  useFrame((_, dt) => {
    const s = spin?.current ?? 0;
    if (!s) return;
    for (const w of wheels.current) if (w) w.rotation.z -= s * Math.min(dt, 0.05);
  });
  return (
    <group ref={ref} {...props}>
      <mesh geometry={g.paint} material={paints[cabPaint]} castShadow={shadows} receiveShadow={shadows} />
      <mesh geometry={g.chrome} material={M.chrome} castShadow={shadows} />
      <mesh geometry={g.steel} material={M.steel} castShadow={shadows} receiveShadow={shadows} />
      <mesh geometry={g.steelDark} material={M.steelDark} castShadow={shadows} receiveShadow={shadows} />
      <mesh geometry={g.glass} material={M.glass} />
      <mesh geometry={g.head} material={M.headlight} />
      <mesh geometry={g.tail} material={M.taillight} />
      {ramps && <mesh ref={rampRef} geometry={g.ramps} material={M.steelDark} castShadow={shadows} />}
      {g.wheels.map((w, i) => {
        const wg = wheelGeo(w.r, w.w, w.z > 0 ? 1 : -1);
        return (
          <group key={i} position={[w.x, w.y, w.z]} ref={(el) => {
            wheels.current[i] = el;
          }}>
            <mesh geometry={wg.tire} material={M.tire} castShadow={shadows} />
            <mesh geometry={wg.rim} material={M.rim} />
            <mesh geometry={wg.lugs} material={M.steelDark} />
          </group>
        );
      })}
      {g.slots.map((slot, i) => {
        const c = load[i];
        if (!c) return null;
        return (
          <Car key={i} kind={c.kind} paint={c.paint} shadows={shadows} position={[slot.x, slot.y, 0]} rotation={[0, 0, slot.tilt]} />
        );
      })}
    </group>
  );
});

/* ------------------------------------------------------------------ */

export function EnclosedShell({
  shellMaterial,
  ribMaterial,
  ...props
}: GroupProps & { shellMaterial: THREE.Material; ribMaterial: THREE.Material }) {
  const g = enclosedShellGeometry();
  return (
    <group {...props}>
      <mesh geometry={g.shell} material={shellMaterial} castShadow receiveShadow />
      <mesh geometry={g.ribs} material={ribMaterial} />
    </group>
  );
}

/* ------------------------------------------------------------------ */

/** Studio lighting: soft key + hemisphere, and an in-scene environment of light strips for reflections. */
export function Studio({
  shadows = false,
  intensity = 1,
  shadowArea = 30,
  envTint = '#5c6270',
}: {
  shadows?: boolean;
  intensity?: number;
  shadowArea?: number;
  envTint?: string;
}) {
  const light = useRef<THREE.DirectionalLight>(null);
  const shadowCam = useMemo(() => {
    const s = shadowArea / 2;
    return { left: -s, right: s, top: s, bottom: -s };
  }, [shadowArea]);
  return (
    <>
      <hemisphereLight args={['#ffffff', '#d9d1c1', 0.85 * intensity]} />
      <directionalLight
        ref={light}
        position={[10, 18, 8]}
        intensity={1.5 * intensity}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={shadowCam.left}
        shadow-camera-right={shadowCam.right}
        shadow-camera-top={shadowCam.top}
        shadow-camera-bottom={shadowCam.bottom}
        shadow-camera-near={1}
        shadow-camera-far={60}
      />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={[envTint]} />
        <Lightformer form="rect" intensity={3} position={[0, 10, 0]} rotation-x={Math.PI / 2} scale={[40, 8, 1]} />
        <Lightformer form="rect" intensity={2.2} position={[-12, 3, 8]} rotation-y={Math.PI / 3} scale={[18, 2.5, 1]} />
        <Lightformer form="rect" intensity={2.2} position={[12, 4, -8]} rotation-y={-Math.PI / 1.6} scale={[18, 2.5, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[0, 2, 14]} scale={[30, 1.2, 1]} />
        <Lightformer form="ring" color="#9fb0ff" intensity={1.2} position={[-6, 6, -12]} scale={5} />
        <Lightformer form="rect" color="#f3efe6" intensity={0.8} position={[0, -4, 0]} rotation-x={-Math.PI / 2} scale={[40, 40, 1]} />
      </Environment>
    </>
  );
}
