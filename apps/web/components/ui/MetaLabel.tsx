import type { ElementType, HTMLAttributes } from 'react';

export type MetaLabelSize = 'default' | 'sm' | 'micro';
export type MetaLabelWeight = 'black';
export type MetaLabelColor = 'muted' | 'inherit' | 'primary';
export type MetaLabelTracking = 'wider' | 'wide' | 'normal';
export type MetaLabelFamily = 'mono' | 'sans';

export interface MetaLabelProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  size?: MetaLabelSize;
  weight?: MetaLabelWeight;
  color?: MetaLabelColor;
  tracking?: MetaLabelTracking;
  /** Explicit font family; ignored by `size='default'`, which inherits from its parent. */
  family?: MetaLabelFamily;
}

const SIZE_CLASSES: Record<MetaLabelSize, string> = {
  default: 'text-xs font-bold uppercase tracking-wider text-ink/60',
  sm: 'text-label-sm uppercase tracking-wider text-ink/60',
  micro: 'text-micro uppercase',
};

const FONT_FAMILY_CLASSES: Record<MetaLabelFamily, string> = {
  mono: 'font-label',
  sans: 'font-body',
};

const TRACKING_CLASSES: Record<MetaLabelTracking, string> = {
  normal: 'tracking-normal',
  wide: 'tracking-wide',
  wider: 'tracking-wider',
};

export function MetaLabel({
  as: Tag = 'p',
  size = 'default',
  weight,
  color = 'muted',
  tracking = 'wider',
  family = 'mono',
  className = '',
  children,
  ...rest
}: MetaLabelProps) {
  const colorClass = color === 'inherit' ? '' : color === 'primary' ? 'text-primary' : 'text-ink/60';
  const familyClass = size === 'default' ? '' : FONT_FAMILY_CLASSES[family];

  return (
    <Tag
      className={[
        SIZE_CLASSES[size],
        familyClass,
        TRACKING_CLASSES[tracking],
        weight === 'black' ? 'font-black' : '',
        colorClass,
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  );
}
