import type { ReactNode } from 'react';

import { Eyebrow } from '@/components/ui/neobrutal';

export interface SectionIntroProps {
  eyebrow: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionIntro({
  eyebrow,
  children,
  className = '',
}: SectionIntroProps) {
  return (
    <div className={className}>
      <Eyebrow size="md" color="accent" className="mb-3">
        {eyebrow}
      </Eyebrow>
      {children}
    </div>
  );
}
