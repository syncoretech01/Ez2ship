import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Carrier, EnclosedShell, Studio } from './models';
import { useTier } from './Stage';
import { pointer } from '../lib/pointer';
import { prefersReducedMotion } from '../lib/env';

export interface CompareState {
  /** handle position across the canvas, 0 (left) → 1 (right) */
  f: number;
}

const SHELL_Z = 1.36;

export function CompareScene({ state }: { state: MutableRefObject<CompareState> }) {
  const tier = useTier();
  const { camera, size } = useThree();
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 0), []);
  const line = useRef<THREE.Mesh>(null);
  const tmp = useMemo(
    () => ({ ndc: new THREE.Vector3(), dir: new THREE.Vector3(), hit: new THREE.Vector3(), mx: 0, my: 0 }),
    [],
  );

  const mats = useMemo(() => {
    const shell = new THREE.MeshPhysicalMaterial({
      color: '#101d42',
      metalness: 0.5,
      roughness: 0.28,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      clippingPlanes: [plane],
      side: THREE.DoubleSide,
    });
    const ribs = new THREE.MeshStandardMaterial({
      color: '#d9dce1',
      metalness: 1,
      roughness: 0.25,
      clippingPlanes: [plane],
    });
    return { shell, ribs };
  }, [plane]);

  useFrame((_, dt) => {
    const t = tmp;
    const narrow = size.width < 760;
    t.mx += ((reduced ? 0 : pointer.nx) - t.mx) * Math.min(1, dt * 2.5);
    t.my += ((reduced ? 0 : pointer.ny) - t.my) * Math.min(1, dt * 2.5);
    camera.position.set(-6 + t.mx * 3, 6 + t.my * 1.5, narrow ? 84 : 52);
    camera.lookAt(-9.4, 2.2, 0);
    const cam = camera as THREE.PerspectiveCamera;
    const fov = narrow ? 20 : 17;
    if (cam.fov !== fov) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }

    // Project the handle's screen position onto the shell's front face to find the cut in world X.
    t.ndc.set(state.current.f * 2 - 1, 0, 0.5).unproject(camera);
    t.dir.copy(t.ndc).sub(camera.position).normalize();
    const k = (SHELL_Z - camera.position.z) / t.dir.z;
    t.hit.copy(camera.position).addScaledVector(t.dir, k);
    plane.constant = -t.hit.x;
    if (line.current) {
      line.current.position.x = t.hit.x;
      line.current.visible = t.hit.x > -20 && t.hit.x < -3.2;
    }
  });

  return (
    <>
      <Studio />
      <group>
        <Carrier shadows={false} />
        <EnclosedShell shellMaterial={mats.shell} ribMaterial={mats.ribs} />
        <mesh ref={line} position={[0, 2.75, SHELL_Z + 0.02]}>
          <boxGeometry args={[0.06, 4.3, 0.06]} />
          <meshBasicMaterial color="#3d5bff" toneMapped={false} />
        </mesh>
        <ContactShadows position={[-7.6, 0.002, 0]} scale={[34, 9]} opacity={0.5} blur={2.2} far={5} resolution={tier === 'low' ? 512 : 1024} frames={1} color="#0a1226" />
      </group>
    </>
  );
}
