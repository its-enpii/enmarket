import { AdminPageHeader } from '@/components/ui';
import { buildMetadata } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

import { InfoCard } from '@/components/ui';
import { apiGet } from '@/lib/api';
import type { NavMenuRecord } from '@/lib/types';

import { NavMenuForm } from '../NavMenuForm';

/** Key navbar yang masih dikenali storefront — baris lama (mis. topup) disaring. */
const SUPPORTED_NAV_KEYS = ['discover', 'develop', 'display', 'layanan'] as const;

function isSupportedNavMenu(menu: NavMenuRecord): boolean {
  return (SUPPORTED_NAV_KEYS as readonly string[]).includes(menu.key);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.settings.navigation' });
  return buildMetadata({
    title: `${t('listTitle')} — Admin`,
  });
}

export default async function NavigationSettingsPage() {
  const t = await getTranslations('admin.settings.navigation');
  let navMenus: NavMenuRecord[] | null = null;

  try {
    const res = await apiGet<{ data: NavMenuRecord[] }>('/api/admin/nav-menus');
    navMenus = res.data.filter(isSupportedNavMenu);
  } catch {
    // Backend down / token expired — render fallback below.
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={t('listEyebrow')}
        title={t('listTitle')}
        subtitle={t('listSubtitle')}
      />

      {navMenus && navMenus.length > 0 ? (
        <NavMenuForm initial={navMenus} />
      ) : (
        <InfoCard title={t('backendDownTitle')}>
          <p className="mt-2 font-body text-sm">{t('backendDownHint')}</p>
        </InfoCard>
      )}
    </div>
  );
}
