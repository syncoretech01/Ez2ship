import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Carrier, Car, Studio, type Load } from './models';
import { Crane, House, Scatter, Ship, G, IM, driveCrane, makeContainers, makeTowers, makeTrees, type Inst } from './diorama';
import { M } from './materials';
import { useTier } from './Stage';
import { pointer } from '../lib/pointer';
import { prefersReducedMotion } from '../lib/env';

export interface JourneyState {
  p: number;
}

/* ---------- Choreography constants ---------- */
const R1_START = -70;
const R1_PICKUP = 21.6;
const R1_PORT = 211;
const SLOT = { x: -17.3, y: 1.35 };
const SHIP_Z = -17;
const SHIP_SPOT_X = -5.5;
const SHIP_DECK = 3.2;
const SHIP_A = R1_PORT + SLOT.x - SHIP_SPOT_X; // ship x at port A
const SHIP_B = 352;
const CRANE_A_X = R1_PORT + SLOT.x;
const CRANE_B_X = SHIP_B + SHIP_SPOT_X;
const R2_PORT = CRANE_B_X - SLOT.x;
const R2_DELIVER = 440;
const HOUSE1: [number, number, number] = [-14, 0, 30];
const HOUSE2: [number, number, number] = [421.2, 0, -30];

/** Journey stage ranges on p, shared with the DOM overlay. */
export const JOURNEY_STAGES = [0, 0.09, 0.24, 0.48, 0.76, 0.9, 1] as const;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const sstep = (t: number) => t * t * (3 - 2 * t);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const RIG1_LOAD: Load = [
  { kind: 'sedan', paint: 'pearl' },
  { kind: 'suv', paint: 'silver' },
  { kind: 'sedan', paint: 'graphite' },
  { kind: 'coupe', paint: 'pearl' },
  { kind: 'sedan', paint: 'silver' },
  { kind: 'suv', paint: 'sand' },
  null,
];
const RIG2_LOAD: Load = [
  null,
  { kind: 'sedan', paint: 'graphite' },
  { kind: 'coupe', paint: 'silver' },
  { kind: 'suv', paint: 'pearl' },
  { kind: 'sedan', paint: 'sand' },
  { kind: 'coupe', paint: 'graphite' },
  null,
];

type Shot = (w: World) => [THREE.Vector3Tuple, THREE.Vector3Tuple];
interface World {
  rig1: number;
  rig2: number;
  ship: number;
}

const SHOTS: { at: number; fn: Shot }[] = [
  { at: 0.0, fn: () => [[-54, 24, 66], [-12, 1, 12]] },
  { at: 0.08, fn: () => [[-42, 12, 44], [-6, 1.5, 6]] },
  { at: 0.15, fn: () => [[-30, 6, 26], [-6, 1, 3]] },
  { at: 0.22, fn: () => [[-14, 5, 18], [3, 1.8, 0]] },
  { at: 0.3, fn: (w) => [[w.rig1 - 26, 7, 26], [w.rig1 - 6, 2.4, 0]] },
  { at: 0.37, fn: (w) => [[w.rig1 + 18, 3.2, 14], [w.rig1 - 8, 2.8, 0]] },
  { at: 0.44, fn: (w) => [[w.rig1 - 34, 30, 64], [w.rig1 + 2, 2, -6]] },
  { at: 0.5, fn: () => [[150, 42, 84], [198, 4, -12]] },
  { at: 0.57, fn: () => [[158, 26, 60], [CRANE_A_X + 2, 6, -10]] },
  { at: 0.68, fn: (w) => [[w.ship - 50, 24, 44], [w.ship + 4, 3, SHIP_Z]] },
  { at: 0.76, fn: (w) => [[w.ship - 30, 26, 52], [w.ship + 2, 4, -12]] },
  { at: 0.82, fn: () => [[CRANE_B_X - 34, 26, 56], [CRANE_B_X + 4, 5, -8]] },
  { at: 0.9, fn: (w) => [[w.rig2 - 26, 16, 44], [w.rig2 - 6, 2, 0]] },
  { at: 1.0, fn: () => [[402, 28, 44], [424, 1, -8]] },
];

/* ---------- Static world ---------- */

