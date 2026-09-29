import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { useMeta } from '../lib/meta';
import { TextField, TextArea, SelectField, ChoiceGroup } from '../components/form/Fields';
import { Button } from '../components/ui/Button';
import { SectionLabel } from '../components/ui/Misc';
import { KineticTitle } from '../components/page/KineticTitle';
import { VehicleIcon } from '../sections/services/VehicleSelector';
import { vehicleOptions, type VehicleKind, type CarrierKind } from '../data/services';
import { company, offices } from '../data/site';
import { submitRequest, copyText, isEmail, isPhone, type SubmitResult } from '../lib/submit';
import { scrollToEl } from '../lib/scroll';
import './quote.css';

interface QuoteData {
  scope: 'domestic' | 'international';
  pickup: string;
  delivery: string;
  vehicleType: VehicleKind | '';
  year: string;
  make: string;
  model: string;
  condition: 'running' | 'non-running' | '';
  carrier: CarrierKind | '';
  date: string;
  flexible: boolean;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

const EMPTY: QuoteData = {
  scope: 'domestic',
  pickup: '',
  delivery: '',
  vehicleType: '',
  year: '',
  make: '',
  model: '',
  condition: '',
  carrier: '',
  date: '',
  flexible: false,
  name: '',
  phone: '',
  email: '',
  notes: '',
};

const STEPS = ['Route', 'Vehicle', 'Transport', 'Contact', 'Review'] as const;
type Errors = Partial<Record<keyof QuoteData, string>>;

const MAKES = [
  'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge',
  'Ducati', 'Ferrari', 'Fiat', 'Ford', 'Genesis', 'GMC', 'Harley-Davidson', 'Honda', 'Hyundai', 'Infiniti', 'Jaguar',
  'Jeep', 'Kawasaki', 'Kia', 'Lamborghini', 'Land Rover', 'Lexus', 'Lincoln', 'Lotus', 'Lucid', 'Maserati', 'Mazda',
  'McLaren', 'Mercedes-Benz', 'MINI', 'Mitsubishi', 'Nissan', 'Polestar', 'Porsche', 'Ram', 'Rivian', 'Rolls-Royce',
  'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'Triumph', 'Volkswagen', 'Volvo', 'Yamaha',
];

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const STORE_KEY = 'ez2-quote-draft';
function loadDraft(): Partial<QuoteData> {
  try {
    return JSON.parse(sessionStorage.getItem(STORE_KEY) || '{}');
  } catch {
    return {};
  }
}
function saveDraft(d: QuoteData) {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(d));
  } catch {
    /* storage unavailable — the draft simply isn't kept */
  }
}
function clearDraft() {
  try {
    sessionStorage.removeItem(STORE_KEY);
  } catch {
    /* ignore */
  }
}

function validate(step: number, d: QuoteData): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (d.pickup.trim().length < 2) e.pickup = 'Enter the pickup city, state or ZIP.';
    if (d.delivery.trim().length < 2) e.delivery = d.scope === 'international' ? 'Enter the destination city and country.' : 'Enter the delivery city, state or ZIP.';
  }
  if (step === 1) {
    if (!d.year) e.year = 'Select the model year.';
    if (d.make.trim().length < 2) e.make = 'Enter the make.';
    if (!d.model.trim()) e.model = 'Enter the model.';
    if (!d.condition) e.condition = 'Let us know whether the vehicle runs.';
  }
  if (step === 2) {
    if (!d.carrier) e.carrier = 'Choose open or enclosed transport.';
    if (!d.date) e.date = 'Choose your first available shipping date.';
    else if (d.date < today()) e.date = 'Choose today or a later date.';
  }
  if (step === 3) {
    if (d.name.trim().length < 2) e.name = 'Enter your name.';
    if (!isPhone(d.phone)) e.phone = 'Enter a phone number we can reach you on.';
    if (!isEmail(d.email)) e.email = 'Enter a valid email address.';
  }
  return e;
}

