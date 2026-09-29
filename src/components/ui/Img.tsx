import { useRef, useState, type CSSProperties } from 'react';
import { imageInfo } from '../../lib/images';
import { gsap, useGSAP } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/env';

interface Props {
  name: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  /** 0–0.3: amount of scroll parallax applied to the inner image */
  parallax?: number;
  /** Use the photo's natural aspect ratio for the wrapper */
  natural?: boolean;
  position?: string;
  style?: CSSProperties;
}

export function Img({ name, alt, sizes = '100vw', className = '', priority, parallax = 0, natural, position, style }: Props) {
  const info = imageInfo(name);
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useGSAP(
    () => {
      if (!parallax || prefersReducedMotion() || !imgRef.current) return;
      gsap.fromTo(
        imgRef.current,
        { yPercent: -parallax * 100, scale: 1 + parallax * 2.2 },
        {
          yPercent: parallax * 100,
          scale: 1 + parallax * 2.2,
          ease: 'none',
          scrollTrigger: { trigger: wrapRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    },
    { dependencies: [parallax, name] },
  );

  return (
    <div
      ref={wrapRef}
      className={`img ${loaded ? 'is-loaded' : ''} ${className}`}
      style={{
        backgroundImage: `url(${info.blur})`,
        aspectRatio: natural ? `${info.width} / ${info.height}` : undefined,
        ...style,
      }}
    >
      <img
        ref={imgRef}
        src={info.small}
        srcSet={info.srcSet}
        sizes={sizes}
        alt={alt}
        width={info.width}
        height={info.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        style={{ objectPosition: position }}
        draggable={false}
      />
    </div>
  );
}
