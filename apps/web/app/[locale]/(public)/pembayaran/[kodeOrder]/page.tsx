import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { orderApi } from '@/lib/order-api';
import { PublicFetchError } from '@/lib/public-api';

import { PaymentPoller } from './PaymentPoller';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ kodeOrder: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { kodeOrder, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'payment' });
  return {
    title: `${t('title')} ${kodeOrder} — enpiistudio`,
    description: t('instruction', { minutes: 30 }),
    robots: { index: false },
  };
}

export default async function PembayaranPage({ params }: PageProps) {
  const { kodeOrder } = await params;
  const t = await getTranslations('payment');
  const tCommon = await getTranslations('common.buttons');

  let order;
  try {
    const res = await orderApi.showPublic(kodeOrder);
    order = res.data;
  } catch (err) {
    if (err instanceof PublicFetchError && err.status === 404) {
      notFound();
    }
    if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 404) {
      notFound();
    }
    throw err;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 sm:py-12">
      <Link
        href="/keranjang"
        className="inline-block mb-4 text-sm font-bold text-ink/60 hover:text-primary"
      >
        ← {tCommon('back')}
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-2">
        {t('title')}
      </h1>
      <p className="text-sm text-ink/60 mb-8">
        Scan QR di bawah ini dari app e-wallet / m-banking kamu.
      </p>

      <PaymentPoller
        kodeOrder={order.kode_order}
        totalFormatted={order.total_harga_formatted}
        initialStatus={order.status}
        initialQrExpiredAt={order.qr_expired_at}
        qrUrl={order.qr_url}
        qrString={order.qr_string}
      />
    </div>
  );
}