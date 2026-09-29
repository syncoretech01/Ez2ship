import { useMemo, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import dots from '../data/land-dots.json';
import { useTier } from './Stage';
import { pointer } from '../lib/pointer';
import { prefersReducedMotion } from '../lib/env';

export interface NetworkState {
  p: number;
}

const D2R = Math.PI / 180;
const R = 4;
const LON0 = -40 * D2R;
const LAT0 = 22 * D2R;
const US_CENTER: [number, number] = [-97 * D2R, 38 * D2R];

type LL = [number, number]; // [lon, lat] degrees
const C: Record<string, LL> = {
  mia: [-80.12, 25.94],
  nyc: [-74.0, 40.7],
  bos: [-71.06, 42.36],
  chi: [-87.63, 41.88],
  atl: [-84.39, 33.75],
  dal: [-96.8, 32.78],
  hou: [-95.37, 29.76],
  den: [-104.99, 39.74],
  phx: [-112.07, 33.45],
  lax: [-118.24, 34.05],
  sfo: [-122.42, 37.77],
  sea: [-122.33, 47.61],
  las: [-115.14, 36.17],
  bna: [-86.78, 36.16],
  clt: [-80.84, 35.23],
  dtw: [-83.05, 42.33],
  msp: [-93.27, 44.98],
  mci: [-94.58, 39.1],
  slc: [-111.89, 40.76],
  pdx: [-122.68, 45.52],
  jax: [-81.66, 30.33],
  msy: [-90.07, 29.95],
  dxb: [55.28, 25.19],
  eu: [4.4, 51.9],
  med: [14.3, 40.8],
  waf: [3.4, 6.5],
  sam: [-46.6, -23.5],
  car: [-79.5, 9.0],
  ind: [72.8, 19.0],
  eaf: [39.7, -4.0],
};

const DOMESTIC: [string, string][] = [
  ['mia', 'nyc'], ['mia', 'chi'], ['mia', 'dal'], ['mia', 'lax'], ['mia', 'den'], ['mia', 'atl'], ['mia', 'sea'],
  ['nyc', 'lax'], ['nyc', 'chi'], ['chi', 'den'], ['den', 'sfo'], ['dal', 'phx'], ['phx', 'lax'], ['hou', 'atl'],
  ['atl', 'clt'], ['clt', 'nyc'], ['sea', 'slc'], ['slc', 'chi'], ['mci', 'bna'], ['bos', 'dtw'], ['msp', 'chi'],
  ['las', 'lax'], ['pdx', 'sfo'], ['msy', 'hou'], ['jax', 'atl'], ['hou', 'den'], ['dal', 'mci'], ['bos', 'mia'],
];
const INTERNATIONAL: [string, string][] = [
  ['mia', 'dxb'], ['nyc', 'dxb'], ['hou', 'dxb'], ['nyc', 'eu'], ['mia', 'med'], ['mia', 'waf'], ['mia', 'sam'],
  ['mia', 'car'], ['dxb', 'ind'], ['dxb', 'eaf'], ['dxb', 'eu'],
];

/* ---------- great-circle helpers ---------- */
const toVec = ([lon, lat]: LL) => {
  const a = lon * D2R;
  const b = lat * D2R;
  return new THREE.Vector3(Math.cos(b) * Math.sin(a), Math.sin(b), Math.cos(b) * Math.cos(a));
};
const toLL = (v: THREE.Vector3): [number, number] => [Math.atan2(v.x, v.z), Math.asin(THREE.MathUtils.clamp(v.y, -1, 1))];
function slerp(a: THREE.Vector3, b: THREE.Vector3, t: number, out: THREE.Vector3) {
  const d = THREE.MathUtils.clamp(a.dot(b), -1, 1);
  const w = Math.acos(d);
  if (w < 1e-5) return out.copy(a);
  const s = Math.sin(w);
  return out.copy(a).multiplyScalar(Math.sin((1 - t) * w) / s).addScaledVector(b, Math.sin(t * w) / s);
}

/* ---------- shared GLSL ---------- */
const COMMON = /* glsl */ `
  uniform float uMorph;
  uniform float uR;
  uniform float uLon0;
  uniform float uLat0;
  uniform vec2 uUS;
  uniform vec3 uMouse;
  uniform float uMouseOn;
  uniform float uTime;
  float morphAt(vec2 ll) {
    float d = distance(ll, uUS) / 3.14159;
    return smoothstep(0.0, 1.0, clamp(uMorph * 1.7 - d * 0.7, 0.0, 1.0));
  }
  vec3 flatP(vec2 ll, float h) {
    return vec3((ll.x - uLon0) * uR, ll.y * uR + h, 0.0);
  }
  vec3 sphereP(vec2 ll, float h) {
    float lon = ll.x - uLon0;
    vec3 p = vec3(cos(ll.y) * sin(lon), sin(ll.y), cos(ll.y) * cos(lon));
    float c = cos(uLat0); float s = sin(uLat0);
    p = vec3(p.x, p.y * c - p.z * s, p.y * s + p.z * c);
    return p * (uR + h);
  }
  vec3 place(vec2 ll, float hFlat, float hSphere, out float m) {
    m = morphAt(ll);
    vec3 p = mix(flatP(ll, hFlat), sphereP(ll, hSphere), m);
    vec3 dir = p - uMouse;
    float dd = length(dir);
    float f = smoothstep(1.3, 0.0, dd) * uMouseOn;
    p += mix(normalize(dir + 1e-4) * 0.22, normalize(p) * 0.28, m) * f;
    return p;
  }
`;

const dotVert = /* glsl */ `
  attribute vec2 aLL;
  attribute float aUS;
  attribute float aRnd;
  uniform float uSize;
  uniform float uUSFocus;
  varying float vAlpha;
  varying float vUS;
  ${COMMON}
  void main() {
    float m;
    vec3 p = place(aLL, 0.0, 0.0, m);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float dist = -mv.z;
    gl_PointSize = uSize * mix(34.0, 78.0, m) / dist * (1.0 + aUS * 0.3 * uUSFocus);
    vec3 n = normalize(p);
    vec3 v = normalize(cameraPosition - p);
    float facing = smoothstep(-0.25, 0.35, dot(n, v));
    float tw = 0.78 + 0.22 * sin(uTime * 1.6 + aRnd * 6.2831);
    vAlpha = tw * mix(1.0, mix(0.1, 1.0, facing), m);
    vUS = aUS;
  }
`;
const dotFrag = /* glsl */ `
  varying float vAlpha;
  varying float vUS;
  uniform float uUSFocus;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float a = smoothstep(0.5, 0.2, r);
    vec3 base = vec3(0.66, 0.7, 0.82);
    vec3 us = vec3(0.56, 0.64, 1.0);
    vec3 col = mix(base, us, vUS * uUSFocus);
    float alpha = a * vAlpha * mix(0.62, 1.0, vUS * uUSFocus);
    gl_FragColor = vec4(col, alpha);
  }
`;

const arcVert = /* glsl */ `
  attribute vec2 aLL;
  attribute float aT;
  attribute float aH;
  attribute float aKind;
  attribute float aSeed;
  uniform float uDom;
  uniform float uInt;
  varying float vT;
  varying float vShow;
  varying float vKind;
  varying float vSeed;
  varying float vFacing;
  ${COMMON}
  void main() {
    float m;
    vec3 p = place(aLL, aH * 0.9, aH * 1.1, m);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float draw = aKind < 0.5 ? uDom : uInt;
    float local = clamp(draw * 1.6 - aSeed * 0.6, 0.0, 1.0);
    vShow = step(aT, local);
    vT = aT;
    vKind = aKind;
    vSeed = aSeed;
    vec3 n = normalize(p);
    vFacing = mix(1.0, smoothstep(-0.2, 0.3, dot(n, normalize(cameraPosition - p))), m);
  }
`;
const arcFrag = /* glsl */ `
  varying float vT;
  varying float vShow;
  varying float vKind;
  varying float vSeed;
  varying float vFacing;
  uniform float uTime;
  void main() {
    if (vShow < 0.5) discard;
    float pulse = smoothstep(0.08, 0.0, abs(vT - fract(uTime * 0.22 + vSeed * 3.7)));
    vec3 dom = vec3(0.4, 0.52, 1.0);
    vec3 intl = vec3(0.95, 0.94, 0.9);
    vec3 col = mix(dom, intl, vKind) + pulse * 0.6;
    float a = (0.8 + pulse * 0.2) * mix(0.25, 1.0, vFacing);
    gl_FragColor = vec4(col, a);
  }
`;

const packetVert = /* glsl */ `
  attribute vec2 aFrom;
  attribute vec2 aTo;
  attribute float aOff;
  attribute float aKind;
  attribute float aLift;
  attribute float aSeed;
  uniform float uDom;
  uniform float uInt;
  uniform float uSize;
  varying float vA;
  varying float vKind;
  ${COMMON}
  vec3 unitV(vec2 ll) { return vec3(cos(ll.y) * sin(ll.x), sin(ll.y), cos(ll.y) * cos(ll.x)); }
  void main() {
    vec3 va = unitV(aFrom);
    vec3 vb = unitV(aTo);
    float w = acos(clamp(dot(va, vb), -1.0, 1.0));
    float t = fract(uTime * (0.1 + aSeed * 0.08) + aOff);
    vec3 v = (sin((1.0 - t) * w) * va + sin(t * w) * vb) / max(sin(w), 1e-4);
    vec2 ll = vec2(atan(v.x, v.z), asin(clamp(v.y, -1.0, 1.0)));
    float h = 4.0 * t * (1.0 - t) * aLift;
    float m;
    vec3 p = place(ll, h * 0.9, h * 1.1, m);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float draw = aKind < 0.5 ? uDom : uInt;
    float local = clamp(draw * 1.6 - aSeed * 0.6, 0.0, 1.0);
    float facing = mix(1.0, smoothstep(-0.1, 0.3, dot(normalize(p), normalize(cameraPosition - p))), m);
    vA = step(0.999, local) * facing * smoothstep(0.0, 0.08, t) * smoothstep(1.0, 0.92, t);
    vKind = aKind;
    gl_PointSize = uSize * mix(60.0, 120.0, m) / -mv.z;
  }
`;
const packetFrag = /* glsl */ `
  varying float vA;
  varying float vKind;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5 || vA < 0.01) discard;
    float core = smoothstep(0.5, 0.0, r);
    vec3 col = mix(vec3(0.62, 0.7, 1.0), vec3(1.0), vKind * 0.7 + core * 0.3);
    gl_FragColor = vec4(col, core * core * vA);
  }
`;

interface Arc {
  from: LL;
  to: LL;
  kind: 0 | 1;
  seed: number;
}

function buildArcs(): { geo: THREE.BufferGeometry; arcs: Arc[]; packets: THREE.BufferGeometry } {
  const arcs: Arc[] = [];
  DOMESTIC.forEach(([a, b], i) => arcs.push({ from: C[a], to: C[b], kind: 0, seed: (i * 0.137) % 1 }));
  INTERNATIONAL.forEach(([a, b], i) => arcs.push({ from: C[a], to: C[b], kind: 1, seed: (i * 0.211) % 1 }));
  const ll: number[] = [];
  const tt: number[] = [];
  const hh: number[] = [];
  const kk: number[] = [];
  const ss: number[] = [];
  const va = new THREE.Vector3();
  const vb = new THREE.Vector3();
  const v = new THREE.Vector3();
  const N = 64;
  for (const arc of arcs) {
    va.copy(toVec(arc.from));
    vb.copy(toVec(arc.to));
    const ang = Math.acos(THREE.MathUtils.clamp(va.dot(vb), -1, 1));
    const lift = Math.min(1.4, 0.18 + ang * 0.9);
    let prev: [number, number, number, number] | null = null;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      slerp(va, vb, t, v).normalize();
      const [lo, la] = toLL(v);
      const h = 4 * t * (1 - t) * lift * (arc.kind ? 0.9 : 0.45);
      const cur: [number, number, number, number] = [lo, la, t, h];
      if (prev) {
        for (const q of [prev, cur]) {
          ll.push(q[0], q[1]);
          tt.push(q[2]);
          hh.push(q[3]);
          kk.push(arc.kind);
          ss.push(arc.seed);
        }
      }
      prev = cur;
    }
  }
  const pFrom: number[] = [];
  const pTo: number[] = [];
  const pOff: number[] = [];
  const pKind: number[] = [];
  const pLift: number[] = [];
  const pSeed: number[] = [];
  for (const arc of arcs) {
    const a = toVec(arc.from);
    const b = toVec(arc.to);
    const ang = Math.acos(THREE.MathUtils.clamp(a.dot(b), -1, 1));
    const lift = Math.min(1.4, 0.18 + ang * 0.9) * (arc.kind ? 0.9 : 0.45);
    for (const off of [0, 0.5]) {
      pFrom.push(arc.from[0] * D2R, arc.from[1] * D2R);
      pTo.push(arc.to[0] * D2R, arc.to[1] * D2R);
      pOff.push(off + arc.seed * 0.3);
      pKind.push(arc.kind);
      pLift.push(lift);
      pSeed.push(arc.seed);
    }
  }
  const packets = new THREE.BufferGeometry();
  packets.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(pOff.length * 3), 3));
  packets.setAttribute('aFrom', new THREE.Float32BufferAttribute(pFrom, 2));
  packets.setAttribute('aTo', new THREE.Float32BufferAttribute(pTo, 2));
  packets.setAttribute('aOff', new THREE.Float32BufferAttribute(pOff, 1));
  packets.setAttribute('aKind', new THREE.Float32BufferAttribute(pKind, 1));
  packets.setAttribute('aLift', new THREE.Float32BufferAttribute(pLift, 1));
  packets.setAttribute('aSeed', new THREE.Float32BufferAttribute(pSeed, 1));

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(tt.length * 3), 3));
  geo.setAttribute('aLL', new THREE.Float32BufferAttribute(ll, 2));
  geo.setAttribute('aT', new THREE.Float32BufferAttribute(tt, 1));
  geo.setAttribute('aH', new THREE.Float32BufferAttribute(hh, 1));
  geo.setAttribute('aKind', new THREE.Float32BufferAttribute(kk, 1));
  geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(ss, 1));
  return { geo, arcs, packets };
}

