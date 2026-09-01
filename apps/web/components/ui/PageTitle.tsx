import type { HTMLAttributes } from 'react';

export type PageTitleSize = 'hero' | 'compact';

export interface PageTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  size?: PageTitleSize;
}

const SIZE_CLASSES: Record<PageTitleSize, string> = {
  hero: 'font-display text-5xl md:text-6xl font-black uppercase leading-[0.95] tracking-tight text-ink',
  compact:
    'text-2xl sm:text-3xl font-black uppercase text-ink tracking-tight',
};

export function PageTitle({
  size = 'hero',
  className = '',
  children,
  ...rest
}: PageTitleProps) {
  return (
    <h1 className={`${SIZE_CLASSES[size]} ${className}`} {...rest}>
      {children}
    </h1>
  );
}
