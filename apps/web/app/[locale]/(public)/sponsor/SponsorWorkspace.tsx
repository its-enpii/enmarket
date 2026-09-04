'use client';

import { useRef } from 'react';

import { SponsorBidForm, type SponsorBidFormHandle } from '@/components/public/SponsorBidForm';
import { SponsorLeaderboard } from '@/components/public/SponsorLeaderboard';
import { Card, Eyebrow } from '@/components/ui/neobrutal';
import { useTranslations } from 'next-intl';

export function SponsorWorkspace() {
  const t = useTranslations('sponsor');
  const bidFormRef = useRef<SponsorBidFormHandle>(null);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="grid content-start gap-8">
        <Card variant="surface" thick hoverable={false} className="p-6 md:p-8">
          <Eyebrow as="h2" size="label-lg" color="accent" className="mb-5">
            {t('form.title')}
          </Eyebrow>
          <SponsorBidForm ref={bidFormRef} />
        </Card>
      </div>

      <aside className="grid content-start gap-6 lg:sticky lg:top-6 lg:self-start">
        <Card variant="filled-primary" thick hoverable={false} className="p-6">
          <h2 className="font-display text-xl font-black uppercase text-surface">
            {t('leaderboard.title')}
          </h2>
          <p className="mt-2 font-body text-sm text-surface/75">{t('leaderboard.body')}</p>
        </Card>
        <SponsorLeaderboard bidFormRef={bidFormRef} />
        <Card variant="surface" thick hoverable={false} className="p-6">
          <h2 className="font-display text-xl font-black uppercase text-primary">
            {t('activationTitle')}
          </h2>
          <ol className="grid gap-3">
            {['submit', 'pay', 'activate'].map((step) => (
              <li
                key={step}
                className="border-t-2 border-ink/20 pt-3 font-body text-sm text-ink/80"
              >
                {t(`steps.${step}`)}
              </li>
            ))}
          </ol>
        </Card>
      </aside>
    </div>
  );
}
