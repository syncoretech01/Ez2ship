import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Stage } from '../../three/Stage';
import { JourneyScene, JOURNEY_STAGES, type JourneyState } from '../../three/JourneyScene';
import { ScrollTrigger, useGSAP } from '../../lib/gsap';
import { prefersReducedMotion, useReducedMotion } from '../../lib/env';
import { SectionLabel } from '../../components/ui/Misc';
import { Img } from '../../components/ui/Img';
import './journey.css';

export const STAGES = [
  {
    title: 'Vehicle pickup',
    short: 'Pickup',
    desc: 'A carrier meets you at your door — or the closest spot a full-size truck can safely reach — and reviews the vehicle’s condition with you before loading.',
    meta: 'Door to door',
  },
  {
    title: 'Loading',
    short: 'Loading',
    desc: 'Your vehicle is driven or winched up the ramps and secured to the deck for the trip.',
    meta: 'Secured on deck',
  },
  {
    title: 'Highway transport',
    short: 'Highway',
    desc: 'It travels the interstate network toward its destination — or to the departure port if it’s heading overseas.',
    meta: 'Open or enclosed carrier',
  },
  {
    title: 'Port & ocean freight',
    short: 'Port',
    desc: 'International shipments are handed over at the port and cross the ocean by container or roll-on/roll-off vessel.',
    meta: 'International shipments',
  },
  {
    title: 'Destination',
    short: 'Destination',
    desc: 'On arrival the vehicle clears local requirements and continues by carrier into the destination city.',
    meta: 'Final leg',
  },
  {
    title: 'Delivery',
    short: 'Delivery',
    desc: 'The vehicle is unloaded and its condition reviewed with you — or someone you designate — at the delivery address.',
    meta: 'Handover',
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

function stageFor(p: number) {
  for (let i = 0; i < 6; i++) if (p < JOURNEY_STAGES[i + 1]) return i;
  return 5;
}

export function Journey() {
  const root = useRef<HTMLElement>(null);
  const state = useRef<JourneyState>({ p: 0 });
  const fillRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const stageRef = useRef(0);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        state.current.p = 0.36;
        return;
      }
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: '+=650%',
        pin: true,
        anticipatePin: 1,
        onUpdate(self) {
          const p = self.progress;
          state.current.p = p;
          if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;
          if (markerRef.current) markerRef.current.style.left = `${p * 100}%`;
          const s = stageFor(p);
          if (s !== stageRef.current) {
            stageRef.current = s;
            setStage(s);
          }
        },
      });
      return () => st.kill();
    },
    { scope: root },
  );

  const s = STAGES[stage];

  return (
    <section className={`jr ${reduced ? 'jr--static' : ''}`} ref={root} data-theme="light" aria-labelledby="journey-title">
      <div className="jr__pin">
        <Stage
          className="jr__stage"
          camera={{ fov: 30, position: [-44, 22, 58], near: 1, far: 600 }}
          shadows
          exposure={1.02}
          fallback={<Img name="highway-forest" alt="" className="jr__fallback" />}
          label="Illustrated journey of a vehicle from pickup, onto a carrier, across the highway, through a port and ocean crossing, to delivery"
        >
          <JourneyScene state={state} />
        </Stage>
        <div className="jr__scrim" aria-hidden="true" />

        <div className="jr__ui">
          <div className="jr__top">
            <SectionLabel index="03">The journey</SectionLabel>
            <h2 id="journey-title" className="jr__h t-mono">
              Door to door — and dock to dock
            </h2>
          </div>

          {!reduced && (
            <div className="jr__info" aria-live="polite">
              <div className="jr__count t-mono">
                <span className="jr__count-n">{String(stage + 1).padStart(2, '0')}</span>
                <span className="jr__count-d">/ 06</span>
                <span className="jr__meta">{s.meta}</span>
              </div>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.h3
                  key={s.title}
                  className="jr__title"
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1, transition: { duration: 0.8, ease } }}
                  exit={{ y: '-60%', opacity: 0, transition: { duration: 0.4, ease } }}
                >
                  {s.title}
                </motion.h3>
              </AnimatePresence>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={s.desc}
                  className="jr__desc"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease, delay: 0.1 } }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                >
                  {s.desc}
                </motion.p>
              </AnimatePresence>
            </div>
          )}

          {!reduced && (
            <div className="jr__rail" aria-hidden="true">
              <div className="jr__track">
                <div className="jr__fill" ref={fillRef} />
                <div className="jr__marker" ref={markerRef}>
                  <span />
                </div>
                {STAGES.map((x, i) => (
                  <div
                    key={x.short}
                    className={`jr__node ${i <= stage ? 'is-on' : ''}`}
                    style={{ left: `${JOURNEY_STAGES[i] * 100}%` }}
                  >
                    <span className="jr__dot" />
                    <span className="jr__lbl t-mono">{x.short}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ol className={reduced ? 'jr__list' : 'sr-only'}>
        {STAGES.map((x, i) => (
          <li key={x.title} className="jr__item">
            <span className="t-mono">{String(i + 1).padStart(2, '0')}</span>
            <h3>{x.title}</h3>
            <p>{x.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
