export type ServiceSlug =
  | 'open-auto-transport'
  | 'enclosed-auto-transport'
  | 'motorcycle-shipping'
  | 'suv-truck-transport'
  | 'luxury-exotic-transport'
  | 'international-auto-shipping';

export type VehicleKind = 'car' | 'suv' | 'truck' | 'motorcycle' | 'exotic';
export type CarrierKind = 'open' | 'enclosed';

export interface Service {
  slug: ServiceSlug;
  index: string;
  name: string;
  title: string;
  titleLines: string[];
  tagline: string;
  summary: string;
  image: string;
  imageAlt: string;
  gallery: { image: string; alt: string }[];
  carrier: CarrierKind | 'both';
  vehicle?: VehicleKind;
  international?: boolean;
  tags: string[];
  overview: string[];
  bestFor: string[];
  features: { title: string; body: string }[];
  process: { title: string; body: string }[];
  prep: string[];
  faqs: { q: string; a: string }[];
  theme: 'light' | 'dark';
}

export const services: Service[] = [
  {
    slug: 'open-auto-transport',
    index: '01',
    name: 'Open Transport',
    title: 'Open Auto Transport',
    titleLines: ['Open', 'Transport'],
    tagline: 'The industry standard — efficient, flexible, door to door.',
    summary:
      'Your vehicle rides on an open, multi-level carrier alongside others — the most widely used and generally the most economical way to move a vehicle.',
    image: 'open-carrier',
    imageAlt: 'Two cars secured on the decks of an open car-carrier trailer',
    gallery: [
      { image: 'carrier-deck', alt: 'SUV and sedan loaded on an open carrier moving along a road' },
      { image: 'highway-forest', alt: 'Aerial view of a divided highway cutting through forest' },
      { image: 'suv-road', alt: 'White SUV on an open desert highway' },
      { image: 'highway-cloverleaf', alt: 'Aerial view of a highway cloverleaf interchange' },
    ],
    carrier: 'open',
    vehicle: 'car',
    tags: ['Most economical', 'Widest availability', 'Door to door'],
    overview: [
      'Open transport is the backbone of the U.S. auto-transport industry. Your vehicle is driven or winched onto an open, multi-level carrier and secured alongside other vehicles for the trip.',
      'Because open carriers make up most of the rigs on the road, they typically offer the most scheduling flexibility and the most economical rates. EZ 2 SHIP arranges open transport for everyday cars, SUVs and trucks moving across state lines or coast to coast.',
    ],
    bestFor: [
      'Daily drivers',
      'Relocations & moves',
      'Dealer & auction purchases',
      'Seasonal / snowbird moves',
      'Online vehicle purchases',
    ],
    features: [
      {
        title: 'Most economical',
        body: 'Open carriers move several vehicles per load, which generally makes them the most cost-effective way to ship.',
      },
      {
        title: 'Widest availability',
        body: 'Open rigs are the most common carriers on the road, so most routes have more trucks — and more pickup windows — to choose from.',
      },
      {
        title: 'Door-to-door convenience',
        body: 'Pickup and delivery as close to your addresses as a full-size carrier can safely reach. If a street is too tight, the driver arranges a nearby meeting point with you.',
      },
    ],
    process: [
      { title: 'Share your route', body: 'Pickup and delivery locations, vehicle details and your first available date.' },
      { title: 'Carrier match', body: 'We place your vehicle with an open carrier running your route.' },
      { title: 'Pickup & loading', body: 'The driver inspects the vehicle with you, loads it and secures it to the deck.' },
      { title: 'Delivery', body: 'The vehicle is unloaded and reviewed with you (or your designee) at destination.' },
    ],
    prep: [
      'Remove personal items and loose accessories from the cabin and trunk.',
      'Photograph the vehicle from every side before pickup.',
      'Keep the fuel level low — around a quarter tank is common practice.',
      'Disable toll tags and any alarm that could trigger in transit.',
    ],
    faqs: [
      {
        q: 'Is my vehicle exposed during open transport?',
        a: 'Yes — on an open carrier the vehicle is exposed to weather and road conditions, much as it would be if you drove it. If you want full coverage, choose enclosed transport.',
      },
      {
        q: 'Can I ship an SUV or pickup on an open carrier?',
        a: 'Yes. Include the exact year, make and model — and any lift, oversized tires or accessories — so the carrier can plan deck space correctly.',
      },
    ],
    theme: 'light',
  },
  {
    slug: 'enclosed-auto-transport',
    index: '02',
    name: 'Enclosed Transport',
    title: 'Enclosed Auto Transport',
    titleLines: ['Enclosed', 'Transport'],
    tagline: 'Fully covered. Shielded from weather, debris and view.',
    summary:
      'Your vehicle travels inside a covered trailer — protected from rain, sun, dust and road debris for the entire trip.',
    image: 'enclosed-ferrari',
    imageAlt: 'A black convertible sports car secured inside a red enclosed transport trailer',
    gallery: [
      { image: 'ferrari-showroom', alt: 'Red hypercar parked in a bright showroom' },
      { image: 'classic-300sl', alt: 'Classic gullwing coupe and a vintage roadster in a gallery' },
      { image: 'panamera-bw', alt: 'Black luxury sedan on a highway in black and white' },
      { image: 'bugatti', alt: 'Front view of a silver hypercar at night' },
    ],
    carrier: 'enclosed',
    vehicle: 'exotic',
    tags: ['Full coverage', 'Fewer vehicles per load', 'High-value ready'],
    overview: [
      'Enclosed transport moves your vehicle inside a hard- or soft-sided trailer, out of the weather and away from road debris from pickup to delivery. It’s the preferred choice for high-value, classic, collectible and low-clearance vehicles.',
      'Enclosed trailers carry fewer vehicles per load, so the service is typically priced higher than open transport and can need more lead time to schedule. We’ll tell you what to expect on your route before you book.',
    ],
    bestFor: [
      'Exotic & supercars',
      'Classic & collector cars',
      'Low-clearance vehicles',
      'Restored or show cars',
      'Custom paint & wraps',
    ],
    features: [
      {
        title: 'Complete coverage',
        body: 'Walls and a roof between your vehicle and the elements — rain, sun, dust, road salt and debris.',
      },
      {
        title: 'Out of sight',
        body: 'The vehicle isn’t on display for the length of the trip — a quieter way to move something valuable.',
      },
      {
        title: 'Planned loading',
        body: 'Tell us about ground clearance, splitters or wide bodies up front so the carrier can plan an appropriate loading method.',
      },
    ],
    process: [
      { title: 'Vehicle profile', body: 'Year, make, model and any clearance or handling notes.' },
      { title: 'Enclosed carrier match', body: 'We place your vehicle with an enclosed carrier on your route.' },
      { title: 'Covered pickup', body: 'Condition is reviewed with you, then the vehicle is loaded and secured inside.' },
      { title: 'Covered delivery', body: 'Unloaded and reviewed with you (or your designee) on arrival.' },
    ],
    prep: [
      'Note ground clearance and any aero parts that need care during loading.',
      'Photograph the vehicle in good light before pickup.',
      'Remove personal items and secure or remove loose trim and covers.',
      'Share any special starting procedures with the driver.',
    ],
    faqs: [
      {
        q: 'Why does enclosed transport cost more?',
        a: 'Enclosed trailers carry fewer vehicles per load and there are fewer of them on the road, so each spot on the trailer costs more to provide than a spot on an open carrier.',
      },
      {
        q: 'Is enclosed transport only for exotic cars?',
        a: 'No. Anyone who wants their vehicle fully covered can choose it — classic cars, new purchases, vehicles with fresh paint or simply peace of mind.',
      },
    ],
    theme: 'dark',
  },
  {
    slug: 'motorcycle-shipping',
    index: '03',
    name: 'Motorcycle Shipping',
    title: 'Motorcycle Shipping',
    titleLines: ['Motorcycle', 'Shipping'],
    tagline: 'Two wheels, properly positioned and secured.',
    summary:
      'Sport bikes, cruisers, tourers and dirt bikes — positioned and secured so they stay upright and stable for the whole trip.',
    image: 'moto-studio',
    imageAlt: 'A white and black modern motorcycle lit against a dark studio background',
    gallery: [
      { image: 'moto-sport', alt: 'Black sport motorcycle against a blue backdrop' },
      { image: 'moto-road', alt: 'Rider on a cruiser motorcycle on an open road at dusk' },
      { image: 'moto-ducati', alt: 'Red sport motorcycle parked in an underground garage' },
    ],
    carrier: 'both',
    vehicle: 'motorcycle',
    tags: ['All bike types', 'Open or enclosed', 'Secured upright'],
    overview: [
      'Motorcycles need a different approach than cars. A bike has to be positioned and secured so it stays upright and stable over thousands of miles — and fairings, mirrors and accessories need room to travel without contact.',
      'We arrange transport for motorcycles of every type, on open or enclosed carriers depending on the bike and the level of protection you want.',
    ],
    bestFor: ['Sport bikes', 'Cruisers & touring bikes', 'Dirt & off-road bikes', 'Vintage & custom builds', 'Moving with your car'],
    features: [
      {
        title: 'Every kind of bike',
        body: 'From lightweight dirt bikes to full-dress tourers — include the model and any modifications so the right carrier is booked.',
      },
      {
        title: 'Open or enclosed',
        body: 'Choose open transport for everyday bikes or enclosed transport for rare, custom or high-value machines.',
      },
      {
        title: 'Ship it with your car',
        body: 'Relocating? Request a quote for your car and your bike together and we’ll coordinate both.',
      },
    ],
    process: [
      { title: 'Bike details', body: 'Year, make, model, whether it runs, and any accessories or modifications.' },
      { title: 'Carrier match', body: 'We place the bike with a carrier suited to motorcycles on your route.' },
      { title: 'Pickup & securing', body: 'The bike is reviewed with you, loaded and secured upright for transit.' },
      { title: 'Delivery', body: 'Unloaded and reviewed with you (or your designee) at destination.' },
    ],
    prep: [
      'Remove saddlebag contents, GPS units, covers and loose luggage.',
      'Note fairings, custom parts and existing scratches — and photograph them.',
      'Check tire pressure and make sure there are no fluid leaks.',
      'Leave the fuel level low and provide a key for loading.',
    ],
    faqs: [
      {
        q: 'Do I need to crate my motorcycle?',
        a: 'For transport within the U.S. a crate usually isn’t needed — tell us about your bike and we’ll confirm the right setup. International shipments can have different packing requirements depending on the method and destination.',
      },
      {
        q: 'Can you ship a non-running motorcycle?',
        a: 'Mark it as non-running in your quote request so we can plan for loading and unloading without starting the engine.',
      },
    ],
    theme: 'dark',
  },
  {
    slug: 'suv-truck-transport',
    index: '04',
    name: 'SUV & Truck Transport',
    title: 'SUV & Truck Transport',
    titleLines: ['SUV &', 'Truck'],
    tagline: 'Bigger vehicles, matched to the right deck space.',
    summary:
      'Full-size SUVs, pickups and lifted trucks — placed with carriers that can accommodate their size and weight.',
    image: 'ram-sunset',
    imageAlt: 'Silver full-size pickup truck at sunset on a coastal overlook',
    gallery: [
      { image: 'raptor-desert', alt: 'Black off-road pickup truck in the desert' },
      { image: 'jeep', alt: 'Black off-road SUV on a gravel road' },
      { image: 'suv-modern', alt: 'Grey three-row SUV parked in front of a modern building' },
    ],
    carrier: 'both',
    vehicle: 'suv',
    tags: ['Full-size ready', 'Lifted & modified', 'Open or enclosed'],
    overview: [
      'Larger vehicles take up more space and weight on a carrier, which affects how they’re loaded and which trucks can take them. We arrange transport for SUVs, crossovers, pickups and lifted or modified trucks.',
      'If your vehicle is lifted, lowered, running oversized tires or carrying racks and accessories, include it in your quote — dimensions matter when a carrier plans its deck.',
    ],
    bestFor: ['Full & mid-size SUVs', 'Pickup trucks', 'Lifted or modified trucks', 'Crossovers', 'Work trucks'],
    features: [
      {
        title: 'Sized correctly',
        body: 'Accurate vehicle details let us place your SUV or truck with a carrier that has the right deck position for it.',
      },
      {
        title: 'Modified vehicles',
        body: 'Lift kits, oversized tires, bed racks and toppers all change the footprint — tell us and we plan around them.',
      },
      {
        title: 'Your choice of carrier',
        body: 'Open transport for everyday moves or enclosed transport for high-value and freshly finished builds.',
      },
    ],
    process: [
      { title: 'Vehicle & modifications', body: 'Year, make, model and anything that changes its size or weight.' },
      { title: 'Carrier match', body: 'We place it with a carrier that can accommodate the vehicle.' },
      { title: 'Pickup & loading', body: 'Condition is reviewed with you, then it’s loaded and secured.' },
      { title: 'Delivery', body: 'Unloaded and reviewed with you (or your designee) on arrival.' },
    ],
    prep: [
      'Empty the bed and cabin, or confirm anything that must stay with the vehicle.',
      'Remove or secure bed covers, racks and toppers where possible.',
      'Share accurate height and any lift or tire changes.',
      'Photograph the vehicle from every side before pickup.',
    ],
    faqs: [
      {
        q: 'Does a lifted truck change my quote?',
        a: 'It can. Extra height and width can limit which deck positions — and which carriers — can take the vehicle, so include the details when you request a quote.',
      },
      {
        q: 'Can I leave items in the truck bed?',
        a: 'Ask us first. Carriers generally don’t accept personal cargo in vehicles, and loose items can shift in transit.',
      },
    ],
    theme: 'light',
  },
  {
    slug: 'luxury-exotic-transport',
    index: '05',
    name: 'Luxury & Exotic',
    title: 'Luxury / Exotic Transport',
    titleLines: ['Luxury', '& Exotic'],
    tagline: 'For the cars that deserve their own plan.',
    summary:
      'Supercars, luxury sedans and collector cars — moved with enclosed options, careful loading and the discretion they deserve.',
    image: 'lambo-rain',
    imageAlt: 'Rear view of a matte black supercar with rain drops on its bodywork',
    gallery: [
      { image: 'monaco-mclaren', alt: 'Two matte black supercars parked on a harbor quay' },
      { image: 'mclaren-white', alt: 'White supercar parked on a roadside' },
      { image: 'amg-red', alt: 'Red grand tourer parked in a forest clearing' },
      { image: 'porsche-snow', alt: 'White sports car parked in a snowy mountain village' },
      { image: 'bugatti', alt: 'Front view of a silver hypercar at night' },
      { image: 'ferrari-showroom', alt: 'Red hypercar parked in a showroom' },
      { image: 'classic-300sl', alt: 'Classic gullwing coupe in a gallery' },
    ],
    carrier: 'enclosed',
    vehicle: 'exotic',
    tags: ['Enclosed recommended', 'Clearance-aware', 'Discreet'],
    overview: [
      'High-value vehicles deserve a transport plan built around them. For luxury, exotic and collector cars we generally recommend enclosed transport, and we talk through loading requirements — ground clearance, wide bodies, front splitters — before the vehicle is booked.',
      'Whether it’s a new delivery, an auction purchase, a relocation or a car heading to an event, we coordinate pickup and delivery windows around your schedule.',
    ],
    bestFor: ['Supercars & hypercars', 'Luxury sedans & SUVs', 'Collector & classic cars', 'Auction purchases', 'Show & event vehicles'],
    features: [
      {
        title: 'Enclosed by default',
        body: 'We recommend covered trailers for high-value vehicles — out of the weather and out of view.',
      },
      {
        title: 'Clearance-aware loading',
        body: 'Low noses and splitters need the right approach angle. Share the details and the carrier plans the load.',
      },
      {
        title: 'Your schedule',
        body: 'Deliveries timed around auctions, events, collections and relocations — tell us your window.',
      },
    ],
    process: [
      { title: 'Vehicle brief', body: 'Model, value considerations, clearance and any handling notes.' },
      { title: 'Enclosed carrier match', body: 'We place the car with an enclosed carrier on your route.' },
      { title: 'Documented pickup', body: 'Condition is reviewed with you before the car is loaded and secured.' },
      { title: 'Delivered to plan', body: 'Unloaded and reviewed with you (or your designee) at destination.' },
    ],
    prep: [
      'Share ground clearance and any front-lip or aero considerations.',
      'Provide special instructions — kill switches, transport modes, lift systems.',
      'Photograph the car in good light, including wheels and lower edges.',
      'Remove personal items, documents and toll devices.',
    ],
    faqs: [
      {
        q: 'Do you require enclosed transport for exotic cars?',
        a: 'It’s your choice — but for high-value, low-clearance or collectible vehicles we recommend enclosed transport for full coverage.',
      },
      {
        q: 'Can you ship a car I bought at auction?',
        a: 'Yes — share the pickup location and any release details from the auction house, and we’ll coordinate pickup around them.',
      },
    ],
    theme: 'dark',
  },
  {
    slug: 'international-auto-shipping',
    index: '06',
    name: 'International',
    title: 'International Auto Shipping',
    titleLines: ['International', 'Shipping'],
    tagline: 'Beyond the border — coordinated from Florida and Dubai.',
    summary:
      'Inland transport, port handling and ocean freight coordinated as one shipment — with offices in the United States and the UAE.',
    image: 'ship-deck',
    imageAlt: 'Vehicles parked on the open deck of a cargo ship at sea',
    gallery: [
      { image: 'container-grid', alt: 'Aerial view of colorful shipping containers in a port terminal' },
      { image: 'port-cranes', alt: 'Container ship being loaded beneath gantry cranes' },
      { image: 'dock-sportscar', alt: 'Orange sports car on a dock beside a large ship' },
      { image: 'dubai-interchange', alt: 'Dubai skyline and highway interchange at sunrise' },
    ],
    carrier: 'both',
    international: true,
    tags: ['US + UAE offices', 'Port to port', 'Door to port'],
    overview: [
      'International shipping combines inland transport, port handling, ocean freight and the paperwork each country requires. EZ 2 SHIP coordinates international vehicle shipments with offices in Sunny Isles Beach, Florida and Dubai, UAE.',
      'Every destination has its own documentation, customs and import rules. We walk you through what your shipment needs before it leaves — and keep one point of contact from pickup to arrival.',
    ],
    bestFor: ['Relocating abroad', 'Exporting a purchase', 'US ⇄ UAE moves', 'Collector shipments', 'Dealer exports'],
    features: [
      {
        title: 'Two offices, two time zones',
        body: 'A team in Florida and a branch in Dubai — so there’s someone working your shipment across both ends of the day.',
      },
      {
        title: 'Container or RoRo',
        body: 'International vehicles typically move inside a shipping container or on a roll-on/roll-off vessel. We help you understand which suits your vehicle and destination.',
      },
      {
        title: 'Inland + ocean, together',
        body: 'Getting the vehicle to the port is part of the shipment. We coordinate the inland leg along with the ocean freight.',
      },
    ],
    process: [
      { title: 'Destination & documents', body: 'Where it’s going and what that country requires.' },
      { title: 'Inland transport', body: 'Pickup and delivery of the vehicle to the departure port.' },
      { title: 'Ocean freight', body: 'The vehicle ships by container or roll-on/roll-off vessel.' },
      { title: 'Arrival', body: 'Customs clearance and release at the destination port, per local rules.' },
    ],
    prep: [
      'Have the original title (or proof of ownership) ready — U.S. export generally requires it.',
      'If there’s a loan on the vehicle, the lienholder typically needs to authorize export.',
      'Keep your bill of sale for recently purchased vehicles.',
      'Check your destination country’s import rules and eligibility early.',
    ],
    faqs: [
      {
        q: 'Which countries can you ship to?',
        a: 'Contact us with your destination. Requirements and options vary by country, and we’ll confirm what’s possible for your specific shipment.',
      },
      {
        q: 'What’s the difference between container and RoRo shipping?',
        a: 'In container shipping the vehicle is secured inside a shipping container. With roll-on/roll-off (RoRo), it’s driven onto a specialized vessel and secured on a vehicle deck. The right option depends on the vehicle, destination and schedule.',
      },
    ],
    theme: 'dark',
  },
];

export const serviceBySlug = (slug: string | undefined) => services.find((s) => s.slug === slug);

export const vehicleOptions: { id: VehicleKind; label: string; hint: string }[] = [
  { id: 'car', label: 'Car', hint: 'Sedans, coupes, hatchbacks' },
  { id: 'suv', label: 'SUV', hint: 'Crossovers & full-size SUVs' },
  { id: 'truck', label: 'Pickup truck', hint: 'Including lifted trucks' },
  { id: 'motorcycle', label: 'Motorcycle', hint: 'All bike types' },
  { id: 'exotic', label: 'Luxury / exotic', hint: 'High-value & collector' },
];
