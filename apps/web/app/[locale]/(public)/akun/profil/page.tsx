'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/neobrutal';
import { PageIntro } from '@/components/ui';
import { ProfileForm } from '@/components/customer/ProfileForm';

export default function AkunProfilPage() {
  const t = useTranslations('account.profile');

  return (
    <div className="space-y-6">
      <PageIntro title={t('title')} subtitle={t('subtitle')} />

      <Card variant="surface" hoverable={false} className="p-6 md:p-8 max-w-xl">
        <ProfileForm />
      </Card>
    </div>
  );
}
