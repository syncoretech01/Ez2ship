import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { prefersReducedMotion } from '../lib/env';
import { KineticTitle } from '../components/page/KineticTitle';
import { Button } from '../components/ui/Button';
import { TLink } from '../components/transition/TLink';
import { primaryNav } from '../data/site';
import { useMeta } from '../lib/meta';
import './notfound.css';

export default function NotFound() {
  useMeta('Page not found', 'This page doesn’t exist. Head back to EZ 2 SHIP to get a vehicle shipping quote.');
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        root.current!.querySelector('.nf__road-path'),
        { drawSVG: '0%' },
        { drawSVG: '100%', duration: 2.2, ease: 'inOut', delay: 0.6 },
      );
      gsap.fromTo(root.current!.querySelector('.nf__gap'), { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 2.4 });
    },
    { scope: root },
  );
  return (
    <section className="nf" ref={root} data-theme="light">
      <div className="wrap nf__wrap">
        <p className="t-mono nf__code">Error 404 — route not found</p>
        <KineticTitle lines={['Off route.']} className="nf__title" max={260} />
        <svg className="nf__road" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
          <path className="nf__road-base" d="M0 70 C 200 20, 380 110, 560 64" />
          <path className="nf__road-path" d="M0 70 C 200 20, 380 110, 560 64" />
          <path className="nf__road-base" d="M700 60 C 860 20, 1000 100, 1200 50" />
          <g className="nf__gap">
            <circle cx="630" cy="62" r="18" />
            <path d="M622 54l16 16M638 54l-16 16" />
          </g>
        </svg>
        <p className="t-body-l nf__text">
          The page you were looking for isn’t on our map. Let’s get you back on the road.
        </p>
        <div className="nf__actions">
          <Button to="/" size="l">
            Back to home
          </Button>
          <Button to="/quote" size="l" variant="ghost">
            Get a quote
          </Button>
        </div>
        <nav className="nf__links" aria-label="Popular pages">
          {primaryNav.map((n) => (
            <TLink key={n.to} to={n.to} className="tlink">
              {n.label}
            </TLink>
          ))}
        </nav>
      </div>
    </section>
  );
}
