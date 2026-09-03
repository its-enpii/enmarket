'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

import { Button, Card } from '@/components/ui/neobrutal';
import { FormError } from '@/components/ui/FormMessage';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Image } from '@/components/ui/Image';
import { sponsorBidApi, type SponsorBidConfig, type SponsorBidPreview } from '@/lib/sponsor-api';
import { formatRupiah } from '@/lib/format';

export function SponsorBidForm() {
  const t = useTranslations('sponsor');
  const router = useRouter();

  const [domain, setDomain] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [wa, setWa] = useState('');
  const [amount, setAmount] = useState('');
  const [config, setConfig] = useState<SponsorBidConfig | null>(null);
  const [paymentGateway, setPaymentGateway] = useState('');
  const [preview, setPreview] = useState<SponsorBidPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    sponsorBidApi
      .fetchConfig()
      .then((data) => {
        if (cancelled) return;
        setConfig(data);
        if (data.gateways.length === 1) {
          setPaymentGateway(data.gateways[0]);
        }
      })
      .catch(() => {
        if (!cancelled) setConfig({ min_bid: 50000, gateways: ['tripay'] });
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
    } catch (err: unknown) {
      setPreview(null);
      const message = err instanceof Error ? err.message : t('previewFailed');
      setPreviewError(message);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    if (!domain.trim() || !contactName.trim() || (!email.trim() && !wa.trim())) {
      setError(t('errors.requiredFields'));
      return;
    }

    const bidAmount = Number.parseInt(amount || '0', 10);
    if (!Number.isFinite(bidAmount) || bidAmount < (config?.min_bid ?? 50000)) {
      setError(t('errors.amountTooLow', { min: formatRupiah(config?.min_bid ?? 50000) }));
      return;
    }

    if (!paymentGateway) {
      setError(t('errors.paymentGatewayRequired'));
      return;
    }

    setLoading(true);
    try {
      const res = await sponsorBidApi.checkout({
        domain: domain.trim(),
        name: name.trim() || undefined,
        description: description.trim() || undefined,
        contact_name: contactName.trim(),
        email: email.trim() || undefined,
        wa: wa.trim() || undefined,
        amount: bidAmount,
        payment_gateway: paymentGateway,
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

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2">
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

        <FormField label={t('form.name')} htmlFor="sponsor-name">
          <Input
            id="sponsor-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('form.namePlaceholder')}
          />
        </FormField>
      </div>

      <FormField label={t('form.description')} htmlFor="sponsor-description">
        <Textarea
          id="sponsor-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={t('form.descriptionPlaceholder')}
          rows={4}
        />
      </FormField>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField label={t('form.contactName')} htmlFor="sponsor-contact-name" required>
          <Input
            id="sponsor-contact-name"
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
            placeholder="Jane Doe"
          />
        </FormField>

        <FormField label={t('form.amount')} htmlFor="sponsor-amount" required>
          <CurrencyInput
            id="sponsor-amount"
            value={amount}
            onChange={setAmount}
            placeholder={(config?.min_bid ?? 50000).toString()}
          />
        </FormField>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField label={t('form.email')} htmlFor="sponsor-email">
          <Input
            id="sponsor-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="email@example.com"
          />
        </FormField>

        <FormField label={t('form.whatsapp')} htmlFor="sponsor-whatsapp">
          <Input
            id="sponsor-whatsapp"
            type="tel"
            value={wa}
            onChange={(event) => setWa(event.target.value)}
            placeholder="08xxxxxxxxxx"
          />
        </FormField>
      </div>

      <FormField label={t('form.paymentGateway')} htmlFor="sponsor-payment-gateway" required>
        <div className="flex flex-wrap gap-3">
          {(config?.gateways ?? []).map((gateway) => (
            <Button
              key={gateway}
              type="button"
              size="sm"
              variant={paymentGateway === gateway ? 'primary' : 'surface'}
              onClick={() => setPaymentGateway(gateway)}
            >
              {t(`gateways.${gateway}` as 'gateways.tripay' | 'gateways.duitku')}
            </Button>
          ))}
        </div>
      </FormField>

      {(preview || previewLoading) && (
        <Card variant="surface" className="p-6">
          <h3 className="font-label text-label-sm uppercase mb-4">{t('preview.title')}</h3>
          {previewLoading ? (
            <p className="font-body text-body-md text-ink/60">{t('preview.loading')}</p>
          ) : (
            preview && (
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 border-2 border-ink bg-surface overflow-hidden flex items-center justify-center">
                  {preview.logo_url ? (
                    <Image
                      src={preview.logo_url}
                      alt={preview.name}
                      contain
                      className="w-full h-full p-1"
                    />
                  ) : (
                    <span className="font-display font-black text-primary text-xl uppercase">
                      {preview.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-display text-lg font-black uppercase text-primary truncate">{preview.name}</p>
                  {preview.fetched_description && (
                    <p className="font-body text-body-md text-ink/80 line-clamp-3">{preview.fetched_description}</p>
                  )}
                </div>
              </div>
            )
          )}
        </Card>
      )}

      <Card variant="filled-accent" className="p-4">
        <div className="flex items-center justify-between font-bold">
          <span>{t('form.total')}</span>
          <span className="font-mono">{formatRupiah(Number.parseInt(amount || '0', 10) || 0)}</span>
        </div>
      </Card>

      <FormError variant="box">{error}</FormError>

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? t('form.processing') : t('form.submit')}
      </Button>
    </form>
  );
}
