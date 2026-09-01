import type { HTMLAttributes, ReactNode } from 'react';

export interface ImagePlaceholderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function ImagePlaceholder({
  className = '',
  children,
  ...rest
}: ImagePlaceholderProps) {
  return (
    <div
      className={`w-full h-full flex items-center justify-center bg-primary text-surface ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
