import { forwardRef, InputHTMLAttributes } from 'react';

import { INPUT_BASE_CLS, INPUT_SM_CLS, INPUT_FLAT_CLS } from './form-tokens';

type Variant = 'default' | 'sm' | 'flat';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  variant?: Variant;
}

/**
 * Input standar. Variant:
 * - default (py-2.5, focus geser + shadow) — untuk form besar
 * - sm (py-1, focus shadow tanpa geser) — untuk inline toolbar (LiveFilterBar)
 * - flat (py-2, focus shadow tanpa geser) — untuk input yang menyatu dengan kontainer
 */
export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { variant = 'default', className = '', ...rest },
  ref,
) {
  const base = variant === 'sm' ? INPUT_SM_CLS : variant === 'flat' ? INPUT_FLAT_CLS : INPUT_BASE_CLS;
  return <input ref={ref} className={`${base} ${className}`} {...rest} />;
});