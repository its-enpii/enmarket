import type { ElementType, HTMLAttributes } from 'react';

export type TextVariant = 'muted' | 'itemTitle' | 'hint';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  variant?: TextVariant;
}

const VARIANT_CLASSES: Record<TextVariant, string> = {
  muted: 'text-xs text-ink/60',
  itemTitle: 'font-bold text-ink truncate',
  hint: 'mt-2 text-xs text-ink/70 leading-relaxed',
};

export function Text({
  as: Tag = 'p',
  variant = 'muted',
  className = '',
  children,
  ...rest
}: TextProps) {
  return (
    <Tag
      className={[VARIANT_CLASSES[variant], className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  );
}
