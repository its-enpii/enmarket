/**
 * Reusable button dengan pola NeoBrutalism.
 * Variants:
 *   - primary (indigo) — default action
 *   - accent  (mustard) — destructive/secondary
 *   - ghost   (surface only)
 */

import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'accent' | 'ghost';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-surface',
  accent: 'bg-accent text-ink',
  ghost: 'bg-surface text-ink',
};

const SIZES: Record<'sm' | 'md', string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={
        'border-2 border-ink font-bold ' +
        VARIANTS[variant] +
        ' ' +
        SIZES[size] +
        ' shadow-[3px_3px_0_0_var(--color-ink)] ' +
        'hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[5px_5px_0_0_var(--color-ink)] ' +
        'active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--color-ink)] ' +
        'transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0_0_var(--color-ink)] ' +
        className
      }
    >
      {children}
    </button>
  );
}
