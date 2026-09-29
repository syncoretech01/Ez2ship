import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/env';
import { SectionLabel, Odometer, VelocityRail } from '../../components/ui/Misc';
import { Img } from '../../components/ui/Img';
import { company } from '../../data/site';
import './statement.css';

const RAIL = [
  { label: 'Cars', image: 'bmw-blue' },
  { label: 'SUVs', image: 'suv-modern' },
  { label: 'Motorcycles', image: 'moto-sport' },
  { label: 'Trucks', image: 'ram-sunset' },
  { label: 'Luxury & exotic', image: 'mclaren-white' },
  { label: 'Open carriers', image: 'open-carrier' },
  { label: 'Enclosed carriers', image: 'enclosed-ferrari' },
  { label: 'International', image: 'container-grid' },
];

export function Statement() {
  const root = useRef<HTMLElement>(null);
  const text = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      if (!text.current || prefersReducedMotion()) return;
      const split = SplitText.create(text.current, { type: 'words', wordsClass: 'st-word' });
      gsap.fromTo(
        split.words,
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: 'none',
          scrollTrigger: { trigger: text.current, start: 'top 78%', end: 'bottom 45%', scrub: true },
        },
      );
      return () => split.revert();
    },
    { scope: root },
  );

  return (
    <section className="st" ref={root} data-theme="light">
      <div className="wrap st__grid">
        <SectionLabel index="01">The brokerage</SectionLabel>
        <p className="st__text" ref={text}>
          One team for every vehicle and every distance — from a driveway in Florida to a port on the other side of the
          world. We match your car, truck or bike with the carrier that fits the route, the timeline and the level of
          protection it needs.
        </p>
        <div className="st__side">
          <p className="t-mono t-muted">Operating authority</p>
          <p className="st__mc">
            MC-<Odometer value={company.mcDigits} />
          </p>
          <p className="t-small t-muted st__note">
            {company.legalName} — an auto-transport brokerage headquartered in Sunny Isles Beach, Florida, with a branch
            office in Dubai, UAE.
          </p>
        </div>
      </div>

      <div className="st__rails" aria-hidden="true">
        <VelocityRail speed={50} className="st__rail-type">
          {['Cars', 'SUVs', 'Motorcycles', 'Trucks', 'Luxury & exotic', 'Open', 'Enclosed', 'Worldwide'].map((w) => (
            <span key={w} className="st__word">
              {w}
              <span className="st__star">✦</span>
            </span>
          ))}
        </VelocityRail>
        <VelocityRail speed={34} reverse className="st__rail-img">
          {RAIL.map((r) => (
            <figure key={r.label} className="st__card">
              <Img name={r.image} alt="" sizes="(max-width: 640px) 60vw, 26vw" />
              <figcaption className="t-mono">{r.label}</figcaption>
            </figure>
          ))}
        </VelocityRail>
      </div>
    </section>
  );
}
