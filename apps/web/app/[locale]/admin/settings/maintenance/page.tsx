import { AdminPageHeader, AdminPageBody } from '@/components/ui';
/**
 * Settings — Maintenance.
 *
 * Server component: fetch /api/admin/maintenance/status → render
 * MaintenanceForm client component. Submit via Server Action toggle on/off
 * + edit banner message.
 */

import { buildMetadata } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

import { Card } from '@/components/ui/neobrutal';
import { apiGet } from '@/lib/api';
import type { MaintenanceStatus } from '@/lib/types';

import { MaintenanceForm } from '../MaintenanceForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.settings.maintenance' });
  return buildMetadata({
    title: `${t('listTitle')} — Admin`,
  });
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
      <AdminPageHeader
        eyebrow={t('listEyebrow')}
        title={t('listTitle')}
        subtitle={t('listSubtitle')}
      />

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
