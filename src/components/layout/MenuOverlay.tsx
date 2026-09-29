import { useEffect, useRef, useState, type RefObject } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLocation } from 'react-router';
import { TLink } from '../transition/TLink';
import { menuNav, offices, company } from '../../data/site';
import { services } from '../../data/services';
import { setAppState, useAppState } from '../../lib/store';
import { lockScroll } from '../../lib/scroll';
import { imageInfo } from '../../lib/images';
import { gsap } from '../../lib/gsap';
import { hasFinePointer } from '../../lib/env';
import { LocalClock } from '../ui/Misc';
import './menu.css';

const ease = [0.76, 0, 0.24, 1] as const;
const easeOut = [0.16, 1, 0.3, 1] as const;

export function MenuOverlay({ returnFocus }: { returnFocus: RefObject<HTMLButtonElement | null> }) {
  const open = useAppState('menuOpen');
  const location = useLocation();
  const [hover, setHover] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      lockScroll(true);
      const t = setTimeout(() => firstLinkRef.current?.focus({ preventScroll: true }), 400);
      return () => clearTimeout(t);
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      lockScroll(false);
      setHover(null);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setAppState({ menuOpen: false });
        returnFocus.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, returnFocus]);

  // Cursor-following image preview
  useEffect(() => {
    if (!open || !hasFinePointer()) return;
    const el = previewRef.current;
    if (!el) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3.out' });
    const rTo = gsap.quickTo(el, 'rotation', { duration: 0.9, ease: 'power3.out' });
    let lastX = 0;
    const onMove = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      rTo(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6));
      lastX = e.clientX;
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [open]);

  const close = () => setAppState({ menuOpen: false });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="site-menu"
          className="menu"
          data-theme="dark"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          initial={{ clipPath: 'circle(0% at calc(100% - 60px) 42px)' }}
          animate={{ clipPath: 'circle(150% at calc(100% - 60px) 42px)', transition: { duration: 1, ease } }}
          exit={{ clipPath: 'circle(0% at calc(100% - 60px) 42px)', transition: { duration: 0.8, ease, delay: 0.1 } }}
        >
          <div className="menu__preview" ref={previewRef} aria-hidden="true">
            {menuNav.map((item, i) =>
              item.image ? (
                <div
                  key={item.to}
                  className={`menu__preview-img ${hover === i ? 'is-on' : ''}`}
                  style={{ backgroundImage: `url(${imageInfo(item.image).small})` }}
                />
              ) : null,
            )}
          </div>

          <div className="menu__inner">
            <nav className="menu__nav" aria-label="Menu">
              <ul onMouseLeave={() => setHover(null)}>
                {menuNav.map((item, i) => {
                  const active = location.pathname === item.to;
                  return (
                    <li key={item.to} className="menu__item">
                      <motion.div
                        initial={{ y: '110%' }}
                        animate={{ y: '0%', transition: { duration: 1.1, ease: easeOut, delay: 0.25 + i * 0.06 } }}
                        exit={{ y: '-110%', transition: { duration: 0.5, ease, delay: i * 0.03 } }}
                      >
                        <TLink
                          to={item.to}
                          ref={i === 0 ? firstLinkRef : undefined}
                          className={`menu__link ${active ? 'is-active' : ''} ${hover !== null && hover !== i ? 'is-dim' : ''}`}
                          onMouseEnter={() => setHover(i)}
                          aria-current={active ? 'page' : undefined}
                        >
                          <span className="menu__num t-mono">0{i + 1}</span>
                          <span className="menu__label">{item.label}</span>
                        </TLink>
                      </motion.div>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <motion.aside
              className="menu__side"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 1, ease: easeOut, delay: 0.5 } }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
            >
              <div className="menu__block">
                <p className="t-mono menu__head">Services</p>
                <ul className="menu__services">
                  {services.map((s) => (
                    <li key={s.slug}>
                      <TLink to={`/services/${s.slug}`} className="menu__service">
                        <span className="t-mono">{s.index}</span> {s.title}
                      </TLink>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="menu__offices">
                {offices.map((o) => (
                  <div key={o.id} className="menu__office">
                    <p className="t-mono menu__head">
                      {o.label} · <LocalClock timeZone={o.timeZone} showZone={false} />
                    </p>
                    <a href={o.phone.href} className="menu__phone">
                      {o.phone.display}
                    </a>
                    <p className="menu__addr">{o.lines.join(', ')}</p>
                  </div>
                ))}
              </div>
              <div className="menu__block">
                <p className="t-mono menu__head">Email</p>
                {company.emails.map((e) => (
                  <a key={e} href={`mailto:${e}`} className="menu__mail" onClick={close}>
                    {e}
                  </a>
                ))}
              </div>
            </motion.aside>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
