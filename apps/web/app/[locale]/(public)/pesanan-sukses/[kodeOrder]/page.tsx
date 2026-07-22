import { notFound } from 'next/navigation';
import { getFormatter, getTranslations } from 'next-intl/server';

import { AccountProvisioningBox } from '@/components/order/AccountProvisioningBox';
import { Button, Card } from '@/components/ui/neobrutal';
import { Link } from '@/i18n/navigation';
import { orderApi } from '@/lib/order-api';
import { PublicFetchError } from '@/lib/public-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ kodeOrder: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { kodeOrder, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'orderSuccess' });
  return {
    title: `${t('title')} — enpiistudio`,
    description: t('subtitle', { code: kodeOrder }),
    robots: { index: false },
  };
}

const TYPE_KEYS = {
  download: 'typeDownload',
  license: 'typeLicense',
  bundle: 'typeBundle',
  account_manual: 'typeAccount',
} as const;

export default async function PesananSuksesPage({ params }: PageProps) {
  const { kodeOrder } = await params;
  const t = await getTranslations('orderSuccess');
  const format = await getFormatter();

  let order;
  try {
    order = (await orderApi.showPublic(kodeOrder)).data;
  } catch (err) {
    if (err instanceof PublicFetchError && err.status === 404) notFound();
    throw err;
  }

  if (order.status === 'pending') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 text-center">
        <p className="font-label text-label-sm uppercase tracking-[0.2em] text-ink/60">{t('pendingLabel')}</p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-ink">{t('pendingTitle')}</h1>
        <p className="mt-4 text-base text-ink/70">{t('pendingBody')}</p>
        <Button href={`/pembayaran/${order.kode_order}`} variant="primary" size="lg" className="mt-8">
          {t('openPayment')}
        </Button>
      </div>
    );
  }

  if (order.status === 'expired' || order.status === 'failed') {
    const expired = order.status === 'expired';
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 text-center">
        <p className="font-label text-label-sm uppercase tracking-[0.2em] text-ink/60">{t(expired ? 'expiredLabel' : 'failedLabel')}</p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-ink">{t(expired ? 'expiredTitle' : 'failedTitle')}</h1>
        <p className="mt-4 text-base text-ink/70">{t(expired ? 'expiredBody' : 'failedBody')}</p>
        <Button href="/katalog" variant="primary" size="lg" className="mt-8">
          {t('shopAgain')}
        </Button>
      </div>
    );
  }

  // Pre-order branch: DP sudah diterima, menunggu admin release. Tampilkan
  // countdown ke release_date + placeholder delivery tiles.
  if (order.status === 'preorder_deposit_paid') {
    const releaseDate = order.preorder_release_date;
    return (
      <div className="mx-auto max-w-3xl px-6 py-8 sm:py-12">
        <Card variant="filled-accent" thick hoverable={false} className="p-8 text-center mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-ink/80">✓ {t('preorderDepositLabel')}</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold leading-tight text-ink">
            {t('preorderDepositTitle')}
          </h1>
          <p className="mt-3 text-base sm:text-lg text-ink/80">
            {t('preorderDepositBody', { date: releaseDate ?? '—' })}
          </p>
        </Card>

        <Card variant="surface" hoverable={false} className="p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Info label={t('orderCode')} value={order.kode_order} mono />
            <Info label={t('status')} value={t('preorderDepositLabel')} primary />
            <Info
              label={t('total')}
              value={order.preorder_deposit_amount
                ? `Rp ${Number(order.preorder_deposit_amount).toLocaleString('id-ID')}`
                : order.total_harga_formatted}
            />
            <Info label={t('paidAt')} value={order.paid_at ? format.dateTime(new Date(order.paid_at), { dateStyle: 'medium', timeStyle: 'short' }) : '—'} />
          </div>
        </Card>

        {order.items && order.items.length > 0 && (
          <Card variant="surface" hoverable={false} className="p-6 mb-6">
            <h2 className="text-lg font-bold text-ink mb-3">{t('products')}</h2>
            <ul className="space-y-3">
              {order.items.map((item) => (
                <li key={item.id} className="border-b-2 border-dashed border-ink/20 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-ink truncate">{item.nama_produk}</p>
                      <p className="text-xs text-ink/60">{t('preorderReadyNotice', { date: releaseDate ?? '—' })}</p>
                    </div>
                    <p className="font-bold text-primary shrink-0">{item.harga_saat_beli_formatted}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card variant="filled-primary" hoverable={false} className="p-5 mb-8">
          <p className="text-sm font-bold mb-2">📦 {t('preorderCountdownTitle')}</p>
          <p className="text-sm">
            {releaseDate
              ? t('preorderReleaseOn', { date: releaseDate })
              : t('preorderReleaseTba')}
          </p>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button href={`/cek-pesanan?kode_order=${encodeURIComponent(order.kode_order)}`} variant="primary" size="lg">
            {t('checkAgain')}
          </Button>
          <Button href="/katalog" variant="surface" size="lg">
            {t('shopAgain')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 sm:py-12">
      <Card variant="filled-primary" thick hoverable={false} className="p-8 text-center mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">
          ✓ {order.is_preorder && order.preorder_release_processed_at
            ? t('preorderReadyNow')
            : t('paymentReceived')}
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold leading-tight">{t('thankYou', { name: order.nama_pembeli })}</h1>
        <p className="mt-3 text-base sm:text-lg text-surface/90">{t('processing')}</p>
        {order.is_preorder && order.preorder_release_processed_at && (
          <p className="mt-2 text-xs text-surface/70 italic">
            {t('preorderReleasedNotice', { date: order.preorder_release_date ?? '—' })}
          </p>
        )}
      </Card>

      <Card variant="surface" hoverable={false} className="p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Info label={t('orderCode')} value={order.kode_order} mono />
          <Info label={t('status')} value={t('paid')} primary />
          <Info label={t('total')} value={order.total_harga_formatted} />
          <Info label={t('paidAt')} value={order.paid_at ? format.dateTime(new Date(order.paid_at), { dateStyle: 'medium', timeStyle: 'short' }) : '—'} />
        </div>
      </Card>

      {order.items && order.items.length > 0 && (
        <Card variant="surface" hoverable={false} className="p-6 mb-6">
          <h2 className="text-lg font-bold text-ink mb-3">{t('products')}</h2>
          <ul className="space-y-3">
            {order.items.map((item) => {
              const delivery = item.delivery;
              const provisioning = item.account_provisioning;
              const hasDownload = Boolean(delivery?.download_url);
              const hasLicense = Boolean(delivery?.license_key);
              const expired = Boolean(delivery?.token_expired_at && new Date(delivery.token_expired_at) < new Date());
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
                  {hasDownload && !expired && (
                    <Button href={delivery!.download_url!} variant="accent" size="sm" className="mt-2" external download>
                      ↓ {t('download')}
                    </Button>
                  )}
                  {hasDownload && expired && <p className="mt-2 text-xs text-ink/60">{t('expiredDownload')}</p>}
                  {hasLicense && (
                    <div className="mt-2 bg-ink text-surface border-2 border-ink p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{t('licenseKey')}</p>
                      <p className="font-mono font-bold text-sm break-words select-all">{delivery!.license_key}</p>
                    </div>
                  )}
                  {provisioning && <AccountProvisioningBox provisioning={provisioning} />}
                  {!hasDownload && !hasLicense && !provisioning && (
                    <p className="mt-2 text-xs text-ink/60 italic">{t('noDelivery')}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <Card variant="filled-accent" hoverable={false} className="p-5 mb-8">
        <p className="text-sm font-bold mb-2">📦 {t('nextTitle')}</p>
        <ul className="text-sm space-y-1 ml-4 list-disc">
          <li>{t('emailSent', { email: order.email_pembeli })}</li>
          <li>{t('whatsAppSent', { phone: order.wa_pembeli })}</li>
          <li>{t('saveCode')}</li>
        </ul>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button href={`/cek-pesanan?kode_order=${encodeURIComponent(order.kode_order)}`} variant="primary" size="lg">
          {t('checkAgain')}
        </Button>
        <Button href="/katalog" variant="surface" size="lg">
          {t('shopAgain')}
        </Button>
      </div>
    </div>
  );
}

function Info({ label, value, mono = false, primary = false }: { label: string; value: string; mono?: boolean; primary?: boolean }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-ink/60">{label}</p>
      <p className={`text-lg font-bold mt-1 break-words ${primary ? 'text-primary' : 'text-ink'} ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}