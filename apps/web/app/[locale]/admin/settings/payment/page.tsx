/**
 * Settings — Payment & Gateway.
 *
 * Server component: fetch payment + channels → render PaymentForm client
 * component. Submit via Server Action (./actions.ts) PATCH /api/admin/settings.
 */

import { getTranslations } from 'next-intl/server';

import { Card } from '@/components/ui/neobrutal';
import { apiGet } from '@/lib/api';
import type { SiteSettings } from '@/lib/types';

import { PaymentForm } from '../PaymentForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.settings.payment' });
  return { title: `${t('listTitle')} — Admin` };
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
      <header className="border-b-4 border-ink pb-6">
        <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-3">
          {t('listEyebrow')}
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.95] tracking-tight text-ink">
          {t('listTitle')}<span className="text-primary">.</span>
        </h1>
        <p className="mt-3 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4">
          {t('listSubtitle')}
        </p>
      </header>

      {initialData ? (
        <PaymentForm
          payment={initialData.payment}
          channels={initialData.channels}
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