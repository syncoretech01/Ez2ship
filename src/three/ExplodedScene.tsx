import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Studio } from './models';
import { carGeometry, cyl, place } from './geometry';
import { M, paints } from './materials';
import { pointer } from '../lib/pointer';
import { prefersReducedMotion } from '../lib/env';

export interface ExplodeState {
  p: number;
}

/** Anchor points (in exploded space) for each quote-field label, in label order. */
export const EXPLODE_LABELS = [
  'Pickup location',
  'Delivery location',
  'Year, make & model',
  'Running or not',
  'Open or enclosed',
  'First available date',
  'Your contact details',
] as const;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function ExplodedScene({
  state,
  labels,
}: {
  state: MutableRefObject<ExplodeState>;
  labels: MutableRefObject<(HTMLDivElement | null)[]>;
}) {
  const g = carGeometry('coupe');
  const s = g.spec;
  const { camera, size } = useThree();
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const body = useRef<THREE.Mesh>(null);
  const glass = useRef<THREE.Mesh>(null);
  const trim = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Mesh>(null);
  const tail = useRef<THREE.Mesh>(null);
  const wheels = useRef<(THREE.Group | null)[]>([]);
  const root = useRef<THREE.Group>(null);

  const wheelGeo = useMemo(
    () => ({
      tire: place(cyl(s.wheelR, 0.26, 32), [0, 0, 0], [Math.PI / 2, 0, 0]),
      rim: place(cyl(s.wheelR * 0.64, 0.28, 24), [0, 0, 0], [Math.PI / 2, 0, 0]),
    }),
    [s.wheelR],
  );
  const wheelPos = useMemo(
    () =>
      [
        [-s.wb / 2, 1],
        [-s.wb / 2, -1],
        [s.wb / 2, 1],
        [s.wb / 2, -1],
      ] as const,
    [s.wb],
  );

  const tmp = useMemo(() => ({ v: new THREE.Vector3(), sm: { p: 0, mx: 0, my: 0 } }), []);

  useFrame((st, dt) => {
    const t = tmp;
    t.sm.p += (state.current.p - t.sm.p) * Math.min(1, dt * 6);
    const e = easeInOut(Math.min(1, t.sm.p * 1.25));
    const time = st.clock.elapsedTime;
    const narrow = size.width < 760;

    if (body.current) body.current.position.y = e * 1.1;
    if (glass.current) glass.current.position.y = e * 2.5;
    if (trim.current) trim.current.position.y = -e * 0.9;
    if (head.current) head.current.position.x = e * 1.2;
    if (tail.current) tail.current.position.x = -e * 1.2;
    wheels.current.forEach((w, i) => {
      if (!w) return;
      const [x, side] = wheelPos[i];
      w.position.set(x * (1 + e * 0.35), s.wheelR - e * 0.1, side * (s.W / 2 - 0.2 + e * 1.7));
      w.rotation.set(0, 0, reduced ? 0 : -time * 0.6 * e);
    });

    t.sm.mx += ((reduced ? 0 : pointer.nx) - t.sm.mx) * Math.min(1, dt * 2.5);
    t.sm.my += ((reduced ? 0 : pointer.ny) - t.sm.my) * Math.min(1, dt * 2.5);
    const ang = 0.72 + t.sm.p * 0.55 + t.sm.mx * 0.25;
    const dist = narrow ? 21 : 12.5;
    camera.position.set(Math.cos(ang) * dist, 4.2 + e * 1.4 + t.sm.my * 0.8, Math.sin(ang) * dist);
    camera.lookAt(0, 1.1 + e * 0.5, 0);
    const cam = camera as THREE.PerspectiveCamera;
    const W = size.width;
    const H = size.height;
    const ox = narrow ? 0 : -0.14 * W;
    const oy = narrow ? 0.12 * H : 0.02 * H;
    const v = cam.view;
    if (!v || v.fullWidth !== W || v.fullHeight !== H || v.offsetX !== ox || v.offsetY !== oy) cam.setViewOffset(W, H, ox, oy, W, H);

    // Project label anchors into screen space.
    const anchors: [number, number, number][] = [
      [-s.L / 2 - 0.1 - e * 1.2, s.tailH - 0.1, 0],
      [s.L / 2 + 0.1 + e * 1.2, s.noseH - 0.1, 0],
      [0.6, s.belt + e * 1.1, s.W / 2],
      [s.wb / 2 * (1 + e * 0.35), s.wheelR, s.W / 2 - 0.2 + e * 1.7 + 0.15],
      [-0.2, s.roof + e * 2.5, 0],
      [-s.wb / 2 * (1 + e * 0.35), s.wheelR, s.W / 2 - 0.2 + e * 1.7 + 0.15],
      [0, s.yb - e * 0.9, s.W / 2],
    ];
    anchors.forEach((a, i) => {
      const el = labels.current[i];
      if (!el) return;
      t.v.set(...a);
      root.current?.localToWorld(t.v);
      t.v.project(camera);
      let x = ((t.v.x + 1) / 2) * size.width;
      const y = ((1 - t.v.y) / 2) * size.height;
      if (narrow) x = Math.min(Math.max(x, 12), size.width - 190);
      const show = Math.min(1, Math.max(0, (t.sm.p - 0.18 - i * 0.07) / 0.12));
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.style.opacity = String(show);
    });
  });

  return (
    <>
      <Studio />
      <group ref={root}>
        <mesh ref={body} geometry={g.body} material={paints.blue} />
        <mesh ref={glass} geometry={g.glass} material={M.glass} />
        <mesh ref={trim} geometry={g.trim} material={M.trim} />
        <mesh ref={head} geometry={g.head} material={M.headlight} />
        <mesh ref={tail} geometry={g.tail} material={M.taillight} />
        {wheelPos.map(([x, side], i) => (
          <group
            key={i}
            position={[x, s.wheelR, side * (s.W / 2 - 0.2)]}
            ref={(el) => {
              wheels.current[i] = el;
            }}
          >
            <mesh geometry={wheelGeo.tire} material={M.tire} />
            <mesh geometry={wheelGeo.rim} material={M.rim} />
          </group>
        ))}
        <ContactShadows position={[0, -1.0, 0]} scale={14} opacity={0.35} blur={2.6} far={6} resolution={512} frames={Infinity} color="#0a1226" />
      </group>
    </>
  );
}
