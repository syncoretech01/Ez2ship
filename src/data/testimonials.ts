/**
 * Customer testimonials as published on EZ 2 SHIP's existing website (ez2ship.com).
 * Quotes are reproduced verbatim; the chips are taken from what each customer describes.
 */
export interface Testimonial {
  quote: string;
  name: string;
  meta: string;
  vehicle: string;
  detail: string;
  image: string;
  imageAlt: string;
}

export const testimonials: Testimonial[] = [
  {
    quote: 'EZ2Ship delivered my SUV from New York to Texas in perfect condition. The process was simple and stress‑free.',
    name: 'John D.',
    meta: 'California',
    vehicle: 'SUV',
    detail: 'New York → Texas',
    image: 'suv-road',
    imageAlt: 'White SUV on an open road',
  },
  {
    quote:
      'EZ2Ship transported my sedan from Florida to California quickly and safely. The driver kept me updated throughout the journey, and the price was exactly as quoted. I’ll definitely use them again.',
    name: 'Kirstin',
    meta: 'Customer',
    vehicle: 'Sedan',
    detail: 'Florida → California',
    image: 'bmw-blue',
    imageAlt: 'Blue coupe parked on a city street',
  },
  {
    quote:
      'I shipped my classic car with EZ2Ship using their enclosed carrier auto transport service. The team provided excellent communication, full insurance coverage, and on‑time delivery. I highly recommend EZ2Ship for anyone needing safe and reliable car shipping.',
    name: 'Michael R.',
    meta: 'Customer',
    vehicle: 'Classic car',
    detail: 'Enclosed transport',
    image: 'classic-300sl',
    imageAlt: 'Classic gullwing coupe and a vintage roadster',
  },
  {
    quote:
      'EZ2Ship provided excellent door‑to‑door car shipping service for my SUV. The driver picked up my vehicle right at my home and delivered it safely to my new address. Their team made the process simple, affordable, and stress‑free. I highly recommend EZ2Ship for anyone needing reliable auto transport.',
    name: 'Paul',
    meta: 'Washington · Soil Conservationist',
    vehicle: 'SUV',
    detail: 'Door to door',
    image: 'jeep',
    imageAlt: 'Black off-road SUV on a gravel road',
  },
];
