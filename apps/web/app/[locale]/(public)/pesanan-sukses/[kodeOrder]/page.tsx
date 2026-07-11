import Link from 'next/link';
import { notFound } from 'next/navigation';

import { orderApi } from '@/lib/order-api';
import { formatDateTime } from '@/lib/format';
import { PublicFetchError } from '@/lib/public-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ kodeOrder: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { kodeOrder, locale } = await params;
  const titles: Record<string, string> = {
    id: `Pesanan ${kodeOrder} — Sukses`,
    en: `Order ${kodeOrder} — Success`,
  };
  return {
    title: titles[locale] ?? titles.id,
    description: '',
    robots: { index: false },
  };
}

export default async function PesananSuksesPage({ params }: PageProps) {
  const { kodeOrder, locale } = await params;
  const isEn = locale === 'en';

  let order;
  try {
    const res = await orderApi.showPublic(kodeOrder);
    order = res.data;
  } catch (err) {
    if (err instanceof PublicFetchError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  // Locale-aware label helper
  const L = (id: string, en: string) => (isEn ? en : id);

  if (order.status === 'pending') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/60">
          {L('Menunggu Pembayaran', 'Awaiting Payment')}
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-ink">
          {L('Pesanan belum dibayar.', 'Order not paid yet.')}
        </h1>
        <p className="mt-4 text-base text-ink/70">
          {L('Selesaikan pembayaran dulu di halaman QRIS.', 'Complete payment on the QRIS page first.')}
        </p>
        <Link
          href={`/pembayaran/${order.kode_order}`}
          className="mt-8 inline-block bg-primary text-surface border-2 border-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] transition-all"
        >
          {L('Buka Halaman Pembayaran →', 'Open Payment Page →')}
        </Link>
      </div>
    );
  }

  if (order.status === 'expired' || order.status === 'failed') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/60">
          {order.status === 'expired' ? L('Kadaluarsa', 'Expired') : L('Gagal', 'Failed')}
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-ink">
          {L('Pesanan tidak berhasil diproses.', 'Order could not be processed.')}
        </h1>
        <p className="mt-4 text-base text-ink/70">
          {order.status === 'expired'
            ? L('QR sudah kadaluarsa. Buat pesanan baru untuk melanjutkan.', 'QR has expired. Create a new order to continue.')
            : L('Pembayaran tidak berhasil. Coba lagi atau hubungi kami.', 'Payment was unsuccessful. Try again or contact us.')}
        </p>
        <Link
          href="/katalog"
          className="mt-8 inline-block bg-primary text-surface border-2 border-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] transition-all"
        >
          {L('Belanja Lagi →', 'Shop Again →')}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 sm:py-12">
      <div className="bg-primary text-surface border-4 border-ink p-8 shadow-[8px_8px_0_0_var(--color-ink)] text-center mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">
          ✓ {L('Pembayaran Diterima', 'Payment Received')}
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold leading-tight">
          {L(`Terima kasih, ${order.nama_pembeli}!`, `Thank you, ${order.nama_pembeli}!`)}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-surface/90">
          {L(
            'Pesanan kamu sedang diproses. Produk akan dikirim via email & WhatsApp setelah diproses oleh sistem.',
            'Your order is being processed. Products will be sent via email & WhatsApp once the system processes them.'
          )}
        </p>
      </div>

      <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)] mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink/60">
              {L('Kode Order', 'Order Code')}
            </p>
            <p className="text-lg font-bold text-ink mt-1 font-mono break-all">
              {order.kode_order}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink/60">
              {L('Status', 'Status')}
            </p>
            <p className="text-lg font-bold text-primary mt-1">{L('Lunas', 'Paid')}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink/60">
              {L('Total', 'Total')}
            </p>
            <p className="text-lg font-bold text-ink mt-1">{order.total_harga_formatted}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink/60">
              {L('Dibayar pada', 'Paid at')}
            </p>
            <p className="text-sm font-bold text-ink mt-1">
              {order.paid_at ? formatDateTime(order.paid_at) : '—'}
            </p>
          </div>
        </div>
      </div>

      {order.items && order.items.length > 0 && (
        <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)] mb-6">
          <h2 className="text-lg font-bold text-ink mb-3">
            {L('Produk & Link Download', 'Products & Download Links')}
          </h2>
          <ul className="space-y-3">
            {order.items.map((item) => {
              const delivery = item.delivery;
              const hasDownload = delivery?.download_url && delivery.download_url.length > 0;
              const hasLicense = delivery?.license_key && delivery.license_key.length > 0;
              const expired = delivery?.token_expired_at && new Date(delivery.token_expired_at) < new Date();

              return (
                <li
                  key={item.id}
                  className="border-b-2 border-dashed border-ink/20 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-ink truncate">{item.nama_produk}</p>
                      <p className="text-xs text-ink/60">{item.tipe_produk}</p>
                    </div>
                    <p className="font-bold text-primary shrink-0">
                      {item.harga_saat_beli_formatted}
                    </p>
                  </div>

                  {hasDownload && !expired && (
                    <a
                      href={delivery!.download_url!}
                      className="mt-2 inline-flex items-center gap-2 bg-accent text-ink border-2 border-ink px-3 py-2 text-sm font-bold shadow-[3px_3px_0_0_var(--color-ink)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--color-ink)] transition-all"
                    >
                      ↓ {L('Download File', 'Download File')}
                    </a>
                  )}
                  {hasDownload && expired && (
                    <p className="mt-2 text-xs text-ink/60">
                      {L('⏰ Link download kadaluarsa. Hubungi admin untuk regenerate.', '⏰ Download link expired. Contact admin to regenerate.')}
                    </p>
                  )}

                  {hasLicense && (
                    <div className="mt-2 bg-ink text-surface border-2 border-ink p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                        License Key
                      </p>
                      <p className="font-mono font-bold text-sm break-all select-all">
                        {delivery!.license_key}
                      </p>
                    </div>
                  )}

                  {!hasDownload && !hasLicense && (
                    <p className="mt-2 text-xs text-ink/60 italic">
                      {L('Item tanpa file download / license key (bundle opsional).', 'Item without download file / license key.')}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="bg-accent text-ink border-2 border-ink p-5 shadow-[4px_4px_0_0_var(--color-ink)] mb-8">
        <p className="text-sm font-bold mb-2">📦 {L('Apa selanjutnya?', 'What\'s next?')}</p>
        <ul className="text-sm space-y-1 ml-4 list-disc">
          <li dangerouslySetInnerHTML={{
            __html: L(
              `Link download & license key sudah tersedia di atas dan juga sudah dikirim ke <strong>${order.email_pembeli}</strong>.`,
              `Download link & license key are available above and have also been sent to <strong>${order.email_pembeli}</strong>.`
            )
          }} />
          <li dangerouslySetInnerHTML={{
            __html: L(
              `Notifikasi juga sudah dikirim via WhatsApp ke <strong>${order.wa_pembeli}</strong>.`,
              `A notification has also been sent via WhatsApp to <strong>${order.wa_pembeli}</strong>.`
            )
          }} />
          <li>
            {L('Simpan kode order kamu untuk cek status kapan saja.', 'Save your order code to check status anytime.')}
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`/cek-pesanan?kode_order=${encodeURIComponent(order.kode_order)}`}
          className="inline-block bg-primary text-surface border-2 border-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] transition-all text-center"
        >
          {L('Cek Pesanan Lagi', 'Check Order Again')}
        </Link>
        <Link
          href="/katalog"
          className="inline-block bg-surface text-ink border-2 border-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] transition-all text-center"
        >
          {L('Belanja Lagi →', 'Shop Again →')}
        </Link>
      </div>
    </div>
  );
}