import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

type V3 = [number, number, number];

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _s = new THREE.Vector3();
const _p = new THREE.Vector3();

/** Clone a geometry into a non-indexed, transformed copy ready for merging. */
export function place(geo: THREE.BufferGeometry, pos: V3 = [0, 0, 0], rot: V3 = [0, 0, 0], scale: V3 = [1, 1, 1]) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  g.clearGroups();
  _m.compose(_p.set(...pos), _q.setFromEuler(_e.set(...rot)), _s.set(...scale));
  g.applyMatrix4(_m);
  if (!g.getAttribute('uv')) {
    const count = g.getAttribute('position').count;
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * 2), 2));
  }
  return g;
}

export function merge(parts: THREE.BufferGeometry[]) {
  const g = mergeGeometries(parts, false);
  g.computeBoundingSphere();
  g.computeBoundingBox();
  parts.forEach((p) => p.dispose());
  return g;
}

export const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
export const rbox = (w: number, h: number, d: number, r = 0.08) => new RoundedBoxGeometry(w, h, d, 3, r);
export const cyl = (r: number, h: number, seg = 24) => new THREE.CylinderGeometry(r, r, h, seg);

/* ------------------------------------------------------------------ */
/* Cars                                                                 */
/* ------------------------------------------------------------------ */

export type CarKind = 'sedan' | 'coupe' | 'suv' | 'pickup';

interface Spec {
  L: number;
  W: number;
  yb: number;
  belt: number;
  roof: number;
  wheelR: number;
  wb: number;
  cabinRear: number;
  roofRear: number;
  roofFront: number;
  cabinFront: number;
  noseH: number;
  tailH: number;
  cabinW: number;
}

export const CAR_SPECS: Record<CarKind, Spec> = {
  sedan: { L: 4.7, W: 1.84, yb: 0.2, belt: 0.92, roof: 1.42, wheelR: 0.34, wb: 2.8, cabinRear: -1.55, roofRear: -0.72, roofFront: 0.3, cabinFront: 1.05, noseH: 0.74, tailH: 0.96, cabinW: 0.8 },
  coupe: { L: 4.5, W: 1.9, yb: 0.16, belt: 0.82, roof: 1.24, wheelR: 0.35, wb: 2.62, cabinRear: -1.75, roofRear: -0.5, roofFront: 0.2, cabinFront: 0.95, noseH: 0.6, tailH: 0.86, cabinW: 0.74 },
  suv: { L: 4.85, W: 1.95, yb: 0.3, belt: 1.12, roof: 1.78, wheelR: 0.39, wb: 2.9, cabinRear: -2.25, roofRear: -2.02, roofFront: 0.52, cabinFront: 1.2, noseH: 0.98, tailH: 1.12, cabinW: 0.84 },
  pickup: { L: 5.5, W: 2.0, yb: 0.34, belt: 1.2, roof: 1.9, wheelR: 0.41, wb: 3.45, cabinRear: -0.6, roofRear: -0.48, roofFront: 0.9, cabinFront: 1.55, noseH: 1.08, tailH: 1.2, cabinW: 0.86 },
};

function bodyShape(s: Spec) {
  const { L, yb, belt, wheelR, wb, noseH, tailH } = s;
  const r = wheelR + 0.15;
  const fx = wb / 2;
  const rx = -wb / 2;
  const hx = L / 2;
  const tx = -L / 2;
  const sh = new THREE.Shape();
  sh.moveTo(tx + 0.15, yb);
  sh.lineTo(rx - r, yb);
  sh.lineTo(rx - r, wheelR);
  sh.absarc(rx, wheelR, r, Math.PI, 0, true);
  sh.lineTo(rx + r, yb);
  sh.lineTo(fx - r, yb);
  sh.lineTo(fx - r, wheelR);
  sh.absarc(fx, wheelR, r, Math.PI, 0, true);
  sh.lineTo(fx + r, yb);
  sh.lineTo(hx - 0.18, yb);
  sh.quadraticCurveTo(hx, yb, hx, yb + 0.18);
  sh.lineTo(hx, noseH - 0.14);
  sh.quadraticCurveTo(hx - 0.02, noseH, hx - 0.32, noseH + 0.04);
  sh.quadraticCurveTo(s.cabinFront + 0.5, belt + 0.01, s.cabinFront, belt);
  sh.lineTo(s.cabinRear, belt);
  sh.quadraticCurveTo(tx + 0.6, tailH + 0.02, tx + 0.3, tailH);
  sh.quadraticCurveTo(tx + 0.02, tailH - 0.02, tx, tailH - 0.24);
  sh.lineTo(tx, yb + 0.2);
  sh.quadraticCurveTo(tx, yb, tx + 0.15, yb);
  return sh;
}

