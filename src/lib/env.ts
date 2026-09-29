import { useEffect, useState } from 'react';

const mq = (q: string) => typeof window !== 'undefined' && window.matchMedia(q).matches;

export const prefersReducedMotion = () => mq('(prefers-reduced-motion: reduce)');
export const hasFinePointer = () => mq('(hover: hover) and (pointer: fine)');
export const isSmallViewport = () => typeof window !== 'undefined' && window.innerWidth < 768;

export type Tier = 'low' | 'mid' | 'high';

/**
 * Rough capability estimate used to scale WebGL work.
 * low  → phones / weak devices: no shadows, DPR 1, fewer particles
 * mid  → tablets & small laptops
 * high → desktop class
 */
export function deviceTier(): Tier {
  if (typeof window === 'undefined') return 'mid';
  const nav = navigator as Navigator & { deviceMemory?: number };
  const touch = mq('(pointer: coarse)');
  const small = window.innerWidth < 768;
  const mem = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  if (small || mem <= 3 || cores <= 3) return 'low';
  if (touch || window.innerWidth < 1200 || mem <= 4 || cores <= 4) return 'mid';
  return 'high';
}

export function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function useMedia(query: string, initial = false) {
  const [match, setMatch] = useState(() => (typeof window === 'undefined' ? initial : mq(query)));
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [query]);
  return match;
}

export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)');
export const useIsDesktop = () => useMedia('(min-width: 1025px)', true);
export const useIsMobile = () => useMedia('(max-width: 640px)');
export const useFinePointer = () => useMedia('(hover: hover) and (pointer: fine)');
