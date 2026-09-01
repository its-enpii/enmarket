import type { ReactNode } from 'react';

type AlertVariant = 'error' | 'success' | 'info' | 'accent-soft';

interface AlertBannerProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}

const VARIANT_CLS: Record<AlertVariant, string> = {
  error: 'bg-accent text-ink',
  success: 'bg-primary text-surface',
  info: 'bg-ink text-surface',
  'accent-soft': 'bg-accent/20 p-3',
};

const BASE_CLS: Record<AlertVariant, string> = {
  error: 'px-4 py-2 text-sm font-bold shadow-[2px_2px_0_0_var(--color-ink)]',
  success: 'px-4 py-2 text-sm font-bold shadow-[2px_2px_0_0_var(--color-ink)]',
  info: 'px-4 py-2 text-sm font-bold shadow-[2px_2px_0_0_var(--color-ink)]',
  'accent-soft': 'text-sm',
};

export function AlertBanner({
  variant = 'info',
  children,
  className = '',
}: AlertBannerProps) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`border-2 border-ink ${BASE_CLS[variant]} ${VARIANT_CLS[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
