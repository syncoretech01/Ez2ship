import { useEffect, useRef, type KeyboardEvent } from 'react';
import { prefersReducedMotion } from '../../lib/env';
import { Img } from '../ui/Img';
import './drag-gallery.css';

export interface GalleryItem {
  image: string;
  alt: string;
  caption?: string;
}

/**
 * Horizontal gallery with pointer drag, momentum and a velocity-based skew.
 * Keyboard: arrow keys move by one card.
 */
export function DragGallery({ items, className = '' }: { items: GalleryItem[]; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const api = useRef<{ nudge: (dir: number) => void } | null>(null);

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr) return;
    const reduced = prefersReducedMotion();
    let x = 0;
    let target = 0;
    let vel = 0;
    let dragging = false;
    let startX = 0;
    let startTarget = 0;
    let lastX = 0;
    let lastT = 0;
    let raf = 0;
    let min = 0;
    let moved = 0;

    const measure = () => {
      min = Math.min(0, el.clientWidth - tr.scrollWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(tr);

    const clamp = (v: number) => Math.max(min, Math.min(0, v));
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!dragging) {
        target += vel;
        vel *= 0.92;
        if (target > 0) target += (0 - target) * 0.18;
        if (target < min) target += (min - target) * 0.18;
      }
      const prev = x;
      x += (target - x) * (reduced ? 1 : 0.14);
      const v = x - prev;
      const skew = reduced ? 0 : Math.max(-8, Math.min(8, v * 0.35));
      tr.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      tr.style.setProperty('--skew', `${skew.toFixed(2)}deg`);
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${min ? x / min : 0})`;
    };
    raf = requestAnimationFrame(loop);

    const down = (e: PointerEvent) => {
      dragging = true;
      moved = 0;
      startX = lastX = e.clientX;
      startTarget = target;
      lastT = performance.now();
      vel = 0;
      el.classList.add('is-dragging');
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      let t = startTarget + dx;
      if (t > 0) t *= 0.35;
      if (t < min) t = min + (t - min) * 0.35;
      target = t;
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      vel = ((e.clientX - lastX) / dt) * 16;
      lastX = e.clientX;
      lastT = now;
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove('is-dragging');
    };
    const click = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        target = clamp(target - e.deltaX);
        e.preventDefault();
      }
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('click', click, true);
    el.addEventListener('wheel', wheel, { passive: false });
    api.current = {
      nudge: (dir: number) => {
        const card = tr.firstElementChild as HTMLElement | null;
        const step = (card?.offsetWidth ?? 300) + 16;
        target = clamp(target - dir * step);
      },
    };
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('click', click, true);
      el.removeEventListener('wheel', wheel);
    };
  }, [items]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') api.current?.nudge(1);
    else if (e.key === 'ArrowLeft') api.current?.nudge(-1);
    else return;
    e.preventDefault();
  };

  return (
    <div className={`dg ${className}`}>
      <div
        className="dg__viewport"
        ref={root}
        data-cursor="drag"
        tabIndex={0}
        role="region"
        aria-label="Photo gallery — drag or use arrow keys"
        onKeyDown={onKey}
      >
        <div className="dg__track" ref={track}>
          {items.map((it, i) => (
            <figure className="dg__card" key={`${it.image}-${i}`}>
              <Img name={it.image} alt={it.alt} sizes="(max-width: 640px) 78vw, 34vw" />
              {it.caption && <figcaption className="t-mono">{it.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </div>
      <div className="dg__bar" aria-hidden="true">
        <span ref={progressRef} />
      </div>
    </div>
  );
}
