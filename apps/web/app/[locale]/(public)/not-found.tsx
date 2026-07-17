import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/neobrutal';

export default async function NotFound() {
  const t = await getTranslations('errors');
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24 text-center">
      <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-ink/60">
        {t('title404')}
      </p>
      <h1 className="mt-3 text-4xl sm:text-5xl font-bold leading-tight text-ink">
        {t('subtitle404')}
      </h1>
      <p className="mt-4 text-base sm:text-lg text-ink/70">
        {t('body404')}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button variant="primary" size="md" href="/katalog">
          {t('viewCatalog')}
        </Button>
        <Button variant="surface" size="md" href="/">
          {t('goHome')}
        </Button>
      </div>
    </div>
  );
}