import { useRef } from 'react';
import { PageHero, CTABand } from '../components/page/PageHero';
import { Button } from '../components/ui/Button';
import { Faq, SectionLabel } from '../components/ui/Misc';
import { RevealText } from '../components/ui/RevealText';
import { Reveal } from '../components/ui/Reveal';
import { Stage } from '../three/Stage';
import { ExplodedScene, EXPLODE_LABELS, type ExplodeState } from '../three/ExplodedScene';
import { ScrollTrigger, gsap, useGSAP } from '../lib/gsap';
import { prefersReducedMotion } from '../lib/env';
import { generalFaqs, usOffice, uaeOffice } from '../data/site';
import { useMeta } from '../lib/meta';
import { Img } from '../components/ui/Img';
import './how.css';

const STEPS = [
  {
    t: 'Request a quote',
    d: 'Share the pickup and delivery locations, your vehicle’s year, make and model, whether it runs, open or enclosed, and your first available date — online or by phone.',
  },
  {
    t: 'Review & book',
    d: 'We come back with your quote and answer your questions. When you’re happy with it, we book the shipment.',
  },
  {
    t: 'Carrier & schedule',
    d: 'We match your vehicle with a carrier running your route and coordinate a pickup window that works for you.',
  },
  {
    t: 'Pickup & inspection',
    d: 'The driver reviews the vehicle’s condition with you, records it on the bill of lading and secures it on the trailer.',
  },
  {
    t: 'In transit',
    d: `Your vehicle travels to its destination. Questions on the way? Our US office (${usOffice.phone.display}) and UAE office (${uaeOffice.phone.display}) are a call away.`,
  },
  {
    t: 'Delivery',
    d: 'The vehicle is unloaded and its condition reviewed with you — or someone you designate — before sign-off.',
  },
];

const PREP = [
  'Remove personal items, toll tags and loose accessories.',
  'Photograph the vehicle from every side in good light.',
  'Keep the fuel level low — around a quarter tank is common practice.',
  'Disable alarms and share any special starting instructions.',
  'Tell us about modifications, low clearance or anything that changes its size.',
  'Make sure someone can hand over and receive the keys.',
];

