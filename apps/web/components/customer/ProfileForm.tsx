'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card } from '@/components/ui/neobrutal';
import { FormError, FormHint } from '@/components/ui/FormMessage';
import { Input } from '@/components/ui/Input';
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
      setError(err.message || t('errorUpdate'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <Card variant="filled-accent" hoverable={false} className="p-3 text-sm font-bold">
          ✓ {t('profileUpdated')}
        </Card>
      )}

      {error && (
        <FormError variant="box">{error}</FormError>
      )}

      <div>
        <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
          {t('nameLabel')}
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('nameLabel')}
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
          {t('phoneLabel')}
        </label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="08123456789"
          disabled={loading}
          className="font-mono"
        />
        <FormHint>{t('phoneHint')}</FormHint>
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
          {t('emailLabel')}
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          disabled={loading}
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
