import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
/**
 * Settings — Payment & Gateway.
 *
 * Server component: fetch payment + channels → render PaymentForm client
 * component. Submit via Server Action (./actions.ts) PATCH /api/admin/settings.
 */

import { buildMetadata } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

import { Card } from '@/components/ui/neobrutal';
import { apiGet } from '@/lib/api';
import type { SiteSettings } from '@/lib/types';

import { PaymentForm } from '../PaymentForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.settings.payment' });
  return buildMetadata({
    title: `${t('listTitle')} — Admin`,
  });
}

export default async function PaymentSettingsPage() {
  const t = await getTranslations('admin.settings.payment');
  let initialData: SiteSettings | null = null;
  try {
    const res = await apiGet<{ data: SiteSettings }>('/api/admin/settings');
    initialData = res.data;
  } catch {
    // Backend down — fallback ke UI dummy
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={t('listEyebrow')}
        title={t('listTitle')}
        subtitle={t('listSubtitle')}
      />

      {initialData ? (
        <PaymentForm
          payment={initialData.payment}
          channels={initialData.channels}
          paymentGateways={initialData.payment_gateways}
        />
      ) : (
        <Card variant="surface" className="p-6 text-ink/60">
          <p className="font-display text-lg font-black uppercase">
            {t('backendDownTitle')}
          </p>
        </Card>
      )}
    </div>
  );
}
