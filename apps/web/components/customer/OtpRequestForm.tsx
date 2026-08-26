'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/neobrutal';
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
        <div className="p-3 bg-red-100 border-2 border-red-600 text-red-800 text-sm font-medium">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="customer-phone" className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
          {t('phoneLabel')}
        </label>
        <input
          id="customer-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('phonePlaceholder')}
          disabled={loading || cooldown > 0}
          className="w-full px-4 py-3 border-3 border-ink bg-surface text-ink font-mono text-base font-semibold focus:outline-none focus:ring-2 focus:ring-primary shadow-[3px_3px_0_0_var(--color-ink)]"
          autoFocus
        />
        <p className="mt-1 text-xs text-ink/70">
          {t('phoneHint')}
        </p>
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
