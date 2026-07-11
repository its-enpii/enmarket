'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/navigation';

import { routing } from '@/i18n/routing';

/**
 * LocaleSwitcher — toggle antara ID/EN.
 *
 * Pakai `usePathname()` next/navigation (return path WITH locale prefix,
 * mis. "/id/discover"). Strip prefix → bare path. Pakai <Link> next-intl
 * dengan `locale` prop, dan href TANPA prefix locale. Next-intl akan
 * prefix otomatis dengan target locale → final URL mis. "/en/discover".
 *
 * SPA navigation (no full reload) karena <Link> pakai next/router push.
 */
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('common.language');

  // Strip leading "/<locale>" prefix → bare path
  const stripped = pathname.replace(/^\/(id|en)/, '') || '/';

  return (
    <div
      role="group"
      aria-label={t('switchTo')}
      className="inline-flex border-2 border-ink shadow-[2px_2px_0_0_var(--color-ink)]"
    >
      {routing.locales.map((l) => {
        const active = l === locale;
        return (
          <Link
            key={l}
            href={stripped}
            locale={l}
            hrefLang={l}
            aria-pressed={active}
            aria-current={active ? 'true' : undefined}
            className={`font-label text-label-sm font-bold uppercase px-2 py-1 min-h-[28px] inline-flex items-center transition-colors no-underline ${
              active
                ? 'bg-primary text-surface'
                : 'bg-surface text-ink hover:bg-accent'
            }`}
          >
            {l === 'id' ? t('id') : t('en')}
          </Link>
        );
      })}
    </div>
  );
}