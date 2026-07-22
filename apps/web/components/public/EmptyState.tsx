'use client';

import { useTranslations } from 'next-intl';

import { Button, Card } from '@/components/ui/neobrutal';

interface Props {
  title: string;
  message?: string;
  cta?: { href: string; label: string };
}

/**
 * Empty state — blok warna dengan CTA.
 * Translated via next-intl 'common.empty' namespace.
 *
 * Layout: flex-column dengan gap konsisten antar section. Jarak antar
 * message dan tombol adalah 2× dari jarak judul ke message, supaya CTA
 * punya "breathing room" yang jelas — terutama saat message panjang
 * (mis. "Add works from the admin dashboard to get started." yang
 * beberapa kali memicu button kelihatan nempel dengan body text).
 *
 * ponytail: `style={{ boxShadow }}` override dihapus — Card primitive
 * sudah supply SHADOW_BASE via className, dan override inline di sini
 * cuma duplicate. Saat diapus, button hover lift jadi sejajar dengan
 * shadow Card (offset 6px → 2px pada hover button vs statis 4px Card).
 */
export function EmptyState({ title, message, cta }: Props) {
  const t = useTranslations('common.empty');
  return (
    <Card
      variant="surface"
      hoverable={false}
      className="flex flex-col items-center gap-4 p-8 sm:p-12 text-center sm:gap-6"
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/60">
        {t('title')}
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-ink">
        {title}
      </h2>
      {message && (
        <p className="text-sm sm:text-base text-ink/70 max-w-md">
          {message}
        </p>
      )}
      {cta && (
        <Button href={cta.href} variant="primary" size="md" className="mt-2">
          {cta.label}
        </Button>
      )}
    </Card>
  );
}