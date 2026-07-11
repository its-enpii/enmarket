'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import type { OrderStatus, OrderStatusSummary } from '@/lib/types';

interface Props {
  kodeOrder: string;
  totalFormatted: string;
  initialStatus: OrderStatus;
  initialQrExpiredAt: string | null;
  qrUrl: string | null;
  qrString: string | null;
}

const POLL_INTERVAL_MS = 4000;

/**
 * Halaman pembayaran: render QR + countdown + polling status.
 * Auto-redirect ke /pesanan-sukses kalau status=paid.
 */
export function PaymentPoller({
  kodeOrder,
  totalFormatted,
  initialStatus,
  initialQrExpiredAt,
  qrUrl,
  qrString,
}: Props) {
  const router = useRouter();
  const t = useTranslations('payment');
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [now, setNow] = useState<number>(Date.now());
  const [copyOk, setCopyOk] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  const expiredAt = initialQrExpiredAt ? new Date(initialQrExpiredAt).getTime() : null;
  const remainingMs = expiredAt ? Math.max(0, expiredAt - now) : 0;
  const isExpired = status === 'expired' || (expiredAt !== null && remainingMs <= 0);

  // Countdown tick
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  // Polling
  useEffect(() => {
    if (status === 'paid' || isExpired) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    async function poll() {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiBase}/api/orders/${kodeOrder}/status`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const json = (await res.json()) as { data: OrderStatusSummary };
        const data = json.data;
        if (data.status !== status) {
          setStatus(data.status);
        }
        if (data.status === 'paid') {
          router.push(`/pesanan-sukses/${kodeOrder}`);
        } else if (data.status === 'expired' || data.status === 'failed') {
          setStatus(data.status);
        }
      } catch (err) {
        console.warn('Polling error:', err);
      }
    }

    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [kodeOrder, status, isExpired, router]);

  async function manualCheck() {
    if (isChecking) return;
    setIsChecking(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/orders/${kodeOrder}/status`, {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const json = (await res.json()) as { data: OrderStatusSummary };
      setStatus(json.data.status);
      if (json.data.status === 'paid') {
        router.push(`/pesanan-sukses/${kodeOrder}`);
      }
    } catch {
      // ignore
    } finally {
      setIsChecking(false);
    }
  }

  async function copyQrString() {
    if (!qrString) return;
    try {
      await navigator.clipboard.writeText(qrString);
      setCopyOk(true);
      setTimeout(() => setCopyOk(false), 2000);
    } catch {
      // fallback: do nothing
    }
  }

  // Format mm:ss untuk countdown
  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const countdownText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Banner status
  let banner: { color: string; text: string } | null = null;
  const rawStatus: OrderStatus = status;
  if (rawStatus === 'paid') {
    banner = { color: 'bg-primary text-surface', text: '✓ Pembayaran diterima — mengarahkan…' };
  } else if (rawStatus === 'failed') {
    banner = { color: 'bg-accent text-ink', text: 'Pembayaran gagal. Coba lagi.' };
  } else if (rawStatus === 'expired' || isExpired) {
    banner = { color: 'bg-ink text-surface', text: t('expiredTitle') + ' — buat pesanan baru.' };
  }

  return (
    <div className="space-y-6">
      {banner && (
        <div className={`${banner.color} border-2 border-ink p-4 shadow-[4px_4px_0_0_var(--color-ink)] font-bold text-center`}>
          {banner.text}
        </div>
      )}

      {/* Countdown */}
      {!isExpired && status === 'pending' && (
        <div className="bg-accent text-ink border-2 border-ink p-4 shadow-[4px_4px_0_0_var(--color-ink)] text-center">
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">
            {t('payWithin')}
          </p>
          <p className="text-4xl sm:text-5xl font-bold leading-none mt-1 font-mono">
            {countdownText}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR image */}
        <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)]">
          <p className="text-xs font-bold uppercase tracking-wider text-ink/60 mb-3 text-center">
            Scan QRIS
          </p>
          <div className="aspect-square bg-surface border-2 border-ink overflow-hidden">
            {qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrUrl}
                alt={`QRIS untuk order ${kodeOrder}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink/40 text-sm">
                QR tidak tersedia
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-ink/60 text-center">
            Buka app e-wallet / m-banking → Scan QR → Konfirmasi bayar.
          </p>
        </div>

        {/* Order info + manual check */}
        <div className="space-y-4">
          <div className="bg-surface border-2 border-ink p-5 shadow-[4px_4px_0_0_var(--color-ink)]">
            <p className="text-xs font-bold uppercase tracking-wider text-ink/60">
              Kode Order
            </p>
            <p className="text-xl font-bold text-ink mt-1 font-mono break-all">
              {kodeOrder}
            </p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-ink/60">
              Total
            </p>
            <p className="text-2xl font-bold text-primary">
              {totalFormatted}
            </p>
          </div>

          {qrString && (
            <div className="bg-surface border-2 border-ink p-5 shadow-[4px_4px_0_0_var(--color-ink)]">
              <p className="text-xs font-bold uppercase tracking-wider text-ink/60 mb-2">
                Atau pakai QR string
              </p>
              <p className="text-xs font-mono text-ink/80 break-all line-clamp-3">
                {qrString}
              </p>
              <button
                type="button"
                onClick={copyQrString}
                className="mt-2 inline-block bg-primary text-surface border-2 border-ink px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0_0_var(--color-ink)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0_0_var(--color-ink)] transition-all"
              >
                {copyOk ? '✓ Tersalin' : 'Copy'}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={manualCheck}
            disabled={isChecking || status === 'paid'}
            className="w-full bg-surface text-ink border-2 border-ink px-5 py-3 font-bold shadow-[3px_3px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[5px_5px_0_0_var(--color-ink)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? 'Mengecek…' : t('checkStatus')}
          </button>

          <a
            href={`/cek-pesanan?kode_order=${encodeURIComponent(kodeOrder)}`}
            className="block text-center text-sm text-ink/60 hover:text-primary font-bold underline decoration-2 underline-offset-4"
          >
            Lihat detail pesanan →
          </a>
        </div>
      </div>

      <p className="text-center text-xs text-ink/50">
        Status otomatis diperbarui setiap 4 detik.
      </p>
    </div>
  );
}