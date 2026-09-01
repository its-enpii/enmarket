'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { FormError } from '@/components/ui/FormMessage';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from '@/components/ui/toast-store';

interface Props {
  kodeOrder: string;
  productId: number;
  productName: string;
  defaultEmailOrPhone?: string;
  defaultBuyerName?: string;
  onSuccess?: () => void;
  triggerLabel?: string;
}

export function ReviewFormModal({
  kodeOrder,
  productId,
  productName,
  defaultEmailOrPhone,
  defaultBuyerName,
  onSuccess,
  triggerLabel,
}: Props) {
  const t = useTranslations('reviews');
  const tCommon = useTranslations('common.ui');
  const tBtn = useTranslations('common.buttons');

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [buyerName, setBuyerName] = useState(defaultBuyerName || '');
  const [emailOrPhone, setEmailOrPhone] = useState(defaultEmailOrPhone || '');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        // Submit via fetch relatif (rewrite /api/* di next.config) — komponen
        // client tidak boleh mengimpor lib/review-api karena menarik lib/api
        // (next/headers, server-only) ke bundle browser.
        const res = await fetch(`${getClientApiBase()}/api/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            kode_order: kodeOrder,
            product_id: productId,
            rating,
            comment: comment.trim() || undefined,
            buyer_name: buyerName.trim() || undefined,
            email_or_phone: emailOrPhone.trim() || undefined,
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.message || t('submitError'));
        }

        setSubmitted(true);
        toast.success(t('submitSuccess'));
        onSuccess?.();
        setTimeout(() => {
          setOpen(false);
          setSubmitted(false);
        }, 1500);
      } catch (err: any) {
        setError(err?.message || t('submitError'));
      }
    });
  };

  const modal = open ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
    >
      <Button
        type="button"
        variant="surface"
        size="sm"
        tabIndex={-1}
        aria-label={tCommon('closeDialog')}
        onClick={() => setOpen(false)}
        className="absolute inset-0 px-0 py-0 bg-ink/70 cursor-default animate-fade-in"
      />

      <Card variant="surface" thick elevation={8} className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto z-10 animate-scale-in p-6">
        <div className="flex items-center justify-between border-b-2 border-ink pb-4 mb-5">
          <div>
            <h2 id="review-modal-title" className="text-xl font-black uppercase text-ink">
              {t('modalTitle')}
            </h2>
            <p className="text-xs text-ink/70 mt-0.5 truncate max-w-xs sm:max-w-sm">
              {productName}
            </p>
          </div>
          <Button
            type="button"
            variant="surface"
            size="sm"
            onClick={() => setOpen(false)}
            aria-label={tCommon('dismiss')}
            className="w-8 h-8 px-0 py-0"
          >
            ✕
          </Button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <span className="text-5xl select-none" role="img" aria-label="success">🌟</span>
            <h3 className="text-2xl font-black text-ink">{t('thankYou')}</h3>
            <p className="text-sm text-ink/70">{t('submitSuccess')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Interactive 5 Star Selector */}
            <FormField label={`${t('ratingLabel')} *`}>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <Button
                      key={star}
                      type="button"
                      variant="surface"
                      size="sm"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-3xl hover:scale-125 focus:outline-none"
                      aria-label={`${star} ${t('stars')}`}
                    >
                      <span className={active ? 'text-accent drop-shadow-[2px_2px_0_var(--color-ink)]' : 'text-ink/20'}>
                        ★
                      </span>
                    </Button>
                  );
                })}
                <span className="font-mono font-bold text-sm text-ink ml-2">
                  {rating} / 5
                </span>
              </div>
            </FormField>

            {/* Comment Textarea */}
            <FormField label={t('commentLabel')} htmlFor="comment">
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder={t('commentPlaceholder')}
                className="text-sm"
              />
            </FormField>

            {/* Buyer Name */}
            <FormField label={t('buyerNameLabel')} htmlFor="buyerName">
              <Input
                id="buyerName"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder={t('buyerNamePlaceholder')}
              />
            </FormField>

            {/* Verification hint if no email / phone default */}
            {!defaultEmailOrPhone && (
              <FormField label={`${t('verificationLabel')} *`} htmlFor="emailOrPhone" hint={t('verificationHint')}>
                <Input
                  id="emailOrPhone"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="Email atau No. WhatsApp saat checkout"
                  required
                />
              </FormField>
            )}

            {error && <FormError variant="box">{error}</FormError>}

            <div className="flex justify-end gap-3 pt-3 border-t-2 border-ink">
              <Button
                type="button"
                variant="surface"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                {tBtn('cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={pending}
              >
                {pending ? t('submitting') : t('submitCta')}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  ) : null;

  return (
    <>
      <Button
        type="button"
        variant="accent"
        size="sm"
        onClick={() => setOpen(true)}
      >
        ★ {triggerLabel ?? t('writeReview')}
      </Button>
      {mounted && typeof document !== 'undefined'
        ? createPortal(modal, document.body)
        : null}
    </>
  );
}
import { getClientApiBase } from '@/lib/api-base';
import { Card } from '@/components/ui/neobrutal';
