import { useLayoutEffect, type RefObject } from 'react';

interface Options {
  wdth?: number;
  wght?: number;
  max?: number;
  min?: number;
  /** fraction of the container width to fill */
  ratio?: number;
  /** letter-spacing in em, matching the CSS of the real element */
  tracking?: number;
  /** also publish the size as a CSS custom property on this element */
  varEl?: RefObject<HTMLElement | null>;
  varName?: string;
  /** measure this text instead of the element's own content (e.g. the longest line of a wrapped title) */
  sample?: string;
}

/**
 * Sizes a single-line headline so it spans its container's width exactly.
 * Measures a hidden clone at the given variable-font settings, so the result is
 * independent of any in-progress width animation on the real letters.
 */
export function useFitText(ref: RefObject<HTMLElement | null>, opts: Options = {}) {
  const { wdth = 112, wght = 780, max = 400, min = 24, ratio = 1, tracking = -0.045, varEl, varName, sample } = opts;
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const probe = document.createElement('span');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = [
      'position:absolute',
      'visibility:hidden',
      'white-space:nowrap',
      'left:-9999px',
      'top:0',
      `font-family:${getComputedStyle(el).fontFamily}`,
      'font-size:100px',
      `letter-spacing:${tracking}em`,
      'text-transform:uppercase',
      `font-variation-settings:'wdth' ${wdth}, 'wght' ${wght}`,
    ].join(';');
    probe.textContent = sample ?? el.textContent ?? '';
    document.body.appendChild(probe);

    const fit = () => {
      const parent = el.parentElement;
      if (!parent) return;
      const cs = getComputedStyle(parent);
      const avail = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const w = probe.getBoundingClientRect().width;
      if (!w) return;
      const size = Math.max(min, Math.min(max, (avail / w) * 100 * ratio * 0.97));
      el.style.fontSize = `${size}px`;
      if (varName) (varEl?.current ?? el).style.setProperty(varName, `${size}px`);
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    if (el.parentElement) ro.observe(el.parentElement);
    return () => {
      ro.disconnect();
      probe.remove();
    };
  }, [ref, wdth, wght, max, min, ratio, tracking, varEl, varName, sample]);
}
