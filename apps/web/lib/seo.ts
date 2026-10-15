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

/**
 * siteMetadata — metadata SEO untuk halaman publik (locale-aware).
 *
 * Mengembalikan title/description + alternates (hreflang) + openGraph
 * (termasuk `og:url` + `og:locale` per locale) + twitter card.
 *
 * `url` sengaja RELATIF (`/${locale}${pathPart}`) — Next mengabsolutkan
 * lewat `metadataBase` di `app/[locale]/layout.tsx` (pola sama seperti
 * halaman detail develop/display).
 *
 * BUKAN pengganti `buildMetadata` (dipakai 34 halaman admin) — helper baru,
 * jangan ubah signature `buildMetadata`.
 */
export function siteMetadata(
  locale: string,
  path: string,
  opts: { title: string; description: string },
): Metadata {
  const cleanPath = path.replace(/^\/+/, '').replace(/\/+$/, '');
  const pathPart = cleanPath ? `/${cleanPath}` : '';

  return {
    title: opts.title,
    description: opts.description,
    alternates: localeAlternates(locale, path),
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: `/${locale}${pathPart}`,
      siteName: 'EnStudio',
      locale: locale === 'en' ? 'en_US' : 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
    },
  };
}
