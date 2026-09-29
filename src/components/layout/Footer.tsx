import { useEffect, useRef } from 'react';
import { TLink } from '../transition/TLink';
import { Button } from '../ui/Button';
import { LocalClock } from '../ui/Misc';
import { LogoBadge } from '../brand/LogoBadge';
import { company, offices, primaryNav } from '../../data/site';
import { services } from '../../data/services';
import { scrollToTop } from '../../lib/scroll';
import { hasFinePointer, prefersReducedMotion } from '../../lib/env';
import './footer.css';

const WORD = 'EZ2SHIP'.split('');

/** Wordmark whose letters widen and thicken as the cursor approaches (variable wdth/wght axes). */
function MorphWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || !hasFinePointer() || prefersReducedMotion()) return;
    const letters = Array.from(root.querySelectorAll<HTMLElement>('.ftr__ch'));
    const cur = letters.map(() => ({ w: 100, g: 700 }));
    let mx = -9999;
    let my = -9999;
    let raf = 0;
    let running = false;
    const loop = () => {
      let moving = false;
      letters.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = Math.hypot(mx - cx, (my - cy) * 0.6);
        const f = Math.max(0, 1 - d / (window.innerWidth * 0.32));
        const tw = 100 + f * 25;
        const tg = 700 + f * 200;
        cur[i].w += (tw - cur[i].w) * 0.12;
        cur[i].g += (tg - cur[i].g) * 0.12;
        if (Math.abs(tw - cur[i].w) > 0.05) moving = true;
        el.style.fontVariationSettings = `'wdth' ${cur[i].w.toFixed(2)}, 'wght' ${cur[i].g.toFixed(1)}`;
      });
      raf = moving ? requestAnimationFrame(loop) : 0;
      running = moving;
    };
    const kick = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      kick();
    };
    const onLeave = () => {
      mx = -9999;
      my = -9999;
      kick();
    };
    root.parentElement?.addEventListener('pointermove', onMove);
    root.parentElement?.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      root.parentElement?.removeEventListener('pointermove', onMove);
      root.parentElement?.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div className="ftr__word" ref={ref} aria-hidden="true">
      {WORD.map((c, i) => (
        <span key={i} className={`ftr__ch ${c === '2' ? 'ftr__ch--two' : ''}`}>
          {c}
        </span>
      ))}
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="ftr" data-theme="dark">
      <div className="ftr__top wrap">
        <LogoBadge className="ftr__badge" />
        <p className="ftr__lead">
          Have a vehicle to move? <span className="t-serif">Let’s route it.</span>
        </p>
        <Button to="/quote" size="l" variant="light">
          Get a shipping quote
        </Button>
      </div>

      <div className="ftr__grid wrap">
        {offices.map((o) => (
          <div key={o.id} className="ftr__col ftr__office">
            <p className="t-mono ftr__head">
              {o.label} — {o.role}
            </p>
            <p className="ftr__clock">
              <LocalClock timeZone={o.timeZone} />
            </p>
            <a className="ftr__big" href={o.phone.href}>
              {o.phone.display}
            </a>
            <address className="ftr__addr">
              {o.lines.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </address>
            <a className="tlink ftr__map t-mono" href={o.mapsUrl} target="_blank" rel="noopener noreferrer">
              Open in Maps ↗
            </a>
          </div>
        ))}

        <div className="ftr__col">
          <p className="t-mono ftr__head">Services</p>
          <ul className="ftr__list">
            {services.map((s) => (
              <li key={s.slug}>
                <TLink to={`/services/${s.slug}`}>{s.title}</TLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="ftr__col">
          <p className="t-mono ftr__head">Company</p>
          <ul className="ftr__list">
            <li>
              <TLink to="/">Home</TLink>
            </li>
            {primaryNav.map((n) => (
              <li key={n.to}>
                <TLink to={n.to}>{n.label}</TLink>
              </li>
            ))}
            <li>
              <TLink to="/quote">Get a quote</TLink>
            </li>
          </ul>
          <p className="t-mono ftr__head ftr__head--mail">Email</p>
          <ul className="ftr__list">
            {company.emails.map((e) => (
              <li key={e}>
                <a href={`mailto:${e}`}>{e}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="ftr__mark">
        <MorphWordmark />
      </div>

      <div className="ftr__bar wrap t-mono">
        <span>
          © {year} {company.legalName}
        </span>
        <span>{company.mc}</span>
        <button className="ftr__top-btn" onClick={() => scrollToTop(false)}>
          Back to top ↑
        </button>
      </div>
    </footer>
  );
}
