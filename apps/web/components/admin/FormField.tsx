import type { ReactNode } from 'react';

import { FormError, FormHint } from '@/components/ui/FormMessage';

interface Props {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
}

/**
 * Form field wrapper — label + child + hint/error.
 * Pakai tokens LABEL_CLS / ERROR_CLS / HINT_CLS dari form-tokens.ts
 * untuk konsistensi di semua form.
 */
export function FormField({ label, htmlFor, hint, error, required, children }: Props) {
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