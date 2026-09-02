import type { ReactNode } from 'react';

import { Card } from '@/components/ui/neobrutal';

export interface CardMessageProps {
  size: 'lg' | 'sm';
  tone: 'bold' | 'muted';
  pulse?: boolean;
  children: ReactNode;
}

export function CardMessage({
  size,
  tone,
  pulse = false,
  children,
}: CardMessageProps) {
  const pulseClass = pulse ? ' animate-pulse' : '';

  if (tone === 'bold' || size === 'lg') {
    return (
      <Card variant="surface" hoverable={false} className="p-12 text-center">
        <p className={`text-sm font-bold text-ink${pulseClass}`}>{children}</p>
      </Card>
    );
  }

  return (
    <Card className="p-8 text-center">
      <p className={`text-ink/60${pulseClass}`}>{children}</p>
    </Card>
  );
}
