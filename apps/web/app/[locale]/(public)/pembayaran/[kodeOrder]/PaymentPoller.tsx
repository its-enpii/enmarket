'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button, Card } from '@/components/ui/neobrutal';
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
  // `now` null saat SSR + initial client mount — countdown tidak dirender
  // sampai useEffect set Date.now() pertama kali (mencegah hydration
  // mismatch karena server-rendered ms akan beda dengan client time).
  const [now, setNow] = useState<number | null>(null);
  const [copyOk, setCopyOk] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  const expiredAt = initialQrExpiredAt ? new Date(initialQrExpiredAt).getTime() : null;
  const remainingMs = expiredAt && now !== null ? Math.max(0, expiredAt - now) : null;
  const isExpired =
    status === 'expired' || (expiredAt !== null && remainingMs !== null && remainingMs <= 0);

  // Countdown tick — pause saat tab hidden (hemat baterai + bandwidth mobile).
  // `now` null saat SSR + initial client mount (hydration-safe). useEffect set
  // Date.now() segera setelah mount, lalu interval 1s tick. Pause saat tab hidden.
  useEffect(() => {
    setNow(Date.now());
    function start() {
      if (tickRef.current) return;
      tickRef.current = setInterval(() => {
        setNow(Date.now());
      }, 1000);
    }
    function stop() {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    }
    function onVisibility() {
      if (document.visibilityState === 'visible') start();
      else stop();
    }
    if (document.visibilityState === 'visible') start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Polling — pause saat tab hidden (hemat baterai + bandwidth mobile).
  useEffect(() => {
    if (status === 'paid') {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      // Auto-redirect ke halaman sukses. Kasih jeda 1.2s biar banner
      // "Payment received—redirecting…" terbaca dulu sebelum navigasi.
      const t = setTimeout(() => router.push(`/pesanan-sukses/${kodeOrder}`), 1200);
      return () => clearTimeout(t);
    }
    if (isExpired) {
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

    function start() {
      if (pollRef.current) return;
      pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
    }
    function stop() {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
    function onVisibility() {
      if (document.visibilityState === 'visible') start();
      else stop();
    }
    if (document.visibilityState === 'visible') start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
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

  // Format mm:ss untuk countdown. Placeholder saat SSR/initial mount supaya
  // tidak hydration-mismatch — `now` baru tersedia setelah useEffect.
  const minutes = remainingMs !== null ? Math.floor(remainingMs / 60000) : 0;
  const seconds = remainingMs !== null ? Math.floor((remainingMs % 60000) / 1000) : 0;
  const countdownText =
    remainingMs !== null
      ? `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : '--:--';

  // Banner status
  let banner: { variant: 'filled-primary' | 'filled-accent' | 'ink'; text: string } | null = null;
  const rawStatus: OrderStatus = status;
  if (rawStatus === 'paid') {
    banner = { variant: 'filled-primary', text: t('paidRedirect') };
  } else if (rawStatus === 'failed') {
    banner = { variant: 'filled-accent', text: t('failed') };
  } else if (rawStatus === 'expired' || isExpired) {
    banner = { variant: 'ink', text: t('expiredBanner') };
  }

  return (
    <div className="space-y-6">
      {banner && (
        <Card variant={banner.variant} hoverable={false} className="p-4 font-bold text-center">
          {banner.text}
        </Card>
      )}

      {/* Countdown */}
      {!isExpired && status === 'pending' && (
        <Card variant="filled-accent" hoverable={false} className="p-4 text-center">
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">
            {t('payWithin')}
          </p>
          <p className="text-4xl sm:text-5xl font-bold leading-none mt-1 font-mono">
            {countdownText}
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR image */}
        <Card variant="surface" hoverable={false} className="p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-ink/60 mb-3 text-center">
            {t('scanTitle')}
          </p>
          <div className="aspect-square bg-surface border-2 border-ink overflow-hidden">
            {qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrUrl}
                alt={t('qrAlt', { code: kodeOrder })}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink/40 text-sm">
                {t('qrUnavailable')}
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-ink/60 text-center">
            {t('scanHint')}
          </p>
        </Card>

        {/* Order info + manual check */}
        <div className="space-y-4">
          <Card variant="surface" hoverable={false} className="p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-ink/60">
              {t('orderCode')}
            </p>
            <p className="text-xl font-bold text-ink mt-1 font-mono break-words">
              {kodeOrder}
            </p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-ink/60">
              {t('total')}
            </p>
            <p className="text-2xl font-bold text-primary">
              {totalFormatted}
            </p>
          </Card>

          {qrString && (
            <Card variant="surface" hoverable={false} className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-ink/60 mb-2">
                {t('qrData')}
              </p>
              <p className="text-xs font-mono text-ink/80 break-all line-clamp-3">
                {qrString}
              </p>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={copyQrString}
                className="mt-2"
              >
                {copyOk ? t('copied') : t('copy')}
              </Button>
            </Card>
          )}

          <Button
            type="button"
            variant="surface"
            size="md"
            onClick={manualCheck}
            disabled={isChecking || status === 'paid'}
            className="w-full"
          >
            {isChecking ? t('checking') : t('checkStatus')}
          </Button>

          <a
            href={`/cek-pesanan?kode_order=${encodeURIComponent(kodeOrder)}`}
            className="block text-center text-sm text-ink/60 hover:text-primary font-bold underline decoration-2 underline-offset-4"
          >
            {t('viewOrder')}
          </a>
        </div>
      </div>

      <p className="text-center text-xs text-ink/50">
        {t('autoRefresh')}
      </p>
    </div>
  );
}