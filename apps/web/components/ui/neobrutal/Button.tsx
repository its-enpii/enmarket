/**
 * Neobrutal Button primitive.
 *
 * Render sebagai `<button>` atau `<Link>` (next/link) bergantung ada/tidak
 * prop `href`. Tidak butuh Radix Slot.
 *
 * Props lain diteruskan ke underlying element (`disabled`, `onClick`,
 * `aria-*`, `type`, dll.) lewat spread.
 *
 * @example
 *   <Button variant="primary" onClick={...}>Click me</Button>
 *   <Button variant="accent" size="lg" href="/katalog">Mulai Belanja</Button>
 */

import Link from 'next/link';
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';

import {
  BORDER,
  BUTTON_SIZE_CLS,
  BUTTON_VARIANT_CLS,
  DISABLED_RESET,
  INTERACTIVE_BASE,
  INTERACTIVE_BASE_SM,
  TRANSITION,
  type ButtonSize,
  type ButtonVariant,
} from './styles';

type CommonProps = {
  variant?: ButtonVariant | 'ghost';
  size?: ButtonSize;
  /** Teks opsional untuk screen reader. */
  srLabel?: string;
  /** Tanpa shadow/border. Untuk button di dalam card yg sudah shadowed. */
  flat?: boolean;
  /** Override shadow color (default ink). Pakai 'accent' untuk hero CTA yang
   *  pakai shadow kuning khas neobrutal. */
  shadowColor?: 'ink' | 'accent';
  children?: ReactNode;
  className?: string;
};

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | keyof CommonProps> & {
    href: string;
    /** Pakai native <a> untuk external URL (download, dll.). Hindari Next.js Link yang akan client-route. */
    external?: boolean;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    flat = false,
    srLabel,
    shadowColor = 'ink',
    children,
    className = '',
    ...rest
  } = props;

  // Saat shadowColor override, replace var(--color-ink) di base interactive.
  const baseShape = flat
    ? 'font-bold hover:brightness-110 active:brightness-95'
    : shadowColor === 'accent'
      ? size === 'sm'
        ? INTERACTIVE_BASE_SM.replace(/var\(--color-ink\)/g, 'var(--color-accent)')
        : INTERACTIVE_BASE.replace(/var\(--color-ink\)/g, 'var(--color-accent)')
      : size === 'sm'
        ? INTERACTIVE_BASE_SM
        : INTERACTIVE_BASE;

  // `ghost` adalah alias legacy admin untuk `surface`.
  const variantKey: ButtonVariant = variant === 'ghost' ? 'surface' : variant;
  const fill = BUTTON_VARIANT_CLS[variantKey];
  const size_ = BUTTON_SIZE_CLS[size];

  const composed = [
    baseShape,
    fill,
    size_,
    'font-bold cursor-pointer',
    DISABLED_RESET,
    'disabled:opacity-50 disabled:cursor-not-allowed',
    flat ? '' : 'transition-all',
    className,
  ].join(' ');

  const inner = (
    <>
      {srLabel ? <span className="sr-only">{srLabel}</span> : null}
      {children}
    </>
  );

  if ('href' in props && props.href !== undefined) {
    const { href, external, ...anchorRest } = rest as ButtonAsLink & { external?: boolean };
    if (external) {
      return (
        <a href={href} className={composed} {...anchorRest}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={composed} {...anchorRest}>
        {inner}
      </Link>
    );
  }

  return (
    <button className={composed} {...(rest as ButtonAsButton)}>
      {inner}
    </button>
  );
}

// ───── Legacy-friendly class re-exports ─────
//
// Caller lama (admin/ProductCard, dll.) yang langsung pakai class constants
// tetap bisa via: `import { BUTTON_VARIANT_CLS } from '@/components/ui/neobrutal'`.

/**
 * Class untuk button non-primitive (e.g. inline tag `<a>` di map) yang
 * harus match style button. Pakai INTERACTIVE_BASE_SM mechanic:
 * translate positif + shadow mengecil (press-down spec).
 */
export const BUTTON_LINK_BASE_CLS = [
  'inline-flex items-center justify-center',
  BORDER,
  'font-bold',
  'shadow-[3px_3px_0_0_var(--color-ink)]',
  'hover:translate-x-[2px] hover:translate-y-[2px]',
  'hover:shadow-[1px_1px_0_0_var(--color-ink)]',
  'active:translate-x-[2px] active:translate-y-[2px]',
  'active:shadow-[1px_1px_0_0_var(--color-ink)]',
  TRANSITION,
  'cursor-pointer',
].join(' ');

/** Size kecil untuk Button sebagai `<Link>` non-primitive. */
export const BUTTON_LINK_SIZE_SM =
  'px-3 py-2.5 text-sm font-medium min-h-[40px]';

/** Plain-class button tanpa interactive state — untuk tag `<label>`, dsb. */
export const BUTTON_LABEL_CLS = [
  BORDER,
  'font-bold cursor-pointer',
  'shadow-[3px_3px_0_0_var(--color-ink)]',
  'hover:bg-accent',
  'hover:translate-x-[1px] hover:translate-y-[1px]',
  'hover:shadow-[1px_1px_0_0_var(--color-ink)]',
  TRANSITION,
].join(' ');
