import { createContext, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Canvas, type CanvasProps } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import * as THREE from 'three';
import { deviceTier, webglAvailable, type Tier } from '../lib/env';

// Route three.js logs through one place. Two non-actionable warnings are dropped:
//  - the r183 Clock deprecation that R3F triggers internally;
//  - ANGLE/D3D compiler *warnings* in the program info log on Windows (real shader errors still log).
const MUTED = ['Clock: This module has been deprecated', 'WebGLProgram: Program Info Log'];
THREE.setConsoleFunction((type: string, message: unknown, ...params: unknown[]) => {
  if (type === 'warn' && typeof message === 'string' && MUTED.some((m) => message.includes(m))) return;
  const out = (console as unknown as Record<string, (...a: unknown[]) => void>)[type] ?? console.log;
  out(message, ...params);
});

const TierContext = createContext<Tier>('high');
export const useTier = () => useContext(TierContext);

interface Props {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  camera?: CanvasProps['camera'];
  shadows?: boolean;
  fallback?: ReactNode;
  /** Mount immediately instead of waiting until near the viewport */
  eager?: boolean;
  /** Keep rendering even when offscreen (rarely needed) */
  alwaysRender?: boolean;
  orthographic?: boolean;
  localClipping?: boolean;
  exposure?: number;
  label?: string;
}

/**
 * Canvas wrapper: lazy-mounts when close to the viewport, pauses its render loop
 * when offscreen, scales DPR by device tier and falls back gracefully without WebGL.
 */
export function Stage({
  children,
  className = '',
  style,
  camera,
  shadows = false,
  fallback = null,
  eager = false,
  alwaysRender = false,
  orthographic = false,
  localClipping = false,
  exposure = 1,
  label,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(eager);
  const [visible, setVisible] = useState(eager);
  const [ok] = useState(() => webglAvailable());
  // A lost WebGL context (e.g. a phone backgrounding the tab) shows the fallback, then rebuilds the canvas.
  const [lost, setLost] = useState(false);
  const [generation, setGeneration] = useState(0);
  const tier = useMemo(() => deviceTier(), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        if (e.isIntersecting) setMounted(true);
      },
      // Mount well ahead of the viewport so scenes compile before they scroll into view.
      { rootMargin: '900px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const dpr: [number, number] = tier === 'high' ? [1, 1.75] : tier === 'mid' ? [1, 1.5] : [1, 1.3];

  return (
    <div ref={ref} className={`stage ${className}`} style={style} role={label ? 'img' : undefined} aria-label={label}>
      {(!ok || lost) && fallback}
      {ok && mounted && (
        <Canvas
          key={generation}
          frameloop={visible || alwaysRender ? 'always' : 'never'}
          dpr={dpr}
          shadows={shadows && tier !== 'low' ? 'percentage' : false}
          orthographic={orthographic}
          camera={camera}
          gl={{
            antialias: tier !== 'low',
            alpha: true,
            powerPreference: 'high-performance',
            localClippingEnabled: localClipping,
          }}
          onCreated={({ gl }) => {
            const canvas = gl.domElement;
            canvas.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              setLost(true);
            });
            canvas.addEventListener('webglcontextrestored', () => {
              setLost(false);
              setGeneration((g) => g + 1);
            });
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = exposure;
            gl.setClearColor(0x000000, 0);
            // Shader error checks are useful in development; skip them in production for faster compiles.
            gl.debug.checkShaderErrors = import.meta.env.DEV;
          }}
          style={{ pointerEvents: 'none' }}
        >
          <TierContext.Provider value={tier}>{children}</TierContext.Provider>
          {/* Compile every material and upload textures up front — no hitches mid-scroll. */}
          <Preload all />
        </Canvas>
      )}
    </div>
  );
}
