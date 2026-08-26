'use client';

import { useActionState, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { Button, Card } from '@/components/ui/neobrutal';
import { FormError, FormHint } from '@/components/ui/FormMessage';
import { Input } from '@/components/ui/Input';
import { formatRupiah } from '@/lib/format';

import { applyCouponAction, checkoutAction } from './actions';

interface State {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

interface Props {
  defaultEmail?: string;
  cartTotal?: number;
}

export function CheckoutForm({ defaultEmail, cartTotal = 0 }: Props) {
  const t = useTranslations('checkout');
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
        <p className="font-label text-label-sm uppercase tracking-[0.2em] text-ink/70">
          ✎ {t('buyerInfo')}
        </p>
        <span className="font-label text-[10px] uppercase tracking-wider text-ink/50">
          {t('required')}
        </span>
      </div>

      <div>
        <label htmlFor="nama" className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5">
          {t('name')}
        </label>
        <Input
          id="nama"
          name="nama"
          type="text"
          required
          autoComplete="name"
          placeholder={t('namePlaceholder')}
        />
        <FormError>{state?.fieldErrors?.nama?.[0]}</FormError>
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5">
          {t('email')}
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={defaultEmail}
          placeholder={t('emailPlaceholder')}
        />
        <FormHint>{t('emailHint')}</FormHint>
        <FormError>{state?.fieldErrors?.email?.[0]}</FormError>
      </div>

      <div>
        <label htmlFor="wa" className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5">
          {t('phone')}
        </label>
        <Input
          id="wa"
          name="wa"
          type="tel"
          required
          autoComplete="tel"
          placeholder="08123456789"
        />
        <FormHint>{t('phoneHint')}</FormHint>
        <FormError>{state?.fieldErrors?.wa?.[0]}</FormError>
      </div>

      {/* Coupon section */}
      <div className="border-t-2 border-ink/10 pt-4">
        <label htmlFor="coupon_code" className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5">
          {t('couponLabel')}
        </label>
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
          <p className="mt-2 text-xs font-bold text-green-600 dark:text-green-400">
            ✓ {couponSuccess}
          </p>
        )}
        {couponError && (
          <p className="mt-2 text-xs font-bold text-red-600">
            ✕ {couponError}
          </p>
        )}
        {appliedCoupon && (
          <Card variant="filled-accent" hoverable={false} className="mt-3 p-3 text-xs font-bold flex justify-between items-center">
            <span>{t('discount')}: {appliedCoupon.code}</span>
            <span>− {formatRupiah(appliedCoupon.discount_amount)}</span>
          </Card>
        )}
      </div>

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
