import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTransitionNav } from '../../components/transition/TransitionProvider';
import { gsap } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/env';
import { SectionLabel } from '../../components/ui/Misc';
import { RevealText } from '../../components/ui/RevealText';
import { TextField } from '../../components/form/Fields';
import { Button } from '../../components/ui/Button';
import { VehicleIcon } from '../services/VehicleSelector';
import { vehicleOptions, type VehicleKind } from '../../data/services';
import './quick-quote.css';

const ROUTE = 'M 60 250 C 170 110, 330 330, 460 150';

/** Three-letter tag for the route card, derived from what the visitor typed. */
const code = (s: string) =>
  s
    .replace(/[^A-Za-z ]/g, '')
    .trim()
    .slice(0, 3)
    .toUpperCase();

export function QuickQuote() {
  const { go } = useTransitionNav();
  const [pickup, setPickup] = useState('');
  const [delivery, setDelivery] = useState('');
  const [vehicle, setVehicle] = useState<VehicleKind | ''>('');
  const [errors, setErrors] = useState<{ pickup?: string; delivery?: string }>({});
  const pathRef = useRef<SVGPathElement>(null);
  const truckRef = useRef<SVGGElement>(null);
  const both = pickup.trim().length > 1 && delivery.trim().length > 1;

  // Draw the route (and drive the truck along it) once both ends are known.
  useEffect(() => {
    const path = pathRef.current;
    const truck = truckRef.current;
    if (!path || !truck) return;
    const reduced = prefersReducedMotion();
    gsap.killTweensOf([path, truck]);
    if (both) {
      gsap.to(path, { drawSVG: '0% 100%', duration: reduced ? 0 : 1.4, ease: 'inOut' });
      gsap.fromTo(
        truck,
        { opacity: 1 },
        {
          motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: true },
          duration: reduced ? 0 : 2.4,
          ease: 'inOut',
        },
      );
    } else {
      gsap.to(path, { drawSVG: '0% 0%', duration: reduced ? 0 : 0.6, ease: 'inOut' });
      gsap.to(truck, { opacity: 0, duration: 0.3 });
    }
  }, [both]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (pickup.trim().length < 2) err.pickup = 'Where is the vehicle now?';
    if (delivery.trim().length < 2) err.delivery = 'Where is it going?';
    setErrors(err);
    if (Object.keys(err).length) return;
    const q = new URLSearchParams({ pickup: pickup.trim(), delivery: delivery.trim() });
    if (vehicle) q.set('vehicle', vehicle);
    go(`/quote?${q.toString()}`);
  };

  const vLabel = vehicleOptions.find((v) => v.id === vehicle)?.label;

  return (
    <section className="qq section" data-theme="light" aria-labelledby="qq-title">
      <div className="wrap qq__grid">
        <div className="qq__copy">
          <SectionLabel index="08">Start a quote</SectionLabel>
          <RevealText as="h2" id="qq-title" className="t-xl qq__title">
            Start with <span className="t-serif blue">the route.</span>
          </RevealText>
          <p className="t-body-l t-muted qq__lead">
            Two locations and your vehicle — that’s all it takes to begin. We’ll carry your answers into the full quote
            form.
          </p>

          <form className="qq__form" onSubmit={submit} noValidate>
            <div className="qq__row">
              <TextField
                label="Pickup — city, state or ZIP"
                value={pickup}
                onChange={(e) => {
                  setPickup(e.target.value);
                  if (errors.pickup) setErrors((x) => ({ ...x, pickup: undefined }));
                }}
                error={errors.pickup}
                name="qq-pickup"
              />
              <TextField
                label="Delivery — city, state or country"
                value={delivery}
                onChange={(e) => {
                  setDelivery(e.target.value);
                  if (errors.delivery) setErrors((x) => ({ ...x, delivery: undefined }));
                }}
                error={errors.delivery}
                name="qq-delivery"
              />
            </div>
            <fieldset className="qq__vehicles">
              <legend className="t-mono">Vehicle</legend>
              <div className="qq__opts" role="radiogroup" aria-label="Vehicle">
                {vehicleOptions.map((v) => (
                  <button
                    type="button"
                    key={v.id}
                    role="radio"
                    aria-checked={vehicle === v.id}
                    className={`qq__opt ${vehicle === v.id ? 'is-on' : ''}`}
                    onClick={() => setVehicle(vehicle === v.id ? '' : v.id)}
                  >
                    <span className="qq__opt-icon">
                      <VehicleIcon kind={v.id} />
                    </span>
                    {v.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="qq__submit">
              <Button type="submit" size="l">
                Continue to your quote
              </Button>
              <span className="t-small t-muted">Takes about two minutes.</span>
            </div>
          </form>
        </div>

        <div className={`qq__card ${both ? 'is-ready' : ''}`} aria-hidden="true">
          <div className="qq__card-top t-mono">
            <span>Route preview</span>
            <span>{both ? 'Ready to quote' : 'Waiting for locations'}</span>
          </div>
          <svg className="qq__map" viewBox="0 0 520 380">
            <defs>
              <pattern id="qq-dots" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="rgba(243,240,234,0.14)" />
              </pattern>
            </defs>
            <rect width="520" height="380" fill="url(#qq-dots)" />
            <path d={ROUTE} className="qq__route-base" />
            <path d={ROUTE} className="qq__route" ref={pathRef} />
            <g ref={truckRef} className="qq__truck" opacity="0">
              <rect x="-15" y="-8" width="30" height="16" rx="4" />
              <rect x="7" y="-6" width="6" height="12" rx="1.5" className="qq__truck-cab" />
            </g>
            <g className={`qq__node ${pickup.trim() ? 'is-on' : ''}`} transform="translate(60 250)">
              <circle r="22" className="qq__pulse" />
              <circle r="8" />
            </g>
            <g className={`qq__node qq__node--b ${delivery.trim() ? 'is-on' : ''}`} transform="translate(460 150)">
              <circle r="22" className="qq__pulse" />
              <circle r="8" />
            </g>
          </svg>
          <div className="qq__labels">
            <div className="qq__end">
              <span className="t-mono">From</span>
              <span className="qq__code">{code(pickup) || '···'}</span>
              <span className="qq__place">{pickup.trim() || 'Pickup location'}</span>
            </div>
            <div className="qq__end qq__end--b">
              <span className="t-mono">To</span>
              <span className="qq__code">{code(delivery) || '···'}</span>
              <span className="qq__place">{delivery.trim() || 'Delivery location'}</span>
            </div>
          </div>
          <div className="qq__vehicle">
            <AnimatePresence mode="wait" initial={false}>
              {vehicle ? (
                <motion.div
                  key={vehicle}
                  className="qq__vehicle-in"
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.45 }}
                >
                  <VehicleIcon kind={vehicle} />
                  <span>{vLabel}</span>
                </motion.div>
              ) : (
                <motion.span key="none" className="t-mono qq__vehicle-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Choose a vehicle
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
