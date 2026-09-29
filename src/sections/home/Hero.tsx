import { useEffect, useRef } from 'react';
import { Stage } from '../../three/Stage';
import { HeroScene, type HeroState } from '../../three/HeroScene';
import { Button } from '../../components/ui/Button';
import { gsap, useGSAP } from '../../lib/gsap';
import { whenReady } from '../../lib/store';
import { hasFinePointer, prefersReducedMotion, useIsMobile } from '../../lib/env';
import { company, usOffice, uaeOffice } from '../../data/site';
import { Img } from '../../components/ui/Img';
import { useFitText } from '../../components/ui/useFitText';
import './hero.css';

const chars = (s: string) =>
  s.split('').map((c, i) => (
    <span key={i} className={`hc ${c === ' ' ? 'hc--sp' : ''}`}>
      {c === ' ' ? ' ' : c}
    </span>
  ));

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const state = useRef<HeroState>({ p: 0, intro: 0 });
  const line1 = useRef<HTMLDivElement>(null);
  const mobile = useIsMobile();
  useFitText(line1, { varEl: root, varName: '--hero-fs', max: 260, sample: mobile ? 'ANYWHERE.' : undefined });

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();
      const q = gsap.utils.selector(root);
      const l1 = q('.hero__line--1 .hc');
      const l2 = q('.hero__line--2 .hc');

      if (reduced) {
        state.current.intro = 1;
        gsap.set([l1, l2], { '--w': 112, '--g': 780 });
        return;
      }

      gsap.set([l1, l2], { yPercent: 120, '--w': 62, '--g': 300 });
      gsap.set(q('.hero__fade'), { opacity: 0, y: 24 });

      const intro = gsap.timeline({ paused: true });
      intro
        .to(state.current, { intro: 1, duration: 2.6, ease: 'expo' }, 0)
        .to(l1, { yPercent: 0, duration: 1.3, stagger: 0.035, ease: 'expo' }, 0.05)
        .to(l1, { '--w': 112, '--g': 780, duration: 1.6, stagger: 0.035, ease: 'inOut' }, 0.35)
        .to(l2, { yPercent: 0, duration: 1.3, stagger: 0.04, ease: 'expo' }, 0.3)
        .to(l2, { '--w': 112, '--g': 780, duration: 1.6, stagger: 0.04, ease: 'inOut' }, 0.6)
        .to(q('.hero__fade'), { opacity: 1, y: 0, duration: 1.2, stagger: 0.08, ease: 'expo' }, 0.9);

      whenReady().then(() => intro.play());

      const mm = gsap.matchMedia();
      mm.add('(min-width: 1025px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=110%',
            pin: true,
            scrub: 0.6,
          },
        });
        tl.to(state.current, { p: 1, ease: 'none', duration: 1 }, 0)
          .to(q('.hero__line--1'), { xPercent: -28, ease: 'none', duration: 1 }, 0)
          .to(q('.hero__line--2'), { xPercent: 26, ease: 'none', duration: 1 }, 0)
          .to(q('.hero__bottom, .hero__meta'), { opacity: 0, y: -40, ease: 'none', duration: 0.5 }, 0)
          .to(q('.hero__veil'), { opacity: 1, ease: 'none', duration: 0.35 }, 0.65);
      });
      mm.add('(max-width: 1024px)', () => {
        gsap.to(state.current, {
          p: 0.55,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        });
      });
    },
    { scope: root },
  );

  // Kinetic "ANYWHERE." — letters widen and thicken near the cursor.
  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    const letters = Array.from(root.current?.querySelectorAll<HTMLElement>('.hero__line--2 .hc') ?? []);
    let raf = 0;
    let armed = false;
    let mx = -1e4;
    let my = -1e4;
    const cur = letters.map(() => 0);
    whenReady().then(() => setTimeout(() => (armed = true), 2600));
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!armed) return;
      letters.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const d = Math.hypot(mx - (r.left + r.width / 2), (my - (r.top + r.height / 2)) * 0.8);
        const f = Math.max(0, 1 - d / 420);
        cur[i] += (f - cur[i]) * 0.1;
        el.style.setProperty('--w', (112 + cur[i] * 13).toFixed(2));
        el.style.setProperty('--g', (780 + cur[i] * 120).toFixed(0));
      });
    };
    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <section className="hero" ref={root} data-theme="light" aria-labelledby="hero-title">
      <h1 id="hero-title" className="sr-only">
        Move anything. Anywhere. Vehicle transportation across the United States and internationally.
      </h1>

      <div className="hero__back" aria-hidden="true">
        <div className="hero__line hero__line--2">{chars('ANYWHERE.')}</div>
      </div>

      <Stage
        className="hero__stage"
        eager
        camera={{ fov: 22, position: [22, 5.6, 38], near: 1, far: 260 }}
        shadows
        exposure={1.05}
        fallback={<Img name="open-carrier" alt="" className="hero__fallback" priority />}
        label="A navy car carrier loaded with vehicles, driving past"
      >
        <HeroScene state={state} />
      </Stage>

      <div className="hero__front">
        <div className="hero__meta hero__fade t-mono">
          <span>
            {company.legalName} <span className="hero__sep">/</span> {company.mc}
          </span>
          <span className="hero__meta-mid">Auto transport — nationwide & international</span>
          <span>
            {usOffice.code} {usOffice.coordsLabel} <span className="hero__sep">↔</span> {uaeOffice.code}
          </span>
        </div>

        <div className="hero__line hero__line--1" aria-hidden="true" ref={line1}>
          {chars('MOVE ')}
          <br className="hero__br" />
          {chars('ANYTHING.')}
        </div>

        <div className="hero__bottom">
          <p className="hero__copy hero__fade">
            Cars, SUVs, trucks, motorcycles and exotics — shipped on <em>open</em> or <em>enclosed</em> carriers across
            the United States and around the world.
          </p>
          <div className="hero__actions hero__fade">
            <Button to="/quote" size="l" variant="primary">
              Get a shipping quote
            </Button>
            <Button to="/services" size="l" variant="ghost" icon="arrow">
              Explore services
            </Button>
          </div>
          <div className="hero__scroll hero__fade t-mono" aria-hidden="true">
            <span className="hero__scroll-line" />
            Scroll to ship
          </div>
        </div>
      </div>
      <div className="hero__veil" aria-hidden="true" />
    </section>
  );
}