const fmtDate = (s: string) => {
  if (!s) return '';
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function fieldsFor(d: QuoteData): [string, string][] {
  const vt = vehicleOptions.find((v) => v.id === d.vehicleType)?.label ?? '';
  return [
    ['Shipment', d.scope === 'international' ? 'International' : 'Within the United States'],
    ['Pickup location', d.pickup],
    ['Delivery location', d.delivery],
    ['Vehicle', `${d.year} ${d.make} ${d.model}`.trim()],
    ['Vehicle type', vt],
    ['Condition', d.condition === 'running' ? 'Running' : d.condition === 'non-running' ? 'Non-running' : ''],
    ['Carrier', d.carrier === 'open' ? 'Open transport' : d.carrier === 'enclosed' ? 'Enclosed transport' : ''],
    ['First available date', `${fmtDate(d.date)}${d.flexible ? ' (flexible)' : ''}`],
    ['Name', d.name],
    ['Phone', d.phone],
    ['Email', d.email],
    ['Notes', d.notes],
  ];
}

/* ---------- Ticket ---------- */
function Ticket({ d, step, done }: { d: QuoteData; step: number; done: boolean }) {
  const code = (s: string) =>
    s
      .replace(/[^A-Za-z ]/g, '')
      .trim()
      .slice(0, 3)
      .toUpperCase() || '———';
  const bars = useMemo(() => {
    const src = `${d.pickup}${d.delivery}${d.make}${d.model}${d.name}` || 'EZ2SHIP';
    const out: number[] = [];
    for (let i = 0; i < 42; i++) out.push(1 + ((src.charCodeAt(i % src.length) * (i + 7)) % 4));
    return out;
  }, [d.pickup, d.delivery, d.make, d.model, d.name]);
  const vehicle = `${d.year} ${d.make} ${d.model}`.trim();
  const rows: [string, string][] = [
    ['Vehicle', vehicle],
    ['Condition', d.condition === 'running' ? 'Running' : d.condition === 'non-running' ? 'Non-running' : ''],
    ['Carrier', d.carrier ? (d.carrier === 'open' ? 'Open' : 'Enclosed') : ''],
    ['Ready from', d.date ? `${fmtDate(d.date)}${d.flexible ? ' · flexible' : ''}` : ''],
    ['Contact', d.name],
  ];
  return (
    <aside className={`tk ${done ? 'is-done' : ''}`} aria-label="Your shipment request summary">
      <div className="tk__head">
        <span className="tk__brand">EZ 2 SHIP</span>
        <span className="t-mono">{company.mc}</span>
      </div>
      <div className="tk__route">
        <div>
          <span className="t-mono tk__k">From</span>
          <span className="tk__code">{code(d.pickup)}</span>
          <span className="tk__place">{d.pickup || 'Pickup location'}</span>
        </div>
        <div className="tk__path" aria-hidden="true">
          <span className="tk__dash" />
          <span className="tk__truck" style={{ left: `${Math.min(100, (step / 4) * 100)}%` }}>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M2 7h11v8H2zM13 10h4l3 3v2h-7z" fill="currentColor" />
              <circle cx="6" cy="17" r="2" fill="currentColor" />
              <circle cx="16" cy="17" r="2" fill="currentColor" />
            </svg>
          </span>
        </div>
        <div className="tk__to">
          <span className="t-mono tk__k">To</span>
          <span className="tk__code">{code(d.delivery)}</span>
          <span className="tk__place">{d.delivery || 'Delivery location'}</span>
        </div>
      </div>
      <div className="tk__perf" aria-hidden="true" />
      <dl className="tk__rows">
        {rows.map(([k, v]) => (
          <div key={k} className={v ? 'is-set' : ''}>
            <dt className="t-mono">{k}</dt>
            <dd>{v || '—'}</dd>
          </div>
        ))}
      </dl>
      <div className="tk__foot">
        <div className="tk__bars" aria-hidden="true">
          {bars.map((b, i) => (
            <span key={i} style={{ width: b }} />
          ))}
        </div>
        <span className={`tk__stamp ${done ? 'is-on' : ''}`}>{done ? 'Ready' : d.scope === 'international' ? 'Intl · Draft' : 'Draft'}</span>
      </div>
    </aside>
  );
}

/* ---------- Page ---------- */
export default function Quote() {
  useMeta('Get a quote', 'Request a vehicle shipping quote from EZ 2 SHIP — open or enclosed transport across the United States and internationally.');
  const [params] = useSearchParams();
  const [d, setD] = useState<QuoteData>(() => {
    const draft = { ...EMPTY, ...loadDraft() };
    const v = params.get('vehicle') as VehicleKind | null;
    const c = params.get('carrier') as CarrierKind | null;
    const sc = params.get('scope');
    const pu = params.get('pickup');
    const de = params.get('delivery');
    if (pu) draft.pickup = pu.slice(0, 120);
    if (de) draft.delivery = de.slice(0, 120);
    if (v && vehicleOptions.some((o) => o.id === v)) draft.vehicleType = v;
    if (c === 'open' || c === 'enclosed') draft.carrier = c;
    if (sc === 'international') draft.scope = 'international';
    return draft;
  });
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [sendError, setSendError] = useState('');
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const years = useMemo(() => {
    const top = new Date().getFullYear() + 1;
    return Array.from({ length: top - 1949 }, (_, i) => String(top - i));
  }, []);

  useEffect(() => {
    if (status !== 'done') saveDraft(d);
  }, [d, status]);

  const set = <K extends keyof QuoteData>(k: K, v: QuoteData[K]) => {
    setD((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
    setErrors({});
    requestAnimationFrame(() => {
      if (formRef.current && formRef.current.getBoundingClientRect().top < 0) scrollToEl(formRef.current, -120);
    });
  };

  const next = () => {
    const e = validate(step, d);
    if (Object.keys(e).length) {
      setErrors(e);
      const first = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], .chg.is-err button');
      first?.focus();
      return;
    }
    go(step + 1);
  };

  const submit = async (ev?: FormEvent) => {
    ev?.preventDefault();
    for (let s = 0; s < 4; s++) {
      const e = validate(s, d);
      if (Object.keys(e).length) {
        setErrors(e);
        go(s);
        return;
      }
    }
    setStatus('sending');
    setSendError('');
    try {
      const r = await submitRequest('quote', fieldsFor(d));
      setResult(r);
      setStatus('done');
      clearDraft();
      requestAnimationFrame(() => formRef.current && scrollToEl(formRef.current, -120));
    } catch (err) {
      setStatus('error');
      setSendError(err instanceof Error ? err.message : 'Something went wrong while sending.');
    }
  };

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step < 4) next();
    else submit();
  };

  const variants = {
    enter: (dd: number) => ({ opacity: 0, x: dd * 48, filter: 'blur(6px)' }),
    center: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
    exit: (dd: number) => ({ opacity: 0, x: dd * -32, filter: 'blur(4px)', transition: { duration: 0.25 } }),
  };

  const done = status === 'done';
  const summaryText = fieldsFor(d)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  return (
    <div className="qt" data-theme="light">
      <section className="qt__hero wrap">
        <SectionLabel>Get a quote</SectionLabel>
        <KineticTitle lines={['Your shipment,', 'in five steps.']} accent={1} className="qt__title" max={150} />
        <p className="qt__lead t-body-l t-muted">
          Tell us where it is, where it’s going and what it is. It takes about two minutes — prefer to talk? Call{' '}
          <a href={offices[0].phone.href}>{offices[0].phone.display}</a> (US) or <a href={offices[1].phone.href}>{offices[1].phone.display}</a> (UAE).
        </p>
      </section>

      <section className="qt__body wrap" ref={formRef}>
        <div className="qt__main">
          {!done && (
            <nav className="qt__progress" aria-label="Quote steps">
              <div className="qt__rail" aria-hidden="true">
                <motion.span className="qt__rail-fill" animate={{ scaleX: step / 4 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
                <motion.span className="qt__rail-truck" animate={{ left: `${(step / 4) * 100}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M2 7h11v8H2zM13 10h4l3 3v2h-7z" fill="currentColor" />
                    <circle cx="6" cy="17" r="2" fill="currentColor" />
                    <circle cx="16" cy="17" r="2" fill="currentColor" />
                  </svg>
                </motion.span>
              </div>
              <ol className="qt__steps">
                {STEPS.map((s, i) => (
                  <li key={s}>
                    <button
                      type="button"
                      className={`qt__step ${i === step ? 'is-current' : ''} ${i < step ? 'is-done' : ''}`}
                      onClick={() => i < step && go(i)}
                      disabled={i > step}
                      aria-current={i === step ? 'step' : undefined}
                    >
                      <span className="t-mono">{String(i + 1).padStart(2, '0')}</span> {s}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <form className="qt__form" onSubmit={onFormSubmit} noValidate>
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              {done && result ? (
                <motion.div key="done" className="qt__done" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}>
                  <div className="qt__check" aria-hidden="true">
                    <svg viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="29" />
                      <path d="M19 33.5 28 42 45 23" />
                    </svg>
                  </div>
                  <h2 className="qt__done-title" tabIndex={-1}>
                    {result.method === 'endpoint' ? 'Request sent.' : 'Request ready to send.'}
                  </h2>
                  {result.method === 'endpoint' ? (
                    <p className="t-body-l">
                      Thanks, {d.name.split(' ')[0]}. Your request has been sent to the EZ 2 SHIP team — we’ll be in touch at{' '}
                      {d.email} or {d.phone}.
                    </p>
                  ) : (
                    <p className="t-body-l">
                      Thanks, {d.name.split(' ')[0]}. Your email app should now be open with your request addressed to {company.primaryEmail} — just
                      press <strong>send</strong>. If it didn’t open, use one of the options below.
                    </p>
                  )}
                  <pre className="qt__summary">{result.summary}</pre>
                  <div className="qt__done-actions">
                    {result.mailto && (
                      <Button href={result.mailto} icon="mail" variant="primary">
                        Open email again
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      icon="none"
                      onClick={async () => {
                        setCopied(await copyText(summaryText));
                      }}
                    >
                      {copied ? 'Copied to clipboard' : 'Copy request details'}
                    </Button>
                    <Button href={offices[0].phone.href} variant="ghost" icon="phone">
                      Call {offices[0].phone.display}
                    </Button>
                  </div>
                  <div className="qt__next">
                    <p className="t-mono">What happens next</p>
                    <ol>
                      <li>We review your route, vehicle and dates.</li>
                      <li>We come back to you with your quote and answer any questions.</li>
                      <li>Once you’re ready to book, we arrange a carrier and pickup window.</li>
                    </ol>
                  </div>
                  <button
                    type="button"
                    className="tlink qt__again"
                    onClick={() => {
                      setD(EMPTY);
                      setStatus('idle');
                      setResult(null);
                      setStep(0);
                    }}
                  >
                    Start another quote
                  </button>
                </motion.div>
              ) : (
                <motion.div key={step} className="qt__panel" custom={dir} variants={variants} initial="enter" animate="center" exit="exit">
                  {step === 0 && (
                    <div className="qt__fields">
                      <h2 className="qt__h">Where is it going?</h2>
                      <ChoiceGroup
                        label="Shipment type"
                        value={d.scope}
                        onChange={(v) => set('scope', v)}
                        options={[
                          { id: 'domestic', title: 'Within the U.S.', text: 'Door-to-door, state to state' },
                          { id: 'international', title: 'International', text: 'From or to a destination abroad' },
                        ]}
                      />
                      <div className="qt__row">
                        <TextField
                          label="Pickup location"
                          value={d.pickup}
                          onChange={(e) => set('pickup', e.target.value)}
                          error={errors.pickup}
                          hint="City and state, or ZIP code"
                          autoComplete="address-level2"
                          name="pickup"
                        />
                        <TextField
                          label={d.scope === 'international' ? 'Destination' : 'Delivery location'}
                          value={d.delivery}
                          onChange={(e) => set('delivery', e.target.value)}
                          error={errors.delivery}
                          hint={d.scope === 'international' ? 'City and country' : 'City and state, or ZIP code'}
                          name="delivery"
                        />
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="qt__fields">
                      <h2 className="qt__h">What are we shipping?</h2>
                      <ChoiceGroup
                        label="Vehicle type (optional)"
                        value={d.vehicleType}
                        onChange={(v) => set('vehicleType', v)}
                        columns={5}
                        options={vehicleOptions.map((v) => ({ id: v.id, title: v.label, icon: <VehicleIcon kind={v.id} /> }))}
                      />
                      <div className="qt__row qt__row--3">
                        <SelectField label="Year" value={d.year} onChange={(e) => set('year', e.target.value)} error={errors.year} name="year">
                          <option value="" disabled hidden />
                          {years.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </SelectField>
                        <TextField label="Make" value={d.make} onChange={(e) => set('make', e.target.value)} error={errors.make} list="qt-makes" name="make" autoComplete="off" />
                        <TextField label="Model" value={d.model} onChange={(e) => set('model', e.target.value)} error={errors.model} name="model" autoComplete="off" />
                      </div>
                      <datalist id="qt-makes">
                        {MAKES.map((m) => (
                          <option key={m} value={m} />
                        ))}
                      </datalist>
                      <ChoiceGroup
                        label="Condition"
                        value={d.condition}
                        onChange={(v) => set('condition', v)}
                        error={errors.condition}
                        options={[
                          { id: 'running', title: 'Running', text: 'Starts, drives, brakes and steers' },
                          { id: 'non-running', title: 'Non-running', text: 'Needs to be winched or assisted on and off' },
                        ]}
                      />
                    </div>
                  )}

                  {step === 2 && (
                    <div className="qt__fields">
                      <h2 className="qt__h">How should it travel?</h2>
                      <ChoiceGroup
                        label="Carrier type"
                        value={d.carrier}
                        onChange={(v) => set('carrier', v)}
                        error={errors.carrier}
                        options={[
                          {
                            id: 'open',
                            title: 'Open transport',
                            text: 'The industry standard — generally the most economical and widely available.',
                            icon: (
                              <svg viewBox="0 0 120 40" aria-hidden="true">
                                <path d="M4 30h92M8 30V14h80v16M8 22h80" fill="none" stroke="currentColor" strokeWidth="3" />
                                <path d="M96 30V16h12l8 8v6z" fill="currentColor" />
                                <circle cx="20" cy="33" r="4" fill="currentColor" />
                                <circle cx="80" cy="33" r="4" fill="currentColor" />
                              </svg>
                            ),
                          },
                          {
                            id: 'enclosed',
                            title: 'Enclosed transport',
                            text: 'Fully covered from weather and road debris — typically priced higher.',
                            icon: (
                              <svg viewBox="0 0 120 40" aria-hidden="true">
                                <rect x="6" y="6" width="84" height="24" rx="3" fill="currentColor" />
                                <path d="M96 30V16h12l8 8v6z" fill="currentColor" />
                                <circle cx="20" cy="33" r="4" fill="currentColor" />
                                <circle cx="80" cy="33" r="4" fill="currentColor" />
                              </svg>
                            ),
                          },
                        ]}
                      />
                      <div className="qt__row">
                        <TextField
                          type="date"
                          label="First available shipping date"
                          value={d.date}
                          min={today()}
                          onChange={(e) => set('date', e.target.value)}
                          error={errors.date}
                          name="date"
                        />
                        <label className="qt__check-row">
                          <input type="checkbox" checked={d.flexible} onChange={(e) => set('flexible', e.target.checked)} />
                          <span className="qt__box" aria-hidden="true" />
                          <span>My dates are flexible</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="qt__fields">
                      <h2 className="qt__h">Where should we send your quote?</h2>
                      <div className="qt__row">
                        <TextField label="Full name" value={d.name} onChange={(e) => set('name', e.target.value)} error={errors.name} autoComplete="name" name="name" />
                        <TextField
                          label="Phone"
                          type="tel"
                          value={d.phone}
                          onChange={(e) => set('phone', e.target.value)}
                          error={errors.phone}
                          autoComplete="tel"
                          name="phone"
                          inputMode="tel"
                        />
                      </div>
                      <TextField
                        label="Email"
                        type="email"
                        value={d.email}
                        onChange={(e) => set('email', e.target.value)}
                        error={errors.email}
                        autoComplete="email"
                        name="email"
                        inputMode="email"
                      />
                      <TextArea
                        label="Anything else we should know?"
                        optional
                        value={d.notes}
                        onChange={(e) => set('notes', e.target.value)}
                        hint="Modifications, low clearance, keys, access limits at pickup or delivery…"
                        name="notes"
                      />
                    </div>
                  )}

                  {step === 4 && (
                    <div className="qt__fields">
                      <h2 className="qt__h">Review your request</h2>
                      <div className="qt__review">
                        {[
                          { title: 'Route', s: 0, rows: [['Shipment', d.scope === 'international' ? 'International' : 'Within the U.S.'], ['Pickup', d.pickup], ['Delivery', d.delivery]] },
                          {
                            title: 'Vehicle',
                            s: 1,
                            rows: [
                              ['Vehicle', `${d.year} ${d.make} ${d.model}`],
                              ['Type', vehicleOptions.find((v) => v.id === d.vehicleType)?.label ?? '—'],
                              ['Condition', d.condition === 'running' ? 'Running' : 'Non-running'],
                            ],
                          },
                          {
                            title: 'Transport',
                            s: 2,
                            rows: [
                              ['Carrier', d.carrier === 'open' ? 'Open' : 'Enclosed'],
                              ['First available', `${fmtDate(d.date)}${d.flexible ? ' · flexible' : ''}`],
                            ],
                          },
                          { title: 'Contact', s: 3, rows: [['Name', d.name], ['Phone', d.phone], ['Email', d.email], ...(d.notes ? [['Notes', d.notes]] : [])] },
                        ].map((b) => (
                          <div key={b.title} className="qt__rev">
                            <div className="qt__rev-h">
                              <span className="t-mono">{b.title}</span>
                              <button type="button" className="tlink" onClick={() => go(b.s)}>
                                Edit
                              </button>
                            </div>
                            <dl>
                              {b.rows.map(([k, v]) => (
                                <div key={k}>
                                  <dt>{k}</dt>
                                  <dd>{v}</dd>
                                </div>
                              ))}
                            </dl>
                          </div>
                        ))}
                      </div>
                      <p className="qt__consent t-small t-muted">
                        By sending this request you’re asking EZ 2 SHIP to contact you about your shipment using the details above.
                      </p>
                      {status === 'error' && (
                        <p className="qt__send-err" role="alert">
                          {sendError} Please try again, or call {offices[0].phone.display}.
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {!done && (
              <div className="qt__nav">
                {step > 0 ? (
                  <button type="button" className="qt__back" onClick={() => go(step - 1)}>
                    ← Back
                  </button>
                ) : (
                  <span />
                )}
                {step < 4 ? (
                  <Button type="submit" size="l">
                    {`Continue — ${STEPS[step + 1]}`}
                  </Button>
                ) : (
                  <Button type="submit" size="l" variant="blue" disabled={status === 'sending'}>
                    {status === 'sending' ? 'Sending…' : 'Send my quote request'}
                  </Button>
                )}
              </div>
            )}
          </form>
        </div>

        <div className="qt__side">
          <Ticket d={d} step={done ? 4 : step} done={done} />
          <div className="qt__help">
            <p className="t-mono">Prefer to talk?</p>
            {offices.map((o) => (
              <a key={o.id} href={o.phone.href}>
                <span className="t-mono">{o.code}</span> {o.phone.display}
              </a>
            ))}
            <a href={`mailto:${company.primaryEmail}`}>{company.primaryEmail}</a>
          </div>
        </div>
      </section>
    </div>
  );
}
