import type { ElementType, HTMLAttributes, ReactNode } from 'react';

export type EyebrowSize = 'micro' | 'sm' | 'md' | 'lg' | 'label-sm' | 'label-lg' | 'mono-otp';
export type EyebrowColor =
  | 'ink'
  | 'ink-muted'
  | 'ink-soft'
  | 'ink-subtle'
  | 'primary'
  | 'accent'
  | 'surface'
  | 'surface-soft'
  | 'inherit';

interface EyebrowProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  size?: EyebrowSize;
  color?: EyebrowColor;
  muted?: boolean;
  children?: ReactNode;
}

const SIZE_CLS: Record<EyebrowSize, string> = {
  micro: 'text-micro tracking-label',
  sm: 'text-micro tracking-label',
  md: 'text-xs tracking-label-lg',
  lg: 'text-xs tracking-[10px]',
  'label-sm': 'text-label-sm tracking-label',
  'label-lg': 'text-label-sm tracking-label-lg',
  'mono-otp': 'tracking-otp font-mono text-2xl',
};

const COLOR_CLS: Record<EyebrowColor, string> = {
  ink: 'text-ink',
  'ink-muted': 'text-ink/60',
  'ink-soft': 'text-ink/70',
  'ink-subtle': 'text-ink/40',
  primary: 'text-primary',
  accent: 'text-accent',
  surface: 'text-surface',
  'surface-soft': 'text-surface/70',
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