function cabinShape(s: Spec) {
  const b = s.belt - 0.04;
  const sh = new THREE.Shape();
  sh.moveTo(s.cabinRear, b);
  sh.lineTo(s.cabinFront, b);
  sh.quadraticCurveTo(s.roofFront + (s.cabinFront - s.roofFront) * 0.3, s.roof - 0.02, s.roofFront, s.roof);
  sh.quadraticCurveTo((s.roofFront + s.roofRear) / 2, s.roof + 0.05, s.roofRear, s.roof);
  sh.quadraticCurveTo(s.cabinRear + (s.roofRear - s.cabinRear) * 0.25, s.roof - 0.04, s.cabinRear, b);
  return sh;
}

export interface CarGeometry {
  spec: Spec;
  body: THREE.BufferGeometry;
  glass: THREE.BufferGeometry;
  tires: THREE.BufferGeometry;
  rims: THREE.BufferGeometry;
  head: THREE.BufferGeometry;
  tail: THREE.BufferGeometry;
  trim: THREE.BufferGeometry;
}

const carCache = new Map<CarKind, CarGeometry>();

export function carGeometry(kind: CarKind): CarGeometry {
  const hit = carCache.get(kind);
  if (hit) return hit;
  const s = CAR_SPECS[kind];
  const bt = 0.1;
  const bodyDepth = s.W - bt * 2;
  const body = new THREE.ExtrudeGeometry(bodyShape(s), {
    depth: bodyDepth,
    bevelEnabled: true,
    bevelThickness: bt,
    bevelSize: 0.08,
    bevelSegments: 4,
    curveSegments: 18,
  });
  body.translate(0, 0, -bodyDepth / 2);
  body.computeVertexNormals();

  const cbt = 0.07;
  const cabinDepth = s.W * s.cabinW - cbt * 2;
  const cabin = new THREE.ExtrudeGeometry(cabinShape(s), {
    depth: cabinDepth,
    bevelEnabled: true,
    bevelThickness: cbt,
    bevelSize: 0.06,
    bevelSegments: 4,
    curveSegments: 16,
  });
  cabin.translate(0, 0, -cabinDepth / 2);

  const tw = 0.26;
  const tz = s.W / 2 - 0.2;
  const tire = cyl(s.wheelR, tw, 28);
  const rim = cyl(s.wheelR * 0.64, 0.03, 24);
  const hub = cyl(s.wheelR * 0.2, 0.05, 12);
  const tires: THREE.BufferGeometry[] = [];
  const rims: THREE.BufferGeometry[] = [];
  const trims: THREE.BufferGeometry[] = [];
  for (const x of [-s.wb / 2, s.wb / 2]) {
    for (const side of [-1, 1]) {
      tires.push(place(tire, [x, s.wheelR, side * tz], [Math.PI / 2, 0, 0]));
      rims.push(place(rim, [x, s.wheelR, side * (tz + tw / 2 + 0.005)], [Math.PI / 2, 0, 0]));
      trims.push(place(hub, [x, s.wheelR, side * (tz + tw / 2 + 0.02)], [Math.PI / 2, 0, 0]));
    }
  }

  const lampZ = s.W / 2 - 0.38;
  const headLamp = box(0.05, 0.07, 0.42);
  const tailLamp = box(0.05, 0.08, 0.5);
  const head = merge([
    place(headLamp, [s.L / 2 + 0.07, s.noseH - 0.12, lampZ]),
    place(headLamp, [s.L / 2 + 0.07, s.noseH - 0.12, -lampZ]),
  ]);
  const tail = merge([
    place(tailLamp, [-s.L / 2 - 0.07, s.tailH - 0.14, lampZ - 0.04]),
    place(tailLamp, [-s.L / 2 - 0.07, s.tailH - 0.14, -lampZ + 0.04]),
  ]);

  // Lower skirt + (for pickups) a tonneau cover over the bed.
  trims.push(place(box(s.wb - 0.9, 0.08, s.W + 0.02), [0, s.yb + 0.02, 0]));
  if (kind === 'pickup') {
    const x0 = -s.L / 2 + 0.25;
    const x1 = s.cabinRear - 0.08;
    trims.push(place(box(x1 - x0, 0.04, s.W - 0.12), [(x0 + x1) / 2, s.belt + 0.02, 0]));
  }

  const geo: CarGeometry = {
    spec: s,
    body,
    glass: cabin,
    tires: merge(tires),
    rims: merge(rims),
    head,
    tail,
    trim: merge(trims),
  };
  carCache.set(kind, geo);
  return geo;
}

