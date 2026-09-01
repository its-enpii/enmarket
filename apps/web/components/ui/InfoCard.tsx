import type { ReactNode } from 'react';

import { Card } from '@/components/ui/neobrutal';

export interface InfoCardProps {
  title: string;
  children?: ReactNode;
  className?: string;
}

export function InfoCard({ title, children, className = '' }: InfoCardProps) {
  return (
    <Card variant="surface" className={`p-6 text-ink/60 ${className}`}>
      <p className="font-display text-lg font-black uppercase">{title}</p>
      {children}
    </Card>
  );
}
