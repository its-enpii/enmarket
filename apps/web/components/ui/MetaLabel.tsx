import type { ElementType, HTMLAttributes } from 'react';

export type MetaLabelSize = 'default' | 'sm';

export interface MetaLabelProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  size?: MetaLabelSize;
}

const SIZE_CLASSES: Record<MetaLabelSize, string> = {
  default: 'text-xs font-bold uppercase tracking-wider text-ink/60',
  sm: 'font-label text-label-sm uppercase tracking-wider text-ink/60',
};

export function MetaLabel({
  as: Tag = 'p',
  size = 'default',
  className = '',
  children,
  ...rest
}: MetaLabelProps) {
  return (
    <Tag className={`${SIZE_CLASSES[size]} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
