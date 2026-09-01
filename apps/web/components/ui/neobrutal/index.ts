/**
 * Neobrutal primitives — barrel export.
 *
 * Import surface:
 *   import { Button, Card, NLink } from '@/components/ui/neobrutal';
 *   import type { ButtonProps, ButtonVariant } from '@/components/ui/neobrutal';
 */

export { Button, BUTTON_LABEL_CLS, BUTTON_LINK_BASE_CLS, BUTTON_LINK_SIZE_SM } from './Button';
export type { ButtonProps } from './Button';
export { Card } from './Card';
export type { CardProps } from './Card';
export { Disclosure } from './Disclosure';
export { Eyebrow } from './Eyebrow';
export type { EyebrowColor, EyebrowSize } from './Eyebrow';
export { PageLoader, AdminListLoader, AdminTableLoader } from './PageLoader';
export { NLink } from './Link';
export { Skeleton, SkeletonCard, SkeletonPageHeader, SkeletonPageHeaderWithEyebrow } from './Skeleton';
export type { SkeletonVariant } from './Skeleton';

export {
  BUTTON_SIZE_CLS,
  BUTTON_VARIANT_CLS,
  CARD_VARIANT_CLS,
  LINK_VARIANT_CLS,
  type ButtonSize,
  type ButtonVariant,
  type CardVariant,
  type LinkVariant,
} from './styles';
