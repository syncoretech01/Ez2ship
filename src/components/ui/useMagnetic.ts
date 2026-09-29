import { useEffect, type RefObject } from 'react';
import { gsap } from '../../lib/gsap';
import { hasFinePointer, prefersReducedMotion } from '../../lib/env';

/**
 * Pulls an element toward the cursor while it's within `radius` px of its bounds.
 * An optional inner element moves further for a layered parallax feel.
 */
export function useMagnetic(
  ref: RefObject<HTMLElement | null>,
  {
    strength = 0.35,
    inner,
    radius = 60,
    enabled = true,
  }: { strength?: number; inner?: RefObject<HTMLElement | null>; radius?: number; enabled?: boolean } = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || !hasFinePointer() || prefersReducedMotion()) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    const inEl = inner?.current;
    const ixTo = inEl ? gsap.quickTo(inEl, 'x', { duration: 0.6, ease: 'power3.out' }) : null;
    const iyTo = inEl ? gsap.quickTo(inEl, 'y', { duration: 0.6, ease: 'power3.out' }) : null;
    let active = false;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const within =
        e.clientX > r.left - radius &&
        e.clientX < r.right + radius &&
        e.clientY > r.top - radius &&
        e.clientY < r.bottom + radius;
      if (within) {
        active = true;
        xTo(dx * strength);
        yTo(dy * strength);
        ixTo?.(dx * strength * 0.45);
        iyTo?.(dy * strength * 0.45);
      } else if (active) {
        active = false;
        xTo(0);
        yTo(0);
        ixTo?.(0);
        iyTo?.(0);
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      gsap.set([el, inEl].filter(Boolean), { x: 0, y: 0 });
    };
  }, [ref, inner, strength, radius, enabled]);
}
