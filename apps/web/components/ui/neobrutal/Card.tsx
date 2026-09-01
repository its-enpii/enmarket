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
 *     <Image src={...} />
 *     <h3>...</h3>
 *   </Card>
 */

import { Link } from '@/i18n/navigation';
import { Image } from '@/components/ui/Image';
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

export type CardElevation = 1 | 2 | 3 | 4 | 6 | 8 | 10 | 12;
export type CardShadowColor = 'ink' | 'accent' | 'primary';

type CommonProps = {
  variant?: CardVariant;
  hoverable?: boolean;
  thick?: boolean; // 4px border instead of 2px
  raised?: boolean;
  elevation?: CardElevation;
  shadowColor?: CardShadowColor;
  as?: AllowedTag;
  className?: string;
  children?: ReactNode;
};

type CardAsContainer = CommonProps &
  Omit<HTMLAttributes<HTMLElement>, keyof CommonProps | 'href'> & {
    href?: undefined;
  };

type CardAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | keyof CommonProps | 'popover'> & {
    href: string;
  };

export type CardProps = CardAsContainer | CardAsLink;

const SHADOW_CLS: Record<CardElevation, string> = {
  1: 'shadow-[1px_1px_0_0_var(--card-shadow-color)]',
  2: 'shadow-[2px_2px_0_0_var(--card-shadow-color)]',
  3: 'shadow-[3px_3px_0_0_var(--card-shadow-color)]',
  4: 'shadow-[4px_4px_0_0_var(--card-shadow-color)]',
  6: 'shadow-[6px_6px_0_0_var(--card-shadow-color)]',
  8: 'shadow-[8px_8px_0_0_var(--card-shadow-color)]',
  10: 'shadow-[10px_10px_0_0_var(--card-shadow-color)]',
  12: 'shadow-[12px_12px_0_0_var(--card-shadow-color)]',
};

const SHADOW_COLOR_CLS: Record<CardShadowColor, string> = {
  ink: '[--card-shadow-color:var(--color-ink)]',
  accent: '[--card-shadow-color:var(--color-accent)]',
  primary: '[--card-shadow-color:var(--color-primary)]',
};

export function Card(props: CardProps) {
  const {
    variant = 'surface',
    hoverable = true,
    thick = false,
    raised = false,
    elevation,
    shadowColor = 'ink',
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
  const interactive = hoverable
    ? 'neo-btn neo-btn-ink'
    : SHADOW_CLS[elevation ?? (raised ? 8 : 6)];

  const composed = [
    'block',
    SHADOW_COLOR_CLS[shadowColor],
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
