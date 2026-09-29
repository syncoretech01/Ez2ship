import { useParams } from 'react-router';
import { serviceBySlug, type Service } from '../data/services';
import { generalFaqs } from '../data/site';
import { useMeta } from '../lib/meta';
import { ServiceHero } from '../sections/service/ServiceHero';
import { Overview, Features, Process, Prep, Related, IntlRoute } from '../sections/service/ServiceSections';
import { DragGallery } from '../components/page/DragGallery';
import { CTABand } from '../components/page/PageHero';
import { Faq, SectionLabel } from '../components/ui/Misc';
import { RevealText } from '../components/ui/RevealText';
import NotFound from './NotFound';
import './services-page.css';

function quoteQuery(s: Service) {
  const p = new URLSearchParams();
  if (s.vehicle) p.set('vehicle', s.vehicle);
  if (s.carrier !== 'both') p.set('carrier', s.carrier);
  if (s.international) p.set('scope', 'international');
  const q = p.toString();
  return q ? `?${q}` : '';
}

export default function ServiceDetail() {
  const { slug } = useParams();
  const service = serviceBySlug(slug);
  useMeta(service?.title ?? 'Service not found', service ? `${service.summary} ${service.tagline}` : undefined, service?.theme === 'dark' ? '#0B1733' : '#F3F0EA');
  if (!service) return <NotFound />;

  const query = quoteQuery(service);
  const faqs = [...service.faqs, generalFaqs[0], generalFaqs[3]];

  return (
    <>
      <ServiceHero service={service} query={query} />
      <Overview service={service} />
      <Features service={service} />
      <Process service={service} />
      {service.international && <IntlRoute />}
      <section className={`sdg section ${service.theme === 'dark' ? 'sdg--dark' : ''}`} data-theme={service.theme}>
        <div className="wrap sdg__head">
          <SectionLabel index={service.international ? '06' : '05'}>Gallery</SectionLabel>
          <RevealText as="h2" className="t-l">
            In <span className="t-serif blue">motion.</span>
          </RevealText>
        </div>
        <DragGallery items={[{ image: service.image, alt: service.imageAlt }, ...service.gallery]} />
      </section>
      <Prep service={service} />
      <section className="svp-faq section" data-theme="light">
        <div className="wrap svp-faq__grid">
          <div>
            <SectionLabel>Questions</SectionLabel>
            <RevealText as="h2" className="t-l svp-faq__title">
              {service.name}, <span className="t-serif blue">answered.</span>
            </RevealText>
          </div>
          <Faq items={faqs} />
        </div>
      </section>
      <Related current={service} />
      <CTABand
        title={['Ship it', `${service.vehicle === 'motorcycle' ? 'on two wheels' : 'your way'}.`]}
        text={`Tell us where it is, where it’s going and when — we’ll prepare a quote for ${service.title.toLowerCase()}.`}
        query={query}
      />
    </>
  );
}
