import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { services } from '../../data/services';
import { Stage } from '../../three/Stage';
import { DistortViewer } from '../../three/DistortViewer';
import { TLink } from '../../components/transition/TLink';
import { SectionLabel } from '../../components/ui/Misc';
import { RevealText } from '../../components/ui/RevealText';
import { Img } from '../../components/ui/Img';
import { Arrow, Button } from '../../components/ui/Button';
import { textureUrl } from '../../lib/images';
import { useIsDesktop } from '../../lib/env';
import './services-selector.css';

const ease = [0.16, 1, 0.3, 1] as const;

export function ServicesSelector() {
  const [active, setActive] = useState(0);
  const viewerRef = useRef<HTMLDivElement>(null);
  const desktop = useIsDesktop();
  const urls = useMemo(() => services.map((s) => textureUrl(s.image, 760)), []);
  const s = services[active];

  return (
    <section className="svc" data-theme="dark" id="services">
      <div className="wrap">
        <header className="svc__head">
          <SectionLabel index="02">Services</SectionLabel>
          <RevealText as="h2" className="svc__title t-xl">
            Six ways to <span className="t-serif blue">move</span> a vehicle.
          </RevealText>
          <p className="svc__intro t-body-l t-muted">
            Pick the service that fits what you’re shipping and where it’s going. Every option is door to door, and every
            shipment is coordinated by one team from quote to delivery.
          </p>
        </header>

        {desktop ? (
          <div className="svc__body">
            <ol className="svc__list">
              {services.map((item, i) => (
                <li key={item.slug}>
                  <TLink
                    to={`/services/${item.slug}`}
                    className={`svc__item ${i === active ? 'is-active' : ''}`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    data-cursor="view"
                    data-cursor-label="Explore"
                  >
                    <span className="svc__num t-mono">{item.index}</span>
                    <span className="svc__name">{item.name}</span>
                    <span className="svc__arrow" aria-hidden="true">
                      <Arrow dir="e" />
                    </span>
                    <span className="svc__bar" aria-hidden="true" />
                  </TLink>
                </li>
              ))}
            </ol>

            <div className="svc__viewer">
              <div className="svc__frame" ref={viewerRef} data-cursor="view" data-cursor-label="Explore">
                <Stage
                  className="svc__stage"
                  camera={{ position: [0, 0, 1] }}
                  fallback={<Img name={s.image} alt={s.imageAlt} className="svc__fallback" />}
                  label={s.imageAlt}
                >
                  <DistortViewer urls={urls} index={active} hostRef={viewerRef} />
                </Stage>
                <TLink to={`/services/${s.slug}`} className="svc__frame-link" tabIndex={-1} aria-hidden="true" />
                <div className="svc__counter t-mono">
                  <span>{s.index}</span> / 06
                </div>
                <div className="svc__tags">
                  {s.tags.map((t) => (
                    <span key={t} className="tag svc__tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={s.slug}
                  className="svc__detail"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.7, ease } }}
                  exit={{ opacity: 0, y: -10, transition: { duration: 0.25 } }}
                >
                  <p className="svc__tagline">{s.tagline}</p>
                  <p className="svc__summary t-muted">{s.summary}</p>
                  <TLink to={`/services/${s.slug}`} className="tlink svc__more">
                    Explore {s.title} <Arrow dir="e" />
                  </TLink>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="svc__carousel" data-lenis-prevent-touch>
            {services.map((item) => (
              <TLink key={item.slug} to={`/services/${item.slug}`} className="svc__card">
                <Img name={item.image} alt={item.imageAlt} sizes="80vw" />
                <div className="svc__card-body">
                  <span className="t-mono svc__num">{item.index} / 06</span>
                  <h3 className="svc__card-title">{item.name}</h3>
                  <p className="t-small t-muted">{item.summary}</p>
                  <span className="tlink">
                    Explore <Arrow dir="e" />
                  </span>
                </div>
              </TLink>
            ))}
          </div>
        )}

        <div className="svc__foot">
          <Button to="/services" variant="ghost-light" size="l">
            All services
          </Button>
        </div>
      </div>
    </section>
  );
}