function buildDots(step: number): THREE.BufferGeometry {
  const data = dots as { step: number; rows: [number, number[]][]; us: [number, number[]][] };
  const usSet = new Set<string>();
  for (const [r, cols] of data.us) for (const c of cols) usSet.add(`${r}:${c}`);
  const ll: number[] = [];
  const us: number[] = [];
  const rnd: number[] = [];
  const s = data.step;
  let k = 0;
  for (const [r, runs] of data.rows) {
    const lat = (-90 + s / 2 + r * s) * D2R;
    for (let i = 0; i < runs.length; i += 2) {
      for (let c = runs[i]; c <= runs[i + 1]; c++) {
        k++;
        const isUS = usSet.has(`${r}:${c}`);
        if (step > 1 && !isUS && k % step !== 0) continue;
        ll.push((-180 + s / 2 + c * s) * D2R, lat);
        us.push(isUS ? 1 : 0);
        rnd.push(Math.random());
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(us.length * 3), 3));
  geo.setAttribute('aLL', new THREE.Float32BufferAttribute(ll, 2));
  geo.setAttribute('aUS', new THREE.Float32BufferAttribute(us, 1));
  geo.setAttribute('aRnd', new THREE.Float32BufferAttribute(rnd, 1));
  return geo;
}

/** CPU mirror of the shader placement, used for HTML labels. */
function placeCPU(lon: number, lat: number, morph: number, lon0: number, out: THREE.Vector3) {
  const d = Math.hypot(lon - US_CENTER[0], lat - US_CENTER[1]) / Math.PI;
  const x = THREE.MathUtils.clamp(morph * 1.7 - d * 0.7, 0, 1);
  const m = x * x * (3 - 2 * x);
  const fx = (lon - lon0) * R;
  const fy = lat * R;
  const l = lon - lon0;
  let sx = Math.cos(lat) * Math.sin(l);
  let sy = Math.sin(lat);
  let sz = Math.cos(lat) * Math.cos(l);
  const c = Math.cos(LAT0);
  const s = Math.sin(LAT0);
  const y2 = sy * c - sz * s;
  const z2 = sy * s + sz * c;
  sy = y2;
  sz = z2;
  sx *= R;
  sy *= R;
  sz *= R;
  return out.set(fx + (sx - fx) * m, fy + (sy - fy) * m, sz * m);
}

export const NETWORK_LABELS = [
  { key: 'mia', title: 'Sunny Isles Beach, FL', sub: 'Headquarters' },
  { key: 'dxb', title: 'Dubai, UAE', sub: 'Branch office' },
];

export function NetworkScene({
  state,
  labels,
}: {
  state: MutableRefObject<NetworkState>;
  labels: MutableRefObject<(HTMLDivElement | null)[]>;
}) {
  const tier = useTier();
  const { camera, size } = useThree();
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const dotGeo = useMemo(() => buildDots(tier === 'low' ? 2 : 1), [tier]);
  const { geo: arcGeo, packets } = useMemo(() => buildArcs(), []);

  const uniforms = useMemo(
    () => ({
      uMorph: { value: 0 },
      uR: { value: R },
      uLon0: { value: LON0 },
      uLat0: { value: LAT0 },
      uUS: { value: new THREE.Vector2(...US_CENTER) },
      uMouse: { value: new THREE.Vector3(999, 999, 999) },
      uMouseOn: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 1 },
      uUSFocus: { value: 1 },
      uDom: { value: 0 },
      uInt: { value: 0 },
    }),
    [],
  );

  // Materials are built by hand so all three share the exact same uniform objects.
  const mats = useMemo(
    () => ({
      dots: new THREE.ShaderMaterial({
        vertexShader: dotVert,
        fragmentShader: dotFrag,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
      arcs: new THREE.ShaderMaterial({ vertexShader: arcVert, fragmentShader: arcFrag, uniforms, transparent: true, depthWrite: false }),
      packets: new THREE.ShaderMaterial({
        vertexShader: packetVert,
        fragmentShader: packetFrag,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    }),
    [uniforms],
  );

  const tmp = useMemo(
    () => ({
      ray: new THREE.Raycaster(),
      ndc: new THREE.Vector2(),
      plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
      sphere: new THREE.Sphere(new THREE.Vector3(), R),
      hit: new THREE.Vector3(),
      look: new THREE.Vector3(),
      v: new THREE.Vector3(),
      n: new THREE.Vector3(),
      d: new THREE.Vector3(),
      sm: { p: 0, mx: 0, my: 0 },
    }),
    [],
  );

  useFrame((_, dt) => {
    const t = tmp;
    t.sm.p += (state.current.p - t.sm.p) * Math.min(1, dt * 7);
    const p = t.sm.p;
    const narrow = size.width < 760;
    const ss = (a: number, b: number) => {
      const x = THREE.MathUtils.clamp((p - a) / (b - a), 0, 1);
      return x * x * (3 - 2 * x);
    };
    const dom = ss(0.02, 0.3);
    const morph = ss(0.3, 0.66);
    const intl = ss(0.66, 0.94);

    t.sm.mx += ((reduced ? 0 : pointer.nx) - t.sm.mx) * Math.min(1, dt * 2);
    t.sm.my += ((reduced ? 0 : pointer.ny) - t.sm.my) * Math.min(1, dt * 2);

    // rotate east as the international routes draw, bringing Dubai into view
    const lon0 = LON0 + morph * (t.sm.mx * 0.2) + intl * 0.8;
    uniforms.uLon0.value = lon0;
    uniforms.uMorph.value = morph;
    uniforms.uDom.value = dom;
    uniforms.uInt.value = intl;
    uniforms.uUSFocus.value = 1 - morph * 0.6;
    uniforms.uTime.value += reduced ? 0 : dt;
    uniforms.uSize.value = (narrow ? 0.85 : 1) * Math.min(window.devicePixelRatio, 2);

    // camera: zoomed on the flat USA → pulled back to the whole globe
    const usx = (US_CENTER[0] - lon0) * R;
    const usy = US_CENTER[1] * R;
    const z0 = narrow ? 11 : 7.6;
    const z1 = narrow ? 27 : 21;
    const k = ss(0.26, 0.7);
    camera.position.set(usx * (1 - k) + t.sm.mx * 0.4, usy * (1 - k) + t.sm.my * 0.3 + (narrow ? -0.6 : 0), z0 + (z1 - z0) * k);
    t.look.set(usx * (1 - k), usy * (1 - k) + (narrow ? -0.6 : 0), 0);
    camera.lookAt(t.look);

    const cam = camera as THREE.PerspectiveCamera;
    const W = size.width;
    const H = size.height;
    const ox = narrow ? 0 : -0.14 * W * k;
    const oy = narrow ? 0.1 * H : 0;
    const v = cam.view;
    if (!v || v.fullWidth !== W || v.fullHeight !== H || Math.abs(v.offsetX - ox) > 0.5 || v.offsetY !== oy) cam.setViewOffset(W, H, ox, oy, W, H);

    // magnetic cursor field
    if (pointer.active && !reduced) {
      t.ndc.set(pointer.nx, pointer.ny);
      t.ray.setFromCamera(t.ndc, camera);
      const hitSphere = morph > 0.5 && t.ray.ray.intersectSphere(t.sphere, t.hit);
      if (!hitSphere) t.ray.ray.intersectPlane(t.plane, t.hit);
      uniforms.uMouse.value.copy(t.hit);
      uniforms.uMouseOn.value += (1 - uniforms.uMouseOn.value) * Math.min(1, dt * 4);
    }

    // office labels: project to screen space and move plain DOM elements
    NETWORK_LABELS.forEach((lb, i) => {
      const el = labels.current[i];
      if (!el) return;
      const [lo, la] = C[lb.key];
      placeCPU(lo * D2R, la * D2R, morph, lon0, t.v);
      t.n.copy(t.v).normalize();
      t.d.copy(camera.position).sub(t.v).normalize();
      const facing = morph > 0.5 ? THREE.MathUtils.clamp(t.n.dot(t.d) * 3, 0, 1) : 1;
      const vis = lb.key === 'mia' ? Math.max(dom, 1 - morph * 0.2) : intl;
      t.v.project(camera);
      const x = ((t.v.x + 1) / 2) * W;
      const y = ((1 - t.v.y) / 2) * H;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.style.opacity = String(vis * facing);
    });
  });

  return (
    <>
      <points geometry={dotGeo} material={mats.dots} frustumCulled={false} />
      <lineSegments geometry={arcGeo} material={mats.arcs} frustumCulled={false} />
      <points geometry={packets} material={mats.packets} frustumCulled={false} />
    </>
  );
}
