import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PageHero } from '../components/page/PageHero';
import { SectionLabel, LocalClock } from '../components/ui/Misc';
import { TextField, TextArea, SelectField } from '../components/form/Fields';
import { Button } from '../components/ui/Button';
import { Reveal } from '../components/ui/Reveal';
import { TLink } from '../components/transition/TLink';
import { Arrow } from '../components/ui/Button';
import { company, offices } from '../data/site';
import { submitRequest, copyText, isEmail, isPhone, type SubmitResult } from '../lib/submit';
import { useMeta } from '../lib/meta';
import './contact.css';

const TOPICS = ['A new shipment', 'An existing shipment', 'International shipping', 'Carrier or partner enquiry', 'Something else'];

interface Form {
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
}
const EMPTY: Form = { name: '', email: '', phone: '', topic: '', message: '' };

export default function Contact() {
  useMeta('Contact', 'Contact EZ 2 SHIP — US office +1 231 294 9658, UAE office +971 55 995 4007, info@ez2ship.com.');
  const [f, setF] = useState<Form>(EMPTY);
  const [err, setErr] = useState<Partial<Record<keyof Form, string>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [failure, setFailure] = useState('');
  const [copied, setCopied] = useState(false);

  const set = (k: keyof Form, v: string) => {
    setF((p) => ({ ...p, [k]: v }));
    if (err[k]) setErr((e) => ({ ...e, [k]: undefined }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const x: typeof err = {};
    if (f.name.trim().length < 2) x.name = 'Enter your name.';
    if (!isEmail(f.email)) x.email = 'Enter a valid email address.';
    if (f.phone && !isPhone(f.phone)) x.phone = 'Check the phone number.';
    if (!f.topic) x.topic = 'Choose a topic.';
    if (f.message.trim().length < 10) x.message = 'Tell us a little more (at least 10 characters).';
    setErr(x);
    if (Object.keys(x).length) {
      (document.querySelector('.ct__form [aria-invalid="true"]') as HTMLElement | null)?.focus();
      return;
    }
    setStatus('sending');
    try {
      const r = await submitRequest('contact', [
        ['Name', f.name],
        ['Email', f.email],
        ['Phone', f.phone],
        ['Topic', f.topic],
        ['Message', f.message],
      ]);
      setResult(r);
      setStatus('done');
    } catch (ex) {
      setFailure(ex instanceof Error ? ex.message : 'Something went wrong.');
      setStatus('error');
    }
  };

  return (
    <>
      <PageHero
        kicker="Contact"
        lines={['Let’s talk', 'shipping.']}
        accent={1}
        compact
        lead="Call either office, send us an email or use the form — for a price on a specific vehicle, the quote form is the fastest route."
        actions={
          <Button to="/quote" size="l">
            Get a shipping quote
          </Button>
        }
        meta={<>Sunny Isles Beach, FL · Dubai, UAE</>}
      />

      <section className="ct section" data-theme="light">
        <div className="wrap ct__grid">
          <div className="ct__offices">
            {offices.map((o, i) => (
              <Reveal key={o.id} delay={i * 0.08} className="ct__card" as="article">
                <div className="ct__card-top">
                  <span className="t-mono">
                    {o.label} — {o.role}
                  </span>
                  <span className="ct__time">
                    <LocalClock timeZone={o.timeZone} />
                  </span>
                </div>
                <h2 className="ct__city">{o.city}</h2>
                <a className="ct__phone" href={o.phone.href}>
                  {o.phone.display}
                </a>
                <address className="ct__addr">
                  {o.lines.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </address>
                <a className="tlink ct__map" href={o.mapsUrl} target="_blank" rel="noopener noreferrer">
                  Open in Maps ↗
                </a>
              </Reveal>
            ))}
            <Reveal delay={0.16} className="ct__card ct__card--mail" as="article">
              <span className="t-mono">Email</span>
              {company.emails.map((m) => (
                <a key={m} href={`mailto:${m}`} className="ct__mail">
                  {m}
                </a>
              ))}
            </Reveal>
          </div>

          <div className="ct__formwrap" id="message">
            <SectionLabel index="01">Send a message</SectionLabel>
            <AnimatePresence mode="wait" initial={false}>
              {status === 'done' && result ? (
                <motion.div key="done" className="ct__done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <h3 className="ct__done-t">{result.method === 'endpoint' ? 'Message sent.' : 'Message ready to send.'}</h3>
                  <p className="t-body-l t-muted">
                    {result.method === 'endpoint'
                      ? `Thanks, ${f.name.split(' ')[0]} — we’ll reply to ${f.email}.`
                      : `Your email app should now be open with your message addressed to ${company.primaryEmail} — just press send. If it didn’t open, copy the message or email us directly.`}
                  </p>
                  <div className="ct__done-actions">
                    {result.mailto && (
                      <Button href={result.mailto} icon="mail">
                        Open email again
                      </Button>
                    )}
                    <Button variant="ghost" icon="none" onClick={async () => setCopied(await copyText(result.summary))}>
                      {copied ? 'Copied' : 'Copy message'}
                    </Button>
                  </div>
                  <button
                    type="button"
                    className="tlink"
                    onClick={() => {
                      setF(EMPTY);
                      setStatus('idle');
                      setResult(null);
                    }}
                  >
                    Write another message
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" className="ct__form" onSubmit={onSubmit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="ct__row">
                    <TextField label="Name" value={f.name} onChange={(e) => set('name', e.target.value)} error={err.name} autoComplete="name" name="name" />
                    <TextField label="Email" type="email" value={f.email} onChange={(e) => set('email', e.target.value)} error={err.email} autoComplete="email" name="email" />
                  </div>
                  <div className="ct__row">
                    <TextField label="Phone" type="tel" optional value={f.phone} onChange={(e) => set('phone', e.target.value)} error={err.phone} autoComplete="tel" name="phone" />
                    <SelectField label="Topic" value={f.topic} onChange={(e) => set('topic', e.target.value)} error={err.topic} name="topic">
                      <option value="" disabled hidden />
                      {TOPICS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </SelectField>
                  </div>
                  <TextArea label="Message" value={f.message} onChange={(e) => set('message', e.target.value)} error={err.message} name="message" rows={5} />
                  {status === 'error' && (
                    <p className="ct__err" role="alert">
                      {failure} You can also email {company.primaryEmail}.
                    </p>
                  )}
                  <div className="ct__submit">
                    <Button type="submit" size="l" disabled={status === 'sending'}>
                      {status === 'sending' ? 'Sending…' : 'Send message'}
                    </Button>
                    <TLink to="/quote" className="tlink">
                      Need a price? Get a quote <Arrow dir="e" />
                    </TLink>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>
  );
}
