'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { ErrorState } from '@/components/ui/ErrorState';
import { ErrorDigest } from '@/components/ui';

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
    <ErrorState
      eyebrow={`500 — ${t('title500')}`}
      title={t('title500')}
      description={t('backToDashboard')}
      actions={
        <div className="flex flex-wrap gap-3 items-center justify-center">
          <Button variant="accent" size="md" onClick={reset} className="min-h-touch">
            {tCommon('retry')}
          </Button>
          <Button variant="surface" size="md" href="/admin" className="min-h-touch">
            {t('backToDashboard')}
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
