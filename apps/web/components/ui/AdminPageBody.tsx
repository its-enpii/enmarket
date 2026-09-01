import type { HTMLAttributes } from 'react';

export interface AdminPageBodyProps extends HTMLAttributes<HTMLDivElement> {}

export function AdminPageBody({
  className = '',
  children,
  ...rest
}: AdminPageBodyProps) {
  return (
    <div className={`p-6 sm:p-8 space-y-6 ${className}`} {...rest}>
      {children}
    </div>
  );
}
