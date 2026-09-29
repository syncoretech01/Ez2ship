import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { TLink } from '../transition/TLink';
import { LogoBadge } from '../brand/LogoBadge';
import { Button } from '../ui/Button';
import { primaryNav, usOffice } from '../../data/site';
import { onScroll } from '../../lib/scroll';
import { setAppState, useAppState } from '../../lib/store';
import { MenuOverlay } from './MenuOverlay';
import './header.css';

export function Header() {
  const ref = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const menuOpen = useAppState('menuOpen');
  const ready = useAppState('ready');
  const location = useLocation();
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  // Scroll direction + theme sampling (what's underneath the header).
  useEffect(() => {
    let raf = 0;
    let acc = 0;
    const sample = () => {
      raf = 0;
      const h = ref.current;
      if (!h) return;
      const y = h.offsetHeight / 2;
      const els = document.elementsFromPoint(window.innerWidth / 2, y);
      const under = els.find((el) => !h.contains(el) && !el.closest('.cursor, .pt, .menu, .loader, .skip-link'));
      const t = (under?.closest('[data-theme]') as HTMLElement | null)?.dataset.theme;
      setTheme(t === 'dark' ? 'dark' : 'light');
    };
    const off = onScroll((y, v) => {
      setScrolled(y > 30);
      acc = Math.sign(v) === Math.sign(acc) ? acc + v : v;
      if (y < 140) setHidden(false);
      else if (acc > 14) setHidden(true);
      else if (acc < -14) setHidden(false);
      if (!raf) raf = requestAnimationFrame(sample);
    });
    const t1 = setTimeout(sample, 60);
    const t2 = setTimeout(sample, 600);
    const t3 = setTimeout(sample, 1600);
    return () => {
      off();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      cancelAnimationFrame(raf);
    };
  }, [location.pathname, ready]);

  useEffect(() => {
    setHidden(false);
  }, [location.pathname]);

  const toggle = () => setAppState({ menuOpen: !menuOpen });

  return (
    <>
      <header
        ref={ref}
        className="hdr"
        data-hidden={hidden && !menuOpen ? '' : undefined}
        data-scrolled={scrolled ? '' : undefined}
        data-tone={menuOpen ? 'dark' : theme}
        data-menu={menuOpen ? '' : undefined}
      >
        <div className="hdr__inner">
          <TLink to="/" className="hdr__logo" aria-label="EZ 2 SHIP — Home">
            <LogoBadge className="hdr__badge" />
            <span className="hdr__word">
              <span className="hdr__name">
                EZ <span className="hdr__two">2</span> SHIP
              </span>
              <span className="hdr__mc t-mono">LLC · MC-1762460</span>
            </span>
          </TLink>

          <nav className="hdr__nav" aria-label="Primary">
            {primaryNav.map((item) => {
              const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
              return (
                <TLink
                  key={item.to}
                  to={item.to}
                  className={`hdr__link ${active ? 'is-active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="hdr__link-t" data-text={item.label}>
                    {item.label}
                  </span>
                </TLink>
              );
            })}
          </nav>

          <div className="hdr__right">
            <a className="hdr__phone t-mono" href={usOffice.phone.href}>
              <span className="hdr__dot" aria-hidden="true" />
              {usOffice.phone.display}
            </a>
            <Button to="/quote" size="m" variant={theme === 'dark' || menuOpen ? 'light' : 'primary'} className="hdr__cta">
              Get a quote
            </Button>
            <button
              ref={menuBtnRef}
              className="hdr__menu"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              onClick={toggle}
            >
              <span className="hdr__menu-label t-mono">{menuOpen ? 'Close' : 'Menu'}</span>
              <span className="hdr__burger" aria-hidden="true">
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>
      <MenuOverlay returnFocus={menuBtnRef} />
    </>
  );
}
