import type { ElementType, HTMLAttributes } from 'react';

export type MetaLabelSize = 'default' | 'sm';
export type MetaLabelWeight = 'black';
export type MetaLabelColor = 'muted' | 'inherit';
export type MetaLabelTracking = 'wider' | 'normal';

export interface MetaLabelProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  size?: MetaLabelSize;
  weight?: MetaLabelWeight;
  color?: MetaLabelColor;
  tracking?: MetaLabelTracking;
}

const SIZE_CLASSES: Record<MetaLabelSize, string> = {
  default: 'text-xs font-bold uppercase tracking-wider text-ink/60',
  sm: 'font-label text-label-sm uppercase tracking-wider text-ink/60',
};

const TRACKING_CLASSES: Record<MetaLabelTracking, string> = {
  normal: 'tracking-normal',
  wider: 'tracking-wider',
};

export function MetaLabel({
  as: Tag = 'p',
  size = 'default',
  weight,
  color = 'muted',
  tracking = 'wider',
  className = '',
  children,
  ...rest
}: MetaLabelProps) {
  const colorClass = color === 'inherit' ? '' : 'text-ink/60';

  return (
    <Tag
      className={[
        SIZE_CLASSES[size],
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
