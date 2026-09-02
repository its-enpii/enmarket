import type { ReactNode } from 'react';

import { Card } from '@/components/ui/neobrutal';

type StatTileVariant = 'surface' | 'filled-primary' | 'filled-accent' | 'ink';
type StatTileSize = 'md' | 'lg';

export interface StatTileProps {
  label: string;
  value: ReactNode;
  variant: StatTileVariant;
  size?: StatTileSize;
  valueClassName?: string;
  className?: string;
}

export function StatTile({
  label,
  value,
  variant,
  size = 'lg',
  valueClassName = '',
  className = '',
}: StatTileProps) {
  const valueSizeClass = size === 'md' ? 'text-2xl md:text-3xl' : 'text-3xl';

  return (
    <Card variant={variant} hoverable={false} className={className}>
      <p className="text-micro font-bold uppercase tracking-widest opacity-70">{label}</p>
      <p className={`mt-2 font-display ${valueSizeClass} font-black leading-none ${valueClassName}`}>
        {value}
      </p>
    </Card>
  );
}
