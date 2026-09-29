# EZ 2 SHIP — website

Marketing site for **EZ 2 SHIP LLC (MC-1762460)**, an auto-transport brokerage with offices in Sunny Isles Beach, FL and Dubai, UAE.

Built with Vite + React 19 + TypeScript, three.js / React Three Fiber, GSAP (ScrollTrigger, SplitText, DrawSVG, MotionPath, MorphSVG), Lenis, Motion and anime.js.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build → dist/
npm run preview    # serve the production build → http://localhost:4173
```

Node 20+ recommended (developed on Node 24).

## Pages

| Route | Page |
| --- | --- |
| `/` | Home — 3D hero, services selector, scroll-driven 3D journey, open vs enclosed, US → world network, why EZ 2 SHIP, wheel-portal CTA |
| `/services` | Services overview, vehicle selector, horizontal service panels, comparison, FAQ |
| `/services/open-auto-transport` | Open Auto Transport |
| `/services/enclosed-auto-transport` | Enclosed Auto Transport |
| `/services/motorcycle-shipping` | Motorcycle Shipping |
| `/services/suv-truck-transport` | SUV & Truck Transport |
| `/services/luxury-exotic-transport` | Luxury / Exotic Transport |
| `/services/international-auto-shipping` | International Auto Shipping |
| `/how-it-works` | Process route, exploded-vehicle quote checklist, prep, FAQ |
| `/about` | Company, two offices (live clocks), how we work |
| `/contact` | Offices, contact form |
| `/quote` | Five-step quote form with live summary ticket |
| anything else | 404 |

The quote form accepts pre-fill parameters, e.g. `/quote?vehicle=motorcycle&carrier=enclosed&scope=international`
(`vehicle`: car · suv · truck · motorcycle · exotic, `carrier`: open · enclosed, `scope`: international).

## Editing content

- Company details, phone numbers, emails, addresses, nav, FAQs → `src/data/site.ts`
- Service copy (overview, features, process, prep tips, FAQs, images) → `src/data/services.ts`
- Photography lives in `public/images` (WebP at 960/1920 px) with sizes and blur placeholders in `src/data/image-manifest.json`. To swap in your own fleet photos, drop `name-960.webp` / `name-1920.webp` into `public/images` and add a matching manifest entry (`scripts/fetch-images.mjs` shows the conversion settings).
- Logo → `src/components/brand/LogoBadge.tsx` (vector badge; the globe comes from `node scripts/build-logo.mjs`). Favicons and `og-image.jpg` in `public/` are rendered from it.
- Testimonials → `src/data/testimonials.ts` (reproduced from the current ez2ship.com site).
- World dot-map data for the network globe → `node scripts/build-map.mjs` (Natural Earth via `world-atlas`).

All copy sticks to what's known about the business: testimonials are the ones published on ez2ship.com, and no statistics, certifications, insurance claims or prices were invented. Add real ones here when you have them.

## Forms (quote + contact)

The forms work without a backend: on submit they open the visitor's email app with the request pre-filled and addressed to `info@ez2ship.com` (cc `info.ez2ship@gmail.com`), and the success screen offers "open email again", "copy details" and a call link.

To receive submissions directly instead, set an endpoint (Formspree, Basin, a serverless function…) that accepts a JSON POST:

```bash
cp .env.example .env
# VITE_FORM_ENDPOINT=https://formspree.io/f/xxxxxxx
npm run build
```

## Deploying

It's a single-page app, so every route must fall back to `index.html`. `public/_redirects` (Netlify) and `vercel.json` (Vercel) are included; for other hosts configure the equivalent rewrite. Upload `dist/`.

## Performance & accessibility notes

- WebGL canvases mount only near the viewport, pause when off-screen, and scale resolution/detail by device tier (fewer objects, no shadows on phones). Pages without 3D never download three.js.
- `prefers-reduced-motion` disables smooth scrolling, pinned scroll sequences and idle animation; content is shown statically (e.g. the journey becomes a step list).
- Custom cursor only on fine pointers; all interactive elements are keyboard-reachable (the comparison divider is a slider, galleries respond to arrow keys, the menu closes on Escape).

