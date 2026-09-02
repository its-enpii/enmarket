import type { ReactNode } from 'react';

import { FormError, FormHint } from './FormMessage';
import { LABEL_CLS } from './form-tokens';

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className={LABEL_CLS}
      >
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </label>
      {children}
      {!error && <FormHint>{hint}</FormHint>}
      <FormError>{error}</FormError>
    </div>
  );
}
