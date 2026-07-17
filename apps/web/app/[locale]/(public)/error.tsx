'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PublicError({ error, reset }: Props) {
  const t = useTranslations('errors');
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24 text-center">
      <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-primary">
        {t('title500')}
      </p>
      <h1 className="mt-3 text-4xl sm:text-5xl font-bold leading-tight text-ink">
        {t('subtitle500')}
      </h1>
      <p className="mt-4 text-base text-ink/70">
        {t('body500')}
      </p>
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-4 text-xs text-left bg-ink/5 p-3 border border-ink/20 overflow-x-auto font-mono max-w-xl mx-auto">
          {error.message}
        </pre>
      )}
      <div className="mt-8 flex flex-wrap gap-3 items-center justify-center">
        <Button variant="accent" size="md" onClick={reset} className="min-h-[44px]">
          {t('retry')}
        </Button>
        <Button variant="surface" size="md" href="/katalog" className="min-h-[44px]">
          {t('viewCatalog').replace('← ', '')}
        </Button>
      </div>
    </div>
  );
}