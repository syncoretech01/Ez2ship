import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Carrier, Studio, DEFAULT_LOAD, type Load } from './models';
import { useTier } from './Stage';
import { pointer } from '../lib/pointer';
import { prefersReducedMotion } from '../lib/env';
import { getAppState, setAppState } from '../lib/store';

export interface HeroState {
  p: number;
  intro: number;
}

const LITE_LOAD: Load = [
  { kind: 'sedan', paint: 'pearl' },
  { kind: 'suv', paint: 'graphite' },
  null,
  { kind: 'coupe', paint: 'blue' },
  { kind: 'sedan', paint: 'navy' },
  null,
  { kind: 'coupe', paint: 'silver' },
];

const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function LaneMarks({ speed }: { speed: MutableRefObject<number> }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const COUNT = 36;
  const SPAN = 108;
  const data = useMemo(() => {
    const arr: { x: number; z: number }[] = [];
    for (let i = 0; i < COUNT / 2; i++) {
      arr.push({ x: -80 + (i * SPAN) / (COUNT / 2), z: 3.1 });
      arr.push({ x: -80 + (i * SPAN) / (COUNT / 2) + 3, z: -3.1 });
    }
    return arr;
  }, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    const d = speed.current * Math.min(dt, 0.05);
    data.forEach((it, i) => {
      it.x -= d;
      if (it.x < -80) it.x += SPAN;
      dummy.position.set(it.x, 0.004, it.z);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <boxGeometry args={[2.6, 0.01, 0.12]} />
      <meshBasicMaterial color="#cbc4b5" transparent opacity={0.9} />
    </instancedMesh>
  );
}

export function HeroScene({ state }: { state: MutableRefObject<HeroState> }) {
  const tier = useTier();
  const rig = useRef<THREE.Group>(null);
  const spin = useRef(7);
  const laneSpeed = useRef(9);
  const { camera, size } = useThree();
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const cam = useMemo(() => new THREE.Vector3(), []);
  const smooth = useRef({ mx: 0, my: 0 });
  const frames = useRef(0);

  useFrame((st, dt) => {
    // Let the loader know the scene is compiled and on screen.
    if (frames.current < 4 && ++frames.current === 4 && !getAppState().sceneReady) setAppState({ sceneReady: true });
    const { p, intro } = state.current;
    const t = st.clock.elapsedTime;
    const narrow = size.width < 760;
    const tablet = !narrow && size.width < 1100;

    const s = smooth.current;
    const k = 1 - Math.pow(0.001, Math.min(dt, 0.05));
    s.mx += ((reduced ? 0 : pointer.nx) - s.mx) * k * 0.6;
    s.my += ((reduced ? 0 : pointer.ny) - s.my) * k * 0.6;

    const ie = easeOut(intro);
    const pe = easeInOut(p);
    if (rig.current) {
      rig.current.position.x = (1 - ie) * -42 + pe * 22;
      rig.current.position.y = reduced ? 0 : Math.sin(t * 7.3) * 0.012;
    }
    spin.current = reduced ? 0 : 5 + (1 - ie) * 10 + pe * 8;
    laneSpeed.current = reduced ? 0 : 8 + pe * 14;

    // Camera path: long-lens 3/4 front → low side view as the rig pulls away.
    const ax = narrow ? 24 : tablet ? 26 : 22;
    const ay = narrow ? 7 : tablet ? 7 : 5.6;
    const az = narrow ? 42 : tablet ? 46 : 38;
    const bx = 9;
    const by = 2.2;
    const bz = 24;
    cam.set(ax + (bx - ax) * pe + s.mx * 2.2, ay + (by - ay) * pe + s.my * 1.2, az + (bz - az) * pe);
    camera.position.copy(cam);
    look.set((narrow ? -8.5 : -7.2) + pe * 12 + s.mx * 0.8, 2.3 - pe * 0.2, 0);
    camera.lookAt(look);
  });

  return (
    <>
      <Studio shadows={tier !== 'low'} shadowArea={46} />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[240, 120]} />
        <shadowMaterial color="#0a1226" opacity={0.16} transparent />
      </mesh>
      <group ref={rig}>
        <Carrier spin={spin} load={tier === 'low' ? LITE_LOAD : DEFAULT_LOAD} shadows={tier !== 'low'} />
        <ContactShadows
          position={[-7.6, 0.002, 0]}
          scale={[32, 8]}
          opacity={0.6}
          blur={2.4}
          far={4.5}
          resolution={tier === 'low' ? 512 : 1024}
          frames={1}
          color="#0a1226"
        />
      </group>
      <LaneMarks speed={laneSpeed} />
    </>
  );
}
