import { useEffect, useRef, useState, type ReactNode } from 'react';
import { gsap, useGSAP } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/env';

export function SectionLabel({ index, children, className = '' }: { index?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`section-label t-mono ${className}`}>
      {index && <span className="section-label__index">({index})</span>}
      <span className="section-label__line" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

function formatTime(tz: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

function tzOffsetLabel(tz: string) {
  const part = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' })
    .formatToParts(new Date())
    .find((p) => p.type === 'timeZoneName');
  return part?.value.replace('GMT', 'UTC') ?? '';
}

/** Live local time for an office. */
export function LocalClock({ timeZone, showZone = true }: { timeZone: string; showZone?: boolean }) {
  const [time, setTime] = useState(() => formatTime(timeZone));
  const [zone, setZone] = useState(() => tzOffsetLabel(timeZone));
  useEffect(() => {
    const id = setInterval(() => {
      setTime(formatTime(timeZone));
      setZone(tzOffsetLabel(timeZone));
    }, 10_000);
    return () => clearInterval(id);
  }, [timeZone]);
  const [h, m] = time.split(':');
  return (
    <span className="clock">
      <span className="clock__t">
        {h}
        <span className="clock__colon">:</span>
        {m}
      </span>
      {showZone && <span className="clock__z">{zone}</span>}
    </span>
  );
}

/** Hours between two time zones right now (accounts for DST). */
export function hoursBetween(a: string, b: string) {
  const off = (tz: string) => {
    const v = tzOffsetLabel(tz).replace('UTC', '') || '0';
    const [hh, mm = '0'] = v.split(':');
    const sign = hh.startsWith('-') ? -1 : 1;
    return sign * (Math.abs(parseInt(hh, 10)) + parseInt(mm, 10) / 60);
  };
  return Math.abs(off(b) - off(a));
}

/** Odometer-style rolling digits, triggered on scroll. */
export function Odometer({ value, className = '' }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const cols = el.querySelectorAll<HTMLElement>('.odo__col');
      cols.forEach((col) => {
        const d = Number(col.dataset.d);
        gsap.fromTo(
          col,
          { yPercent: 0 },
          {
            yPercent: -(10 * 2 + d) * (100 / 30),
            duration: 2.4,
            ease: 'expo',
            delay: Number(col.dataset.i) * 0.08,
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          },
        );
      });
    },
    { scope: ref },
  );
  const reduced = typeof window !== 'undefined' && prefersReducedMotion();
  return (
    <span ref={ref} className={`odo ${className}`} aria-label={value}>
      {value.split('').map((ch, i) => {
        if (!/\d/.test(ch))
          return (
            <span key={i} className="odo__sep" aria-hidden="true">
              {ch}
            </span>
          );
        const d = Number(ch);
        return (
          <span key={i} className="odo__digit" aria-hidden="true">
            <span
              className="odo__col"
              data-d={d}
              data-i={i}
              style={reduced ? { transform: `translateY(${-(20 + d) * (100 / 30)}%)` } : undefined}
            >
              {Array.from({ length: 30 }).map((_, k) => (
                <span key={k}>{k % 10}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** Infinite horizontal rail. Scroll velocity speeds it up and skews it. */
export function VelocityRail({
  children,
  speed = 40,
  reverse = false,
  className = '',
  skew = true,
}: {
  children: ReactNode;
  speed?: number;
  reverse?: boolean;
  className?: string;
  skew?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const root = ref.current;
    if (!track || !root) return;
    if (prefersReducedMotion()) return;
    let x = 0;
    let boost = 0;
    let skewV = 0;
    let lastScroll = window.scrollY;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '100px' });
    io.observe(root);
    const setSkew = gsap.quickSetter(track, 'skewX', 'deg');
    const setX = gsap.quickSetter(track, 'x', 'px');
    const dir = reverse ? 1 : -1;

    const tick = (_t: number, dt: number) => {
      const y = window.scrollY;
      const v = y - lastScroll;
      lastScroll = y;
      if (!visible) return;
      boost += (Math.min(Math.abs(v), 120) * 0.12 - boost) * 0.08;
      const half = track.scrollWidth / 2;
      x += dir * (speed + boost * 60) * (dt / 1000) * (v < 0 ? -1 : 1);
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      setX(x);
      if (skew) {
        skewV += (gsap.utils.clamp(-10, 10, -v * 0.25) - skewV) * 0.1;
        setSkew(skewV);
      }
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
    };
  }, [speed, reverse, skew]);

  return (
    <div ref={ref} className={`rail ${className}`}>
      <div ref={trackRef} className="rail__track">
        <div className="rail__group">{children}</div>
        <div className="rail__group" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Faq({ items, dark = false }: { items: { q: string; a: string }[]; dark?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className={`faq ${dark ? 'faq--dark' : ''}`}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className={`faq__item ${isOpen ? 'is-open' : ''}`}>
            <h3>
              <button
                className="faq__q"
                aria-expanded={isOpen}
                aria-controls={`faq-a-${i}`}
                id={`faq-q-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span className="faq__num t-mono">{String(i + 1).padStart(2, '0')}</span>
                <span className="faq__qt">{item.q}</span>
                <span className="faq__icon" aria-hidden="true" />
              </button>
            </h3>
            <div className="faq__a" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`}>
              <div className="faq__a-inner">
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
