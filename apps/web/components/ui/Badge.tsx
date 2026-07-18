/**
 * Badge — chip info statis NeoBrutalism.
 *
 * Render sebagai `<span>`. Tone menentukan fill + text color, shadow ON/OFF
 * untuk visual weight. Untuk interactive chip (klik/hover), pakai `<Button>`
 * dengan `flat`. Badge ini NON-interactive — pakai untuk label info.
 *
 * Tone:
 *   - accent : bg-accent text-ink — gold chip (status positif, harga)
 *   - primary: bg-primary text-surface — purple chip
 *   - ink    : bg-ink text-surface — black chip (tag label, kategori)
 *   - surface: bg-surface text-ink — neutral chip
 *
 * Size:
 *   - sm : px-2.5 py-0.5 text-[10px] — corner badge (ProductCard overlay)
 *   - md : px-3 py-1 text-label-sm — chip inline (kategori, status)
 *   - lg : px-4 py-2 text-display    — price tag (font besar)
 *
 * @example
 *   <Badge tone="accent" size="md">Studio Pick</Badge>
 *   <Badge tone="ink" size="sm">LICENSE</Badge>
 */

import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeTone = 'accent' | 'primary' | 'ink' | 'surface';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface Props extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: BadgeSize;
  /** Pakai shadow (default md=true, sm=false, lg=true). Override untuk tone tertentu. */
  shadow?: boolean;
  children?: ReactNode;
}

const TONE_CLS: Record<BadgeTone, string> = {
  accent: 'bg-accent text-ink',
  primary: 'bg-primary text-surface',
  ink: 'bg-ink text-surface',
  surface: 'bg-surface text-ink',
};

const SIZE_CLS: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-label-sm font-black uppercase tracking-wider',
  lg: 'px-4 py-2 font-display text-2xl md:text-3xl font-black uppercase',
};

const SHADOW_BY_SIZE: Record<BadgeSize, string> = {
  sm: '',
  md: 'shadow-[3px_3px_0_0_var(--color-ink)]',
  lg: 'shadow-[4px_4px_0_0_var(--color-ink)]',
};

export function Badge({
  tone = 'accent',
  size = 'md',
  shadow,
  className = '',
  children,
  ...rest
}: Props) {
  const useShadow = shadow ?? (size !== 'sm');

  const composed = [
    'inline-flex items-center border-2 border-ink',
    TONE_CLS[tone],
    SIZE_CLS[size],
    size === 'md' ? 'font-label' : '',
    useShadow ? SHADOW_BY_SIZE[size] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={composed} {...rest}>
      {children}
    </span>
  );
}