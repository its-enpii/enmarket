'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/neobrutal';
import { FormError, FormHint } from '@/components/ui/FormMessage';
import { Icon } from '@/components/ui';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { AlertBanner } from '@/components/ui/AlertBanner';
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
      setError(err.message || t('errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <AlertBanner variant="success" className="p-3">
          <Icon name="check" size={14} className="mr-1" />
          {t('profileUpdated')}
        </AlertBanner>
      )}

      {error && (
        <FormError variant="box">{error}</FormError>
      )}

      <FormField label={t('nameLabel')} htmlFor="name">
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('nameLabel')}
          disabled={loading}
        />
      </FormField>

      <FormField label={t('phoneLabel')} htmlFor="phone" hint={t('phoneHint')}>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="08123456789"
          disabled={loading}
          className="font-mono"
        />
      </FormField>

      <FormField label={t('emailLabel')} htmlFor="email">
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          disabled={loading}
        />
      </FormField>

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
