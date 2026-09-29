import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { gsap } from '../lib/gsap';
import { hasFinePointer } from '../lib/env';
import './cursor.css';

type State = 'default' | 'link' | 'view' | 'drag' | 'hide' | 'label';

/**
 * Custom cursor. Elements opt into states with:
 *   data-cursor="view|drag|hide|label"  and optional data-cursor-label="Explore"
 * Links and buttons get the "link" state automatically.
 */
export function Cursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const stateRef = useRef<State>('default');
  const location = useLocation();

  useEffect(() => {
    if (!hasFinePointer()) return;
    const root = rootRef.current!;
    const ring = ringRef.current!;
    const dot = dotRef.current!;
    document.documentElement.classList.add('has-cursor');

    const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
    const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });
    const dx = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' });
    const dy = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' });
    let shown = false;

    const setState = (s: State, label = '') => {
      if (labelRef.current) labelRef.current.textContent = label;
      if (stateRef.current === s && s !== 'label') return;
      stateRef.current = s;
      root.dataset.state = s;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      if (!shown) {
        shown = true;
        root.classList.add('is-visible');
        gsap.set([ring, dot], { x: e.clientX, y: e.clientY });
      }
      rx(e.clientX);
      ry(e.clientY);
      dx(e.clientX);
      dy(e.clientY);
    };

    const resolve = (target: EventTarget | null) => {
      const el = target instanceof Element ? target : null;
      if (!el) return setState('default');
      const tagged = el.closest<HTMLElement>('[data-cursor]');
      if (tagged) {
        const kind = tagged.dataset.cursor as State;
        const label = tagged.dataset.cursorLabel ?? (kind === 'view' ? 'View' : kind === 'drag' ? 'Drag' : '');
        return setState(kind, label);
      }
      if (el.closest('input:not([type=radio]):not([type=checkbox]):not([type=range]), textarea, [contenteditable]'))
        return setState('hide');
      if (el.closest('a, button, [role="button"], label, select, summary, [role="tab"], [role="radio"]'))
        return setState('link');
      setState('default');
    };

    const onOver = (e: PointerEvent) => resolve(e.target);
    const onDown = () => root.classList.add('is-down');
    const onUp = () => root.classList.remove('is-down');
    const onLeave = () => {
      root.classList.remove('is-visible');
      shown = false;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  // Reset contextual state after navigation (the hovered element may be gone).
  useEffect(() => {
    if (rootRef.current) rootRef.current.dataset.state = 'default';
    stateRef.current = 'default';
  }, [location.pathname]);

  return (
    <div className="cursor" ref={rootRef} data-state="default" aria-hidden="true">
      <div className="cursor__ring" ref={ringRef}>
        <div className="cursor__disc">
          <span className="cursor__arrow cursor__arrow--l">←</span>
          <span className="cursor__label" ref={labelRef} />
          <span className="cursor__arrow cursor__arrow--r">→</span>
        </div>
      </div>
      <div className="cursor__dot" ref={dotRef} />
    </div>
  );
}
