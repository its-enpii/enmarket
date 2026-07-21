import { notFound } from 'next/navigation';
import { getFormatter, getTranslations } from 'next-intl/server';

import { AccountProvisioningBox } from '@/components/order/AccountProvisioningBox';
import { Button, Card } from '@/components/ui/neobrutal';
import { Link } from '@/i18n/navigation';
import { orderApi } from '@/lib/order-api';
import { PublicFetchError } from '@/lib/public-api';

import { StatusPoller } from './StatusPoller';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ kodeOrder: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { kodeOrder, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkOrder' });
  return {
    title: `${t('detailTitle')} ${kodeOrder} — enpiistudio`,
    description: t('subtitle'),
    robots: { index: false },
  };
}

const STATUS_VARIANTS: Record<string, 'filled-accent' | 'filled-primary' | 'ink' | 'surface'> = {
  pending: 'filled-accent',
  paid: 'filled-primary',
  failed: 'ink',
  expired: 'ink',
  refunded: 'surface',
};

const STATUS_KEYS = {
  pending: 'statusPending',
  paid: 'statusPaid',
  failed: 'statusFailed',
  expired: 'statusExpired',
  refunded: 'statusRefunded',
} as const;

const TYPE_KEYS = {
  download: 'typeDownload',
  license: 'typeLicense',
  bundle: 'typeBundle',
  account_manual: 'typeAccount',
} as const;

export default async function CekPesananDetailPage({ params }: PageProps) {
  const { kodeOrder } = await params;
  const t = await getTranslations('checkOrder');
  const format = await getFormatter();

  let order;
  try {
    order = (await orderApi.showPublic(kodeOrder)).data;
  } catch (err) {
    if (err instanceof PublicFetchError && err.status === 404) notFound();
    throw err;
  }

  const statusVariant = STATUS_VARIANTS[order.status] ?? 'surface';
  const statusKey = STATUS_KEYS[order.status as keyof typeof STATUS_KEYS];

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 sm:py-12">
      <Link href="/cek-pesanan" className="inline-block mb-4 text-sm font-bold text-ink/60 hover:text-primary">
        {t('otherOrder')}
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-2">{t('detailTitle')}</h1>
      <p className="text-sm text-ink/60 mb-6">
        {t('orderCode', { code: order.kode_order })}
      </p>

      <StatusPoller kodeOrder={order.kode_order} initialStatus={order.status} />

      <Card variant={statusVariant} hoverable={false} className="p-4 mb-6">
        <p className="text-xs font-bold uppercase tracking-wider opacity-80">{t('status')}</p>
        <p className="text-2xl sm:text-3xl font-bold mt-1">
          {statusKey ? t(statusKey) : order.status}
        </p>
        {order.status === 'pending' && <p className="text-xs mt-2 opacity-80">{t('pendingHint')}</p>}
        {order.status === 'paid' && (
          <p className="text-xs mt-2 opacity-80">
            {t('paidHint', {
              date: order.paid_at
                ? format.dateTime(new Date(order.paid_at), { dateStyle: 'medium', timeStyle: 'short' })
                : '—',
            })}
          </p>
        )}
      </Card>

      <Card variant="surface" hoverable={false} className="p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            [t('name'), order.nama_pembeli],
            [t('email'), order.email_pembeli],
            [t('phone'), order.wa_pembeli],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs font-bold uppercase tracking-wider text-ink/60">{label}</p>
              <p className="text-sm font-bold text-ink mt-0.5">{value}</p>
            </div>
          ))}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink/60">{t('total')}</p>
            <p className="text-lg font-bold text-primary mt-0.5">{order.total_harga_formatted}</p>
          </div>
        </div>
      </Card>

      {order.items && order.items.length > 0 && (
        <Card variant="surface" hoverable={false} className="p-5 mb-6">
          <h2 className="text-lg font-bold text-ink mb-3">{t('products')}</h2>
          <ul className="space-y-3">
            {order.items.map((item) => {
              const delivery = item.delivery;
              const provisioning = item.account_provisioning;
              const hasDownload = Boolean(delivery?.download_url);
              const hasLicense = Boolean(delivery?.license_key);
              const expired = Boolean(delivery?.token_expired_at && new Date(delivery.token_expired_at) < new Date());
              const showDelivery = order.status === 'paid' && (hasDownload || hasLicense);
              const typeKey = TYPE_KEYS[item.tipe_produk as keyof typeof TYPE_KEYS];

              return (
                <li key={item.id} className="border-b-2 border-dashed border-ink/20 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-ink truncate">{item.nama_produk}</p>
                      <p className="text-xs text-ink/60">{typeKey ? t(typeKey) : item.tipe_produk}</p>
                    </div>
                    <p className="font-bold text-primary shrink-0">{item.harga_saat_beli_formatted}</p>
                  </div>

                  {showDelivery && hasDownload && !expired && (
                    <Button
                      variant="accent"
                      size="sm"
                      href={delivery!.download_url!}
                      external
                      download
                      className="mt-2"
                    >
                      ↓ {t('downloadFile')}
                    </Button>
                  )}
                  {showDelivery && hasDownload && expired && <p className="mt-2 text-xs text-ink/60">{t('expiredDownload')}</p>}
                  {showDelivery && hasLicense && (
                    <p className="mt-2 text-xs font-mono bg-ink text-surface px-2 py-1 inline-block break-words">{delivery!.license_key}</p>
                  )}
                  {provisioning && <AccountProvisioningBox provisioning={provisioning} />}
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {order.status === 'pending' && (
        <Button
          href={`/pembayaran/${order.kode_order}`}
          variant="primary"
          size="md"
          className="w-full"
        >
          {t('continuePayment')}
        </Button>
      )}
    </div>
  );
}
