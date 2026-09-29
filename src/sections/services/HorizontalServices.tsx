import { useRef } from 'react';
import { gsap, useGSAP } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/env';
import { services } from '../../data/services';
import { Img } from '../../components/ui/Img';
import { TLink } from '../../components/transition/TLink';
import { SectionLabel } from '../../components/ui/Misc';
import { Arrow } from '../../components/ui/Button';
import './horizontal-services.css';

export function HorizontalServices() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1025px)', () => {
        const tr = track.current!;
        const distance = () => tr.scrollWidth - window.innerWidth;
        const tween = gsap.to(tr, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
              const skew = gsap.utils.clamp(-6, 6, self.getVelocity() / -400);
              gsap.to(tr.querySelectorAll('.hs__img-in'), { skewX: skew, duration: 0.5, ease: 'power3', overwrite: 'auto' });
            },
          },
        });
        // Each image drifts inside its frame as it travels (parallax against the horizontal scroll).
        tr.querySelectorAll<HTMLElement>('.hs__img-in').forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -10 },
            {
              xPercent: 10,
              ease: 'none',
              scrollTrigger: {
                trigger: img.parentElement,
                containerAnimation: tween,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            },
          );
        });
      });
    },
    { scope: root },
  );

  return (
    <section className="hs" ref={root} data-theme="dark" aria-labelledby="hs-title">
      <div className="hs__track" ref={track}>
        <div className="hs__intro">
          <SectionLabel index="02">All services</SectionLabel>
          <h2 id="hs-title" className="hs__title">
            Six services.
            <br />
            <span className="t-serif">One team.</span>
          </h2>
          <p className="hs__lead t-body-l">
            Every shipment is door to door and coordinated by EZ 2 SHIP from quote to delivery. Scroll to explore each
            one.
          </p>
          <div className="hs__bar" aria-hidden="true">
            <span ref={bar} />
          </div>
        </div>
        {services.map((s) => (
          <article key={s.slug} className="hs__panel">
            <TLink to={`/services/${s.slug}`} className="hs__link" data-cursor="view" data-cursor-label="Explore">
              <div className="hs__img">
                <div className="hs__img-in">
                  <Img name={s.image} alt={s.imageAlt} sizes="(max-width: 1024px) 90vw, 46vw" />
                </div>
              </div>
              <div className="hs__meta">
                <span className="t-mono hs__idx">{s.index}</span>
                <h3 className="hs__name">{s.title}</h3>
                <p className="hs__sum">{s.summary}</p>
                <div className="hs__tags">
                  {s.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
                <span className="hs__more tlink">
                  Explore <Arrow dir="e" />
                </span>
              </div>
            </TLink>
          </article>
        ))}
      </div>
    </section>
  );
}
