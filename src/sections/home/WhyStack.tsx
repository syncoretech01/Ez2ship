import { useRef } from 'react';
import { gsap, useGSAP } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/env';
import { SectionLabel } from '../../components/ui/Misc';
import { RevealText } from '../../components/ui/RevealText';
import { SliceImage } from '../../components/ui/SliceImage';
import { TLink } from '../../components/transition/TLink';
import { Arrow } from '../../components/ui/Button';
import './why.css';

const PILLARS = [
  {
    title: 'Nationwide transportation',
    body: 'Coast to coast, city to city — door-to-door vehicle transport across the continental United States.',
    tag: 'Coast to coast',
    image: 'highway-cloverleaf',
    alt: 'Aerial view of a highway cloverleaf interchange',
    link: { to: '/services/open-auto-transport', label: 'Open transport' },
    tone: 'white',
  },
  {
    title: 'International shipping',
    body: 'Inland transport, port handling and ocean freight coordinated as one shipment, with a team on the ground in the UAE.',
    tag: 'Container & RoRo',
    image: 'port-cranes',
    alt: 'Container ship beneath gantry cranes at a port',
    link: { to: '/services/international-auto-shipping', label: 'International shipping' },
    tone: 'navy',
  },
  {
    title: 'Open + enclosed carriers',
    body: 'Choose the economy and availability of open transport, or the full coverage of an enclosed trailer.',
    tag: 'Your choice of protection',
    image: 'carrier-deck',
    alt: 'Vehicles secured on the decks of a moving car carrier',
    link: { to: '/services/enclosed-auto-transport', label: 'Enclosed transport' },
    tone: 'paper',
  },
  {
    title: 'Multiple vehicle types',
    body: 'Cars, SUVs, pickups, motorcycles and luxury or exotic vehicles — each matched to a carrier suited to it.',
    tag: 'Cars · SUVs · Trucks · Bikes · Exotics',
    image: 'raptor-desert',
    alt: 'Black off-road pickup truck in the desert',
    link: { to: '/services', label: 'All services' },
    tone: 'blue',
  },
  {
    title: 'Door-to-door convenience',
    body: 'Pickup and delivery at your addresses — or the nearest spot a full-size carrier can safely reach.',
    tag: 'No terminals to visit',
    image: 'mustang-garage',
    alt: 'A sports car lit up in a parking garage',
    link: { to: '/how-it-works', label: 'How it works' },
    tone: 'white',
  },
  {
    title: 'US + UAE operations',
    body: 'Headquarters in Sunny Isles Beach, Florida and a branch office in Dubai — two time zones working your shipment.',
    tag: 'Florida · Dubai',
    image: 'dubai-interchange',
    alt: 'Dubai skyline with a highway interchange at sunrise',
    link: { to: '/about', label: 'About us' },
    tone: 'ink',
  },
];

export function WhyStack() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => {
        const cards = gsap.utils.toArray<HTMLElement>('.why__card');
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (!next) return;
          const st = { trigger: next, start: 'top bottom', end: 'top top+=120', scrub: true };
          gsap.to(card.querySelector('.why__inner'), { scale: 0.93, yPercent: -3, ease: 'none', scrollTrigger: st });
          gsap.fromTo(card.querySelector('.why__shade'), { opacity: 0 }, { opacity: 0.38, ease: 'none', scrollTrigger: st });
        });
      });
    },
    { scope: root },
  );

  return (
    <section className="why" ref={root} data-theme="light">
      <div className="wrap why__head">
        <SectionLabel index="06">Why EZ 2 SHIP</SectionLabel>
        <RevealText as="h2" className="why__title t-xxl">
          Easy to ship. <span className="t-serif blue">Six reasons</span> why.
        </RevealText>
      </div>

      <div className="why__stack">
        {PILLARS.map((p, i) => (
          <article key={p.title} className={`why__card why__card--${p.tone}`} style={{ zIndex: i + 1 }}>
            <div className="why__inner" data-theme={p.tone === 'navy' || p.tone === 'blue' || p.tone === 'ink' ? 'dark' : 'light'}>
              <div className="why__text">
                <span className="why__num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="why__body">
                  <span className="tag">{p.tag}</span>
                  <h3 className="why__h">{p.title}</h3>
                  <p className="why__p">{p.body}</p>
                  <TLink to={p.link.to} className="tlink why__link">
                    {p.link.label} <Arrow dir="e" />
                  </TLink>
                </div>
              </div>
              <SliceImage name={p.image} alt={p.alt} className="why__img" slices={i % 2 ? 5 : 7} />
              <span className="why__shade" aria-hidden="true" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
