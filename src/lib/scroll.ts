import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';
import { prefersReducedMotion } from './env';

type Listener = (y: number, velocity: number, direction: number) => void;

let lenis: Lenis | null = null;
const listeners = new Set<Listener>();
let lastY = 0;
let nativeBound = false;

function emit(y: number, velocity: number, direction: number) {
  listeners.forEach((fn) => fn(y, velocity, direction));
}

function onNativeScroll() {
  const y = window.scrollY;
  const v = y - lastY;
  emit(y, v, Math.sign(v));
  lastY = y;
}

export function initScroll() {
  if (lenis || nativeBound) return;
  if (prefersReducedMotion()) {
    window.addEventListener('scroll', onNativeScroll, { passive: true });
    nativeBound = true;
    return;
  }
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.4,
    anchors: { offset: -90 },
  });
  lenis.on('scroll', (l: Lenis) => {
    ScrollTrigger.update();
    emit(l.scroll, l.velocity, l.direction);
  });
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function getLenis() {
  return lenis;
}

export function onScroll(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function scrollToTop(immediate = true) {
  if (lenis) lenis.scrollTo(0, { immediate, force: true });
  else window.scrollTo({ top: 0, behavior: immediate ? 'instant' : 'smooth' });
}

export function scrollToEl(target: HTMLElement | string, offset = 0) {
  if (lenis) lenis.scrollTo(target, { offset, duration: 1.4 });
  else {
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    el?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }
}

export function lockScroll(lock: boolean) {
  if (lenis) {
    if (lock) lenis.stop();
    else lenis.start();
  }
  document.documentElement.style.overflow = lock ? 'hidden' : '';
}