/* ------------------------------------------------------------------ */
/* Car carrier (tractor + two-deck stinger trailer)                      */
/* ------------------------------------------------------------------ */

export interface CarrierGeometry {
  paint: THREE.BufferGeometry;
  chrome: THREE.BufferGeometry;
  steel: THREE.BufferGeometry;
  steelDark: THREE.BufferGeometry;
  glass: THREE.BufferGeometry;
  head: THREE.BufferGeometry;
  tail: THREE.BufferGeometry;
  wheels: { x: number; y: number; z: number; r: number; w: number }[];
  slots: { x: number; y: number; tilt: number; deck: 'head' | 'upper' | 'lower' }[];
  ramps: THREE.BufferGeometry;
}

let carrierCache: CarrierGeometry | null = null;

export const CARRIER = {
  lowerY: 0.9,
  rearLowerY: 1.32,
  upperY: 3.05,
  trailerFront: -3.5,
  trailerRear: -19.6,
  width: 2.5,
};

export function carrierGeometry(): CarrierGeometry {
  if (carrierCache) return carrierCache;
  const { lowerY, rearLowerY, upperY, trailerFront, trailerRear } = CARRIER;
  const paint: THREE.BufferGeometry[] = [];
  const chrome: THREE.BufferGeometry[] = [];
  const steel: THREE.BufferGeometry[] = [];
  const dark: THREE.BufferGeometry[] = [];
  const glass: THREE.BufferGeometry[] = [];

  // --- Tractor ---
  dark.push(place(box(7.6, 0.3, 0.95), [0.3, 1.0, 0]));
  paint.push(place(rbox(2.1, 1.25, 2.3, 0.18), [3.15, 1.78, 0]));
  paint.push(place(rbox(2.0, 2.3, 2.44, 0.16), [1.15, 2.42, 0]));
  paint.push(place(rbox(1.5, 0.34, 0.5, 0.1), [3.25, 1.3, 1.15]));
  paint.push(place(rbox(1.5, 0.34, 0.5, 0.1), [3.25, 1.3, -1.15]));
  chrome.push(place(box(0.08, 0.92, 1.36), [4.22, 1.72, 0]));
  chrome.push(place(rbox(0.3, 0.42, 2.5, 0.08), [4.3, 0.95, 0]));
  chrome.push(place(cyl(0.085, 2.8, 16), [0.05, 3.1, 1.1]));
  chrome.push(place(cyl(0.085, 2.8, 16), [0.05, 3.1, -1.1]));
  chrome.push(place(cyl(0.32, 1.1, 20), [0.95, 1.0, 1.08], [0, 0, Math.PI / 2]));
  chrome.push(place(cyl(0.32, 1.1, 20), [0.95, 1.0, -1.08], [0, 0, Math.PI / 2]));
  chrome.push(place(box(0.08, 0.36, 0.1), [2.25, 2.95, 1.36]));
  chrome.push(place(box(0.08, 0.36, 0.1), [2.25, 2.95, -1.36]));
  glass.push(place(box(0.06, 0.78, 2.2), [2.14, 3.0, 0], [0, 0, -0.18]));
  glass.push(place(box(0.95, 0.72, 2.46), [1.4, 2.98, 0]));

  const head = merge([place(box(0.06, 0.16, 0.44), [4.19, 1.52, 0.9]), place(box(0.06, 0.16, 0.44), [4.19, 1.52, -0.9])]);
  const tail = merge([
    place(box(0.06, 0.14, 0.3), [trailerRear - 0.05, rearLowerY - 0.18, 1.05]),
    place(box(0.06, 0.14, 0.3), [trailerRear - 0.05, rearLowerY - 0.18, -1.05]),
  ]);

  // Head rack over the cab
  steel.push(place(box(0.14, 3.0, 0.14), [0.05, 2.7, 1.12]));
  steel.push(place(box(0.14, 3.0, 0.14), [0.05, 2.7, -1.12]));
  steel.push(place(box(4.7, 0.1, 0.12), [2.3, 4.12, 1.1], [0, 0, -0.05]));
  steel.push(place(box(4.7, 0.1, 0.12), [2.3, 4.12, -1.1], [0, 0, -0.05]));
  dark.push(place(box(4.6, 0.05, 0.46), [2.3, 4.16, 0.78], [0, 0, -0.05]));
  dark.push(place(box(4.6, 0.05, 0.46), [2.3, 4.16, -0.78], [0, 0, -0.05]));
  for (const x of [0.4, 1.6, 2.8, 4.0]) steel.push(place(box(0.08, 0.06, 2.3), [x, 4.1 - (x - 2.3) * 0.05, 0]));
  steel.push(place(cyl(0.05, 1.8, 10), [3.6, 3.1, 1.05], [0, 0, 0.5]));
  steel.push(place(cyl(0.05, 1.8, 10), [3.6, 3.1, -1.05], [0, 0, 0.5]));

  // --- Trailer ---
  const lowerFrontEnd = -14.6;
  // stinger / neck
  dark.push(place(box(1.4, 0.26, 0.6), [trailerFront + 0.4, lowerY - 0.05, 0]));
  // spine
  dark.push(place(box(trailerFront - lowerFrontEnd, 0.24, 0.6), [(trailerFront + lowerFrontEnd) / 2, lowerY - 0.12, 0]));
  dark.push(place(box(lowerFrontEnd - trailerRear, 0.24, 0.6), [(lowerFrontEnd + trailerRear) / 2, rearLowerY - 0.12, 0]));
  dark.push(place(box(0.3, rearLowerY - lowerY + 0.3, 2.4), [lowerFrontEnd, (lowerY + rearLowerY) / 2 - 0.05, 0]));

  const deck = (x0: number, x1: number, y: number, withRails = true) => {
    const l = x0 - x1;
    const c = (x0 + x1) / 2;
    dark.push(place(box(l, 0.05, 0.5), [c, y, 0.78]));
    dark.push(place(box(l, 0.05, 0.5), [c, y, -0.78]));
    if (withRails) {
      steel.push(place(box(l, 0.14, 0.1), [c, y - 0.04, 1.2]));
      steel.push(place(box(l, 0.14, 0.1), [c, y - 0.04, -1.2]));
    }
    for (let x = x1 + 0.3; x < x0; x += 0.9) steel.push(place(box(0.07, 0.05, 2.36), [x, y - 0.06, 0]));
  };
  deck(trailerFront, lowerFrontEnd, lowerY);
  deck(lowerFrontEnd, trailerRear, rearLowerY);
  deck(trailerFront - 0.6, trailerRear, upperY);

  // posts + hydraulics
  for (const x of [trailerFront - 0.6, -8.2, -12.6, -17.0, trailerRear + 0.2]) {
    const baseY = x < lowerFrontEnd ? rearLowerY : lowerY;
    const h = upperY - baseY + 0.1;
    steel.push(place(box(0.15, h, 0.15), [x, baseY + h / 2 - 0.08, 1.24]));
    steel.push(place(box(0.15, h, 0.15), [x, baseY + h / 2 - 0.08, -1.24]));
  }
  for (const [x, dir] of [
    [-6.2, 1],
    [-10.4, -1],
    [-14.9, 1],
  ] as const) {
    for (const z of [1.18, -1.18]) {
      chrome.push(place(cyl(0.045, 2.3, 10), [x, (lowerY + upperY) / 2, z], [0, 0, dir * 0.55]));
    }
  }
  // rear bumper
  dark.push(place(box(0.2, 0.2, 2.5), [trailerRear, rearLowerY - 0.35, 0]));

  // Loading ramps (folded down at the rear)
  const ramps = merge([
    place(box(2.6, 0.05, 0.5), [trailerRear - 1.2, rearLowerY / 2 + 0.02, 0.78], [0, 0, 0.5]),
    place(box(2.6, 0.05, 0.5), [trailerRear - 1.2, rearLowerY / 2 + 0.02, -0.78], [0, 0, 0.5]),
  ]);

  const wheels = [
    { x: 3.25, y: 0.54, z: 1.02, r: 0.54, w: 0.34 },
    { x: 3.25, y: 0.54, z: -1.02, r: 0.54, w: 0.34 },
    { x: -1.35, y: 0.54, z: 0.92, r: 0.54, w: 0.56 },
    { x: -1.35, y: 0.54, z: -0.92, r: 0.54, w: 0.56 },
    { x: -2.6, y: 0.54, z: 0.92, r: 0.54, w: 0.56 },
    { x: -2.6, y: 0.54, z: -0.92, r: 0.54, w: 0.56 },
    { x: -16.2, y: 0.5, z: 0.95, r: 0.5, w: 0.5 },
    { x: -16.2, y: 0.5, z: -0.95, r: 0.5, w: 0.5 },
    { x: -17.45, y: 0.5, z: 0.95, r: 0.5, w: 0.5 },
    { x: -17.45, y: 0.5, z: -0.95, r: 0.5, w: 0.5 },
  ];

  const slots: CarrierGeometry['slots'] = [
    { x: 2.25, y: 4.2, tilt: -0.05, deck: 'head' },
    { x: -6.6, y: upperY + 0.03, tilt: 0, deck: 'upper' },
    { x: -11.5, y: upperY + 0.03, tilt: 0, deck: 'upper' },
    { x: -16.5, y: upperY + 0.03, tilt: 0, deck: 'upper' },
    { x: -6.4, y: lowerY + 0.03, tilt: 0, deck: 'lower' },
    { x: -11.2, y: lowerY + 0.03, tilt: 0, deck: 'lower' },
    { x: -17.3, y: rearLowerY + 0.03, tilt: 0, deck: 'lower' },
  ];

  carrierCache = {
    paint: merge(paint),
    chrome: merge(chrome),
    steel: merge(steel),
    steelDark: merge(dark),
    glass: merge(glass),
    head,
    tail,
    wheels,
    slots,
    ramps,
  };
  return carrierCache;
}

/** Enclosed trailer shell with ribbed sides, sized to wrap the carrier's trailer. */
let shellCache: { shell: THREE.BufferGeometry; ribs: THREE.BufferGeometry } | null = null;
export function enclosedShellGeometry() {
  if (shellCache) return shellCache;
  const { trailerFront, trailerRear } = CARRIER;
  const len = trailerFront - trailerRear + 0.5;
  const cx = (trailerFront + trailerRear) / 2 - 0.1;
  const h = 4.05;
  const cy = 0.72 + h / 2;
  const shell = merge([place(rbox(len, h, 2.72, 0.22), [cx, cy, 0])]);
  const ribs: THREE.BufferGeometry[] = [];
  for (let x = trailerRear + 0.4; x < trailerFront; x += 0.75) {
    ribs.push(place(box(0.06, h - 0.3, 2.78), [x, cy, 0]));
  }
  ribs.push(place(box(len - 0.3, 0.08, 2.78), [cx, 0.9, 0]));
  ribs.push(place(box(len - 0.3, 0.08, 2.78), [cx, cy + h / 2 - 0.22, 0]));
  shellCache = { shell, ribs: merge(ribs) };
  return shellCache;
}
