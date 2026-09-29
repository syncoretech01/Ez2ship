import { useRef } from 'react';
import { gsap, useGSAP } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/env';
import { Img } from '../ui/Img';
import './column-slider.css';

/** Columns of photos that travel in alternating directions as the page scrolls. */
export function ColumnSlider({ columns, className = '' }: { columns: string[][]; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const cols = gsap.utils.toArray<HTMLElement>('.colsl__col');
      cols.forEach((col, i) => {
        const dir = i % 2 ? 1 : -1;
        gsap.fromTo(
          col,
          { yPercent: dir > 0 ? -18 : 0 },
          {
            yPercent: dir > 0 ? 0 : -18,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
          },
        );
      });
    },
    { scope: root },
  );
  return (
    <div className={`colsl ${className}`} ref={root} aria-hidden="true">
      {columns.map((imgs, i) => (
        <div className="colsl__col" key={i}>
          {[...imgs, ...imgs].map((name, k) => (
            <Img key={k} name={name} alt="" sizes="(max-width: 1024px) 40vw, 18vw" className="colsl__img" />
          ))}
        </div>
      ))}
    </div>
  );
}
