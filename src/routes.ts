import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

type Loader = () => Promise<{ default: ComponentType }>;
type Preloadable = LazyExoticComponent<ComponentType> & { preload: Loader };

function lazyPage(loader: Loader): Preloadable {
  let promise: ReturnType<Loader> | null = null;
  const load = () => (promise ??= loader());
  const Comp = lazy(load) as Preloadable;
  Comp.preload = load;
  return Comp;
}

export const Pages = {
  Home: lazyPage(() => import('./pages/Home')),
  Services: lazyPage(() => import('./pages/Services')),
  ServiceDetail: lazyPage(() => import('./pages/ServiceDetail')),
  HowItWorks: lazyPage(() => import('./pages/HowItWorks')),
  About: lazyPage(() => import('./pages/About')),
  Contact: lazyPage(() => import('./pages/Contact')),
  Quote: lazyPage(() => import('./pages/Quote')),
  NotFound: lazyPage(() => import('./pages/NotFound')),
};

export function preloadRoute(pathname: string): Promise<unknown> {
  const p = pathname.replace(/\/+$/, '') || '/';
  if (p === '/') return Pages.Home.preload();
  if (p === '/services') return Pages.Services.preload();
  if (p.startsWith('/services/')) return Pages.ServiceDetail.preload();
  if (p === '/how-it-works') return Pages.HowItWorks.preload();
  if (p === '/about') return Pages.About.preload();
  if (p === '/contact') return Pages.Contact.preload();
  if (p === '/quote') return Pages.Quote.preload();
  return Pages.NotFound.preload();
}
