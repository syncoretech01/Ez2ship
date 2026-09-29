import { Suspense, useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from '../lib/gsap';
import { prefersReducedMotion } from '../lib/env';

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const frag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uFrom;
  uniform sampler2D uTo;
  uniform vec2 uFromSize;
  uniform vec2 uToSize;
  uniform vec2 uRes;
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uZoom;

  vec2 cover(vec2 uv, vec2 img) {
    float rs = uRes.x / uRes.y;
    float ri = img.x / img.y;
    vec2 s = rs < ri ? vec2(ri / rs, 1.0) : vec2(1.0, rs / ri);
    return (uv - 0.5) / s / uZoom + 0.5;
  }

  // 2D value noise
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;

    // Cursor ripple
    vec2 aspect = vec2(uRes.x / uRes.y, 1.0);
    vec2 d = (uv - uMouse) * aspect;
    float dist = length(d);
    float ripple = sin(dist * 38.0 - uTime * 5.0) * 0.006 * uHover * smoothstep(0.45, 0.0, dist);
    uv += normalize(d + 1e-5) * ripple;

    // Liquid front
    float n = fbm(uv * 3.2 + vec2(uTime * 0.05, 0.0));
    float front = uProgress * 1.7 - 0.35;
    float field = uv.x * 0.6 + (1.0 - uv.y) * 0.4 + (n - 0.5) * 0.55;
    float m = smoothstep(front - 0.12, front + 0.12, field);
    float mix_ = 1.0 - m;
    float edge = (1.0 - abs(mix_ * 2.0 - 1.0));

    vec2 warp = vec2(n - 0.5, fbm(uv * 2.5 + 7.0) - 0.5) * 0.18 * edge;
    vec2 uvA = cover(uv + warp * (1.0 - mix_), uFromSize);
    vec2 uvB = cover(uv - warp * mix_, uToSize);

    // Subtle RGB split while hovering / transitioning
    float shift = (0.0025 * uHover + 0.012 * edge);
    vec4 a = vec4(texture2D(uFrom, uvA + vec2(shift, 0.0)).r, texture2D(uFrom, uvA).g, texture2D(uFrom, uvA - vec2(shift, 0.0)).b, 1.0);
    vec4 b = vec4(texture2D(uTo, uvB + vec2(shift, 0.0)).r, texture2D(uTo, uvB).g, texture2D(uTo, uvB - vec2(shift, 0.0)).b, 1.0);
    vec4 col = mix(a, b, mix_);
    col.rgb += edge * 0.06 * vec3(0.55, 0.62, 1.0);
    gl_FragColor = col;
  }
`;

interface Props {
  urls: string[];
  index: number;
  hostRef: RefObject<HTMLElement | null>;
}

function Plane({ urls, index, hostRef }: Props) {
  const textures = useTexture(urls) as THREE.Texture[];
  const { size } = useThree();
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const current = useRef(index);
  const mouse = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, hover: 0, th: 0 });

  const uniforms = useMemo(
    () => ({
      uFrom: { value: textures[index] },
      uTo: { value: textures[index] },
      uFromSize: { value: new THREE.Vector2(1, 1) },
      uToSize: { value: new THREE.Vector2(1, 1) },
      uRes: { value: new THREE.Vector2(1, 1) },
      uProgress: { value: 1 },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uZoom: { value: 1.04 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [textures],
  );

  const material = useMemo(() => new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms }), [uniforms]);

  useEffect(() => {
    textures.forEach((t) => {
      // Raw shader output: sample the sRGB bytes untouched so photos keep their original tones.
      t.colorSpace = THREE.NoColorSpace;
      t.minFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
      t.needsUpdate = true;
    });
    const img = textures[index].image as HTMLImageElement;
    uniforms.uFromSize.value.set(img.width, img.height);
    uniforms.uToSize.value.set(img.width, img.height);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textures]);

  useEffect(() => {
    if (index === current.current) return;
    const toImg = textures[index].image as HTMLImageElement;
    uniforms.uFrom.value = uniforms.uTo.value;
    uniforms.uFromSize.value.copy(uniforms.uToSize.value);
    uniforms.uTo.value = textures[index];
    uniforms.uToSize.value.set(toImg.width, toImg.height);
    current.current = index;
    gsap.killTweensOf(uniforms.uProgress);
    if (reduced) {
      uniforms.uProgress.value = 1;
      return;
    }
    uniforms.uProgress.value = 0;
    gsap.to(uniforms.uProgress, { value: 1, duration: 1.25, ease: 'inOut' });
    gsap.fromTo(uniforms.uZoom, { value: 1.12 }, { value: 1.04, duration: 1.6, ease: 'expo' });
  }, [index, textures, uniforms, reduced]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      mouse.current.tx = (e.clientX - r.left) / r.width;
      mouse.current.ty = 1 - (e.clientY - r.top) / r.height;
      mouse.current.th = 1;
    };
    const onLeave = () => (mouse.current.th = 0);
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    return () => {
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, [hostRef]);

  useFrame((_, dt) => {
    const m = mouse.current;
    const k = Math.min(1, dt * 6);
    m.x += (m.tx - m.x) * k;
    m.y += (m.ty - m.y) * k;
    m.hover += ((reduced ? 0 : m.th) - m.hover) * k * 0.6;
    uniforms.uMouse.value.set(m.x, m.y);
    uniforms.uHover.value = m.hover;
    uniforms.uTime.value += dt;
    uniforms.uRes.value.set(size.width, size.height);
  });

  return (
    <mesh frustumCulled={false} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

export function DistortViewer(props: Props) {
  return (
    <Suspense fallback={null}>
      <Plane {...props} />
    </Suspense>
  );
}
