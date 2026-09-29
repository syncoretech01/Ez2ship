import { Hero } from '../sections/home/Hero';
import { Statement } from '../sections/home/Statement';
import { ServicesSelector } from '../sections/home/ServicesSelector';
import { Journey } from '../sections/home/Journey';
import { OpenVsEnclosed } from '../sections/home/OpenVsEnclosed';
import { Network } from '../sections/home/Network';
import { WhyStack } from '../sections/home/WhyStack';
import { FinalCTA } from '../sections/home/FinalCTA';
import { Testimonials } from '../sections/home/Testimonials';
import { QuickQuote } from '../sections/home/QuickQuote';
import { useMeta } from '../lib/meta';

export default function Home() {
  useMeta(
    '',
    'EZ 2 SHIP LLC (MC-1762460) arranges open and enclosed transport for cars, SUVs, trucks, motorcycles and exotic vehicles across the United States and internationally.',
  );
  return (
    <>
      <Hero />
      <Statement />
      <ServicesSelector />
      <Journey />
      <OpenVsEnclosed />
      <Network />
      <WhyStack />
      <Testimonials />
      <QuickQuote />
      <FinalCTA />
    </>
  );
}
