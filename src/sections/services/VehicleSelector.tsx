import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { gsap } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/env';
import { services, vehicleOptions, type VehicleKind, type CarrierKind } from '../../data/services';
import { SectionLabel } from '../../components/ui/Misc';
import { RevealText } from '../../components/ui/RevealText';
import { Button } from '../../components/ui/Button';
import { TLink } from '../../components/transition/TLink';
import { Arrow } from '../../components/ui/Button';
import './vehicle-selector.css';

/* Side-view silhouettes (viewBox 0 0 400 160, ground at y≈124) */
export const SHAPES: Record<VehicleKind, { body: string; wheels: [number, number, number][] }> = {
  car: {
    body: 'M20,112 C20,100 28,92 44,90 L96,86 C116,70 140,56 170,54 L236,54 C262,54 282,70 300,84 L352,90 C372,93 382,102 382,112 L382,118 C382,121 380,122 376,122 L22,122 C19,122 20,120 20,118 Z',
    wheels: [
      [92, 120, 24],
      [312, 120, 24],
    ],
  },
  suv: {
    body: 'M18,112 C18,98 26,86 42,84 L84,80 C98,58 112,40 140,38 L300,38 C318,38 330,52 340,76 L362,82 C376,86 384,96 384,110 L384,120 C384,122 382,124 378,124 L22,124 C19,124 18,122 18,120 Z',
    wheels: [
      [94, 121, 27],
      [316, 121, 27],
    ],
  },
  truck: {
    body: 'M16,110 C16,98 22,90 36,88 L96,84 C104,62 114,46 136,44 L210,44 C222,44 230,52 232,64 L234,80 L386,80 L388,114 C388,120 386,124 380,124 L20,124 C17,124 16,122 16,118 Z',
    wheels: [
      [96, 121, 27],
      [318, 121, 27],
    ],
  },
  motorcycle: {
    body: 'M112,110 L150,76 C160,66 176,60 196,62 L236,66 L262,56 C272,52 282,54 288,62 L300,80 L322,86 C334,90 338,100 334,108 L300,112 L262,100 L220,108 L178,112 Z',
    wheels: [
      [128, 118, 30],
      [318, 118, 30],
    ],
  },
  exotic: {
    body: 'M16,114 C16,106 22,100 34,98 L110,92 C140,72 170,62 206,62 L246,64 C276,66 300,80 322,94 L366,100 C380,102 386,108 386,114 L386,118 C386,120 384,121 380,121 L20,121 C17,121 16,119 16,117 Z',
    wheels: [
      [96, 119, 23],
      [316, 119, 23],
    ],
  },
};

/** Small static silhouette used in choice cards. */
export function VehicleIcon({ kind }: { kind: VehicleKind }) {
  const sh = SHAPES[kind];
  return (
    <svg viewBox="0 0 400 160" aria-hidden="true">
      <path d={sh.body} fill="currentColor" />
      {sh.wheels.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="currentColor" stroke="var(--chg-bg, #fff)" strokeWidth="6" />
      ))}
    </svg>
  );
}

type Scope = 'domestic' | 'international';
type Priority = 'value' | 'protection';

