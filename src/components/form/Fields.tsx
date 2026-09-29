import { useId, type ReactNode, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import './form.css';

interface Base {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
}

function Message({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  return (
    <AnimatePresence initial={false} mode="wait">
      {error ? (
        <motion.p
          key="e"
          id={id}
          className="fld__msg fld__msg--err"
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {error}
        </motion.p>
      ) : hint ? (
        <motion.p key="h" id={id} className="fld__msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {hint}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

export function TextField({ label, error, hint, optional, className = '', ...rest }: Base & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const msg = `${id}-msg`;
  return (
    <div className={`fld ${error ? 'is-err' : ''} ${className}`}>
      <div className="fld__box">
      <input
        id={id}
        className="fld__input"
        placeholder=" "
        aria-invalid={!!error}
        aria-describedby={error || hint ? msg : undefined}
        {...rest}
      />
      <label htmlFor={id} className="fld__label">
        {label}
        {optional && <span className="fld__opt"> (optional)</span>}
      </label>
      <span className="fld__line" aria-hidden="true" />
      </div>
      <Message id={msg} error={error} hint={hint} />
    </div>
  );
}

export function TextArea({ label, error, hint, optional, className = '', ...rest }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  const msg = `${id}-msg`;
  return (
    <div className={`fld fld--area ${error ? 'is-err' : ''} ${className}`}>
      <div className="fld__box">
      <textarea
        id={id}
        className="fld__input"
        placeholder=" "
        rows={4}
        aria-invalid={!!error}
        aria-describedby={error || hint ? msg : undefined}
        {...rest}
      />
      <label htmlFor={id} className="fld__label">
        {label}
        {optional && <span className="fld__opt"> (optional)</span>}
      </label>
      <span className="fld__line" aria-hidden="true" />
      </div>
      <Message id={msg} error={error} hint={hint} />
    </div>
  );
}

export function SelectField({
  label,
  error,
  hint,
  optional,
  className = '',
  children,
  ...rest
}: Base & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  const id = useId();
  const msg = `${id}-msg`;
  return (
    <div className={`fld fld--select ${error ? 'is-err' : ''} ${rest.value ? 'has-value' : ''} ${className}`}>
      <div className="fld__box">
      <select id={id} className="fld__input" aria-invalid={!!error} aria-describedby={error || hint ? msg : undefined} {...rest}>
        {children}
      </select>
      <label htmlFor={id} className="fld__label">
        {label}
        {optional && <span className="fld__opt"> (optional)</span>}
      </label>
      <span className="fld__chev" aria-hidden="true" />
      <span className="fld__line" aria-hidden="true" />
      </div>
      <Message id={msg} error={error} hint={hint} />
    </div>
  );
}

export function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  error,
  columns = 2,
}: {
  label: string;
  value: T | '';
  options: { id: T; title: string; text?: string; icon?: ReactNode }[];
  onChange: (v: T) => void;
  error?: string;
  columns?: number;
}) {
  const id = useId();
  return (
    <fieldset className={`chg ${error ? 'is-err' : ''}`} aria-describedby={error ? `${id}-err` : undefined}>
      <legend className="chg__legend">{label}</legend>
      <div className="chg__grid" role="radiogroup" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {options.map((o) => {
          const on = value === o.id;
          return (
            <button
              type="button"
              key={o.id}
              role="radio"
              aria-checked={on}
              className={`chg__opt ${on ? 'is-on' : ''}`}
              onClick={() => onChange(o.id)}
            >
              {o.icon && <span className="chg__icon">{o.icon}</span>}
              <span className="chg__title">{o.title}</span>
              {o.text && <span className="chg__text">{o.text}</span>}
              <span className="chg__radio" aria-hidden="true" />
            </button>
          );
        })}
      </div>
      <Message id={`${id}-err`} error={error} />
    </fieldset>
  );
}
