import { createElement, useRef, type ElementType } from 'react';
import { gsap, useGSAP } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/env';
import { whenReady } from '../../lib/store';
import { useFitText } from '../ui/useFitText';
import './kinetic-title.css';

interface Props {
  lines: string[];
  as?: ElementType;
  className?: string;
  /** index of a line to render in the accent colour */
  accent?: number;
  max?: number;
  /** fraction of the container width the longest line should fill */
  fill?: number;
  label?: string;
}

/**
 * Oversized uppercase title. Letters rise into place while their width axis
 * expands from condensed to extended once the page is revealed.
 */
export function KineticTitle({ lines, as = 'h1', className = '', accent, max = 230, fill = 1, label }: Props) {
  const root = useRef<HTMLElement>(null);
  const longest = useRef<HTMLSpanElement>(null);
  const longestIndex = lines.reduce((best, l, i) => (l.length > lines[best].length ? i : best), 0);
  useFitText(longest, { varEl: root, varName: '--kt-fs', max, ratio: fill, wdth: 112, wght: 780 });

  useGSAP(
    () => {
      const chars = root.current?.querySelectorAll('.kt__ch');
      if (!chars?.length) return;
      if (prefersReducedMotion()) return;
      gsap.set(chars, { yPercent: 115, '--w': 62, '--g': 300 });
      const tl = gsap.timeline({ paused: true });
      tl.to(chars, { yPercent: 0, duration: 1.2, stagger: 0.028, ease: 'expo' }).to(
        chars,
        { '--w': 112, '--g': 780, duration: 1.5, stagger: 0.028, ease: 'inOut' },
        0.25,
      );
      whenReady().then(() => tl.play());
    },
    { scope: root },
  );

  return createElement(
    as,
    { ref: root, className: `kt ${className}`, 'aria-label': label ?? lines.join(' ') },
    lines.map((line, li) => (
      <span key={li} className={`kt__line ${li === accent ? 'kt__line--accent' : ''}`} aria-hidden="true">
        <span className="kt__inner" ref={li === longestIndex ? longest : undefined}>
          {line.split('').map((c, i) => (
            <span key={i} className="kt__ch">
              {c === ' ' ? ' ' : c}
            </span>
          ))}
        </span>
      </span>
    )),
  );
}
