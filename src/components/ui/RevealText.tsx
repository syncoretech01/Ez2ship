import { createElement, useRef, type ElementType, type ReactNode } from 'react';
import { gsap, SplitText, useGSAP } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/env';
import { whenReady } from '../../lib/store';

interface Props {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  split?: 'lines' | 'words' | 'chars';
  stagger?: number;
  delay?: number;
  duration?: number;
  /** 'scroll' plays when scrolled into view; 'ready' plays when the page is revealed */
  mode?: 'scroll' | 'ready';
  start?: string;
  id?: string;
}

/** Masked line/word/char reveal powered by GSAP SplitText. */
export function RevealText({
  as: Tag = 'h2',
  children,
  className = '',
  split = 'lines',
  stagger,
  delay = 0,
  duration = 1.25,
  mode = 'scroll',
  start = 'top 88%',
  id,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        el.style.visibility = 'visible';
        return;
      }
      let cancelled = false;
      const type = split === 'lines' ? 'lines' : split === 'words' ? 'lines,words' : 'lines,words,chars';
      const st = stagger ?? (split === 'chars' ? 0.025 : split === 'words' ? 0.05 : 0.1);

      const s = SplitText.create(el, {
        type,
        mask: 'lines',
        linesClass: 'split-line',
        autoSplit: true,
        onSplit(self) {
          const targets = split === 'chars' ? self.chars : split === 'words' ? self.words : self.lines;
          el.style.visibility = 'visible';
          const tween = gsap.from(targets, {
            yPercent: 115,
            rotate: split === 'lines' ? 0 : 4,
            duration,
            stagger: st,
            delay,
            ease: 'expo',
            paused: mode === 'ready',
            scrollTrigger: mode === 'scroll' ? { trigger: el, start, once: true } : undefined,
          });
          if (mode === 'ready')
            whenReady().then(() => {
              if (!cancelled) tween.play();
            });
          return tween;
        },
      });
      return () => {
        cancelled = true;
        s.revert();
      };
    },
    { scope: ref },
  );

  return createElement(Tag, { ref, className: `reveal-text ${className}`, id }, children);
}
