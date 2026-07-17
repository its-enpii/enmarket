'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary untuk route /admin/*. Layout sudah render sidebar+topbar
 * dari admin/layout.tsx, jadi component ini cuma render konten utama.
 */
export default function AdminError({ error, reset }: Props) {
  const t = useTranslations('admin.errors');
  const tCommon = useTranslations('common.buttons');

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
        500 — {t('title500')}
      </p>
      <h1 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight text-ink">
        {t('title500')}
      </h1>
      <p className="mt-4 text-base text-ink/70">
        {/* Use same generic message but reuse the backToDashboard label intent. */}
        {t('backToDashboard')}
      </p>
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-4 text-xs text-left bg-ink/5 p-3 border border-ink/20 overflow-x-auto font-mono max-w-xl mx-auto">
          {error.message}
        </pre>
      )}
      <div className="mt-8 flex flex-wrap gap-3 items-center justify-center">
        <Button variant="accent" size="md" onClick={reset} className="min-h-[44px]">
          {tCommon('retry')}
        </Button>
        <Button variant="surface" size="md" href="/admin" className="min-h-[44px]">
          {t('backToDashboard')}
        </Button>
      </div>
    </div>
  );
}