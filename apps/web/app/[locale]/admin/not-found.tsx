import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/neobrutal';

/**
 * 404 untuk route /admin/*. Layout admin sudah render sidebar+topbar.
 */
export default async function AdminNotFound() {
  const t = await getTranslations('admin.errors');
  const tNav = await getTranslations('admin.nav');

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/60">
        404 — {t('title404')}
      </p>
      <h1 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight text-ink">
        {t('title404')}
      </h1>
      <p className="mt-4 text-base text-ink/70">
        {t('backToDashboard')}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button variant="primary" size="md" href="/admin" className="min-h-[44px]">
          {t('backToDashboard')}
        </Button>
        <Button variant="surface" size="md" href="/admin/products" className="min-h-[44px]">
          {tNav('products')}
        </Button>
        <Button variant="surface" size="md" href="/admin/orders" className="min-h-[44px]">
          {tNav('orders')}
        </Button>
      </div>
    </div>
  );
}