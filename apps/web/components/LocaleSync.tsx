'use client';

import { useEffect } from 'react';

import { useLocale } from 'next-intl';

/**
 * Sync `document.documentElement.lang` dengan locale aktif.
 *
 * Kenapa perlu: Next.js 15.5 root layout merender <html> tapi tidak punya
 * akses ke [locale] dynamic segment. Kita set lang attribute via DOM API
 * saat client mount, sehingga screen reader & SEO tooling dapat detect
 * bahasa halaman yang benar.
 */
export function LocaleSync() {
  const locale = useLocale();
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);
  return null;
}
