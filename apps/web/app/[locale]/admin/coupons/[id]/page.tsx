import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { notFound } from 'next/navigation';
import { buildMetadata } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

import { Card } from '@/components/ui/neobrutal';
import { ApiRequestError, apiGet } from '@/lib/api';
import type { Coupon, SingleResponse } from '@/lib/types';

import { CouponForm } from '../CouponForm';

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.coupons' });
  return buildMetadata({
    title: `${t('editTitle')} — Admin`,
  });
}

export default async function EditCouponPage({ params }: Props) {
  const { id } = await params;

  let coupon: Coupon | null = null;
  try {
    const res = await apiGet<SingleResponse<Coupon>>(`/api/admin/coupons/${id}`);
    coupon = res.data;
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  if (!coupon) notFound();

  const t = await getTranslations('admin.coupons');

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <AdminPageHeader
        eyebrow={t('editEyebrow')}
        title={coupon.code}
        subtitle={t('editSubtitle')}
      />

      <Card variant="surface" className="p-6 md:p-8 max-w-3xl">
        <CouponForm initial={coupon} />
      </Card>
    </div>
  );
}
