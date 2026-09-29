import { motion } from 'motion/react';
import type { ReactNode, CSSProperties } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: 'div' | 'li' | 'p' | 'section' | 'span' | 'article';
  style?: CSSProperties;
  amount?: number;
}

const ease = [0.16, 1, 0.3, 1] as const;

/** Simple fade-up on enter, built on Motion's viewport detection. */
export function Reveal({ children, className, delay = 0, y = 36, as = 'div', style, amount = 0.2 }: Props) {
  const M = motion[as];
  return (
    <M
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 1.1, ease, delay }}
    >
      {children}
    </M>
  );
}
