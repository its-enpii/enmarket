import type { Metadata } from 'next';

import { routing } from '@/i18n/routing';

interface BuildMetadataOptions {
  title: string;
  description?: string;
}

export function buildMetadata({
  title,
  description,
}: BuildMetadataOptions): Metadata {
  return {
    title,
    ...(description ? { description } : {}),
  };
}

export function localeAlternates(locale: string, path: string) {
  const cleanPath = path.replace(/^\/+/, '').replace(/\/+$/, '');
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const pathPart = cleanPath ? `/${cleanPath}` : '';
  const languageUrls = routing.locales.map((alternateLocale) => [
    alternateLocale,
    `${baseUrl}/${alternateLocale}${pathPart}`,
  ] as const);

  return {
    canonical: `/${locale}${pathPart}`,
    languages: {
      ...Object.fromEntries(languageUrls),
      'x-default': `${baseUrl}/${routing.defaultLocale}${pathPart}`,
    },
  };
}

export function noIndexMetadata() {
  return {
    robots: {
      index: false,
      follow: false,
    },
  };
}
