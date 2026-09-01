import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { MetaLabel } from '@/components/ui/MetaLabel';

export interface DataItemProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  as?: ElementType;
  valueClassName?: string;
}

export function DataItem({
  label,
  value,
  hint,
  as,
  valueClassName = '',
  className = '',
  ...rest
}: DataItemProps) {
  const ValueTag = as ?? 'p';

  return (
    <div className={className} {...rest}>
      <MetaLabel>{label}</MetaLabel>
      <ValueTag className={`font-bold text-ink text-sm ${valueClassName}`}>
        {value}
      </ValueTag>
      {hint && <p className="mt-1 text-ink/60 text-xs">{hint}</p>}
    </div>
  );
}
