import { useRef } from 'react';
import type { Service } from '../../data/services';
import { gsap, useGSAP } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/env';
import { whenReady } from '../../lib/store';
import { KineticTitle } from '../../components/page/KineticTitle';
import { Img } from '../../components/ui/Img';
import { Button } from '../../components/ui/Button';
import { TLink } from '../../components/transition/TLink';
import { Reveal } from '../../components/ui/Reveal';
import './service-hero.css';

const WINDOW_FROM = 'polygon(14% 34%, 30% 12%, 86% 12%, 86% 88%, 14% 88%)';
const WINDOW_TO = 'polygon(0% 0%, 0% 0%, 100% 0%, 100% 100%, 0% 100%)';

export function ServiceHero({ service, query }: { service: Service; query: string }) {
  const root = useRef<HTMLElement>(null);
  const doors = service.slug === 'enclosed-auto-transport' || service.slug === 'luxury-exotic-transport';

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      if (prefersReducedMotion()) return;
      const media = q('.sdh__media')[0] as HTMLElement;
      const img = q('.sdh__media .img img');
      if (doors) {
        const l = q('.sdh__door--l');
        const r = q('.sdh__door--r');
        gsap.set(img, { scale: 1.18 });
        const tl = gsap.timeline({ paused: true });
        tl.to(l, { rotateY: -104, duration: 1.8, ease: 'inOut' }, 0.6)
          .to(r, { rotateY: 104, duration: 1.8, ease: 'inOut' }, 0.66)
          .to(img, { scale: 1.02, duration: 2.4, ease: 'expo' }, 0.8);
        whenReady().then(() => tl.play());
      } else {
        gsap.set(media, { clipPath: WINDOW_FROM });
        gsap.to(media, {
          clipPath: WINDOW_TO,
          ease: 'none',
          scrollTrigger: { trigger: media, start: 'top 85%', end: 'top 15%', scrub: 0.6 },
        });
        gsap.fromTo(
          img,
          { scale: 1.3 },
          { scale: 1, ease: 'none', scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: true } },
        );
      }
    },
    { scope: root, dependencies: [service.slug] },
  );

  return (
    <section className={`sdh sdh--${service.theme}`} ref={root} data-theme={service.theme}>
      <div className="wrap sdh__top">
        <nav className="sdh__crumbs t-mono" aria-label="Breadcrumb">
          <TLink to="/services">Services</TLink>
          <span aria-hidden="true">/</span>
          <span aria-current="page">
            {service.index} — {service.title}
          </span>
        </nav>
        <KineticTitle lines={service.titleLines} accent={1} className="sdh__title" max={240} label={service.title} />
        <div className="sdh__row">
          <Reveal delay={0.4} className="sdh__tagline">
            {service.tagline}
          </Reveal>
          <Reveal delay={0.5} className="sdh__sum t-body-l">
            {service.summary}
          </Reveal>
          <Reveal delay={0.6} className="sdh__actions">
            <Button to={`/quote${query}`} size="l" variant={service.theme === 'dark' ? 'light' : 'primary'}>
              Get a quote
            </Button>
          </Reveal>
        </div>
      </div>

      <div className="sdh__stage">
        <div className={`sdh__media ${doors ? 'sdh__media--doors' : ''}`}>
          <Img name={service.image} alt={service.imageAlt} priority sizes="100vw" />
          {doors && (
            <div className="sdh__doors" aria-hidden="true">
              <span className="sdh__door sdh__door--l">
                <i className="sdh__latch" />
              </span>
              <span className="sdh__door sdh__door--r">
                <i className="sdh__latch" />
              </span>
            </div>
          )}
          <div className="sdh__tags">
            {service.tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
