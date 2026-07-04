import { forwardRef, TextareaHTMLAttributes } from 'react';

import { TEXTAREA_CLS } from './form-tokens';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { className = '', ...rest },
  ref,
) {
  return <textarea ref={ref} className={`${TEXTAREA_CLS} ${className}`} {...rest} />;
});