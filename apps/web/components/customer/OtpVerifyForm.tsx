'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/neobrutal';
import { FormError, FormHint } from '@/components/ui/FormMessage';
import { Input } from '@/components/ui/Input';
import { useAuth } from './AuthProvider';
import { authApi } from '@/lib/auth-api';

interface Props {
  phone: string;
  initialCooldown?: number;
  onSuccess: () => void;
  onChangePhone: () => void;
  locale?: string;
}

export function OtpVerifyForm({
  phone,
  initialCooldown = 60,
  onSuccess,
  onChangePhone,
  locale,
}: Props) {
  const t = useTranslations('customer.login');
  const { login } = useAuth();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(initialCooldown);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (codeToVerify: string) => {
    if (codeToVerify.length !== 6 || loading) return;
    setLoading(true);
    setError(null);

    try {
      // Baca cookie sesi guest jika ada
      let cartSession: string | undefined;
      let wishlistSession: string | undefined;

      if (typeof document !== 'undefined') {
        const cartMatch = document.cookie.match(/(^| )cart_session=([^;]+)/);
        if (cartMatch) cartSession = decodeURIComponent(cartMatch[2]);

        const wishlistMatch = document.cookie.match(/(^| )wishlist_session=([^;]+)/);
        if (wishlistMatch) wishlistSession = decodeURIComponent(wishlistMatch[2]);
      }

      await login(phone, codeToVerify, cartSession, wishlistSession);
      onSuccess();
    } catch (err: any) {
      setError(err.message || t('errors.invalidOtp'));
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setCode(val);
    if (val.length === 6) {
      handleVerify(val);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      const res = await authApi.requestOtp(phone, locale);
      setCooldown(res.cooldown_seconds || 60);
    } catch (err: any) {
      setError(err.message || t('errors.rateLimited'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <FormError variant="box">{error}</FormError>
      )}

      <div className="p-3 bg-accent/20 border-2 border-ink text-sm">
        <p className="text-xs text-ink/70 font-semibold uppercase">{t('phoneLabel')}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="font-mono font-bold text-ink">{phone}</span>
          <Button
            type="button"
            variant="surface"
            size="sm"
            onClick={onChangePhone}
            className="text-xs font-bold text-primary underline hover:text-ink"
          >
            {t('changePhone')}
          </Button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleVerify(code);
        }}
        className="space-y-4"
      >
        <div>
          <label htmlFor="otp-code" className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
            {t('otpLabel')}
          </label>
          <Input
            id="otp-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={handleCodeChange}
            placeholder="000000"
            disabled={loading}
            className="text-center tracking-[0.5em] font-mono text-2xl font-black"
            autoFocus
            autoComplete="one-time-code"
          />
          <FormHint>{t('otpHint')}</FormHint>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={loading || code.length !== 6}
          className="w-full justify-center"
        >
          {loading ? '...' : t('verifyOtp')}
        </Button>
      </form>

      <div className="pt-2 text-center">
        <Button
          type="button"
          variant="surface"
          size="sm"
          onClick={handleResend}
          disabled={cooldown > 0 || resending || loading}
          className={`text-xs font-bold uppercase tracking-wider ${
            cooldown > 0 ? 'text-ink/40 cursor-not-allowed' : 'text-primary hover:underline'
          }`}
        >
          {cooldown > 0 ? `${t('resendOtp')} (${cooldown}s)` : t('resendOtp')}
        </Button>
      </div>
    </div>
  );
}
