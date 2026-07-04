import { forwardRef, SelectHTMLAttributes } from 'react';

import { SELECT_CLS, SELECT_FLAT_CLS } from './form-tokens';

type Variant = 'default' | 'flat';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  variant?: Variant;
}

/**
 * Select native dengan arrow indicator. Variant:
 * - default — form besar
 * - flat — menyatu dengan kontainer (LiveFilterBar)
 */
export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { variant = 'default', className = '', children, ...rest },
  ref,
) {
  const base = variant === 'flat' ? SELECT_FLAT_CLS : SELECT_CLS;
  return (
    <select ref={ref} className={`${base} ${className}`} {...rest}>
      {children}
    </select>
  );
});