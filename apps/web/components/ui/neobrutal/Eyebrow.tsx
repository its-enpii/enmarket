import type { ElementType, HTMLAttributes, ReactNode } from 'react';

export type EyebrowSize = 'sm' | 'md' | 'lg' | 'mono-otp';
export type EyebrowColor = 'ink' | 'ink-muted' | 'primary' | 'accent' | 'surface' | 'inherit';

interface EyebrowProps extends HTMLAttributes<HTMLParagraphElement> {
  as?: ElementType;
  size?: EyebrowSize;
  color?: EyebrowColor;
  muted?: boolean;
  children?: ReactNode;
}

const SIZE_CLS: Record<EyebrowSize, string> = {
  sm: 'text-micro tracking-label',
  md: 'text-xs tracking-label-lg',
  lg: 'text-xs tracking-[10px]',
  'mono-otp': 'tracking-otp font-mono text-2xl',
};

const COLOR_CLS: Record<EyebrowColor, string> = {
  ink: 'text-ink',
  'ink-muted': 'text-ink/60',
  primary: 'text-primary',
  accent: 'text-accent',
  surface: 'text-surface',
  inherit: '',
};

export function Eyebrow({
  as: Tag = 'p',
  size = 'sm',
  color = 'ink-muted',
  muted = false,
  className = '',
  children,
  ...rest
}: EyebrowProps) {
  const colorClass = muted ? 'text-ink/60' : COLOR_CLS[color];
  const fontClass = size === 'mono-otp' ? '' : 'font-label font-bold uppercase';
  const composed = [fontClass, SIZE_CLS[size], colorClass, className].filter(Boolean).join(' ');
  return <Tag className={composed} {...rest}>{children}</Tag>;
}
