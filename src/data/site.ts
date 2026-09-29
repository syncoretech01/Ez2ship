export const company = {
  legalName: 'EZ 2 SHIP LLC',
  name: 'EZ 2 SHIP',
  mc: 'MC-1762460',
  mcDigits: '1762460',
  emails: ['info@ez2ship.com', 'info.ez2ship@gmail.com'],
  primaryEmail: 'info@ez2ship.com',
} as const;

export interface Office {
  id: 'us' | 'uae';
  code: string;
  label: string;
  role: string;
  city: string;
  region: string;
  lines: string[];
  phone: { display: string; href: string };
  timeZone: string;
  coords: { lat: number; lon: number };
  coordsLabel: string;
  mapsUrl: string;
  image: string;
}

export const offices: Office[] = [
  {
    id: 'us',
    code: 'MIA',
    label: 'US Office',
    role: 'Headquarters',
    city: 'Sunny Isles Beach',
    region: 'Florida, United States',
    lines: ['100 Bayview Dr, Suite 1903', 'Sunny Isles Beach, FL 33160'],
    phone: { display: '+1 231 294 9658', href: 'tel:+12312949658' },
    timeZone: 'America/New_York',
    coords: { lat: 25.94, lon: -80.12 },
    coordsLabel: '25.94°N 80.12°W',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=100+Bayview+Dr+Suite+1903+Sunny+Isles+Beach+FL+33160',
    image: 'sunny-isles-aerial',
  },
  {
    id: 'uae',
    code: 'DXB',
    label: 'UAE Office',
    role: 'UAE Branch',
    city: 'Dubai',
    region: 'United Arab Emirates',
    lines: ['Paramount Midtown Damac, Al Mustaqbal St', 'Suite 3110, Dubai, UAE'],
    phone: { display: '+971 55 995 4007', href: 'tel:+971559954007' },
    timeZone: 'Asia/Dubai',
    coords: { lat: 25.19, lon: 55.28 },
    coordsLabel: '25.19°N 55.28°E',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Paramount+Tower+Midtown+Damac+Al+Mustaqbal+Street+Dubai',
    image: 'dubai-skyline',
  },
];

export const usOffice = offices[0];
export const uaeOffice = offices[1];

export interface NavItem {
  label: string;
  to: string;
  image?: string;
}

export const primaryNav: NavItem[] = [
  { label: 'Services', to: '/services', image: 'open-carrier' },
  { label: 'How it works', to: '/how-it-works', image: 'highway-forest' },
  { label: 'About', to: '/about', image: 'sunny-isles-aerial' },
  { label: 'Contact', to: '/contact', image: 'dubai-sunset' },
];

export const menuNav: NavItem[] = [
  { label: 'Home', to: '/', image: 'carrier-deck' },
  ...primaryNav,
  { label: 'Get a quote', to: '/quote', image: 'enclosed-ferrari' },
];

/** Human-readable names for routes, used by the page transition overlay. */
export const routeNames: Record<string, string> = {
  '/': 'Home',
  '/services': 'Services',
  '/how-it-works': 'How it works',
  '/about': 'About',
  '/contact': 'Contact',
  '/quote': 'Get a quote',
};

export const vehicleTypes = [
  'Cars',
  'SUVs',
  'Motorcycles',
  'Trucks',
  'Luxury & exotic',
  'Classics',
] as const;

export const generalFaqs = [
  {
    q: 'How do I get a shipping quote?',
    a: 'Use the quote form — it asks for pickup and delivery locations, the vehicle’s year, make and model, whether it runs, your carrier preference and your first available date. You can also call our US office at +1 231 294 9658 or our UAE office at +971 55 995 4007.',
  },
  {
    q: 'Is EZ 2 SHIP a carrier or a broker?',
    a: 'EZ 2 SHIP LLC is an auto-transport brokerage operating under MC-1762460. We arrange your shipment with a carrier suited to your vehicle and route, and coordinate it from quote to delivery.',
  },
  {
    q: 'What’s the difference between open and enclosed transport?',
    a: 'Open carriers haul vehicles on an uncovered, multi-level trailer — the most common and generally the most economical option. Enclosed carriers move vehicles inside a covered trailer, shielding them from weather and road debris; they carry fewer vehicles per load and are typically priced higher.',
  },
  {
    q: 'Can you ship a vehicle that doesn’t run?',
    a: 'Tell us in your quote request. A non-running vehicle has to be winched or otherwise assisted on and off the trailer, which affects which carriers can take the job — so we plan for it from the start.',
  },
  {
    q: 'Do I need to be present at pickup and delivery?',
    a: 'Someone needs to be there to hand over or receive the keys and review the vehicle’s condition with the driver. It can be you or a person you designate.',
  },
  {
    q: 'How long will transport take?',
    a: 'Transit time depends on distance, route, carrier availability and — for international shipments — port schedules and customs. We give you an estimate for your specific route when we prepare your quote.',
  },
];
