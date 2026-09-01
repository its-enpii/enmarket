import type { ElementType, HTMLAttributes } from 'react';

export interface SectionTitleProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
}

export function SectionTitle({
  as: Tag = 'h2',
  className = '',
  children,
  ...rest
}: SectionTitleProps) {
  return (
    <Tag
      className={`font-display text-headline-lg-mobile md:text-headline-lg font-extrabold uppercase tracking-tight text-ink ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
