import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/neobrutal';
import { ErrorState } from '@/components/ui/ErrorState';

export default async function NotFound() {
  const t = await getTranslations('errors');
  return (
    <ErrorState
      className="mx-auto max-w-2xl px-6 py-16 sm:py-24 text-center"
      eyebrowColor="muted"
      titleClassName="mt-3 text-4xl sm:text-5xl font-bold leading-tight text-ink"
      descriptionClassName="mt-4 text-base sm:text-lg text-ink/70"
      eyebrow={t('title404')}
      title={t('subtitle404')}
      description={t('body404')}
      actions={
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button variant="primary" size="md" href="/develop">
            {t('viewCatalog')}
          </Button>
          <Button variant="surface" size="md" href="/">
            {t('goHome')}
          </Button>
        </div>
      }
    />
  );
}
