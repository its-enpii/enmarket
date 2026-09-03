'use client';

import { useTranslations } from 'next-intl';

import { Card, NLink } from '@/components/ui/neobrutal';
import { Text } from '@/components/ui';

interface Benefit {
  icon: string;
  titleKey: string;
  bodyKey: string;
}

const BENEFIT_KEYS: Benefit[] = [
  { icon: '⚡', titleKey: 'benefit1Title', bodyKey: 'benefit1Body' },
  { icon: '🔑', titleKey: 'benefit2Title', bodyKey: 'benefit2Body' },
  { icon: '🛠️', titleKey: 'benefit3Title', bodyKey: 'benefit3Body' },
  { icon: '💬', titleKey: 'benefit4Title', bodyKey: 'benefit4Body' },
];

/**
 * Section "Kenapa belanja di sini" — trust badge untuk marketplace.
 * 4 tile NeoBrutalism, warna diselang-seling biar ritme visual.
 */
export function TrustSection() {
  const t = useTranslations('trust');
  return (
    <section aria-label={t('ariaLabel')} className="space-y-4">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl sm:text-4xl font-bold text-primary font-mono">★</span>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink leading-tight">
            {t('heading')}
          </h2>
          <p className="text-sm sm:text-base text-ink/70 mt-1">
            {t('subtitle')}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {BENEFIT_KEYS.map((b, i) => {
          const variant =
            i % 4 === 0
              ? 'filled-primary'
              : i % 4 === 1
                ? 'filled-accent'
                : i % 4 === 2
                  ? 'ink'
                  : 'surface';
          return (
            <Card key={b.titleKey} variant={variant} hoverable={false} className="p-4">
              <p className="text-2xl" aria-hidden="true">
                {b.icon}
              </p>
              <h3 className="mt-2 font-bold text-base leading-tight">{t(b.titleKey as any)}</h3>
              <p className="mt-1 text-xs leading-relaxed opacity-80">{t(b.bodyKey as any)}</p>
            </Card>
          );
        })}
      </div>
      <Text className="text-center pt-2">
        {t('footerText')}{' '}
        <NLink
          href="/develop"
          variant="primary"
          underline="static"
        >
          {t('footerCta')}
        </NLink>{' '}
        {t('footerSuffix')}
      </Text>
    </section>
  );
}
