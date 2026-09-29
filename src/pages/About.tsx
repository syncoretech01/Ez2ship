import { useEffect, useState } from 'react';
import { PageHero, CTABand } from '../components/page/PageHero';
import { ColumnSlider } from '../components/page/ColumnSlider';
import { SectionLabel, Odometer, LocalClock, hoursBetween } from '../components/ui/Misc';
import { RevealText } from '../components/ui/RevealText';
import { Reveal } from '../components/ui/Reveal';
import { Img } from '../components/ui/Img';
import { Button } from '../components/ui/Button';
import { company, offices, usOffice, uaeOffice } from '../data/site';
import { useMeta } from '../lib/meta';
import './about.css';

const PRINCIPLES = [
  {
    t: 'Matched, not assigned',
    d: 'Every vehicle is placed with a carrier suited to its size, value and route — open or enclosed, across town or overseas.',
  },
  {
    t: 'One point of contact',
    d: 'The same team follows your shipment from the first question to the moment the keys are handed back.',
  },
  {
    t: 'Straight answers',
    d: 'Clear information about options, timing and requirements before you book — including what we need from you.',
  },
  {
    t: 'Your level of protection',
    d: 'We explain the difference between open and enclosed transport and let you choose what’s right for your vehicle.',
  },
];

function Offices() {
  const [active, setActive] = useState<0 | 1 | null>(null);
  const [diff, setDiff] = useState(() => hoursBetween(usOffice.timeZone, uaeOffice.timeZone));
  useEffect(() => {
    const id = setInterval(() => setDiff(hoursBetween(usOffice.timeZone, uaeOffice.timeZone)), 60_000);
    return () => clearInterval(id);
  }, []);
  return (
    <section className="ofs" data-theme="dark">
      <div className="wrap ofs__head">
        <SectionLabel index="02">Two offices</SectionLabel>
        <RevealText as="h2" className="t-xl">
          Florida <span className="t-serif">&amp;</span> Dubai.
        </RevealText>
        <p className="t-body-l ofs__lead">
          Dubai is currently {diff} hours ahead of Sunny Isles Beach — so between our two offices, someone is working your
          shipment across both ends of the day.
        </p>
      </div>
      <div className="ofs__split" onMouseLeave={() => setActive(null)}>
        {offices.map((o, i) => (
          <article
            key={o.id}
            className={`ofs__panel ${active === i ? 'is-active' : ''} ${active !== null && active !== i ? 'is-shrunk' : ''}`}
            onMouseEnter={() => setActive(i as 0 | 1)}
          >
            <Img name={o.image} alt={`${o.city} skyline`} sizes="(max-width: 1024px) 100vw, 60vw" className="ofs__img" />
            <div className="ofs__shade" />
            <div className="ofs__body">
              <div className="ofs__top">
                <span className="t-mono">
                  {o.code} — {o.role}
                </span>
                <span className="ofs__clock">
                  <LocalClock timeZone={o.timeZone} />
                </span>
              </div>
              <div className="ofs__bottom">
                <h3 className="ofs__city">{o.city}</h3>
                <p className="ofs__region">{o.region}</p>
                <address className="ofs__addr">
                  {o.lines.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </address>
                <div className="ofs__actions">
                  <Button href={o.phone.href} variant="light" icon="phone" size="m">
                    {o.phone.display}
                  </Button>
                  <a className="tlink ofs__map" href={o.mapsUrl} target="_blank" rel="noopener noreferrer">
                    Open in Maps ↗
                  </a>
                </div>
                <p className="t-mono ofs__coords">{o.coordsLabel}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function About() {
  useMeta(
    'About',
    'EZ 2 SHIP LLC (MC-1762460) is an auto-transport brokerage headquartered in Sunny Isles Beach, Florida, with a branch office in Dubai, UAE.',
  );
  return (
    <>
      <PageHero
        kicker="About"
        lines={['Two offices.', 'One team.']}
        accent={1}
        lead={
          <>
            {company.legalName} is an auto-transport brokerage headquartered in Sunny Isles Beach, Florida, with a branch
            office in Dubai, UAE — arranging vehicle transportation across the United States and internationally.
          </>
        }
        actions={
          <Button to="/contact" size="l" variant="ghost">
            Contact us
          </Button>
        }
        meta={<>{company.mc}</>}
      />

      <section className="ab section" data-theme="light">
        <div className="wrap ab__grid">
          <div className="ab__side">
            <SectionLabel index="01">What we do</SectionLabel>
          </div>
          <div className="ab__main">
            <RevealText as="p" className="ab__statement">
              As a brokerage, our job is to match every vehicle with the right carrier for its route, its timeline and the
              level of protection it needs — and to stay with the shipment until the keys are handed back.
            </RevealText>
            <div className="ab__facts">
              <Reveal className="ab__mc">
                <p className="t-mono t-muted">Operating authority</p>
                <p className="ab__mc-n">
                  MC-<Odometer value={company.mcDigits} />
                </p>
              </Reveal>
              <dl className="ab__dl">
                {[
                  ['Company', company.legalName],
                  ['Headquarters', usOffice.lines.join(', ')],
                  ['UAE branch', uaeOffice.lines.join(', ')],
                  ['Carrier types', 'Open and enclosed'],
                  ['Vehicles', 'Cars, SUVs, pickup trucks, motorcycles, luxury & exotic'],
                  ['Coverage', 'Nationwide (U.S.) and international'],
                ].map(([k, v], i) => (
                  <Reveal key={k} delay={i * 0.04} className="ab__row">
                    <dt className="t-mono">{k}</dt>
                    <dd>{v}</dd>
                  </Reveal>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <Offices />

      <section className="pr section" data-theme="light">
        <div className="wrap pr__grid">
          <ColumnSlider
            className="pr__cols"
            columns={[
              ['porsche-snow', 'highway-semis', 'moto-road'],
              ['suv-road', 'dock-sportscar', 'classic-muscle'],
            ]}
          />
          <div className="pr__main">
            <SectionLabel index="03">How we work</SectionLabel>
            <RevealText as="h2" className="t-l pr__title">
              The way we <span className="t-serif blue">ship.</span>
            </RevealText>
            <ol className="pr__list">
              {PRINCIPLES.map((p, i) => (
                <Reveal as="li" key={p.t} delay={i * 0.06} className="pr__item">
                  <span className="pr__n">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="pr__t">{p.t}</h3>
                    <p className="pr__d">{p.d}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <CTABand title={['Let’s move', 'something.']} />
    </>
  );
}
