import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from 'react';
import { useTransitionNav } from './TransitionProvider';
import { preloadRoute } from '../../routes';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string };

/** Internal link that plays the page transition instead of a hard navigation. */
export const TLink = forwardRef<HTMLAnchorElement, Props>(function TLink(
  { to, onClick, onMouseEnter, onFocus, children, ...rest },
  ref,
) {
  const { go } = useTransitionNav();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    go(to);
  };

  const warm = () => {
    preloadRoute(to.split(/[?#]/)[0]).catch(() => undefined);
  };

  return (
    <a
      ref={ref}
      href={to}
      onClick={handleClick}
      onMouseEnter={(e) => {
        warm();
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        warm();
        onFocus?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
});
