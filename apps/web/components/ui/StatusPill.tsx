import type { ReactNode } from 'react';

type StatusPillTone = 'success' | 'error' | 'neutral' | 'warning';

const TONE_CLASSES: Record<StatusPillTone, string> = {
  success: 'bg-accent border-success text-success',
  error: 'bg-accent border-danger text-danger',
  neutral: 'bg-surface border-ink text-ink/70',
  warning: 'bg-accent border-warning text-warning',
};

interface StatusPillProps {
  tone: StatusPillTone;
  children: ReactNode;
  className?: string;
}

export function StatusPill({ tone, children, className }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center border-2 px-2 py-0.5 text-micro font-bold uppercase tracking-wider ${TONE_CLASSES[tone]} ${className ?? ''}`}
    >
      {children}
    </span>
  );
}
