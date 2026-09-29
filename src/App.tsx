import { Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router';
import { MotionConfig } from 'motion/react';
import { TransitionProvider } from './components/transition/TransitionProvider';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Loader } from './components/Loader';
import { Cursor } from './components/Cursor';
import { Pages } from './routes';
import { initScroll } from './lib/scroll';
import { ScrollTrigger } from './lib/gsap';

function SmoothScroll() {
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    initScroll();
    // Fonts change line heights/widths — re-measure pinned sections once they load.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);
  return null;
}

function AppRoutes() {
  const location = useLocation();
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Pages.Home />} />
        <Route path="/services" element={<Pages.Services />} />
        <Route path="/services/:slug" element={<Pages.ServiceDetail />} />
        <Route path="/how-it-works" element={<Pages.HowItWorks />} />
        <Route path="/about" element={<Pages.About />} />
        <Route path="/contact" element={<Pages.Contact />} />
        <Route path="/quote" element={<Pages.Quote />} />
        <Route path="*" element={<Pages.NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <TransitionProvider>
          <SmoothScroll />
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Loader />
          <Cursor />
          <Header />
          <main id="main">
            <AppRoutes />
          </main>
          <Footer />
        </TransitionProvider>
      </MotionConfig>
    </BrowserRouter>
  );
}
