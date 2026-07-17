/**
 * Neobrutal text Link primitive.
 *
 * Animated underline + hover color transition. Untuk navigasi text-only
 * (e.g. "Read Entry →", nav menu links, footer link list).
 *
 * Variant:
 *   - default : ink text, hover ke primary
 *   - primary : primary text, hover ke accent
 *   - on-dark : surface/80 text di atas bg ink, hover ke accent
 *
 * Underline:
 *   - static : underline permanen visible
 *   - hover  : underline muncul hanya saat hover (animated)
 *   - none   : tanpa underline
 *
 * Arrow: trailing "→" glyph (optional).
 *
 * @example
 *   <NLink href="/katalog" variant="primary" arrow>Katalog</NLink>
 *   <NLink href="/display" variant="default" underline="hover">Catatan</NLink>
 */

import { Link as NextLink } from '@/i18n/navigation';
import type {
  AnchorHTMLAttributes,
  ReactNode,
} from 'react';

import { LINK_VARIANT_CLS, type LinkVariant } from './styles';

type CommonProps = {
  variant?: LinkVariant;
  underline?: 'static' | 'hover' | 'none';
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

type Props = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps | 'href' | 'popover'> & {
    href: string;
  };

export function NLink({
  variant = 'default',
  underline = 'none',
  arrow = false,
  className = '',
  children,
  ...rest
}: Props) {
  const color = LINK_VARIANT_CLS[variant];

  const underlineCls =
    underline === 'static'
      ? 'underline underline-offset-4 decoration-2'
      : underline === 'hover'
        ? 'hover:underline underline-offset-4 decoration-2'
        : '';

  const composed = [
    'inline-flex items-center gap-2 font-bold transition-all',
    color,
    underlineCls,
    className,
  ].join(' ');

  const inner = (
    <>
      {children}
      {arrow ? (
        <span aria-hidden="true" className="text-current">
          →
        </span>
      ) : null}
    </>
  );

  return (
    <NextLink {...rest} href={rest.href} className={composed}>
      {inner}
    </NextLink>
  );
}
