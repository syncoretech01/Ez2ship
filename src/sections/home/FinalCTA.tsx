import { useEffect, useRef } from 'react';
import { gsap, useGSAP } from '../../lib/gsap';
import { hasFinePointer, prefersReducedMotion } from '../../lib/env';
import { whenReady } from '../../lib/store';
import { Button } from '../../components/ui/Button';
import { FlowField } from '../../components/FlowField';
import { company, offices } from '../../data/site';
import './final-cta.css';

const SPOKES = 5;
const C = 500;
// Centre of the gap between the first two spokes, in wheel coordinates.
const GAP_ANGLE = -Math.PI / 2 + Math.PI / SPOKES;
const GAP = { x: C + Math.cos(GAP_ANGLE) * 150, y: C + Math.sin(GAP_ANGLE) * 150 };

function Wheel() {
  const spokes = Array.from({ length: SPOKES }).map((_, i) => {
    const a = (i / SPOKES) * 360;
    return <rect key={i} x={C - 26} y={C - 250} width={52} height={250} rx={10} transform={`rotate(${a} ${C} ${C})`} />;
  });
  return (
    <>
      <defs>
        <mask id="wheel-mask" maskUnits="userSpaceOnUse" x="-20000" y="-20000" width="40000" height="40000">
          <rect x="-20000" y="-20000" width="40000" height="40000" fill="white" />
          <g className="cta__wheel-mask">
            <circle cx={C} cy={C} r={236} fill="black" />
            <g fill="white">{spokes}</g>
            <circle cx={C} cy={C} r={62} fill="white" />
          </g>
        </mask>
        <linearGradient id="rim-chrome" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#9aa1ac" />
          <stop offset="55%" stopColor="#f2f3f5" />
          <stop offset="80%" stopColor="#7d8492" />
          <stop offset="100%" stopColor="#e9ebee" />
        </linearGradient>
      </defs>
      <rect className="cta__cover" x="-20000" y="-20000" width="40000" height="40000" mask="url(#wheel-mask)" />
      <g className="cta__wheel-art">
        <circle cx={C} cy={C} r={290} fill="none" stroke="#0a1226" strokeWidth={62} />
        <circle cx={C} cy={C} r={290} fill="none" stroke="#1b2440" strokeWidth={2} strokeDasharray="4 14" />
        <circle cx={C} cy={C} r={244} fill="none" stroke="url(#rim-chrome)" strokeWidth={14} />
        <g fill="url(#rim-chrome)" opacity="0.9">
          {Array.from({ length: 5 }).map((_, i) => {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
            return <circle key={i} cx={C + Math.cos(a) * 34} cy={C + Math.sin(a) * 34} r={7} />;
          })}
        </g>
        <circle cx={C} cy={C} r={16} fill="#2446f5" />
      </g>
    </>
  );
}

const WORDS = ['READY', 'TO', 'MOVE?'];

export function FinalCTA() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const letters = q('.cta__ch');
      if (prefersReducedMotion()) {
        gsap.set(q('.cta__svg'), { autoAlpha: 0 });
        return;
      }
      const wheel = root.current!.querySelectorAll<SVGGElement>('.cta__wheel-mask, .cta__wheel-art');
      const s = { k: 0 };
      const setWheel = () => {
        const k = s.k;
        const e = k * k * (3 - 2 * k);
        const scale = 0.62 * Math.pow(46, e);
        const rot = e * 110;
        const px = C + (GAP.x - C) * Math.min(1, e * 1.6);
        const py = C + (GAP.y - C) * Math.min(1, e * 1.6);
        const tr = `translate(${C} ${C}) scale(${scale}) rotate(${rot}) translate(${-px} ${-py})`;
        wheel.forEach((g) => g.setAttribute('transform', tr));
      };
      setWheel();
      gsap.set(letters, { yPercent: 110, '--w': 70 });
      gsap.set(q('.cta__after'), { autoAlpha: 0, y: 30 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=160%', pin: true, scrub: 0.8 },
      });
      tl.to(s, { k: 1, duration: 1, ease: 'none', onUpdate: setWheel }, 0)
        .to(q('.cta__pre'), { autoAlpha: 0, y: -30, duration: 0.25, ease: 'none' }, 0.05)
        .to(q('.cta__svg'), { autoAlpha: 0, duration: 0.12, ease: 'none' }, 0.88)
        .to(letters, { yPercent: 0, duration: 0.3, stagger: 0.02, ease: 'expo' }, 0.62)
        .to(letters, { '--w': 118, duration: 0.35, stagger: 0.02, ease: 'inOut' }, 0.7)
        .to(q('.cta__after'), { autoAlpha: 1, y: 0, duration: 0.25, stagger: 0.05, ease: 'expo' }, 0.85);
    },
    { scope: root },
  );

  // Kinetic headline: letters widen near the cursor.
  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    const letters = Array.from(root.current?.querySelectorAll<HTMLElement>('.cta__ch') ?? []);
    const cur = letters.map(() => 0);
    let mx = -1e4;
    let my = -1e4;
    let raf = 0;
    let armed = false;
    whenReady().then(() => (armed = true));
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!armed || mx < -1e3) return;
      letters.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const d = Math.hypot(mx - (r.left + r.width / 2), (my - (r.top + r.height / 2)) * 0.7);
        const f = Math.max(0, 1 - d / 380);
        cur[i] += (f - cur[i]) * 0.1;
        el.style.setProperty('--g', (760 + cur[i] * 140).toFixed(0));
        el.style.setProperty('--dx', `${(cur[i] * 0.04).toFixed(3)}em`);
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
    <section className="cta" ref={root} data-theme="dark" aria-labelledby="cta-title">
      <div className="cta__pin">
        <div className="cta__scene">
          <FlowField className="cta__flow" />
          <div className="cta__content">
            <h2 id="cta-title" className="cta__title" aria-label="Ready to move?">
              {WORDS.map((w, wi) => (
                <span key={w} className="cta__word" aria-hidden="true">
                  {w.split('').map((ch, i) => (
                    <span key={i} className={`cta__ch ${wi === 2 ? 'cta__ch--blue' : ''}`}>
                      {ch}
                    </span>
                  ))}
                </span>
              ))}
            </h2>
            <div className="cta__after">
              <Button to="/quote" size="xl" variant="light">
                Get your shipping quote
              </Button>
            </div>
            <div className="cta__after cta__contacts t-mono">
              {offices.map((o) => (
                <a key={o.id} href={o.phone.href}>
                  {o.code} {o.phone.display}
                </a>
              ))}
              <a href={`mailto:${company.primaryEmail}`}>{company.primaryEmail}</a>
            </div>
          </div>
        </div>

        <svg className="cta__svg" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <Wheel />
        </svg>
        <div className="cta__pre">
          <p className="t-mono">Next stop</p>
          <p className="cta__pre-t">Your driveway.</p>
          <p className="t-mono cta__pre-hint">Scroll through the wheel</p>
        </div>
      </div>
    </section>
  );
}
