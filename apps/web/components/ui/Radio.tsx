import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';

import { RADIO_CLS } from './form-tokens';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, Props>(function Radio(
  { label, className = '', id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  if (!label) {
    return (
      <input
        ref={ref}
        id={inputId}
        type="radio"
        className={`${RADIO_CLS} ${className}`}
        {...rest}
      />
    );
  }
  return (
    <label htmlFor={inputId} className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
      <input
        ref={ref}
        id={inputId}
        type="radio"
        className={`${RADIO_CLS} ${className}`}
        {...rest}
      />
      <span>{label}</span>
    </label>
  );
});