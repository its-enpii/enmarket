'use client';

import { useActionState, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { Button, Card } from '@/components/ui/neobrutal';
import { FormError, FormHint } from '@/components/ui/FormMessage';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { formatRupiah } from '@/lib/format';
import type { PaymentGateway } from '@/lib/types';

import { applyCouponAction, checkoutAction } from './actions';

interface State {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

interface Props {
  defaultEmail?: string;
  cartTotal?: number;
  enabledGateways?: Array<{ key: PaymentGateway }>;
}

export function CheckoutForm({
  defaultEmail,
  cartTotal = 0,
  enabledGateways = [{ key: 'tripay' }, { key: 'duitku' }],
}: Props) {
  const t = useTranslations('checkout');
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>(
    enabledGateways[0]?.key ?? 'tripay',
  );
  const [paymentMethod, setPaymentMethod] = useState('VC');
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_amount: number;
    final_total: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isApplyingCoupon, startCouponTransition] = useTransition();

  const handleApplyCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setCouponError(null);
    setCouponSuccess(null);

    startCouponTransition(async () => {
      const res = await applyCouponAction(couponCodeInput.trim(), cartTotal);
      if (res.valid) {
        setAppliedCoupon({
          code: couponCodeInput.trim().toUpperCase(),
          discount_amount: res.discount_amount,
          final_total: res.final_total,
        });
        setCouponSuccess(res.message || t('couponApplied'));
      } else {
        setCouponError(res.message || t('couponInvalid'));
      }
    });
  };

  const handleRemoveCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponError(null);
    setCouponSuccess(null);
  };

  const [state, formAction, pending] = useActionState<State | undefined, FormData>(
    async (_prev, formData) =>
      checkoutAction({
        nama: (formData.get('nama') as string) ?? '',
        email: (formData.get('email') as string) ?? '',
        wa: (formData.get('wa') as string) ?? '',
        coupon_code: appliedCoupon?.code || (formData.get('coupon_code') as string) || undefined,
        payment_gateway: (formData.get('payment_gateway') as PaymentGateway) || selectedGateway,
        payment_method: (formData.get('payment_method') as string) || (selectedGateway === 'duitku' ? paymentMethod : undefined),
      }).catch((err) => {
        if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err;
        return { error: t('errorGeneric') };
      }),
    {} as State,
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* Header strip — matches theme eyebrow */}
      <div className="border-b-2 border-ink/20 pb-3 flex items-baseline justify-between">
        <p className="font-label text-label-sm uppercase tracking-label text-ink/70">
          ✎ {t('buyerInfo')}
        </p>
        <span className="font-label text-micro uppercase tracking-wider text-ink/50">
          {t('required')}
        </span>
      </div>

      <FormField label={t('name')} htmlFor="nama" error={state?.fieldErrors?.nama?.[0]}>
        <Input
          id="nama"
          name="nama"
          type="text"
          required
          autoComplete="name"
          placeholder={t('namePlaceholder')}
        />
      </FormField>

      <FormField label={t('email')} htmlFor="email" required hint={t('emailHint')} error={state?.fieldErrors?.email?.[0]}>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={defaultEmail}
          placeholder={t('emailPlaceholder')}
        />
      </FormField>

      <FormField label={t('phone')} htmlFor="wa" required hint={t('phoneHint')} error={state?.fieldErrors?.wa?.[0]}>
        <Input
          id="wa"
          name="wa"
          type="tel"
          required
          autoComplete="tel"
          placeholder="08123456789"
        />
      </FormField>

      {/* Coupon section */}
      <FormField label={t('couponLabel')} htmlFor="coupon_code">
        <div className="flex gap-2">
          <Input
            id="coupon_code"
            name="coupon_code"
            type="text"
            value={couponCodeInput}
            onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
            disabled={!!appliedCoupon || isApplyingCoupon}
            placeholder="DISKON10"
            className="uppercase font-mono font-bold"
          />
          {appliedCoupon ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleRemoveCoupon}
            >
              ✕
            </Button>
          ) : (
            <Button
              type="button"
              variant="surface"
              size="md"
              disabled={isApplyingCoupon || !couponCodeInput.trim()}
              onClick={handleApplyCoupon}
            >
              {isApplyingCoupon ? '…' : t('couponApply')}
            </Button>
          )}
        </div>

        {couponSuccess && (
          <span className="mt-2 block text-xs font-bold text-[var(--color-success)]">
            ✓ {couponSuccess}
          </span>
        )}
        {couponError && (
          <FormError>{couponError}</FormError>
        )}
        {appliedCoupon && (
          <Card variant="filled-accent" hoverable={false} className="mt-3 p-3 text-xs font-bold flex justify-between items-center">
            <span>{t('discount')}: {appliedCoupon.code}</span>
            <span>− {formatRupiah(appliedCoupon.discount_amount)}</span>
          </Card>
        )}
      </FormField>

      <PaymentMethodSelector
        enabledGateways={enabledGateways}
        selectedGateway={selectedGateway}
        onSelectGateway={setSelectedGateway}
        paymentMethod={paymentMethod}
        onChangePaymentMethod={setPaymentMethod}
      />

      {state?.error && !state.fieldErrors && (
        <FormError variant="box">{state.error}</FormError>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        shadowColor="accent"
        disabled={pending}
        className="w-full"
      >
        {pending ? `${t('placeOrder')}…` : `${t('placeOrder')} →`}
      </Button>

      <p className="text-xs text-ink/50 text-center border-t-2 border-ink/10 pt-3">
        {t('submitHint')}
      </p>
    </form>
  );
}
