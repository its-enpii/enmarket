import type { ReactNode } from 'react';

import { FormError, FormHint } from './FormMessage';

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5"
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
