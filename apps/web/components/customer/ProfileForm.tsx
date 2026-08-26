'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/neobrutal';
import { useAuth } from './AuthProvider';

export function ProfileForm() {
  const t = useTranslations('account.profile');
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <div className="p-4 bg-green-100 border-3 border-green-700 text-green-900 font-bold text-sm shadow-[3px_3px_0_0_var(--color-ink)]">
          {t('profileUpdated')}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 border-3 border-red-700 text-red-900 font-bold text-sm shadow-[3px_3px_0_0_var(--color-ink)]">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
          {t('nameLabel')}
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama Lengkap"
          disabled={loading}
          className="w-full px-4 py-3 border-3 border-ink bg-surface text-ink font-semibold focus:outline-none focus:ring-2 focus:ring-primary shadow-[3px_3px_0_0_var(--color-ink)]"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
          {t('phoneLabel')}
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="08123456789"
          disabled={loading}
          className="w-full px-4 py-3 border-3 border-ink bg-surface text-ink font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-primary shadow-[3px_3px_0_0_var(--color-ink)]"
        />
        <p className="mt-1 text-xs text-ink/70">
          Nomor ini digunakan untuk login WhatsApp OTP.
        </p>
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
          Email (Opsional)
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@contoh.com"
          disabled={loading}
          className="w-full px-4 py-3 border-3 border-ink bg-surface text-ink font-semibold focus:outline-none focus:ring-2 focus:ring-primary shadow-[3px_3px_0_0_var(--color-ink)]"
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={loading}
        >
          {loading ? '...' : t('saveProfile')}
        </Button>
      </div>
    </form>
  );
}
