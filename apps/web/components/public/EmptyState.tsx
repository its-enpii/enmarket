'use client';

import { useTranslations } from 'next-intl';

import { Button, Card } from '@/components/ui/neobrutal';

interface Props {
  title: string;
  message?: string;
  cta?: { href: string; label: string };
}

/**
 * Empty state — blok warna dengan CTA.
 * Translated via next-intl 'common.empty' namespace.
 */
export function EmptyState({ title, message, cta }: Props) {
  const t = useTranslations('common.empty');
  return (
    <Card variant="surface" hoverable={false} className="p-8 sm:p-12 text-center" style={{ boxShadow: '4px 4px 0 0 var(--color-ink)' }}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/60">
        {t('title')}
      </p>
      <h2 className="mt-2 text-2xl sm:text-3xl font-bold leading-tight text-ink">
        {title}
      </h2>
      {message && (
        <p className="mt-3 text-sm sm:text-base text-ink/70 max-w-md mx-auto">
          {message}
        </p>
      )}
      {cta && (
        <Button href={cta.href} variant="primary" size="md" className="mt-6">
          {cta.label}
        </Button>
      )}
    </Card>
  );
}