import type { HTMLAttributes } from 'react';

import { Card } from './Card';
import { Eyebrow } from './Eyebrow';

export type SkeletonVariant = 'text' | 'block' | 'card';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: 'full' | 'narrow' | 'medium' | 'wide';
  height?: 'text' | 'input' | 'panel' | 'media';
  lines?: number;
}

const WIDTH_CLS = {
  narrow: 'w-24',
  medium: 'w-64',
  wide: 'w-80',
  full: 'w-full',
} as const;

const HEIGHT_CLS = {
  text: 'h-4',
  input: 'h-12',
  panel: 'h-24',
  media: 'h-48',
} as const;

export function Skeleton({
  variant = 'block',
  width = 'full',
  height = 'panel',
  lines,
  className = '',
  ...rest
}: SkeletonProps) {
  if (variant === 'text') {
    const count = lines ?? 1;
    return (
      <div
        aria-hidden
        className={`space-y-2 ${width === 'full' ? '' : WIDTH_CLS[width]} ${className}`}
        {...rest}
      >
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            className={`h-4 animate-pulse rounded-xs bg-ink/10 ${index === count - 1 ? 'w-2/3' : 'w-full'}`}
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card
        aria-hidden
        hoverable={false}
        elevation={3}
        className={`animate-pulse bg-ink/5 p-4 ${className}`}
        {...rest}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-xs bg-ink/10 ${HEIGHT_CLS[height]} ${width === 'full' ? '' : WIDTH_CLS[width]} ${className}`}
      {...rest}
    />
  );
}

export function SkeletonCard({
  className = '',
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card aria-hidden hoverable={false} className={`animate-pulse bg-ink/5 ${className}`}>
      {children ?? <Skeleton variant="block" height="media" />}
    </Card>
  );
}

export function SkeletonPageHeader() {
  return (
    <header className="space-y-3 border-b-4 border-ink pb-6">
      <Skeleton variant="text" width="narrow" className="[&>div]:h-3" />
      <Skeleton variant="block" width="wide" height="input" />
    </header>
  );
}

export function SkeletonPageHeaderWithEyebrow() {
  return (
    <header className="space-y-3 border-b-4 border-ink pb-6">
      <Eyebrow aria-hidden className="opacity-0">Loading</Eyebrow>
      <Skeleton variant="block" width="wide" height="input" />
    </header>
  );
}
