import { useEffect, useRef, useState } from 'react';
import { createTimeline, animate, stagger } from 'animejs';
import { prefersReducedMotion, webglAvailable } from '../lib/env';
import { setAppState, whenSceneReady } from '../lib/store';
import { lockScroll } from '../lib/scroll';
import { company, usOffice, uaeOffice } from '../data/site';
import { LogoBadge } from './brand/LogoBadge';
import './loader.css';

const WORD = ['E', 'Z', ' ', '2', ' ', 'S', 'H', 'I', 'P'];

function seenBefore() {
  try {
    return sessionStorage.getItem('ez2-loaded') === '1';
  } catch {
    return false;
  }
}
function markSeen() {
  try {
    sessionStorage.setItem('ez2-loaded', '1');
  } catch {
    /* storage unavailable — loader simply plays in full next time */
  }
}

const fontsReady = () =>
  Promise.race([
    (document.fonts?.ready ?? Promise.resolve()).then(() => undefined),
    new Promise<void>((r) => setTimeout(r, 2500)),
  ]);

/** On the home page, hold the reveal until the 3D hero has actually rendered. */
const sceneReady = () => {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path !== '/' || !webglAvailable()) return Promise.resolve();
  return whenSceneReady(7000);
};

export function Loader() {
  const [gone, setGone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const reduced = prefersReducedMotion();
    const quick = seenBefore();
    lockScroll(true);

    const finish = () => {
      markSeen();
      document.documentElement.classList.remove('is-loading');
      lockScroll(false);
      setAppState({ ready: true, booted: true });
    };

    if (reduced) {
      Promise.all([fontsReady(), sceneReady()]).then(() => {
        finish();
        animate(root, { opacity: [1, 0], duration: 300, ease: 'linear', onComplete: () => setGone(true) });
      });
      return;
    }

    const chars = Array.from(root.querySelectorAll<HTMLElement>('.loader__ch'));
    const states = chars.map(() => ({ w: 62, g: 180, o: 0, y: 70 }));
    const apply = () =>
      chars.forEach((el, i) => {
        const s = states[i];
        el.style.fontVariationSettings = `'wdth' ${s.w.toFixed(1)}, 'wght' ${s.g.toFixed(0)}`;
        el.style.opacity = String(s.o);
        el.style.transform = `translate3d(0, ${s.y}%, 0)`;
      });
    apply();

    const route = root.querySelector<SVGPathElement>('.loader__route-path')!;
    const svgEl = root.querySelector<SVGSVGElement>('.loader__svg')!;
    const dot = root.querySelector<HTMLElement>('.loader__dot')!;
    const badge = root.querySelector<HTMLElement>('.loader__badge')!;
    const total = route.getTotalLength();
    const progress = { v: 0 };
    const render = () => {
      if (countRef.current) countRef.current.textContent = String(Math.round(progress.v)).padStart(3, '0');
      // Draw the route and place the marker in CSS pixels so it isn't distorted by the stretched viewBox.
      const len = (progress.v / 100) * total;
      route.style.strokeDasharray = `${total}`;
      route.style.strokeDashoffset = `${total - len}`;
      const p = route.getPointAtLength(len);
      dot.style.transform = `translate3d(${(p.x / 600) * svgEl.clientWidth}px, ${(p.y / 80) * svgEl.clientHeight}px, 0)`;
    };
    render();

    const speed = quick ? 0.55 : 1;
    const HOLD = 88;
    const tl = createTimeline({ defaults: { ease: 'outExpo' } });
    tl.add(badge, { scale: [0.55, 1], rotate: [-40, 0], opacity: [0, 1], duration: 1500 * speed }, 0)
      .add(states, { y: [70, 0], o: [0, 1], duration: 1000 * speed, delay: stagger(55 * speed), onUpdate: apply }, 250 * speed)
      .add(
        states,
        { w: [62, 125], g: [180, 820], duration: 1400 * speed, delay: stagger(60 * speed), ease: 'inOutExpo', onUpdate: apply },
        550 * speed,
      )
      .add(progress, { v: [0, HOLD], duration: 2000 * speed, ease: 'inOutQuart', onUpdate: render }, 150 * speed)
      .add('.loader__meta', { opacity: [0, 1], translateY: ['40%', '0%'], duration: 900, delay: stagger(80) }, 200 * speed);

    let cancelled = false;
    Promise.all([tl.then(() => undefined), fontsReady(), sceneReady()]).then(() => {
      if (cancelled) return;
      const end = createTimeline({ defaults: { ease: 'inOutExpo' } });
      end.add(progress, { v: [progress.v, 100], duration: 500, ease: 'outQuart', onUpdate: render }, 0);
      end.then(() => {
        if (cancelled) return;
        finish();
        const out = createTimeline({ defaults: { ease: 'inOutExpo' } });
        out
          .add(states, { y: [0, -115], duration: 900, delay: stagger(35), ease: 'inExpo', onUpdate: apply }, 0)
          .add(badge, { scale: [1, 0.8], opacity: [1, 0], duration: 700, ease: 'inExpo' }, 0)
          .add('.loader__meta, .loader__route, .loader__count', { opacity: [1, 0], duration: 400, ease: 'linear' }, 200)
          .add(root, { clipPath: ['inset(0% 0% 0% 0%)', 'inset(0% 0% 100% 0%)'], duration: 1100 }, 450)
          .add('.loader__edge', { translateY: ['0vh', '-100vh'], duration: 1100 }, 450);
        out.then(() => setGone(true));
      });
    });

    return () => {
      cancelled = true;
      tl.pause();
    };
  }, []);

  if (gone) return null;

  return (
    <div className="loader" ref={rootRef} role="status" aria-label="Loading EZ 2 SHIP">
      <div className="loader__top">
        <span className="loader__meta t-mono">{company.legalName}</span>
        <span className="loader__meta t-mono">{company.mc}</span>
      </div>

      <div className="loader__center">
        <div className="loader__badge">
          <LogoBadge />
        </div>
        <div className="loader__word" aria-hidden="true">
          {WORD.map((c, i) =>
            c === ' ' ? (
              <span key={i} className="loader__sp" />
            ) : (
              <span key={i} className={`loader__ch ${c === '2' ? 'loader__ch--two' : ''}`}>
                {c}
              </span>
            ),
          )}
        </div>
      </div>

      <div className="loader__bottom">
        <div className="loader__route">
          <div className="loader__city">
            <span className="t-mono">{usOffice.code}</span>
            <span className="loader__coord t-mono">{usOffice.coordsLabel}</span>
          </div>
          <div className="loader__track">
            <svg className="loader__svg" viewBox="0 0 600 80" preserveAspectRatio="none" aria-hidden="true">
              <path className="loader__route-base" d="M 8 70 C 180 -10, 420 -10, 592 70" />
              <path className="loader__route-path" d="M 8 70 C 180 -10, 420 -10, 592 70" />
            </svg>
            <span className="loader__dot" />
          </div>
          <div className="loader__city loader__city--r">
            <span className="t-mono">{uaeOffice.code}</span>
            <span className="loader__coord t-mono">{uaeOffice.coordsLabel}</span>
          </div>
        </div>
        <div className="loader__count t-mono">
          <span ref={countRef}>000</span>
        </div>
      </div>
      <div className="loader__edge" aria-hidden="true" />
    </div>
  );
}
