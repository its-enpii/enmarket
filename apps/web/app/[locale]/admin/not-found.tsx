import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/neobrutal';
import { ErrorState } from '@/components/ui/ErrorState';

/**
 * 404 untuk route /admin/*. Layout admin sudah render sidebar+topbar.
 */
export default async function AdminNotFound() {
  const t = await getTranslations('admin.errors');
  const tNav = await getTranslations('admin.nav');

  return (
    <ErrorState
      eyebrowColor="muted"
      eyebrow={`404 — ${t('title404')}`}
      title={t('title404')}
      description={t('backToDashboard')}
      actions={
        <div className="flex flex-wrap items-center justify-center gap-3">
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
      }
    />
  );
}
