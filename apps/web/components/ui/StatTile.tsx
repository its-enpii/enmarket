import type { ReactNode } from 'react';

import { Card } from '@/components/ui/neobrutal';

type StatTileVariant = 'surface' | 'filled-primary' | 'filled-accent' | 'ink';

export interface StatTileProps {
  label: string;
  value: ReactNode;
  variant: StatTileVariant;
  valueClassName?: string;
  className?: string;
}

export function StatTile({
  label,
  value,
  variant,
  valueClassName = '',
  className = '',
}: StatTileProps) {
  return (
    <Card variant={variant} hoverable={false} className={className}>
      <p className="text-micro font-bold uppercase tracking-widest opacity-70">{label}</p>
      <p className={`mt-2 font-display text-3xl font-black leading-none ${valueClassName}`}>
        {value}
      </p>
    </Card>
  );
}
