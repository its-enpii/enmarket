import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
/**
 * Settings — Site Identity.
 *
 * Server component: fetch settings via apiGet → pass data ke IdentityForm client
 * component. Submit di-handle via Server Action (./actions.ts) yang call
 * PATCH /api/admin/settings group=identity|social|footer.
 */

import { buildMetadata } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

import { Card } from '@/components/ui/neobrutal';
import { apiGet } from '@/lib/api';
import type { SiteSettings } from '@/lib/types';

import { IdentityForm } from './IdentityForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.settings.identity' });
  return buildMetadata({
    title: `${t('listTitle')} — Admin`,
  });
}

export default async function SiteIdentitySettingsPage() {
  const t = await getTranslations('admin.settings.identity');
  let initialData: SiteSettings | null = null;
  try {
    const res = await apiGet<{ data: SiteSettings }>('/api/admin/settings');
    initialData = res.data;
  } catch {
    // Backend down / token expired → render empty form. IdentityForm handles
    // null values via ?? fallback.
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={t('listEyebrow')}
        title={t('listTitle')}
        subtitle={t('listSubtitle')}
      />

      {initialData ? (
        <IdentityForm
          identity={initialData.identity}
          social={initialData.social}
          footer={initialData.footer}
        />
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