import manifest from '../data/image-manifest.json';

type Entry = { w: number; h: number; blur: string };
const data = manifest as Record<string, Entry>;

export type ImageName = keyof typeof manifest;

export function imageInfo(name: string) {
  const entry = data[name];
  if (!entry) throw new Error(`Unknown image: ${name}`);
  return {
    src: `/images/${name}-1920.webp`,
    small: `/images/${name}-960.webp`,
    srcSet: `/images/${name}-960.webp 960w, /images/${name}-1920.webp 1920w`,
    width: entry.w,
    height: entry.h,
    ratio: entry.w / entry.h,
    blur: entry.blur,
  };
}

/** Best URL for a WebGL texture given the element's rendered width. */
export function textureUrl(name: string, cssWidth = 900) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  return cssWidth * dpr > 1000 ? `/images/${name}-1920.webp` : `/images/${name}-960.webp`;
}
