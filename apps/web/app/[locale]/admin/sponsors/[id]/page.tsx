import { notFound } from 'next/navigation';
import { AdminPageHeader, AdminPageBody } from '@/components/ui';
import { buildMetadata } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

import { Card } from '@/components/ui/neobrutal';
import { ApiRequestError, apiGet } from '@/lib/api';
import type { SingleResponse, Sponsor } from '@/lib/types';
import { SponsorForm } from '../SponsorForm';

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.sponsors' });
  return buildMetadata({
    title: `${t('editTitle')} — Admin`,
  });
}

export default async function EditSponsorPage({ params }: Props) {
  const { id } = await params;

  let sponsor: Sponsor | null = null;
  try {
    const res = await apiGet<SingleResponse<Sponsor>>(`/api/admin/sponsors/${id}`);
    sponsor = res.data;
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  if (!sponsor) notFound();

  const t = await getTranslations('admin.sponsors');

  return (
    <AdminPageBody>
      <AdminPageHeader
        eyebrow={t('editEyebrow')}
        title={sponsor.name || sponsor.domain}
        subtitle={t('editSubtitle')}
      />

      <Card variant="surface" hoverable={false} className="p-6 md:p-8 max-w-3xl">
        <SponsorForm initial={sponsor} />
      </Card>
    </AdminPageBody>
  );
}
