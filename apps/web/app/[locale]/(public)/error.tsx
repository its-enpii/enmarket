'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { ErrorState } from '@/components/ui/ErrorState';
import { ErrorDigest } from '@/components/ui';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PublicError({ error, reset }: Props) {
  const t = useTranslations('errors');
  return (
    <ErrorState
      className="mx-auto max-w-2xl px-6 py-16 sm:py-24 text-center"
      titleClassName="mt-3 text-4xl sm:text-5xl font-bold leading-tight text-ink"
      eyebrow={t('title500')}
      title={t('subtitle500')}
      description={t('body500')}
      actions={
        <div className="flex flex-wrap gap-3 items-center justify-center">
          <Button variant="accent" size="md" onClick={reset} className="min-h-touch">
            {t('retry')}
          </Button>
          <Button variant="surface" size="md" href="/develop" className="min-h-touch">
            {t('viewCatalog').replace('← ', '')}
          </Button>
        </div>
      }
    >
      {process.env.NODE_ENV === 'development' && (
        <ErrorDigest>
          {error.message}
        </ErrorDigest>
      )}
    </ErrorState>
  );
}
