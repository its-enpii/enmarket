'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/neobrutal';
import { PageTitle } from '@/components/ui';
import { ProfileForm } from '@/components/customer/ProfileForm';

export default function AkunProfilPage() {
  const t = useTranslations('account.profile');

  return (
    <div className="space-y-6">
      <div>
        <PageTitle size="compact">
          {t('title')}
        </PageTitle>
        <p className="text-sm text-ink/70 mt-1">
          {t('subtitle')}
        </p>
      </div>

      <Card variant="surface" hoverable={false} className="p-6 md:p-8 max-w-xl">
        <ProfileForm />
      </Card>
    </div>
  );
}
