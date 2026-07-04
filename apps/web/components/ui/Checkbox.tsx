import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';

import { CHECKBOX_CLS } from './form-tokens';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

/**
 * Checkbox + label inline. Pakai native input[type=checkbox] untuk
 * kompatibilitas FormData, tapi styling NeoBrutalism.
 *
 * Pakai:
 *   <Checkbox name="aktif" label="Aktif" defaultChecked />
 *   atau standalone: <Checkbox /> + <label htmlFor=...> di luar
 */
export const Checkbox = forwardRef<HTMLInputElement, Props>(function Checkbox(
  { label, className = '', id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  if (!label) {
    return (
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        className={`${CHECKBOX_CLS} ${className}`}
        {...rest}
      />
    );
  }
  return (
    <label htmlFor={inputId} className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        className={`${CHECKBOX_CLS} ${className}`}
        {...rest}
      />
      <span>{label}</span>
    </label>
  );
});