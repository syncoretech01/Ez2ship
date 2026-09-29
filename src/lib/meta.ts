import { useEffect } from 'react';

const BASE = 'EZ 2 SHIP';

export function useMeta(title: string, description?: string, theme: string = '#F3F0EA') {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE}` : `${BASE} — Vehicle Transport, Nationwide & Worldwide`;
    if (description) {
      let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = 'description';
        document.head.appendChild(tag);
      }
      tag.content = description;
    }
    const themeTag = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (themeTag) themeTag.content = theme;
  }, [title, description, theme]);
}
