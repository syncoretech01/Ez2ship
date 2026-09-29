import { useRef } from 'react';
import { imageInfo } from '../../lib/images';
import { gsap, useGSAP } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/env';

interface Props {
  name: string;
  alt: string;
  slices?: number;
  className?: string;
  direction?: 'up' | 'down' | 'alternate';
  position?: string;
}

/** Image revealed through staggered vertical slices as it enters the viewport. */
export function SliceImage({ name, alt, slices = 6, className = '', direction = 'alternate', position = '50% 50%' }: Props) {
  const info = imageInfo(name);
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const parts = el.querySelectorAll<HTMLElement>('.slice__part');
      const inner = el.querySelectorAll<HTMLElement>('.slice__img');
      gsap.set(parts, {
        yPercent: (i) => (direction === 'up' ? 101 : direction === 'down' ? -101 : i % 2 ? -101 : 101),
      });
      gsap.set(inner, { scale: 1.25 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 82%', once: true } });
      tl.to(parts, { yPercent: 0, duration: 1.4, ease: 'expo', stagger: { each: 0.07, from: 'center' } }).to(
        inner,
        { scale: 1, duration: 1.8, ease: 'expo' },
        0,
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={`slice ${className}`} role="img" aria-label={alt}>
      {Array.from({ length: slices }).map((_, i) => (
        <div
          key={i}
          className="slice__part"
          style={{ left: `${(i * 100) / slices}%`, width: `calc(${100 / slices}% + 1px)` }}
        >
          <div
            className="slice__img"
            style={{
              width: `calc((100% - 1px) * ${slices})`,
              left: `calc((100% - 1px) * ${-i})`,
              backgroundImage: `url(${info.src}), url(${info.blur})`,
              backgroundPosition: position,
            }}
          />
        </div>
      ))}
    </div>
  );
}
