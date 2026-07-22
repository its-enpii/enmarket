/**
 * Neobrutal Card primitive.
 *
 * Interactive surface (image card, info box) — render sebagai `<div>`,
 * `<article>`, atau `<Link>` (next/link) bergantung prop `href` & `as`.
 *
 * Kalau `hoverable` (default true): apply lift-on-hover + shadow membesar.
 * Kalau tidak: static card (e.g. featured pillar, journal entry info box).
 *
 * Children adalah free-form DOM — primitive TIDAK wrap dalam container
 * tambahan. Caller yang kontrol layout internal (image aspect ratio,
 * padding, border-b separator, dst.).
 *
 * @example
 *   <Card href="/develop/foo" variant="surface">
 *     <img src={...} />
 *     <h3>...</h3>
 *   </Card>
 */

import Link from 'next/link';
import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from 'react';

import {
  BORDER,
  BORDER_THICK,
  CARD_VARIANT_CLS,
  INTERACTIVE_BASE,
  LIFT_HOVER,
  LIFT_PRESS,
  SHADOW_BASE,
  type CardVariant,
} from './styles';

type AllowedTag = 'div' | 'article' | 'section' | 'aside' | 'label' | 'button';

type CommonProps = {
  variant?: CardVariant;
  hoverable?: boolean;
  thick?: boolean; // 4px border instead of 2px
  as?: AllowedTag;
  className?: string;
  children?: ReactNode;
};

type CardAsContainer = CommonProps &
  Omit<HTMLAttributes<HTMLElement>, keyof CommonProps | 'href'> & {
    href?: undefined;
  };

type CardAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | keyof CommonProps> & {
    href: string;
  };

export type CardProps = CardAsContainer | CardAsLink;

export function Card(props: CardProps) {
  const {
    variant = 'surface',
    hoverable = true,
    thick = false,
    as = 'div',
    className = '',
    children,
    ...rest
  } = props as CardProps & { href?: string };

  const fill = CARD_VARIANT_CLS[variant];
  const borderCls = thick ? BORDER_THICK : BORDER;

  // Press-down mechanic saat hoverable: translate + shadow shrink together.
  // Memakai class raw CSS dari globals.css untuk menjamin hardware acceleration
  // dan menghindari bug ghosting Tailwind v4 translate property.
  const interactive = hoverable ? 'neo-btn neo-btn-ink' : 'shadow-[6px_6px_0_0_var(--color-ink)]';

  const composed = [
    'block',
    borderCls,
    fill,
    interactive,
    className,
  ].join(' ');

  if ('href' in props && props.href !== undefined) {
    const { href, ...anchorRest } = rest as CardAsLink;
    return (
      <Link href={href} className={composed} {...anchorRest}>
        {children}
      </Link>
    );
  }

  const { ...containerRest } = rest as CardAsContainer;
  const Tag = as as AllowedTag;
  return (
    <Tag className={composed} {...containerRest}>
      {children}
    </Tag>
  );
}
