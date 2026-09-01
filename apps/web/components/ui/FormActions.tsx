import type { HTMLAttributes } from 'react';

export interface FormActionsProps extends HTMLAttributes<HTMLDivElement> {}

export function FormActions({
  className = '',
  children,
  ...rest
}: FormActionsProps) {
  return (
    <div className={`flex gap-2 pt-2 border-t-2 border-ink ${className}`} {...rest}>
      {children}
    </div>
  );
}
