'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/neobrutal';
import { FormError, FormHint } from '@/components/ui/FormMessage';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/auth-api';

interface Props {
  initialPhone?: string;
  onSuccess: (phone: string, cooldownSeconds: number) => void;
  locale?: string;
}

export function OtpRequestForm({ initialPhone = '', onSuccess, locale }: Props) {
  const t = useTranslations('customer.login');
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 8) {
      setError(t('errors.invalidPhone'));
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.requestOtp(cleanPhone, locale);
      if (res.success) {
        setCooldown(res.cooldown_seconds || 60);
        onSuccess(cleanPhone, res.cooldown_seconds || 60);
      } else {
        setError(res.message || t('errors.rateLimited'));
        if (res.cooldown_seconds) {
          setCooldown(res.cooldown_seconds);
        }
      }
    } catch (err: any) {
      if (err.status === 429) {
        setError(t('errors.rateLimited'));
        if (err.data?.cooldown_seconds) {
          setCooldown(err.data.cooldown_seconds);
        }
      } else {
        setError(err.message || t('errors.rateLimited'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <FormError variant="box">{error}</FormError>
      )}

      <div>
        <label htmlFor="customer-phone" className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
          {t('phoneLabel')}
        </label>
        <Input
          id="customer-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('phonePlaceholder')}
          disabled={loading || cooldown > 0}
          className="font-mono text-base font-semibold"
          autoFocus
        />
        <FormHint>{t('phoneHint')}</FormHint>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={loading || cooldown > 0 || !phone.trim()}
        className="w-full justify-center"
      >
        {loading
          ? '...'
          : cooldown > 0
          ? `${t('resendOtp')} (${cooldown}s)`
          : t('requestOtp')}
      </Button>
    </form>
  );
}
