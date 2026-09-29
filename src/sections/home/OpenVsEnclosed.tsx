import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Stage } from '../../three/Stage';
import { CompareScene, type CompareState } from '../../three/CompareScene';
import { gsap, useGSAP } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/env';
import { SectionLabel } from '../../components/ui/Misc';
import { RevealText } from '../../components/ui/RevealText';
import { Button } from '../../components/ui/Button';
import { Img } from '../../components/ui/Img';
import './compare.css';

const ROWS = [
  {
    k: 'Coverage',
    open: 'Exposed to weather and road conditions — much like driving it yourself.',
    enclosed: 'Fully covered, with walls and a roof between the vehicle and the elements.',
  },
  {
    k: 'Typical cost',
    open: 'Generally the most economical way to ship a vehicle.',
    enclosed: 'Typically priced higher than open transport.',
  },
  {
    k: 'Availability',
    open: 'Most carriers on the road are open — the widest scheduling flexibility.',
    enclosed: 'Fewer trucks on the road, so it can need more lead time.',
  },
  {
    k: 'Per load',
    open: 'Multi-level trailers carry several vehicles at once.',
    enclosed: 'Fewer vehicles per load.',
  },
  {
    k: 'Best for',
    open: 'Daily drivers, SUVs, pickups, dealer purchases and relocations.',
    enclosed: 'Exotic, classic, collector, low-clearance and high-value vehicles.',
  },
];

const MIN = 0.06;
const MAX = 0.94;

export function OpenVsEnclosed() {
  const root = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const state = useRef<CompareState>({ f: 0.5 });
  const [f, setF] = useState(0.5);
  const dragging = useRef(false);
  const tween = useRef<gsap.core.Tween | null>(null);

  const apply = useCallback((v: number) => {
    const c = Math.min(MAX, Math.max(MIN, v));
    state.current.f = c;
    if (handleRef.current) handleRef.current.style.left = `${c * 100}%`;
    if (frameRef.current) frameRef.current.style.setProperty('--f', String(c));
    setF(c);
  }, []);

  const animateTo = useCallback(
    (v: number) => {
      if (prefersReducedMotion()) return apply(v);
      const o = { v: state.current.f };
      tween.current?.kill();
      tween.current = gsap.to(o, { v, duration: 1.1, ease: 'inOut', onUpdate: () => apply(o.v) });
    },
    [apply],
  );

  useEffect(() => apply(0.5), [apply]);

  // A small "try me" sweep when the section first comes into view.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const o = { v: 0.5 };
      gsap
        .timeline({ scrollTrigger: { trigger: frameRef.current, start: 'top 70%', once: true } })
        .to(o, { v: 0.3, duration: 0.9, ease: 'inOut', onUpdate: () => !dragging.current && apply(o.v) })
        .to(o, { v: 0.66, duration: 1.1, ease: 'inOut', onUpdate: () => !dragging.current && apply(o.v) })
        .to(o, { v: 0.5, duration: 0.9, ease: 'inOut', onUpdate: () => !dragging.current && apply(o.v) });
    },
    { scope: root },
  );

  const fromEvent = (e: PointerEvent) => {
    const r = frameRef.current!.getBoundingClientRect();
    return (e.clientX - r.left) / r.width;
  };
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    tween.current?.kill();
    e.currentTarget.setPointerCapture(e.pointerId);
    apply(fromEvent(e));
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) apply(fromEvent(e));
  };
  const onUp = () => (dragging.current = false);
  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 0.1 : 0.03;
    if (e.key === 'ArrowLeft') apply(state.current.f - step);
    else if (e.key === 'ArrowRight') apply(state.current.f + step);
    else if (e.key === 'Home') apply(MIN);
    else if (e.key === 'End') apply(MAX);
    else return;
    e.preventDefault();
  };

  const openShare = Math.round(((f - MIN) / (MAX - MIN)) * 100);
  const lean = f > 0.62 ? 'open' : f < 0.38 ? 'enclosed' : 'both';

  return (
    <section className="cmp" ref={root} data-theme="light" id="open-vs-enclosed">
      <div className="wrap">
        <header className="cmp__head">
          <SectionLabel index="04">Open vs enclosed</SectionLabel>
          <RevealText as="h2" className="cmp__title t-xl">
            Open air or <span className="t-serif blue">fully covered?</span>
          </RevealText>
          <p className="cmp__intro t-body-l t-muted">
            Same route, same door-to-door service — the difference is what surrounds your vehicle on the way. Drag the
            divider to compare.
          </p>
        </header>
      </div>

      <div
        className="cmp__frame"
        ref={frameRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        data-cursor="drag"
      >
        <Stage
          className="cmp__stage"
          camera={{ fov: 17, position: [-2, 5.2, 64], near: 1, far: 300 }}
          localClipping
          fallback={
            <div className="cmp__fallback">
              <Img name="open-carrier" alt="Vehicles on an open car carrier" />
              <Img name="enclosed-ferrari" alt="A sports car inside an enclosed trailer" />
            </div>
          }
          label="A car carrier shown half open and half enclosed"
        >
          <CompareScene state={state} />
        </Stage>
        <span className="cmp__word cmp__word--l" aria-hidden="true">
          Open
        </span>
        <span className="cmp__word cmp__word--r" aria-hidden="true">
          Enclosed
        </span>
        <div
          className="cmp__handle"
          ref={handleRef}
          role="slider"
          tabIndex={0}
          aria-label="Compare open and enclosed transport"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={openShare}
          aria-valuetext={`${openShare}% open, ${100 - openShare}% enclosed`}
          onKeyDown={onKey}
        >
          <span className="cmp__line" />
          <span className="cmp__knob">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M9 6 3 12l6 6M15 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>

      <div className="wrap">
        <div className="cmp__toggle" role="group" aria-label="Show carrier type">
          <button className={lean === 'open' ? 'is-on' : ''} onClick={() => animateTo(MAX)}>
            Show open
          </button>
          <button className={lean === 'both' ? 'is-on' : ''} onClick={() => animateTo(0.5)}>
            Side by side
          </button>
          <button className={lean === 'enclosed' ? 'is-on' : ''} onClick={() => animateTo(MIN)}>
            Show enclosed
          </button>
        </div>

        <div className={`cmp__table is-${lean}`}>
          <div className="cmp__row cmp__row--head">
            <span />
            <span className="cmp__col-h">
              <i className="cmp__dot cmp__dot--open" /> Open transport
            </span>
            <span className="cmp__col-h">
              <i className="cmp__dot cmp__dot--enc" /> Enclosed transport
            </span>
          </div>
          {ROWS.map((r) => (
            <div className="cmp__row" key={r.k}>
              <span className="cmp__k t-mono">{r.k}</span>
              <span className="cmp__open">{r.open}</span>
              <span className="cmp__enc">{r.enclosed}</span>
            </div>
          ))}
          <div className="cmp__row cmp__row--cta">
            <span />
            <span>
              <Button to="/quote?carrier=open" variant="ghost" size="m">
                Quote open transport
              </Button>
            </span>
            <span>
              <Button to="/quote?carrier=enclosed" variant="primary" size="m">
                Quote enclosed transport
              </Button>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
