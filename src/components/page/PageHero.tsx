import type { ReactNode } from 'react';
import { SectionLabel } from '../ui/Misc';
import { Reveal } from '../ui/Reveal';
import { RevealText } from '../ui/RevealText';
import { Button } from '../ui/Button';
import { FlowField } from '../FlowField';
import { KineticTitle } from './KineticTitle';
import { offices, company } from '../../data/site';
import './page.css';

interface Props {
  kicker: string;
  index?: string;
  lines: string[];
  accent?: number;
  lead?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  theme?: 'light' | 'dark';
  meta?: ReactNode;
  children?: ReactNode;
  maxTitle?: number;
  titleFill?: number;
  compact?: boolean;
}

export function PageHero({
  kicker,
  index,
  lines,
  accent,
  lead,
  actions,
  aside,
  theme = 'light',
  meta,
  children,
  maxTitle,
  titleFill,
  compact,
}: Props) {
  return (
    <section className={`ph ph--${theme} ${aside ? 'ph--aside' : ''} ${compact ? 'ph--compact' : ''}`} data-theme={theme}>
      <div className="wrap ph__wrap">
        <div className="ph__top">
          <SectionLabel index={index}>{kicker}</SectionLabel>
          {meta && <div className="ph__meta t-mono">{meta}</div>}
        </div>
        <div className="ph__main">
          <KineticTitle lines={lines} accent={accent} className="ph__title" max={maxTitle} fill={titleFill} />
          <div className="ph__bottom">
            {lead && (
              <Reveal delay={0.5} className="ph__lead t-body-l">
                {lead}
              </Reveal>
            )}
            {actions && (
              <Reveal delay={0.6} className="ph__actions">
                {actions}
              </Reveal>
            )}
          </div>
        </div>
        {aside && <div className="ph__aside">{aside}</div>}
      </div>
      {children}
    </section>
  );
}

export function CTABand({
  title = ['Ready', 'to move?'],
  text = 'Tell us what you’re shipping and where it’s going — we’ll come back with a quote.',
  query = '',
}: {
  title?: [string, string];
  text?: string;
  query?: string;
}) {
  return (
    <section className="band" data-theme="dark">
      <FlowField className="band__flow" />
      <div className="wrap band__wrap">
        <RevealText as="h2" className="band__title" split="chars">
          {title[0]} <span className="band__accent">{title[1]}</span>
        </RevealText>
        <p className="band__text t-body-l">{text}</p>
        <div className="band__actions">
          <Button to={`/quote${query}`} size="xl" variant="light">
            Get your shipping quote
          </Button>
        </div>
        <div className="band__contacts t-mono">
          {offices.map((o) => (
            <a key={o.id} href={o.phone.href}>
              {o.label} · {o.phone.display}
            </a>
          ))}
          <a href={`mailto:${company.primaryEmail}`}>{company.primaryEmail}</a>
        </div>
      </div>
    </section>
  );
}
