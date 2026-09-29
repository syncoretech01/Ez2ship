import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { lockScroll, scrollToEl, scrollToTop } from '../../lib/scroll';
import { preloadRoute } from '../../routes';
import { routeNames } from '../../data/site';
import { serviceBySlug } from '../../data/services';
import { setAppState } from '../../lib/store';
import { prefersReducedMotion } from '../../lib/env';
import './transition.css';

interface Ctx {
  go: (to: string) => void;
}

const TransitionContext = createContext<Ctx>({ go: () => {} });
export const useTransitionNav = () => useContext(TransitionContext);

const frames = (n: number) =>
  new Promise<void>((resolve) => {
    const step = (i: number) => (i <= 0 ? resolve() : requestAnimationFrame(() => step(i - 1)));
    step(n);
  });

function labelFor(pathname: string) {
  if (routeNames[pathname]) return routeNames[pathname];
  if (pathname.startsWith('/services/')) {
    const s = serviceBySlug(pathname.split('/')[2]);
    if (s) return s.name;
  }
  return 'EZ 2 SHIP';
}

// Path states for the curtain (viewBox 0 0 100 100, preserveAspectRatio none)
const P = {
  below: 'M 0 100 V 100 Q 50 100 100 100 V 100 Z',
  risingIn: 'M 0 100 V 55 Q 50 18 100 55 V 100 Z',
  full: 'M 0 100 V 0 Q 50 0 100 0 V 100 Z',
  fullTop: 'M 0 0 V 100 Q 50 100 100 100 V 0 Z',
  risingOut: 'M 0 0 V 45 Q 50 82 100 45 V 0 Z',
  above: 'M 0 0 V 0 Q 50 0 100 0 V 0 Z',
};

export function TransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnameRef = useRef(location.pathname);
  const busy = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const [label, setLabel] = useState('');

  useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);

  // Browser back/forward: no curtain, but reset scroll + triggers.
  useEffect(() => {
    const onPop = () => {
      requestAnimationFrame(() => {
        scrollToTop(true);
        setTimeout(() => ScrollTrigger.refresh(), 120);
      });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const go = useCallback(
    async (to: string) => {
      const url = new URL(to, window.location.origin);
      const target = url.pathname;
      const hash = url.hash.slice(1);
      if (busy.current) return;

      if (target === pathnameRef.current && url.search === window.location.search) {
        if (hash) scrollToEl(`#${hash}`);
        else scrollToTop(false);
        setAppState({ menuOpen: false });
        return;
      }

      busy.current = true;
      setAppState({ transitioning: true });
      setLabel(labelFor(target));
      const preload = preloadRoute(target).catch(() => undefined);
      const root = rootRef.current!;
      const path = pathRef.current!;
      const reduced = prefersReducedMotion();

      root.style.visibility = 'visible';
      lockScroll(true);

      if (reduced) {
        gsap.set(path, { attr: { d: P.full } });
        await gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'none' });
      } else {
        gsap.set(root, { opacity: 1 });
        gsap.set(labelRef.current, { opacity: 0, yPercent: 40 });
        gsap.set(routeRef.current, { drawSVG: '0% 0%' });
        const tl = gsap.timeline();
        tl.set(path, { attr: { d: P.below } })
          .to(path, { attr: { d: P.risingIn }, duration: 0.45, ease: 'power3.in' })
          .to(path, { attr: { d: P.full }, duration: 0.35, ease: 'power2.out' })
          .to(labelRef.current, { opacity: 1, yPercent: 0, duration: 0.6, ease: 'expo' }, '-=0.25')
          .to(routeRef.current, { drawSVG: '0% 100%', duration: 0.7, ease: 'inOut' }, '<');
        await tl;
      }

      await preload;
      setAppState({ ready: false, menuOpen: false });
      navigate(to);
      await frames(2);
      scrollToTop(true);
      await frames(2);
      ScrollTrigger.refresh();
      lockScroll(false);
      setAppState({ ready: true });

      if (reduced) {
        await gsap.to(root, { opacity: 0, duration: 0.25, ease: 'none' });
      } else {
        const tl = gsap.timeline();
        tl.to(labelRef.current, { opacity: 0, yPercent: -30, duration: 0.35, ease: 'power2.in' })
          .set(path, { attr: { d: P.fullTop } })
          .to(path, { attr: { d: P.risingOut }, duration: 0.4, ease: 'power3.in' })
          .to(path, { attr: { d: P.above }, duration: 0.4, ease: 'power2.out' });
        await tl;
      }

      root.style.visibility = 'hidden';
      setAppState({ transitioning: false });
      busy.current = false;
      if (hash) setTimeout(() => scrollToEl(`#${hash}`), 50);
    },
    [navigate],
  );

  return (
    <TransitionContext.Provider value={{ go }}>
      {children}
      <div className="pt" ref={rootRef} aria-hidden="true">
        <svg className="pt__svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path ref={pathRef} d={P.below} />
        </svg>
        <div className="pt__content" ref={labelRef}>
          <span className="t-mono pt__kicker">En route to</span>
          <span className="pt__label">{label}</span>
          <svg className="pt__route" viewBox="0 0 400 20" preserveAspectRatio="none">
            <path ref={routeRef} d="M2 10 H 398" />
          </svg>
        </div>
      </div>
    </TransitionContext.Provider>
  );
}
