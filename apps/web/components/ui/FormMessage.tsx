import type { ReactNode } from 'react';

interface ErrorProps {
  children: ReactNode;
  /** Variant: 'inline' (kecil di bawah field) atau 'box' (banner alert) */
  variant?: 'inline' | 'box';
}

/** Error text merah-primary. Inline untuk per-field, box untuk form-level. */
export function FormError({ children, variant = 'inline' }: ErrorProps) {
  if (!children) return null;
  if (variant === 'box') {
    return (
      <div className="bg-accent border-2 border-ink px-3 py-2 text-sm font-medium text-ink shadow-[2px_2px_0_0_var(--color-ink)]">
        {children}
      </div>
    );
  }
  return <p className="mt-1 text-xs font-bold text-primary">{children}</p>;
}

interface HintProps {
  children: ReactNode;
}

/** Hint text dimmer di bawah field. */
export function FormHint({ children }: HintProps) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-ink/60">{children}</p>;
}