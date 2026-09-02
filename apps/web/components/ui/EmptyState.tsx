import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/neobrutal';
import { Card } from '@/components/ui/neobrutal';
import { Eyebrow } from '@/components/ui/neobrutal';

type EmptyStateVariant = 'admin' | 'public';

interface AdminEmptyStateProps {
  variant: 'admin';
  compact?: false;
  title: string;
  body?: string;
  action?: ReactNode;
}

interface PublicEmptyStateProps {
  variant?: 'public';
  compact?: false;
  title: string;
  message?: string;
  cta?: { href: string; label: string };
}

interface CompactEmptyStateProps {
  compact: true;
  size: 'lg' | 'sm';
  title: string;
  hint?: string;
  cta: { href: string; label: string };
}

export type EmptyStateProps =
  | AdminEmptyStateProps
  | PublicEmptyStateProps
  | CompactEmptyStateProps;

export function EmptyState(props: EmptyStateProps) {
  const t = useTranslations('common.empty');

  if (props.compact) {
    if (props.size === 'sm') {
      return (
        <Card className="p-8 text-center">
          <p className="text-sm font-semibold text-ink/70 mb-4">{props.title}</p>
          <Button variant="primary" size="md" href={props.cta.href}>
            {props.cta.label}
          </Button>
        </Card>
      );
    }

    return (
      <Card variant="surface" hoverable={false} className="p-12 text-center">
        <p className="text-base font-bold text-ink mb-2">{props.title}</p>
        {props.hint && <p className="text-xs text-ink/70 mb-6">{props.hint}</p>}
        <Button variant="primary" size="md" href={props.cta.href}>
          {props.cta.label}
        </Button>
      </Card>
    );
  }

  if (props.variant === 'admin') {
    return (
      <Card variant="surface" hoverable={false} className="p-8 md:p-12">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="relative inline-block shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-primary border-4 border-ink shadow-[10px_10px_0_0_var(--color-ink)] flex items-center justify-center">
              <span className="font-display text-5xl md:text-6xl font-black uppercase text-surface">
                ∅
              </span>
            </div>
            <div
              aria-hidden="true"
              className="absolute -bottom-5 -right-5 w-16 h-16 md:w-20 md:h-20 bg-accent border-4 border-ink shadow-[6px_6px_0_0_var(--color-ink)] z-raised"
            />
          </div>

          <div className="flex-1 min-w-0">
            <Eyebrow size="md" color="accent" className="mb-2">
              ✎ Empty
            </Eyebrow>
            <h3 className="font-display text-2xl md:text-3xl font-black uppercase leading-[0.95] tracking-tight text-ink">
              {props.title}
            </h3>
            {props.body && (
              <p className="mt-3 font-body text-body-md text-ink/70 max-w-md">
                {props.body}
              </p>
            )}
            {props.action && <div className="mt-5">{props.action}</div>}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant="surface"
      hoverable={false}
      className="flex flex-col items-center gap-4 p-8 sm:p-12 text-center sm:gap-6"
    >
      <p className="text-xs font-bold uppercase tracking-label text-ink/60">
        {t('title')}
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-ink">
        {props.title}
      </h2>
      {props.message && (
        <p className="text-sm sm:text-base text-ink/70 max-w-md">
          {props.message}
        </p>
      )}
      {props.cta && (
        <Button href={props.cta.href} variant="primary" size="md" className="mt-2">
          {props.cta.label}
        </Button>
      )}
    </Card>
  );
}
