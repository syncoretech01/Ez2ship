import { company } from '../data/site';

export type SubmitKind = 'quote' | 'contact';
export interface SubmitResult {
  method: 'endpoint' | 'email';
  mailto?: string;
  summary: string;
}

/**
 * Delivers a form submission.
 *  - If VITE_FORM_ENDPOINT is configured (e.g. a Formspree/Basin/serverless URL), the data is POSTed as JSON.
 *  - Otherwise the visitor's email app opens with the request pre-filled and addressed to EZ 2 SHIP,
 *    so every submission still reaches the team without a backend.
 */
export async function submitRequest(kind: SubmitKind, fields: [label: string, value: string][]): Promise<SubmitResult> {
  const subject = kind === 'quote' ? 'Shipping quote request' : 'Website enquiry';
  const summary = fields
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  const endpoint = import.meta.env.VITE_FORM_ENDPOINT as string | undefined;

  if (endpoint) {
    const payload: Record<string, string> = { _subject: `${subject} — EZ 2 SHIP website`, kind };
    for (const [k, v] of fields) payload[k] = v;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`The request could not be sent (HTTP ${res.status}).`);
    return { method: 'endpoint', summary };
  }

  const body = `${summary}\n\n— Sent from the EZ 2 SHIP website`;
  const mailto = `mailto:${company.primaryEmail}?cc=${encodeURIComponent(company.emails[1])}&subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
  return { method: 'email', mailto, summary };
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isPhone = (v: string) => (v.replace(/[^\d]/g, '').length >= 7 && /^[+\d\s().-]+$/.test(v.trim()));
