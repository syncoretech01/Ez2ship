import { PageHero, CTABand } from '../components/page/PageHero';
import { ColumnSlider } from '../components/page/ColumnSlider';
import { VehicleSelector } from '../sections/services/VehicleSelector';
import { HorizontalServices } from '../sections/services/HorizontalServices';
import { OpenVsEnclosed } from '../sections/home/OpenVsEnclosed';
import { Button } from '../components/ui/Button';
import { Faq, SectionLabel } from '../components/ui/Misc';
import { RevealText } from '../components/ui/RevealText';
import { generalFaqs } from '../data/site';
import { useMeta } from '../lib/meta';
import './services-page.css';

export default function Services() {
  useMeta(
    'Services',
    'Open and enclosed auto transport, motorcycle shipping, SUV & truck transport, luxury and exotic vehicle transport, and international auto shipping from EZ 2 SHIP.',
  );
  return (
    <>
      <PageHero
        kicker="Services"
        lines={['Every vehicle.', 'Every route.']}
        accent={1}
        lead={
          <>
            Open and enclosed transport for cars, SUVs, trucks, motorcycles and luxury vehicles — across the United States
            and around the world, door to door.
          </>
        }
        actions={
          <>
            <Button to="/quote" size="l">
              Get a shipping quote
            </Button>
            <Button href="#find-your-service" size="l" variant="ghost" magnetic={false}>
              Find your service
            </Button>
          </>
        }
        aside={
          <ColumnSlider
            className="svp__cols"
            columns={[
              ['open-carrier', 'moto-studio', 'dubai-sunset'],
              ['enclosed-ferrari', 'raptor-desert', 'container-grid'],
              ['lambo-rain', 'carrier-deck', 'classic-300sl'],
            ]}
          />
        }
        meta={<>6 services · Open & enclosed · US + International</>}
        maxTitle={210}
      />
      <VehicleSelector />
      <HorizontalServices />
      <OpenVsEnclosed />
      <section className="svp-faq section" data-theme="light">
        <div className="wrap svp-faq__grid">
          <div>
            <SectionLabel index="05">Questions</SectionLabel>
            <RevealText as="h2" className="t-l svp-faq__title">
              Good to <span className="t-serif blue">know.</span>
            </RevealText>
          </div>
          <Faq items={generalFaqs} />
        </div>
      </section>
      <CTABand />
    </>
  );
}
