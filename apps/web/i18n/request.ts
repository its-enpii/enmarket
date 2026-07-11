import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';

/**
 * Server-side config untuk next-intl.
 * Load messages per-request sesuai locale di URL.
 * Fallback ke default locale jika locale tidak valid.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = (routing.locales as readonly string[]).includes(requested ?? '')
    ? (requested as (typeof routing.locales)[number])
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    // 'warn' saat dev agar missing keys tidak crash; bisa strict ke 'error' di prod.
    onMessageError: () => undefined,
  };
});