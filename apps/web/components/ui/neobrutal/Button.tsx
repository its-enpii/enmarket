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
  LIFT_HOVER,
  LIFT_PRESS,
  LIFT_SM_HOVER,
  LIFT_SM_PRESS,
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

/**
 * Base interactive mechanics via raw CSS class (.neo-btn-* di globals.css)
 * Mengatasi bug rendering Tailwind v4 logical `translate`.
 */
const BASE_INK = [BORDER, 'neo-btn', 'neo-btn-ink'].join(' ');
const BASE_ACCENT = [BORDER, 'neo-btn', 'neo-btn-accent'].join(' ');
const BASE_SM_INK = [BORDER, 'neo-btn', 'neo-btn-sm-ink'].join(' ');
const BASE_SM_ACCENT = [BORDER, 'neo-btn', 'neo-btn-sm-accent'].join(' ');

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

  // Resolve base shape tanpa string manipulation (Tailwind JIT safe)
  let baseShape = '';
  if (flat) {
    baseShape = 'font-bold hover:brightness-110 active:brightness-95';
  } else if (shadowColor === 'accent') {
    baseShape = size === 'sm' ? BASE_SM_ACCENT : BASE_ACCENT;
  } else {
    baseShape = size === 'sm' ? BASE_SM_INK : BASE_INK;
  }

  // `ghost` adalah alias legacy admin untuk `surface`.
  const variantKey: ButtonVariant = variant === 'ghost' ? 'surface' : variant;
  const fill = BUTTON_VARIANT_CLS[variantKey];
  const size_ = BUTTON_SIZE_CLS[size];

  const composed = [
    'inline-flex items-center justify-center text-center',
    baseShape,
    fill,
    size_,
    'font-bold cursor-pointer',
    DISABLED_RESET,
    'disabled:opacity-50 disabled:cursor-not-allowed',
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

/**
 * Class untuk button non-primitive (e.g. inline tag `<a>` di map).
 */
export const BUTTON_LINK_BASE_CLS = [
  'inline-flex items-center justify-center',
  BORDER,
  'font-bold',
  'neo-btn',
  'neo-btn-sm-ink',
  'cursor-pointer',
].join(' ');

export const BUTTON_LINK_SIZE_SM =
  'px-3 py-2.5 text-sm font-medium min-h-[40px]';

export const BUTTON_LABEL_CLS = [
  BORDER,
  'font-bold cursor-pointer',
  'hover:bg-accent',
  'neo-btn',
  'neo-btn-sm-ink',
].join(' ');