function World({ tier }: { tier: string }) {
  const low = tier === 'low';
  const data = useMemo(() => {
    const k = low ? 0.45 : 1;
    const trees = makeTrees(11, [
      { x0: -150, x1: -64, z0: 38, z1: 90, n: Math.round(40 * k) },
      { x0: 12, x1: 150, z0: 38, z1: 90, n: Math.round(60 * k) },
      { x0: -150, x1: 150, z0: -80, z1: -10, n: Math.round(110 * k) },
      { x0: 406, x1: 600, z0: 40, z1: 100, n: Math.round(24 * k) },
    ]);
    const poles: Inst[] = [];
    for (let x = -140; x < 226; x += 18) poles.push({ p: [x, 0, 7.2], r: Math.PI / 2 });
    for (let x = 336; x < 600; x += 18) poles.push({ p: [x, 0, 7.2], r: Math.PI / 2 });
    const dashes: Inst[] = [];
    for (let x = -150; x < 226; x += 7) dashes.push({ p: [x, 0.03, 3.2], s: [3, 0.02, 0.18] });
    for (let x = 330; x < 600; x += 7) dashes.push({ p: [x, 0.03, 3.2], s: [3, 0.02, 0.18] });
    const containers = [
      ...makeContainers(6, 208, 226, 20, 50, low ? 2 : 3),
      ...makeContainers(4, 364, 402, 18, 40, 2),
    ];
    const towers = makeTowers(5, [
      { x0: 446, x1: 600, z0: -95, z1: -16, n: low ? 22 : 46, hMax: 56 },
      { x0: 450, x1: 600, z0: 36, z1: 95, n: low ? 10 : 22, hMax: 34 },
      { x0: 406, x1: 440, z0: -95, z1: -48, n: low ? 3 : 6, hMax: 26 },
    ]);
    const hills: Inst[] = [
      { p: [-120, -2, -120], s: [60, 18, 30] },
      { p: [-30, -2, -130], s: [70, 24, 34] },
      { p: [70, -2, -125], s: [60, 16, 30] },
      { p: [150, -2, -140], s: [80, 20, 36] },
    ];
    return { trees, poles, dashes, containers, towers, hills };
  }, [low]);

  return (
    <group>
      {/* water + land masses */}
      <mesh rotation-x={-Math.PI / 2} position={[220, -0.35, 0]} receiveShadow>
        <planeGeometry args={[1200, 700]} />
        <primitive object={M.water} attach="material" />
      </mesh>
      <mesh position={[-5, -0.2, 0]} receiveShadow material={M.clay}>
        <boxGeometry args={[310, 0.4, 320]} />
      </mesh>
      <mesh position={[188, -0.2, 75]} receiveShadow material={M.clay2}>
        <boxGeometry args={[76, 0.4, 170]} />
      </mesh>
      <mesh position={[368, -0.2, 75]} receiveShadow material={M.clay2}>
        <boxGeometry args={[76, 0.4, 170]} />
      </mesh>
      <mesh position={[503, -0.2, 0]} receiveShadow material={M.clay}>
        <boxGeometry args={[194, 0.4, 320]} />
      </mesh>
      {/* roads */}
      <mesh position={[38, 0.01, 0]} receiveShadow material={M.road}>
        <boxGeometry args={[376, 0.02, 12]} />
      </mesh>
      <mesh position={[465, 0.01, 0]} receiveShadow material={M.road}>
        <boxGeometry args={[270, 0.02, 12]} />
      </mesh>
      <Scatter items={data.dashes} geometry={G.unitBox} material={M.roadLine} />
      <Scatter items={data.poles} geometry={G.pole} material={M.steel} shadows={!low} />
      <Scatter items={data.trees.trunks} geometry={G.trunk} material={M.clay3} />
      <Scatter items={data.trees.canopies} geometry={G.canopy} material={IM.canopy} shadows={!low} />
      <Scatter items={data.hills} geometry={G.hill} material={M.clay2} />
      <Scatter items={data.containers} geometry={G.container} material={IM.container} shadows={!low} />
      <Scatter items={data.towers} geometry={G.unitBox} material={IM.tower} shadows={!low} />
      <House position={HOUSE1} rotation-y={Math.PI} />
      <House position={HOUSE2} variant={1} />
    </group>
  );
}

/* ---------- Scene ---------- */