function recommend(v: VehicleKind, scope: Scope, pr: Priority) {
  const carrier: CarrierKind = v === 'exotic' ? 'enclosed' : pr === 'protection' ? 'enclosed' : 'open';
  let slug: string;
  if (scope === 'international') slug = 'international-auto-shipping';
  else if (v === 'motorcycle') slug = 'motorcycle-shipping';
  else if (v === 'exotic') slug = 'luxury-exotic-transport';
  else if (v === 'suv' || v === 'truck') slug = 'suv-truck-transport';
  else slug = carrier === 'enclosed' ? 'enclosed-auto-transport' : 'open-auto-transport';
  const service = services.find((s) => s.slug === slug)!;

  const reasons: string[] = [];
  if (carrier === 'open') reasons.push('Open carriers are the most common rigs on the road — generally the most economical option with the widest scheduling.');
  else if (v === 'exotic') reasons.push('For high-value and low-clearance vehicles we recommend a fully covered, enclosed trailer.');
  else reasons.push('An enclosed trailer keeps your vehicle covered from weather and road debris for the whole trip.');
  if (scope === 'international') reasons.push('We coordinate the inland leg to the port and the ocean freight together, with offices in Florida and Dubai.');
  if (v === 'motorcycle') reasons.push('Bikes are positioned and secured upright for the trip — include any accessories in your request.');
  if (v === 'truck' || v === 'suv') reasons.push('Share any lift, oversized tires or racks so the carrier can plan deck space.');

  const query = `?vehicle=${v}&carrier=${carrier}${scope === 'international' ? '&scope=international' : ''}`;
  return { service, carrier, reasons, query };
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string; hint?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="vs__group">
      <legend className="t-mono vs__legend">{label}</legend>
      <div className="vs__opts" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={value === o.id}
            className={`vs__opt ${value === o.id ? 'is-on' : ''}`}
            onClick={() => onChange(o.id)}
          >
            <span className="vs__opt-l">{o.label}</span>
            {o.hint && <span className="vs__opt-h">{o.hint}</span>}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function VehicleSelector() {
  const [vehicle, setVehicle] = useState<VehicleKind>('car');
  const [scope, setScope] = useState<Scope>('domestic');
  const [priority, setPriority] = useState<Priority>('value');
  const bodyRef = useRef<SVGPathElement>(null);
  const wheelRefs = useRef<(SVGGElement | null)[]>([]);
  const rec = useMemo(() => recommend(vehicle, scope, priority), [vehicle, scope, priority]);

  useEffect(() => {
    const shape = SHAPES[vehicle];
    const reduced = prefersReducedMotion();
    if (bodyRef.current) {
      gsap.to(bodyRef.current, { morphSVG: shape.body, duration: reduced ? 0 : 0.9, ease: 'inOut' });
    }
    shape.wheels.forEach(([x, y, r], i) => {
      const g = wheelRefs.current[i];
      if (g) gsap.to(g, { attr: { transform: `translate(${x} ${y}) scale(${r / 26})` }, duration: reduced ? 0 : 0.9, ease: 'inOut' });
    });
  }, [vehicle]);

  const enclosed = rec.carrier === 'enclosed';

  return (
    <section className="vs" data-theme="light" id="find-your-service">
      <div className="wrap">
        <div className="shead">
          <SectionLabel index="01">Find your service</SectionLabel>
          <RevealText as="h2" className="shead__title t-xl">
            What are you <span className="t-serif blue">shipping?</span>
          </RevealText>
          <p className="shead__text t-body-l t-muted">
            Three quick choices and we’ll point you to the right service and carrier type — then carry your answers into
            the quote form.
          </p>
        </div>

        <div className="vs__grid">
          <div className="vs__controls">
            <Segmented
              label="01 — Vehicle"
              value={vehicle}
              onChange={setVehicle}
              options={vehicleOptions.map((v) => ({ id: v.id, label: v.label, hint: v.hint }))}
            />
            <Segmented
              label="02 — Destination"
              value={scope}
              onChange={setScope}
              options={[
                { id: 'domestic', label: 'Within the U.S.' },
                { id: 'international', label: 'International' },
              ]}
            />
            <Segmented
              label="03 — Priority"
              value={priority}
              onChange={setPriority}
              options={[
                { id: 'value', label: 'Best value' },
                { id: 'protection', label: 'Maximum protection' },
              ]}
            />
          </div>

          <div className={`vs__stage ${enclosed ? 'is-enclosed' : ''}`}>
            <div className="vs__visual" aria-hidden="true">
              <div className="vs__trailer">
                <span className="vs__trailer-roof" />
                <span className="vs__trailer-wall" />
              </div>
              <svg viewBox="0 0 400 160" className="vs__svg">
                <defs>
                  <linearGradient id="vs-rim" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="0.5" stopColor="#8d939c" />
                    <stop offset="1" stopColor="#e8eaee" />
                  </linearGradient>
                  <linearGradient id="vs-body" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#2446f5" />
                    <stop offset="1" stopColor="#14224a" />
                  </linearGradient>
                </defs>
                <path ref={bodyRef} d={SHAPES.car.body} fill="url(#vs-body)" />
                {SHAPES.car.wheels.map(([x, y, r], i) => (
                  <g
                    key={i}
                    ref={(el) => {
                      wheelRefs.current[i] = el;
                    }}
                    transform={`translate(${x} ${y}) scale(${r / 26})`}
                  >
                    <circle r="26" fill="#0a1226" stroke="#f3f0ea" strokeWidth="4" />
                    <circle r="14" fill="url(#vs-rim)" />
                    <circle r="4" fill="#0a1226" />
                  </g>
                ))}
              </svg>
              <div className="vs__road" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${rec.service.slug}-${rec.carrier}`}
                className="vs__result"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
              >
                <p className="t-mono vs__rec-k">Recommended</p>
                <h3 className="vs__rec">{rec.service.title}</h3>
                <p className="vs__carrier">
                  <span className={`vs__pill ${enclosed ? 'vs__pill--enc' : ''}`}>{enclosed ? 'Enclosed carrier' : 'Open carrier'}</span>
                  {scope === 'international' && <span className="vs__pill vs__pill--intl">International</span>}
                </p>
                <ul className="vs__reasons">
                  {rec.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <div className="vs__actions">
                  <Button to={`/quote${rec.query}`} variant="primary">
                    Quote this setup
                  </Button>
                  <TLink to={`/services/${rec.service.slug}`} className="tlink">
                    About {rec.service.name} <Arrow dir="e" />
                  </TLink>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
