import { useEffect, useRef, useState } from 'react';
import type { Service } from '../../data/services';
import { services } from '../../data/services';
import { gsap, useGSAP } from '../../lib/gsap';
import { hasFinePointer, prefersReducedMotion } from '../../lib/env';
import { imageInfo } from '../../lib/images';
import { SectionLabel } from '../../components/ui/Misc';
import { RevealText } from '../../components/ui/RevealText';
import { Reveal } from '../../components/ui/Reveal';
import { TLink } from '../../components/transition/TLink';
import { Arrow } from '../../components/ui/Button';
import dots from '../../data/land-dots.json';
import { usOffice, uaeOffice } from '../../data/site';
import './service-sections.css';

/* ---------- Overview ---------- */
export function Overview({ service }: { service: Service }) {
  return (
    <section className="sdo section" data-theme="light">
      <div className="wrap sdo__grid">
        <div className="sdo__side">
          <SectionLabel index="01">Overview</SectionLabel>
        </div>
        <div className="sdo__main">
          <RevealText as="p" className="sdo__lead">
            {service.overview[0]}
          </RevealText>
          <div className="sdo__cols">
            <Reveal className="sdo__p t-body-l t-muted">{service.overview[1]}</Reveal>
            <Reveal delay={0.1} className="sdo__best">
              <p className="t-mono sdo__best-k">Best for</p>
              <ul>
                {service.bestFor.map((b, i) => (
                  <li key={b}>
                    <span className="t-mono">{String(i + 1).padStart(2, '0')}</span>
                    {b}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Features ---------- */
export function Features({ service }: { service: Service }) {
  return (
    <section className="sdf section" data-theme="dark">
      <div className="wrap">
        <div className="shead">
          <SectionLabel index="02">What you get</SectionLabel>
          <RevealText as="h2" className="shead__title t-xl">
            Why choose <span className="t-serif">{service.name.toLowerCase()}</span>
          </RevealText>
        </div>
        <div className="sdf__rows">
          {service.features.map((f, i) => (
            <Reveal key={f.title} className="sdf__row" delay={i * 0.06}>
              <span className="sdf__num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="sdf__h">{f.title}</h3>
              <p className="sdf__p">{f.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Process with a self-drawing route ---------- */
export function Process({ service }: { service: Service }) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const path = root.current!.querySelector<SVGPathElement>('.sdp__path');
      const marker = root.current!.querySelector<SVGGElement>('.sdp__marker');
      const nodes = root.current!.querySelectorAll('.sdp__step');
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top 70%', end: 'bottom 60%', scrub: 0.8 },
      });
      tl.fromTo(path, { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none', duration: 1 }, 0);
      if (marker && path)
        tl.to(marker, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: true }, ease: 'none', duration: 1 }, 0);
      nodes.forEach((n, i) => tl.from(n, { opacity: 0.2, y: 20, duration: 0.12, ease: 'none' }, i * 0.22));
    },
    { scope: root, dependencies: [service.slug] },
  );
  return (
    <section className="sdp section" ref={root} data-theme="light">
      <div className="wrap">
        <div className="shead">
          <SectionLabel index="03">How it works</SectionLabel>
          <RevealText as="h2" className="shead__title t-xl">
            From your door <span className="t-serif blue">to theirs.</span>
          </RevealText>
        </div>
        <div className="sdp__track">
          <svg className="sdp__svg" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
            <path className="sdp__base" d="M10 60 C 200 10, 400 110, 600 60 S 1000 10, 1190 60" />
            <path className="sdp__path" d="M10 60 C 200 10, 400 110, 600 60 S 1000 10, 1190 60" />
            <g className="sdp__marker">
              <rect x="-14" y="-7" width="28" height="14" rx="4" />
            </g>
          </svg>
          <ol className="sdp__steps">
            {service.process.map((s, i) => (
              <li key={s.title} className="sdp__step">
                <span className="sdp__dot" />
                <span className="t-mono sdp__n">Step {String(i + 1).padStart(2, '0')}</span>
                <h3 className="sdp__h">{s.title}</h3>
                <p className="sdp__p">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ---------- Prep checklist ---------- */
export function Prep({ service }: { service: Service }) {
  return (
    <section className="sdc section" data-theme="light">
      <div className="wrap sdc__grid">
        <div>
          <SectionLabel index="04">Before pickup</SectionLabel>
          <RevealText as="h2" className="t-l sdc__title">
            Prepare your <span className="t-serif blue">{service.vehicle === 'motorcycle' ? 'bike' : 'vehicle'}.</span>
          </RevealText>
          <p className="t-muted sdc__note">General good practice — your coordinator will confirm anything specific to your shipment.</p>
        </div>
        <ul className="sdc__list">
          {service.prep.map((p, i) => (
            <Reveal as="li" key={p} className="sdc__item" delay={i * 0.06}>
              <span className="sdc__check" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M5 12.5 10 17 19 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>{p}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Related services with cursor-following preview ---------- */
export function Related({ current }: { current: Service }) {
  const others = services.filter((s) => s.slug !== current.slug);
  const [hover, setHover] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!hasFinePointer()) return;
    const el = previewRef.current;
    const list = listRef.current;
    if (!el || !list) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
    const onMove = (e: PointerEvent) => {
      const r = list.getBoundingClientRect();
      xTo(e.clientX - r.left);
      yTo(e.clientY - r.top);
    };
    list.addEventListener('pointermove', onMove);
    return () => list.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <section className="sdr section" data-theme="light">
      <div className="wrap">
        <SectionLabel index="06">Other services</SectionLabel>
        <div className="sdr__wrap">
          <div className="sdr__preview" ref={previewRef} aria-hidden="true">
            {others.map((s, i) => (
              <div
                key={s.slug}
                className={`sdr__pimg ${hover === i ? 'is-on' : ''}`}
                style={{ backgroundImage: `url(${imageInfo(s.image).small})` }}
              />
            ))}
          </div>
          <ul className="sdr__list" ref={listRef} onMouseLeave={() => setHover(null)}>
          {others.map((s, i) => (
            <li key={s.slug}>
              <TLink
                to={`/services/${s.slug}`}
                className={`sdr__item ${hover !== null && hover !== i ? 'is-dim' : ''}`}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
              >
                <span className="t-mono">{s.index}</span>
                <span className="sdr__name">{s.title}</span>
                <span className="sdr__tag t-small">{s.tagline}</span>
                <span className="sdr__arrow">
                  <Arrow dir="e" />
                </span>
              </TLink>
            </li>
          ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- International route map (canvas dot map + drawn arc) ---------- */
export function IntlRoute() {
  const ref = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const host = wrap.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = dots as unknown as { step: number; rows: [number, number[]][] };
    const reduced = prefersReducedMotion();
    let w = 0;
    let h = 0;
    let prog = reduced ? 1 : 0;
    let raf = 0;
    let t = 0;
    const lonMin = -110;
    const lonMax = 75;
    const latMin = -12;
    const latMax = 58;
    const proj = (lon: number, lat: number) => [((lon - lonMin) / (lonMax - lonMin)) * w, ((latMax - lat) / (latMax - latMin)) * h] as const;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const draw = () => {
      const a = proj(usOffice.coords.lon, usOffice.coords.lat);
      const b = proj(uaeOffice.coords.lon, uaeOffice.coords.lat);
      ctx.clearRect(0, 0, w, h);
      const s = data.step;
      const r = Math.max(1, w / 900);
      ctx.fillStyle = 'rgba(243,240,234,0.28)';
      for (const [row, runs] of data.rows) {
        const lat = -90 + s / 2 + row * s;
        if (lat < latMin || lat > latMax || row % 2) continue;
        for (let i = 0; i < runs.length; i += 2) {
          for (let c = runs[i]; c <= runs[i + 1]; c += 2) {
            const lon = -180 + s / 2 + c * s;
            if (lon < lonMin || lon > lonMax) continue;
            const [x, y] = proj(lon, lat);
            ctx.fillRect(x, y, r * 1.6, r * 1.6);
          }
        }
      }
      // arc
      const mx = (a[0] + b[0]) / 2;
      const my = Math.min(a[1], b[1]) - h * 0.38;
      const N = 120;
      ctx.strokeStyle = '#8fa1ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      let px = a[0];
      let py = a[1];
      for (let i = 0; i <= N * prog; i++) {
        const u = i / N;
        px = (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * mx + u * u * b[0];
        py = (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * my + u * u * b[1];
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      const pulse = 6 + Math.sin(t * 3) * 2;
      for (const [p, col] of [
        [a, '#8fa1ff'],
        [b, '#f3f0ea'],
      ] as const) {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(p[0], p[1], 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = col;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(p[0], p[1], 5 + pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (prog > 0 && prog < 1) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    const loop = () => {
      raf = requestAnimationFrame(loop);
      t += 0.016;
      draw();
    };
    const o = { v: 0 };
    const st = reduced
      ? null
      : gsap.to(o, {
          v: 1,
          ease: 'none',
          scrollTrigger: { trigger: host, start: 'top 75%', end: 'bottom 55%', scrub: 0.8 },
          onUpdate: () => {
            prog = o.v;
          },
        });
    if (reduced) draw();
    else raf = requestAnimationFrame(loop);
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(host);
    return () => {
      cancelAnimationFrame(raf);
      st?.scrollTrigger?.kill();
      st?.kill();
      ro.disconnect();
    };
  }, []);

  return (
    <section className="sdi section" data-theme="dark">
      <div className="wrap sdi__grid">
        <div className="sdi__copy">
          <SectionLabel index="05">Two offices</SectionLabel>
          <RevealText as="h2" className="t-l">
            Florida to Dubai, <span className="t-serif">and beyond.</span>
          </RevealText>
          <p className="t-body-l sdi__p">
            Our headquarters in Sunny Isles Beach and our branch in Dubai work the same shipment from both ends — so there’s
            a team available across both time zones.
          </p>
          <dl className="sdi__offices">
            {[usOffice, uaeOffice].map((o) => (
              <div key={o.id}>
                <dt className="t-mono">
                  {o.code} — {o.role}
                </dt>
                <dd>
                  {o.city}, {o.region}
                </dd>
                <dd>
                  <a href={o.phone.href}>{o.phone.display}</a>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="sdi__map" ref={wrap}>
          <canvas ref={ref} role="img" aria-label="Map with a route drawn from Sunny Isles Beach, Florida to Dubai, UAE" />
        </div>
      </div>
    </section>
  );
}
