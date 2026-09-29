import { useRef, type ReactNode, type MouseEventHandler } from 'react';
import { TLink } from '../transition/TLink';
import { useMagnetic } from './useMagnetic';
import './button.css';

type Variant = 'primary' | 'blue' | 'light' | 'ghost' | 'ghost-light';
type Size = 'm' | 'l' | 'xl';

interface Props {
  children: ReactNode;
  to?: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  type?: 'button' | 'submit';
  variant?: Variant;
  size?: Size;
  icon?: 'arrow' | 'phone' | 'mail' | 'none' | 'back';
  magnetic?: boolean;
  className?: string;
  disabled?: boolean;
  external?: boolean;
  ariaLabel?: string;
  cursor?: string;
}

export function Arrow({ dir = 'ne' }: { dir?: 'ne' | 'e' | 'w' }) {
  const rot = dir === 'e' ? 45 : dir === 'w' ? 225 : 0;
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" style={{ transform: `rotate(${rot}deg)` }} aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Icon({ name }: { name: NonNullable<Props['icon']> }) {
  if (name === 'phone')
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path
          d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (name === 'mail')
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path d="M3 6h18v12H3zM3 7l9 6 9-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  if (name === 'back') return <Arrow dir="w" />;
  return <Arrow />;
}

export function Button({
  children,
  to,
  href,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'm',
  icon = 'arrow',
  magnetic = true,
  className = '',
  disabled,
  external,
  ariaLabel,
  cursor,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  useMagnetic(ref, { strength: 0.28, inner: innerRef, radius: 40, enabled: magnetic });

  const cls = `btn btn--${variant} btn--${size} ${icon === 'none' ? 'btn--noicon' : ''} ${className}`;
  const text = typeof children === 'string' ? children : undefined;
  const content = (
    <>
      <span className="btn__fill" aria-hidden="true" />
      <span className="btn__inner" ref={innerRef}>
        <span className="btn__label">
          <span className="btn__text" data-text={text}>
            {children}
          </span>
        </span>
        {icon !== 'none' && (
          <span className="btn__icon" aria-hidden="true">
            <span className="btn__icon-a">
              <Icon name={icon} />
            </span>
            <span className="btn__icon-b">
              <Icon name={icon} />
            </span>
          </span>
        )}
      </span>
    </>
  );

  if (to) {
    return (
      <TLink
        to={to}
        className={cls}
        ref={ref as React.Ref<HTMLAnchorElement>}
        onClick={onClick}
        aria-label={ariaLabel}
        data-cursor={cursor}
      >
        {content}
      </TLink>
    );
  }
  if (href) {
    return (
      <a
        href={href}
        className={cls}
        ref={ref as React.Ref<HTMLAnchorElement>}
        onClick={onClick}
        aria-label={ariaLabel}
        data-cursor={cursor}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {content}
      </a>
    );
  }
  return (
    <button
      type={type}
      className={cls}
      ref={ref as React.Ref<HTMLButtonElement>}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      data-cursor={cursor}
    >
      {content}
    </button>
  );
}
