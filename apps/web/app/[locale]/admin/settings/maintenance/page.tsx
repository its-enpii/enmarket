/**
 * Settings — Maintenance.
 *
 * Server component: fetch /api/admin/maintenance/status → render
 * MaintenanceForm client component. Submit via Server Action toggle on/off
 * + edit banner message.
 */

import { getTranslations } from 'next-intl/server';

import { Card } from '@/components/ui/neobrutal';
import { apiGet } from '@/lib/api';
import type { MaintenanceStatus } from '@/lib/types';

import { MaintenanceForm } from '../MaintenanceForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.settings.maintenance' });
  return { title: `${t('listTitle')} — Admin` };
}

export default async function MaintenanceSettingsPage() {
  const t = await getTranslations('admin.settings.maintenance');
  let status: MaintenanceStatus | null = null;
  try {
    const res = await apiGet<{ data: MaintenanceStatus }>(
      '/api/admin/maintenance/status',
    );
    status = res.data;
  } catch {
    // Backend down
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

      {status ? (
        <MaintenanceForm status={status} />
      ) : (
        <Card variant="surface" className="p-6 text-ink/60">
          <p className="font-display text-lg font-black uppercase">
            {t('backendDownTitle')}
          </p>
          <p className="mt-2 font-body text-sm">
            {t('backendDownHint')}
          </p>
        </Card>
      )}
    </div>
  );
}