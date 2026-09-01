import type { ElementType, HTMLAttributes } from 'react';

export type SectionTitleSize = 'sm' | 'md' | 'xl' | 'xxxl';

export interface SectionTitleProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  size?: SectionTitleSize;
  color?: 'ink' | 'primary';
}

const SIZE_CLASSES: Record<SectionTitleSize, string> = {
  sm: 'font-display text-headline-lg-mobile md:text-headline-lg font-extrabold uppercase tracking-tight text-ink',
  md: 'font-display text-4xl md:text-5xl font-black uppercase leading-[0.95] tracking-tight text-ink',
  xl: 'font-display text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.95] text-ink',
  xxxl: 'font-display text-4xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.95] tracking-tight text-ink',
};

export function SectionTitle({
  as: Tag = 'h2',
  size = 'sm',
  color = 'ink',
  className = '',
  children,
  ...rest
}: SectionTitleProps) {
  const colorClass = color === 'primary' ? 'text-primary' : 'text-ink';
  return (
    <Tag
      className={`${SIZE_CLASSES[size]} ${colorClass} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
