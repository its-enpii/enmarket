import type { ReactNode } from 'react';

export interface SpinnerProps {
  className?: string;
  label?: string;
  children?: ReactNode;
}

export function Spinner({ className = '', label, children }: SpinnerProps) {
  return (
    <span className={`animate-spin ${className}`} role="status">
      {children ?? label}
    </span>
  );
}