function RouteSteps() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const path = root.current!.querySelector<SVGPathElement>('.rs__path')!;
      const car = root.current!.querySelector<SVGGElement>('.rs__car')!;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current!.querySelector('.rs__track'), start: 'top 60%', end: 'bottom 70%', scrub: 0.8 },
      });
      tl.fromTo(path, { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none' }, 0).to(
        car,
        { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: 90 }, ease: 'none' },
        0,
      );
      gsap.utils.toArray<HTMLElement>('.rs__step').forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 62%',
          onEnter: () => el.classList.add('is-on'),
          onLeaveBack: () => el.classList.remove('is-on'),
        });
      });
    },
    { scope: root },
  );

  // A winding road down the page: alternating bends between the step columns.
  const d = 'M 500 0 C 500 120, 180 140, 180 300 S 820 460, 820 620 S 180 780, 180 940 S 820 1100, 820 1260 S 180 1420, 180 1580 S 500 1760, 500 1880';

  return (
    <section className="rs section" ref={root} data-theme="light">
      <div className="wrap">
        <div className="shead">
          <SectionLabel index="01">The process</SectionLabel>
          <RevealText as="h2" className="shead__title t-xl">
            Six steps, <span className="t-serif blue">one route.</span>
          </RevealText>
          <p className="shead__text t-body-l t-muted">One team coordinates every step, from the first question to the moment your keys are handed back.</p>
        </div>
        <div className="rs__track">
          <svg className="rs__svg" viewBox="0 0 1000 1880" preserveAspectRatio="none" aria-hidden="true">
            <path className="rs__road" d={d} />
            <path className="rs__base" d={d} />
            <path className="rs__path" d={d} />
            <g className="rs__car">
              <rect x="-11" y="-20" width="22" height="40" rx="7" />
              <rect x="-8" y="-9" width="16" height="10" rx="2" className="rs__car-glass" />
            </g>
          </svg>
          <ol className="rs__steps">
            {STEPS.map((s, i) => (
              <li key={s.t} className={`rs__step rs__step--${i % 2 ? 'r' : 'l'}`}>
                <span className="rs__num">{String(i + 1).padStart(2, '0')}</span>
                <div className="rs__body">
                  <h3 className="rs__t">{s.t}</h3>
                  <p className="rs__d">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Exploded() {
  const root = useRef<HTMLElement>(null);
  const state = useRef<ExplodeState>({ p: 0 });
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        state.current.p = 1;
        return;
      }
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: '+=180%',
        pin: true,
        onUpdate: (self) => (state.current.p = self.progress),
      });
      return () => st.kill();
    },
    { scope: root },
  );
  return (
    <section className="xp" ref={root} data-theme="light" aria-labelledby="xp-title">
      <div className="xp__pin">
        <Stage
          className="xp__stage"
          camera={{ fov: 32, position: [9, 4, 9], near: 0.1, far: 100 }}
          fallback={<Img name="bmw-blue" alt="" className="xp__fallback" />}
          label="A car separating into its parts, each labelled with a detail needed for a shipping quote"
        >
          <ExplodedScene state={state} labels={labels} />
        </Stage>
        <div className="xp__labels" aria-hidden="true">
          {EXPLODE_LABELS.map((l, i) => (
            <div
              key={l}
              className="xp__label"
              ref={(el) => {
                labels.current[i] = el;
              }}
            >
              <span className="xp__dot" />
              <span className="xp__line" />
              <span className="xp__txt">
                <span className="t-mono">{String(i + 1).padStart(2, '0')}</span> {l}
              </span>
            </div>
          ))}
        </div>
        <div className="xp__copy">
          <SectionLabel index="02">Your quote, taken apart</SectionLabel>
          <h2 id="xp-title" className="xp__title">
            Seven details. <span className="t-serif blue">That’s it.</span>
          </h2>
          <p className="t-body-l t-muted xp__p">Everything we need to prepare your quote — nothing more.</p>
          <ul className="sr-only">
            {EXPLODE_LABELS.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <Button to="/quote" size="l">
            Start your quote
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function HowItWorks() {
  useMeta(
    'How it works',
    'How vehicle shipping with EZ 2 SHIP works — from your quote request and booking to pickup, transit and delivery.',
  );
  return (
    <>
      <PageHero
        kicker="How it works"
        lines={['Quote. Book.', 'Ship. Done.']}
        accent={1}
        lead="From your first quote to the handover at delivery — here’s exactly how shipping a vehicle with EZ 2 SHIP works."
        actions={
          <Button to="/quote" size="l">
            Get a shipping quote
          </Button>
        }
        meta={<>Door to door · US + international</>}
      />
      <RouteSteps />
      <Exploded />
      <section className="prep section" data-theme="dark">
        <div className="wrap prep__grid">
          <div>
            <SectionLabel index="03">Before pickup</SectionLabel>
            <RevealText as="h2" className="t-l prep__title">
              Ready the <span className="t-serif">vehicle.</span>
            </RevealText>
            <p className="prep__note">General good practice — your coordinator confirms anything specific to your shipment.</p>
          </div>
          <ol className="prep__list">
            {PREP.map((p, i) => (
              <Reveal as="li" key={p} delay={i * 0.05} className="prep__item">
                <span className="t-mono">{String(i + 1).padStart(2, '0')}</span>
                <span>{p}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
      <section className="svp-faq section" data-theme="light">
        <div className="wrap svp-faq__grid">
          <div>
            <SectionLabel index="04">Questions</SectionLabel>
            <RevealText as="h2" className="t-l svp-faq__title">
              Still <span className="t-serif blue">wondering?</span>
            </RevealText>
          </div>
          <Faq items={generalFaqs} />
        </div>
      </section>
      <CTABand />
    </>
  );
}