export function JourneyScene({ state }: { state: MutableRefObject<JourneyState> }) {
  const tier = useTier();
  const rig1 = useRef<THREE.Group>(null);
  const rig2 = useRef<THREE.Group>(null);
  const car = useRef<THREE.Group>(null);
  const ship = useRef<THREE.Group>(null);
  const craneA = useRef<THREE.Group>(null);
  const craneB = useRef<THREE.Group>(null);
  const ramps1 = useRef<THREE.Mesh>(null);
  const ramps2 = useRef<THREE.Mesh>(null);
  const marker = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.DirectionalLight>(null);
  const spin1 = useRef(0);
  const spin2 = useRef(0);
  const { camera, size, scene } = useThree();
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const shadows = tier === 'high';

  const tmp = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      tgt: new THREE.Vector3(),
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      c: new THREE.Vector3(),
      d: new THREE.Vector3(),
      tan: new THREE.Vector3(),
      look: new THREE.Vector3(),
      sm: { mx: 0, my: 0, p: 0 },
      lastX1: R1_START,
      lastX2: R2_PORT,
    }),
    [],
  );

  const loadCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(HOUSE1[0] - 3.2, 0, 17),
        new THREE.Vector3(HOUSE1[0] - 3.2, 0, 10),
        new THREE.Vector3(-13, 0, 3),
        new THREE.Vector3(-7, 0, 0.4),
        new THREE.Vector3(-0.4, 0, 0),
      ]),
    [],
  );
  const parkCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(411, 0, 0),
        new THREE.Vector3(416, 0, -1.3),
        new THREE.Vector3(421, 0, -5),
        new THREE.Vector3(HOUSE2[0] + 3.2, 0, -12),
      ]),
    [],
  );

  useLayoutEffect(() => {
    scene.fog = new THREE.Fog('#f3f0ea', 70, 240);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useFrame((st, dt) => {
    const t = tmp;
    // Gentle extra smoothing on top of the ScrollTrigger scrub.
    t.sm.p += (state.current.p - t.sm.p) * Math.min(1, dt * 8);
    const p = t.sm.p;
    const time = st.clock.elapsedTime;

    /* Rigs & ship */
    const r1 =
      p < 0.24 ? lerp(R1_START, R1_PICKUP, easeOut(seg(p, 0, 0.08))) : lerp(R1_PICKUP, R1_PORT, easeInOut(seg(p, 0.24, 0.47)));
    const r2 = lerp(R2_PORT, R2_DELIVER, easeInOut(seg(p, 0.86, 0.94)));
    const sx = lerp(SHIP_A, SHIP_B, easeInOut(seg(p, 0.61, 0.76)));
    rig1.current?.position.set(r1, 0, 0);
    rig2.current?.position.set(r2, 0, 0);
    if (ship.current) {
      ship.current.position.set(sx, reduced ? 0 : Math.sin(time * 0.8) * 0.08, SHIP_Z);
      ship.current.rotation.x = reduced ? 0 : Math.sin(time * 0.6) * 0.004;
    }
    const v1 = (r1 - t.lastX1) / Math.max(dt, 1e-3);
    const v2 = (r2 - t.lastX2) / Math.max(dt, 1e-3);
    t.lastX1 = r1;
    t.lastX2 = r2;
    spin1.current = v1 / 0.52;
    spin2.current = v2 / 0.52;
    if (ramps1.current) ramps1.current.visible = p > 0.07 && p < 0.235;
    if (ramps2.current) ramps2.current.visible = p > 0.935;

    /* Hero car */
    const c = car.current;
    let heading = 0;
    let pitch = 0;
    const cp = t.a;
    const rampBase1 = R1_PICKUP - 19.6 - 2.3;
    if (p < 0.09) {
      cp.set(HOUSE1[0] - 3.2, 0, 17);
      heading = Math.PI / 2;
    } else if (p < 0.17) {
      const u = sstep(seg(p, 0.09, 0.17));
      loadCurve.getPointAt(u, cp);
      loadCurve.getTangentAt(Math.min(u, 0.999), t.tan);
      heading = Math.atan2(-t.tan.z, t.tan.x);
    } else if (p < 0.22) {
      const u = sstep(seg(p, 0.17, 0.22));
      const x = lerp(rampBase1, R1_PICKUP + SLOT.x, u);
      const rampT = clamp01((x - rampBase1) / 2.3);
      cp.set(x, rampT * 1.32 + (x > rampBase1 + 2.3 ? 0.03 : 0), 0);
      pitch = rampT > 0 && rampT < 1 ? 0.5 : 0;
    } else if (p < 0.49) {
      cp.set(r1 + SLOT.x, SLOT.y, 0);
    } else if (p < 0.6) {
      const slotX = R1_PORT + SLOT.x;
      const ry = sstep(seg(p, 0.49, 0.52));
      const mv = sstep(seg(p, 0.52, 0.57));
      const dn = sstep(seg(p, 0.57, 0.6));
      const y = lerp(lerp(SLOT.y, 11, ry), SHIP_DECK, dn);
      cp.set(slotX, y, lerp(0, SHIP_Z, mv));
    } else if (p < 0.77) {
      cp.set(sx + SHIP_SPOT_X, SHIP_DECK, SHIP_Z);
    } else if (p < 0.86) {
      const ry = sstep(seg(p, 0.77, 0.8));
      const mv = sstep(seg(p, 0.8, 0.83));
      const dn = sstep(seg(p, 0.83, 0.86));
      const y = lerp(lerp(SHIP_DECK, 11, ry), SLOT.y, dn);
      cp.set(CRANE_B_X, y, lerp(SHIP_Z, 0, mv));
    } else if (p < 0.94) {
      cp.set(r2 + SLOT.x, SLOT.y, 0);
    } else if (p < 0.97) {
      const u = sstep(seg(p, 0.94, 0.97));
      const rampTop = R2_DELIVER - 19.6;
      const x = lerp(R2_DELIVER + SLOT.x, 411, u);
      const rampT = clamp01((x - (rampTop - 2.3)) / 2.3);
      cp.set(x, rampT * 1.32, 0);
      pitch = rampT > 0 && rampT < 1 ? 0.5 : 0;
    } else {
      const u = sstep(seg(p, 0.97, 1));
      parkCurve.getPointAt(u, cp);
      parkCurve.getTangentAt(Math.min(u, 0.999), t.tan);
      heading = Math.atan2(-t.tan.z, t.tan.x);
    }
    if (c) {
      c.position.copy(cp);
      c.rotation.set(0, heading, 0);
      c.rotateZ(pitch);
    }

    /* Cranes follow the car during transfers */
    if (p >= 0.47 && p < 0.62) driveCrane(craneA.current, cp.z, cp.y + 2.3);
    else driveCrane(craneA.current, p < 0.47 ? 0 : SHIP_Z + 4, 15);
    if (p >= 0.75 && p < 0.88) driveCrane(craneB.current, cp.z, cp.y + 2.3);
    else driveCrane(craneB.current, p < 0.75 ? SHIP_Z + 4 : 0, 15);

    if (marker.current) {
      const on = seg(p, 0.985, 1);
      marker.current.visible = on > 0;
      const pulse = reduced ? 1 : 1 + Math.sin(time * 3) * 0.08;
      marker.current.scale.setScalar(on * 4.2 * pulse);
    }

    /* Camera: blend neighbouring shots */
    const w: World = { rig1: r1, rig2: r2, ship: sx };
    let i = 0;
    while (i < SHOTS.length - 2 && p > SHOTS[i + 1].at) i++;
    const A = SHOTS[i];
    const B = SHOTS[i + 1];
    const k = sstep(seg(p, A.at, B.at));
    const [ap, at] = A.fn(w);
    const [bp, bt] = B.fn(w);
    t.pos.set(lerp(ap[0], bp[0], k), lerp(ap[1], bp[1], k), lerp(ap[2], bp[2], k));
    t.tgt.set(lerp(at[0], bt[0], k), lerp(at[1], bt[1], k), lerp(at[2], bt[2], k));

    const narrow = size.width < 760;
    if (narrow) t.pos.sub(t.tgt).multiplyScalar(1.28).add(t.tgt);
    t.sm.mx += ((reduced ? 0 : pointer.nx) - t.sm.mx) * Math.min(1, dt * 3);
    t.sm.my += ((reduced ? 0 : pointer.ny) - t.sm.my) * Math.min(1, dt * 3);
    t.pos.x += t.sm.mx * 2.2;
    t.pos.y += t.sm.my * 1.4;
    camera.position.copy(t.pos);
    camera.lookAt(t.tgt);

    const cam = camera as THREE.PerspectiveCamera;
    const fov = narrow ? 42 : 30;
    if (cam.fov !== fov) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    // Compose the subject right of centre (desktop) or high (mobile), leaving room for the copy.
    const W = size.width;
    const H = size.height;
    const ox = narrow ? 0 : -0.13 * W;
    const oy = narrow ? 0.14 * H : 0.07 * H;
    const v = cam.view;
    if (!v || v.fullWidth !== W || v.fullHeight !== H || v.offsetX !== ox || v.offsetY !== oy) cam.setViewOffset(W, H, ox, oy, W, H);

    if (light.current) {
      light.current.position.set(t.tgt.x + 24, 46, t.tgt.z + 20);
      light.current.target.position.copy(t.tgt);
      light.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      <Studio intensity={0.72} />
      <directionalLight
        ref={light}
        intensity={1.75}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.03}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-near={1}
        shadow-camera-far={140}
      />
      <World tier={tier} />
      <Crane ref={craneA} position={[CRANE_A_X, 0, 0]} />
      <Crane ref={craneB} position={[CRANE_B_X, 0, 0]} />
      <Ship ref={ship} position={[SHIP_A, 0, SHIP_Z]} />
      <Carrier ref={rig1} load={RIG1_LOAD} spin={spin1} ramps rampRef={ramps1} shadows={shadows} />
      <Carrier ref={rig2} load={RIG2_LOAD} spin={spin2} ramps rampRef={ramps2} shadows={shadows} cabPaint="pearl" position={[R2_PORT, 0, 0]} />
      <Car ref={car} kind="sedan" paint="blue" shadows={shadows} />
      <mesh ref={marker} rotation-x={-Math.PI / 2} position={[HOUSE2[0] + 3.2, 0.1, -12]} visible={false}>
        <ringGeometry args={[0.92, 1, 64]} />
        <primitive object={M.accentGlow} attach="material" />
      </mesh>
    </>
  );
}
