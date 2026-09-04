'use client';

import { useEffect, useImperativeHandle, useRef, useState, type FormEvent, type Ref } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

import { Button, Card } from '@/components/ui/neobrutal';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { FormError, FormHint } from '@/components/ui/FormMessage';
import { FormField } from '@/components/ui/FormField';
import { Icon } from '@/components/ui';
import { Image } from '@/components/ui/Image';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { formatRupiah } from '@/lib/format';
import {
  sponsorBidApi,
  type SponsorBidConfig,
  type SponsorBidPreview,
} from '@/lib/sponsor-api';

const FALLBACK_MIN_BID = 50_000;
const CHIP_MULTIPLIERS = [1, 2, 4, 10] as const;

export interface SponsorBidFormHandle {
  challenge: (amount: number) => void;
}

export function SponsorBidForm({ ref }: { ref?: Ref<SponsorBidFormHandle> }) {
  const t = useTranslations('sponsor');
  const router = useRouter();
  const amountInputRef = useRef<HTMLInputElement>(null);

  const [domain, setDomain] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [amount, setAmount] = useState('');
  const [config, setConfig] = useState<SponsorBidConfig | null>(null);
  const [preview, setPreview] = useState<SponsorBidPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [showDetailEditor, setShowDetailEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    sponsorBidApi
      .fetchConfig()
      .then((data) => {
        if (cancelled) return;
        setConfig(data);
        setAmount(String(data.min_bid));
      })
      .catch(() => {
        if (!cancelled) {
          const fallbackConfig = { min_bid: FALLBACK_MIN_BID, gateways: ['tripay'] };
          setConfig(fallbackConfig);
          setAmount(String(FALLBACK_MIN_BID));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function fetchPreview() {
    const cleanDomain = domain.trim();
    if (!cleanDomain) return;

    setPreviewLoading(true);
    setPreviewError('');
    try {
      const data = await sponsorBidApi.preview(cleanDomain);
      setPreview(data);
      setName('');
      setDescription('');
    } catch (err: unknown) {
      setPreview(null);
      setPreviewError(err instanceof Error ? err.message : t('previewFailed'));
    } finally {
      setPreviewLoading(false);
    }
  }

  function challenge(amountToBeat: number) {
    setAmount(String(amountToBeat + 10_000));
    window.requestAnimationFrame(() => amountInputRef.current?.focus());
  }

  useImperativeHandle(
    ref,
    () => ({ challenge }),
    [],
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    if (!domain.trim()) {
      setError(t('errors.domainRequired'));
      return;
    }

    const bidAmount = Number.parseInt(amount || '0', 10);
    if (!Number.isFinite(bidAmount) || bidAmount < (config?.min_bid ?? FALLBACK_MIN_BID)) {
      setError(t('errors.amountTooLow', { min: formatRupiah(config?.min_bid ?? FALLBACK_MIN_BID) }));
      return;
    }

    setLoading(true);
    try {
      const res = await sponsorBidApi.checkout({
        domain: domain.trim(),
        name: name.trim() || preview?.name || undefined,
        description: description.trim() || preview?.fetched_description || undefined,
        email: contact.includes('@') ? contact.trim() : undefined,
        wa: contact.includes('@') ? undefined : contact.trim() || undefined,
        amount: bidAmount,
        payment_gateway: config?.gateways[0] ?? 'tripay',
      });

      if (res.data.payment_url && res.data.gateway === 'duitku') {
        window.location.href = res.data.payment_url;
        return;
      }

      router.push(res.data.redirect_url);
    } catch (err: unknown) {
      const data = (err as { data?: { message?: string } }).data;
      setError(data?.message ?? (err instanceof Error ? err.message : t('errors.checkoutFailed')));
    } finally {
      setLoading(false);
    }
  }

  const minBid = config?.min_bid ?? FALLBACK_MIN_BID;
  const chipAmounts = CHIP_MULTIPLIERS.map((multiplier) => minBid * multiplier);

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <FormField label={t('form.domain')} htmlFor="sponsor-domain" required>
        <Input
          id="sponsor-domain"
          value={domain}
          onChange={(event) => setDomain(event.target.value)}
          onBlur={fetchPreview}
          placeholder="example.com"
          inputMode="url"
        />
        <FormError>{previewError}</FormError>
      </FormField>

      {(preview || previewLoading) && (
        <Card variant="surface" thick hoverable={false} className="flex items-center gap-4 p-4">
          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden border-2 border-ink bg-surface">
            {preview?.logo_url ? (
              <Image
                src={preview.logo_url}
                alt={preview.name}
                contain
                className="size-full p-1"
              />
            ) : (
              <span className="font-display text-xl font-black uppercase text-primary">
                {(preview?.name ?? '?').charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-black uppercase text-primary">
              {previewLoading ? t('preview.loading') : preview?.name}
            </p>
            {preview?.fetched_description && (
              <p className="line-clamp-2 font-body text-sm text-ink/80">
                {preview.fetched_description}
              </p>
            )}
          </div>
        </Card>
      )}

      <div>
        <button
          type="button"
          onClick={() => setShowDetailEditor((current) => !current)}
          className="font-label text-label-sm font-bold uppercase text-primary underline decoration-2 underline-offset-4"
        >
          {showDetailEditor ? t('form.hideDetailEditor') : t('form.editDetail')}
        </button>
        {showDetailEditor && (
          <div className="mt-3 grid gap-3">
            <FormField label={t('form.name')} htmlFor="sponsor-name">
              <Input
                id="sponsor-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={preview?.name ?? t('form.namePlaceholder')}
              />
            </FormField>
            <FormField label={t('form.description')} htmlFor="sponsor-description">
              <Textarea
                id="sponsor-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={preview?.fetched_description ?? t('form.descriptionPlaceholder')}
                rows={2}
              />
            </FormField>
          </div>
        )}
      </div>

      <FormField label={t('form.amount')} htmlFor="sponsor-amount" required>
        <div className="grid gap-2 sm:grid-cols-4">
          {chipAmounts.map((chipAmount, index) => (
            <Button
              key={chipAmount}
              type="button"
              variant={amount === String(chipAmount) ? 'primary' : 'surface'}
              onClick={() => setAmount(String(chipAmount))}
              className="font-mono"
            >
              {formatRupiah(chipAmount)}
            </Button>
          ))}
        </div>
        <div className="mt-2">
          <CurrencyInput
            id="sponsor-amount"
            ref={amountInputRef}
            value={amount}
            onChange={setAmount}
            placeholder={String(minBid)}
          />
        </div>
        <FormHint>{t('form.minBid', { min: formatRupiah(minBid) })}</FormHint>
      </FormField>

      <FormField label={t('form.contact')} htmlFor="sponsor-contact">
        <Input
          id="sponsor-contact"
          value={contact}
          onChange={(event) => setContact(event.target.value)}
          placeholder="08123456789"
        />
        <FormHint>{t('form.contactHint')}</FormHint>
      </FormField>

      <FormError variant="box">{error}</FormError>

      <Button type="submit" size="lg" disabled={loading} className="flex w-full justify-center">
        {loading ? (
          t('form.processing')
        ) : (
          <>
            <span>{t('form.cta')}</span>
            <span className="font-mono">{formatRupiah(Number.parseInt(amount || '0', 10) || 0)}</span>
            <Icon name="arrow-right" size={18} />
          </>
        )}
      </Button>
    </form>
  );
}
