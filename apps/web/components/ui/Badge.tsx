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
 *   - sm : px-2.5 py-0.5 text-micro — corner badge (ProductCard overlay)
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
export type BadgeElevation = 1 | 2 | 3 | 4 | 6 | 8 | 12;
export type BadgeHeight = '24' | '28' | '32' | '36' | '40' | '56' | '80';
export type BadgeWidth = '24' | '28' | '32' | '36' | '40' | '56' | '80';

interface Props extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: BadgeSize;
  /** Pakai border tipis (1px) alih-alih border standar (2px). */
  thin?: boolean;
  /** Pakai shadow (default md=true, sm=false, lg=true). Override untuk tone tertentu. */
  shadow?: boolean;
  elevation?: BadgeElevation;
  shadowColor?: 'accent' | 'primary' | 'ink';
  height?: BadgeHeight;
  width?: BadgeWidth;
  fontSize?: 'micro' | 'fine' | 'xs' | 'base';
  children?: ReactNode;
}

const TONE_CLS: Record<BadgeTone, string> = {
  accent: 'bg-accent text-ink',
  primary: 'bg-primary text-surface',
  ink: 'bg-ink text-surface',
  surface: 'bg-surface text-ink',
};

const SIZE_CLS: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-micro',
  md: 'px-3 py-1 text-label-sm font-black uppercase tracking-wider',
  lg: 'px-4 py-2 font-display text-2xl md:text-3xl font-black uppercase',
};

const ELEVATION_CLS: Record<BadgeElevation, string> = {
  1: 'shadow-brutal-1',
  2: 'shadow-brutal-2',
  3: 'shadow-brutal-3',
  4: 'shadow-brutal-4',
  6: 'shadow-brutal-6',
  8: 'shadow-brutal-8',
  12: 'shadow-brutal-12',
};

const HEIGHT_CLS: Record<BadgeHeight, string> = {
  24: 'min-h-0 h-6',
  28: 'min-h-0 h-7',
  32: 'min-h-0 h-8',
  36: 'min-h-0 h-9',
  40: 'min-h-0 h-10',
  56: 'min-h-0 h-14',
  80: 'min-h-0 h-20',
};

const WIDTH_CLS: Record<BadgeWidth, string> = {
  24: 'w-6',
  28: 'w-7',
  32: 'w-8',
  36: 'w-9',
  40: 'w-10',
  56: 'w-14',
  80: 'w-20',
};

const FONT_SIZE_CLS: Record<'micro' | 'fine' | 'xs' | 'base', string> = {
  micro: 'text-micro',
  fine: 'text-fine',
  xs: 'text-xs',
  base: 'text-base',
};

export function Badge({
  tone = 'accent',
  size = 'md',
  thin = false,
  shadow,
  elevation,
  shadowColor = 'ink',
  height,
  width,
  fontSize,
  className = '',
  children,
  ...rest
}: Props) {
  const useShadow = shadow ?? (elevation === undefined ? size !== 'sm' : true);
  const shadowCls = elevation
    ? ELEVATION_CLS[elevation]
    : shadowColor === 'accent'
      ? 'shadow-[4px_4px_0_0_var(--color-accent)]'
      : shadowColor === 'primary'
        ? 'shadow-[4px_4px_0_0_var(--color-primary)]'
        : size === 'sm' ? '' : size === 'md' ? 'shadow-brutal-3' : 'shadow-brutal-4';

  const composed = [
    `inline-flex items-center ${thin ? 'border' : 'border-2'} border-ink`,
    TONE_CLS[tone],
    SIZE_CLS[size],
    height ? HEIGHT_CLS[height] : '',
    width ? WIDTH_CLS[width] : '',
    fontSize ? FONT_SIZE_CLS[fontSize] : '',
    size === 'md' ? 'font-label' : '',
    useShadow ? shadowCls : '',
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
