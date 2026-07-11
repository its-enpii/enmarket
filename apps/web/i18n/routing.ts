import { defineRouting } from 'next-intl/routing';

/**
 * Routing konfigurasi untuk multi-bahasa.
 * - `locales`: bahasa yang didukung ('id' Indonesia, 'en' English).
 * - `defaultLocale`: 'id' — root URL `/` akan redirect ke `/id/...`.
 * - `localePrefix: 'always'`: SELALU ada prefix locale di URL. Tidak ada URL tanpa locale.
 * - `localeCookie`: persist pilihan bahasa visitor selama 1 tahun.
 */
export const routing = defineRouting({
  locales: ['id', 'en'] as const,
  defaultLocale: 'id',
  localePrefix: 'always',
  localeCookie: {
    name: 'NEXT_LOCALE',
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 tahun
  },
});

export type Locale = (typeof routing.locales)[number];