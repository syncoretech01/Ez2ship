import { useRef } from 'react';
import { Stage } from '../../three/Stage';
import { NetworkScene, NETWORK_LABELS, type NetworkState } from '../../three/NetworkScene';
import { ScrollTrigger, useGSAP } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/env';
import { SectionLabel } from '../../components/ui/Misc';
import { Img } from '../../components/ui/Img';
import { Button } from '../../components/ui/Button';
import './network.css';

const FROM = 'NATION';
const TO = 'WORLD';
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Deterministic split-flap scramble driven by progress q (0..1) so it scrubs both ways. */
function flapText(q: number) {
  const out: { ch: string; w: number }[] = [];
  for (let i = 0; i < FROM.length; i++) {
    const start = 0.12 + i * 0.1;
    const end = start + 0.22;
    const target = TO[i] ?? '';
    let ch = FROM[i];
    if (q >= end) ch = target;
    else if (q > start) {
      const tick = Math.floor(q * 90) + i * 7;
      ch = GLYPHS[(tick * 13 + i * 5) % GLYPHS.length];
    }
    // the sixth letter has no counterpart — collapse it
    const w = target ? 1 : 1 - Math.min(1, Math.max(0, (q - start) / (end - start)));
    out.push({ ch: ch || FROM[i], w });
  }
  return out;
}

export function Network() {
  const root = useRef<HTMLElement>(null);
  const state = useRef<NetworkState>({ p: 0 });
  const slots = useRef<(HTMLSpanElement | null)[]>([]);
  const phaseA = useRef<HTMLDivElement>(null);
  const phaseB = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const render = (p: number) => {
        const q = Math.min(1, Math.max(0, (p - 0.3) / 0.36));
        flapText(q).forEach((s, i) => {
          const el = slots.current[i];
          if (!el) return;
          if (el.textContent !== s.ch) el.textContent = s.ch;
          el.style.setProperty('--sw', String(s.w));
          el.classList.toggle('is-flip', q > 0.12 + i * 0.1 && q < 0.34 + i * 0.1);
        });
        const a = Math.min(1, Math.max(0, (p - 0.48) / 0.07));
        const b = Math.min(1, Math.max(0, (p - 0.57) / 0.09));
        if (phaseA.current) {
          phaseA.current.style.opacity = String(1 - a);
          phaseA.current.style.transform = `translateY(${-a * 16}px)`;
          phaseA.current.style.visibility = a >= 1 ? 'hidden' : 'visible';
        }
        if (phaseB.current) {
          phaseB.current.style.opacity = String(b);
          phaseB.current.style.transform = `translateY(${(1 - b) * 24}px)`;
          phaseB.current.style.visibility = b <= 0 ? 'hidden' : 'visible';
        }
      };
      if (prefersReducedMotion()) {
        state.current.p = 1;
        render(1);
        return;
      }
      render(0);
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: '+=320%',
        pin: true,
        onUpdate(self) {
          state.current.p = self.progress;
          render(self.progress);
        },
      });
      return () => st.kill();
    },
    { scope: root },
  );

  return (
    <section className="net" ref={root} data-theme="dark" aria-labelledby="net-title">
      <div className="net__pin">
        <Stage
          className="net__stage"
          camera={{ fov: 34, position: [-7, 2.6, 7.6], near: 0.1, far: 100 }}
          fallback={<Img name="container-grid" alt="" className="net__fallback" />}
          label="A dot map of the United States with transport routes, transforming into a globe with international routes"
        >
          <NetworkScene state={state} labels={labels} />
        </Stage>
        <div className="net__labels" aria-hidden="true">
          {NETWORK_LABELS.map((lb, i) => (
            <div
              key={lb.key}
              className={`net-label net-label--${lb.key}`}
              ref={(el) => {
                labels.current[i] = el;
              }}
            >
              <span className="net-label__dot" />
              <span className="net-label__t">{lb.title}</span>
              <span className="net-label__s">{lb.sub}</span>
            </div>
          ))}
        </div>
        <div className="net__glow" aria-hidden="true" />

        <div className="net__ui">
          <div className="net__top">
            <SectionLabel index="05">Network</SectionLabel>
            <span className="t-mono net__note">Routes shown are illustrative</span>
          </div>

          <div className="net__copy">
            <h2 id="net-title" className="net__word" aria-label="Nationwide to worldwide">
              <span className="net__prefix" aria-hidden="true">
                {FROM.split('').map((c, i) => (
                  <span key={i} className="net__slot" ref={(el) => {
            slots.current[i] = el;
          }}>
                    {c}
                  </span>
                ))}
              </span>
              <span className="net__suffix chrome-text" aria-hidden="true">
                WIDE
              </span>
            </h2>
            <div className="net__phases">
              <div className="net__phase" ref={phaseA}>
                <p className="t-body-l">
                  Coast to coast and border to border — we arrange vehicle transport across the continental United
                  States, door to door.
                </p>
              </div>
              <div className="net__phase net__phase--b" ref={phaseB}>
                <p className="t-body-l">
                  And beyond. International shipments are coordinated from our offices in Sunny Isles Beach, Florida and
                  Dubai, UAE — tell us the destination and we’ll confirm what’s possible.
                </p>
                <Button to="/services/international-auto-shipping" variant="light" size="m">
                  International shipping
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
