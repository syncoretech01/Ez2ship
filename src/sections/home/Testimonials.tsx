import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { testimonials } from '../../data/testimonials';
import { gsap, SplitText, useGSAP } from '../../lib/gsap';
import { prefersReducedMotion, useReducedMotion } from '../../lib/env';
import { SectionLabel } from '../../components/ui/Misc';
import { RevealText } from '../../components/ui/RevealText';
import { Img } from '../../components/ui/Img';
import { Arrow } from '../../components/ui/Button';
import './testimonials.css';

const DURATION = 9000;
const ease = [0.76, 0, 0.24, 1] as const;

export function Testimonials() {
  const root = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const reduced = useReducedMotion();
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const t = testimonials[i];
  const n = testimonials.length;

  const go = useCallback((to: number) => setI(((to % n) + n) % n), [n]);

  // Only run the autoplay while the section is on screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Autoplay with a progress bar on the active tab.
  useEffect(() => {
    barRefs.current.forEach((b, k) => b && (b.style.transform = `scaleX(${k < i ? 1 : 0})`));
    if (reduced || paused || !inView) return;
    const bar = barRefs.current[i];
    const tw = bar ? gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: DURATION / 1000, ease: 'none' }) : null;
    const id = setTimeout(() => go(i + 1), DURATION);
    return () => {
      clearTimeout(id);
      tw?.kill();
    };
  }, [i, paused, inView, reduced, go]);

  // Word-by-word reveal of each quote.
  useGSAP(
    () => {
      const el = quoteRef.current;
      if (!el || prefersReducedMotion()) return;
      const split = SplitText.create(el, { type: 'words' });
      gsap.fromTo(
        split.words,
        { opacity: 0, yPercent: 40, filter: 'blur(8px)' },
        { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.025, ease: 'expo' },
      );
      return () => split.revert();
    },
    { dependencies: [i], scope: root },
  );

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(i + 1);
    else if (e.key === 'ArrowLeft') go(i - 1);
    else return;
    e.preventDefault();
    const next = root.current?.querySelectorAll<HTMLButtonElement>('.tm__tab');
    requestAnimationFrame(() => next?.[(((e.key === 'ArrowRight' ? i + 1 : i - 1) % n) + n) % n]?.focus());
  };

  return (
    <section
      className="tm"
      ref={root}
      data-theme="dark"
      aria-labelledby="tm-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="tm__glow" aria-hidden="true" />
      <div className="wrap">
        <header className="tm__head">
          <SectionLabel index="07">Testimonials</SectionLabel>
          <RevealText as="h2" id="tm-title" className="tm__title t-xl">
            In their <span className="t-serif">own words.</span>
          </RevealText>
          <p className="tm__intro t-body-l">What customers say about shipping with EZ 2 SHIP.</p>
        </header>

        <div className="tm__body">
          <div className="tm__main">
            <span className="tm__mark" aria-hidden="true">
              “
            </span>
            <div
              className="tm__panel"
              role="tabpanel"
              id="tm-panel"
              aria-labelledby={`tm-tab-${i}`}
              aria-live={paused ? 'polite' : 'off'}
            >
              <blockquote className="tm__quote" ref={quoteRef} key={`q-${i}`}>
                {t.quote}
              </blockquote>
              <motion.footer
                key={`f-${i}`}
                className="tm__who"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] } }}
              >
                <span className="tm__avatar" aria-hidden="true">
                  {t.name.charAt(0)}
                </span>
                <span className="tm__id">
                  <cite className="tm__name">{t.name}</cite>
                  <span className="tm__meta">{t.meta}</span>
                </span>
                <span className="tm__chips">
                  <span className="tag">{t.vehicle}</span>
                  <span className="tag">{t.detail}</span>
                </span>
              </motion.footer>
            </div>

            <div className="tm__controls">
              <span className="tm__count t-mono">
                <span>{String(i + 1).padStart(2, '0')}</span> / {String(n).padStart(2, '0')}
              </span>
              <div className="tm__arrows">
                <button className="tm__arrow" onClick={() => go(i - 1)} aria-label="Previous testimonial">
                  <Arrow dir="w" />
                </button>
                <button className="tm__arrow" onClick={() => go(i + 1)} aria-label="Next testimonial">
                  <Arrow dir="e" />
                </button>
              </div>
            </div>
          </div>

          <div className="tm__visual" aria-hidden="true">
            <AnimatePresence initial={false}>
              <motion.div
                key={t.image}
                className="tm__img"
                initial={{ clipPath: 'inset(0% 0% 0% 100%)', scale: 1.12 }}
                animate={{ clipPath: 'inset(0% 0% 0% 0%)', scale: 1, transition: { duration: 1.1, ease } }}
                exit={{ opacity: 0.999, transition: { duration: 1.1 } }}
              >
                <Img name={t.image} alt={t.imageAlt} sizes="(max-width: 1024px) 90vw, 40vw" />
              </motion.div>
            </AnimatePresence>
            <div className="tm__stamp t-mono">
              <span>{t.vehicle}</span>
              <span className="tm__stamp-route">{t.detail}</span>
            </div>
          </div>
        </div>

        <div className="tm__tabs" role="tablist" aria-label="Choose a testimonial" onKeyDown={onKey}>
          {testimonials.map((x, k) => (
            <button
              key={x.name}
              id={`tm-tab-${k}`}
              role="tab"
              aria-selected={k === i}
              aria-controls="tm-panel"
              tabIndex={k === i ? 0 : -1}
              className={`tm__tab ${k === i ? 'is-on' : ''}`}
              onClick={() => go(k)}
            >
              <span className="tm__tab-bar">
                <span
                  ref={(el) => {
                    barRefs.current[k] = el;
                  }}
                />
              </span>
              <span className="tm__tab-name">{x.name}</span>
              <span className="tm__tab-meta">
                {x.vehicle} · {x.detail}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
