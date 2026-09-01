import type { ElementType, HTMLAttributes } from 'react';

export interface SectionBandProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
}

export function SectionBand({
  as: Tag = 'section',
  className = '',
  children,
  ...rest
}: SectionBandProps) {
  return (
    <Tag className={`bg-surface border-b-4 border-ink ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
