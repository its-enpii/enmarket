import { forwardRef, InputHTMLAttributes } from 'react';

import { FILE_INPUT_CLS } from './form-tokens';

interface Props extends InputHTMLAttributes<HTMLInputElement> {}

/**
 * Styled file input. Native <input type="file"> dengan button "Pilih File"
 * ber-style NeoBrutalism (border-2 + shadow + hover effect).
 */
export const FileInput = forwardRef<HTMLInputElement, Props>(function FileInput(
  { className = '', ...rest },
  ref,
) {
  return <input ref={ref} type="file" className={`${FILE_INPUT_CLS} ${className}`} {...rest} />;
});