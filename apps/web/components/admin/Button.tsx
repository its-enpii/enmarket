/**
 * Reusable button dengan pola NeoBrutalism.
 * Variants:
 *   - primary (indigo) — default action
 *   - accent  (mustard) — destructive/secondary
 *   - ghost   (surface only)
 */

import { ButtonHTMLAttributes } from 'react';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'accent' | 'ghost';

export type ButtonVariant = Variant;

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
  /** Flat = tanpa border & shadow. Pakai saat tombol menyatu dengan kontainer
   *  yang sudah punya border/shadow (mis. tombol di dalam LiveFilterBar). */
  flat?: boolean;
}

export const BUTTON_VARIANT_CLS: Record<Variant, string> = {
  primary: 'bg-primary text-surface',
  accent: 'bg-accent text-ink',
  ghost: 'bg-surface text-ink',
};

export const BUTTON_SIZE_CLS: Record<'sm' | 'md', string> = {
  sm: 'px-3 py-1.5 text-sm min-h-[40px]',
  md: 'px-5 py-2.5 text-base min-h-[44px]',
};

/** Reusable class untuk tombol non-button yang tetap harus match style
 *  (link, anchor, `<a>` element dalam map). */
export const BUTTON_LINK_BASE_CLS =
  'inline-flex items-center justify-center border-2 border-ink font-bold ' +
  'shadow-[3px_3px_0_0_var(--color-ink)] ' +
  'hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[5px_5px_0_0_var(--color-ink)] ' +
  'active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--color-ink)] ' +
  'transition-all cursor-pointer';

/** Size untuk button-as-Link (mis. Reset di LiveFilterBar).
 *  Match dengan SelectSearch trigger styling: py-2.5 + font-medium.
 *  Element <Link> tidak punya default browser button padding,
 *  jadi lebih jelas pakai size eksplisit ini. */
export const BUTTON_LINK_SIZE_SM =
  'px-3 py-2.5 text-sm font-medium min-h-[40px]';

export function Button({
  variant = 'primary',
  size = 'md',
  flat = false,
  className = '',
  children,
  ...rest
}: Props) {
  const baseShape = flat
    ? 'font-bold hover:brightness-110 active:brightness-95'
    : 'border-2 border-ink font-bold shadow-[3px_3px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[5px_5px_0_0_var(--color-ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--color-ink)] transition-all';
  return (
    <button
      {...rest}
      className={
        baseShape +
        ' ' +
        BUTTON_VARIANT_CLS[variant] +
        ' ' +
        BUTTON_SIZE_CLS[size] +
        ' cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ' +
        (flat ? '' : 'transition-all disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0_0_var(--color-ink)] ') +
        className
      }
    >
      {children}
    </button>
  );
}
