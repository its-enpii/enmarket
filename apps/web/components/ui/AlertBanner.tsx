import type { ReactNode } from 'react';

type AlertVariant = 'error' | 'success' | 'info';

interface AlertBannerProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}

const VARIANT_CLS: Record<AlertVariant, string> = {
  error: 'bg-accent text-ink',
  success: 'bg-primary text-surface',
  info: 'bg-ink text-surface',
};

export function AlertBanner({
  variant = 'info',
  children,
  className = '',
}: AlertBannerProps) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`border-2 border-ink px-4 py-2 text-sm font-bold shadow-[2px_2px_0_0_var(--color-ink)] ${VARIANT_CLS[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
