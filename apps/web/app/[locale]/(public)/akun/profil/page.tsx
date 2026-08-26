'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/neobrutal';
import { ProfileForm } from '@/components/customer/ProfileForm';

export default function AkunProfilPage() {
  const t = useTranslations('account.profile');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase text-ink tracking-tight">
          {t('title')}
        </h1>
        <p className="text-sm text-ink/70 mt-1">
          Kelola informasi nama, nomor WhatsApp, dan email Anda.
        </p>
      </div>

      <Card variant="surface" hoverable={false} className="p-6 md:p-8 max-w-xl">
        <ProfileForm />
      </Card>
    </div>
  );
}
