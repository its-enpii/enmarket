import { AdminPageHeader, AdminPageBody } from '@/components/ui';
import { buildMetadata } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

import { Card } from '@/components/ui/neobrutal';

import { CouponForm } from '../CouponForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.coupons' });
  return buildMetadata({
    title: `${t('newTitle')} — Admin`,
  });
}

export default async function NewCouponPage() {
  const t = await getTranslations('admin.coupons');
  return (
    <AdminPageBody>
      <AdminPageHeader
        eyebrow={t('listEyebrow')}
        title={t('newTitle')}
        subtitle={t('newSubtitle')}
      />

      <Card variant="surface" className="p-6 md:p-8 max-w-3xl">
        <CouponForm />
      </Card>
    </AdminPageBody>
  );
}
