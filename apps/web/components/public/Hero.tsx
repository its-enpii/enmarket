'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { SectionContainer } from './SectionContainer';

export function Hero() {
  const t = useTranslations('home');
  return (
    <section className="min-h-[60vh] sm:min-h-[80vh] flex flex-col items-center justify-center text-center border-b-4 border-ink">
      <SectionContainer py="xl">
        <h1 className="font-display text-4xl sm:text-6xl md:text-headline-xl text-primary leading-none mb-10 uppercase break-words">
          ENPIISTUDIO — <br />
          <span className="inline-block bg-ink text-accent px-6 py-2 transform -rotate-1">
            DISCOVER,
          </span>
          <br />
          DEVELOP, DISPLAY
        </h1>

        <p className="font-body text-body-md sm:text-body-lg max-w-2xl mx-auto italic text-ink/80 mb-12 border-x-4 border-accent px-8">
          {t('heroSubtitle')}
        </p>

        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <Button
            variant="accent"
            size="lg"
            href="/develop"
            className="font-label text-label-sm font-black uppercase"
          >
            {t('heroCta')}
          </Button>
        </div>
      </SectionContainer>
    </section>
  );
}