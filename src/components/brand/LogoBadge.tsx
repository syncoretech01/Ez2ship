import { useId, type CSSProperties } from 'react';
import { GLOBE_LAND, GLOBE_GRATICULE } from './globePaths';
import './logo-badge.css';

interface Props {
  className?: string;
  style?: CSSProperties;
  /** Hide the "LLC" line and ribbon text (for very small renders such as favicons). */
  mark?: boolean;
  title?: string;
}

/**
 * EZ 2 SHIP badge — the company emblem (globe, container ship, wave, truck and ribbon)
 * redrawn as vector art in the site palette: chrome ring, midnight navy, electric blue.
 */
export function LogoBadge({ className = '', style, mark = false, title = 'EZ 2 SHIP LLC' }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (n: string) => `${n}-${uid}`;
  const url = (n: string) => `url(#${id(n)})`;
  return (
    <svg className={`badge ${className}`} style={style} viewBox="0 0 240 240" role="img" aria-label={title}>
      <defs>
        <linearGradient id={id('chrome')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.22" stopColor="#c9cdd4" />
          <stop offset="0.4" stopColor="#7e8594" />
          <stop offset="0.55" stopColor="#f1f2f4" />
          <stop offset="0.72" stopColor="#9aa0ab" />
          <stop offset="1" stopColor="#e6e8ec" />
        </linearGradient>
        <radialGradient id={id('ocean')} cx="0.38" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#223a7a" />
          <stop offset="0.55" stopColor="#13224a" />
          <stop offset="1" stopColor="#0a1430" />
        </radialGradient>
        <linearGradient id={id('land')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6d84ff" />
          <stop offset="0.5" stopColor="#2f52ff" />
          <stop offset="1" stopColor="#1c38d8" />
        </linearGradient>
        <linearGradient id={id('sea')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#13224a" />
          <stop offset="1" stopColor="#070d1d" />
        </linearGradient>
        <linearGradient id={id('ribbon')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c2f60" />
          <stop offset="1" stopColor="#0b1733" />
        </linearGradient>
        <clipPath id={id('disc')}>
          <circle cx="120" cy="116" r="101" />
        </clipPath>
        <clipPath id={id('globe')}>
          <circle cx="120" cy="94" r="78" />
        </clipPath>
      </defs>

      {/* chrome ring */}
      <circle className="badge__ring" cx="120" cy="116" r="112" fill={url('chrome')} />
      <circle cx="120" cy="116" r="105" fill="#070d1d" />
      <circle cx="120" cy="116" r="102.5" fill="#0b1733" />

      <g clipPath={url('disc')}>
        {/* globe */}
        <g className="badge__globe" clipPath={url('globe')}>
          <circle cx="120" cy="94" r="78" fill={url('ocean')} />
          <path d={GLOBE_GRATICULE} fill="none" stroke="#8fa1ff" strokeOpacity="0.28" strokeWidth="0.6" />
          <path d={GLOBE_LAND} fill={url('land')} />
          <path d={GLOBE_LAND} fill="none" stroke="#b9c6ff" strokeOpacity="0.35" strokeWidth="0.4" />
        </g>
        <circle cx="120" cy="94" r="78" fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="1" />

        {/* sea */}
        <path d="M14 138 C 60 128, 150 126, 228 134 L 228 240 L 14 240 Z" fill={url('sea')} />

        {/* container ship */}
        <g className="badge__ship" transform="translate(0 -8)">
          <path d="M30 140 L 132 134 L 124 156 L 42 160 Z" fill="#101c3e" stroke="#f3f0ea" strokeWidth="1.1" strokeLinejoin="round" />
          <g stroke="#0b1733" strokeWidth="0.6">
            <rect x="42" y="128" width="13" height="9" fill="#2446f5" />
            <rect x="56" y="128" width="13" height="9" fill="#e9e5dc" />
            <rect x="70" y="127" width="13" height="9" fill="#8fa1ff" />
            <rect x="84" y="126" width="13" height="9" fill="#2446f5" />
            <rect x="49" y="119" width="13" height="9" fill="#8fa1ff" />
            <rect x="63" y="118" width="13" height="9" fill="#2446f5" />
            <rect x="77" y="117" width="13" height="9" fill="#e9e5dc" />
            <rect x="98" y="125" width="13" height="9" fill="#e9e5dc" />
          </g>
          <rect x="34" y="118" width="7" height="20" fill="#e9e5dc" stroke="#0b1733" strokeWidth="0.6" />
        </g>

        {/* wave swoosh */}
        <path className="badge__wave" d="M14 160 C 60 148, 108 160, 150 152 S 206 140, 228 136" fill="none" stroke="#f3f0ea" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M20 168 C 70 158, 118 168, 228 148" fill="none" stroke="#8fa1ff" strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" />

        {/* truck */}
        <g className="badge__truck" strokeLinejoin="round" transform="translate(0 -9)">
          <path d="M112 126 L 170 118 L 172 150 L 114 156 Z" fill="#070d1d" stroke="#f3f0ea" strokeWidth="1.2" />
          <path d="M118 134 L 164 128" stroke="#2446f5" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M168 122 L 196 120 L 206 132 L 206 154 L 170 156 Z" fill="#101c3e" stroke="#f3f0ea" strokeWidth="1.2" />
          <path d="M178 124 L 195 123 L 202 133 L 180 134 Z" fill="#8fa1ff" />
          <rect x="190" y="138" width="14" height="10" rx="1.5" fill="none" stroke="#c9cdd4" strokeWidth="1" />
          <path d="M191 141.5 H 203 M191 144.5 H 203" stroke="#c9cdd4" strokeWidth="0.8" />
          <rect x="198" y="136" width="5" height="2.4" rx="1" fill="#ffffff" />
          <circle cx="130" cy="156" r="6.2" fill="#070d1d" stroke="#c9cdd4" strokeWidth="1.2" />
          <circle cx="150" cy="154.5" r="6.2" fill="#070d1d" stroke="#c9cdd4" strokeWidth="1.2" />
          <circle cx="188" cy="156" r="6.4" fill="#070d1d" stroke="#c9cdd4" strokeWidth="1.2" />
        </g>
      </g>

      {/* ribbon */}
      <g className="badge__ribbon">
        <path d="M22 162 L 2 164 L 12 178 L 2 194 L 26 192 Z" fill="#070d1d" stroke={url('chrome')} strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M218 162 L 238 164 L 228 178 L 238 194 L 214 192 Z" fill="#070d1d" stroke={url('chrome')} strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M16 156 Q 120 142 224 156 L 224 192 Q 120 178 16 192 Z" fill={url('ribbon')} stroke={url('chrome')} strokeWidth="1.6" strokeLinejoin="round" />
        {!mark && (
          <>
            <path id={id('arc')} d="M24 180 Q 120 166 216 180" fill="none" />
            <text className="badge__name" fontSize="27" textAnchor="middle" fill="#f3f0ea">
              <textPath href={`#${id('arc')}`} startOffset="50%">
                EZ <tspan fill="#8fa1ff">2</tspan> SHIP
              </textPath>
            </text>
          </>
        )}
      </g>
      {!mark && (
        <text className="badge__llc" x="120" y="213" fontSize="13.5" textAnchor="middle" fill={url('chrome')}>
          LLC
        </text>
      )}
    </svg>
  );
}
