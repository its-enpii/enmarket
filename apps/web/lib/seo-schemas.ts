/**
 * JSON-LD schema factories untuk halaman publik.
 *
 * Semua URL dibangun dari `NEXT_PUBLIC_SITE_URL` (fallback localhost) —
 * TIDAK ada literal hostname produksi di sini.
 */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export function siteUrl(): string {
  return SITE_URL;
}

interface OrganizationOptions {
  name?: string;
  /** Social profile URLs (dari site-config `data.social`). */
  socialUrls?: ReadonlyArray<{ label?: string | null; url?: string | null }>;
  /** Override default logo path di bawah baseUrl. */
  logoPath?: string;
}

/**
 * Organisation schema. `logo` WAJIB ada sebagai ImageObject yang menunjuk aset
 * statis yang benar-benar ada: `public/logo/enstudio-mark-light.png`
 * (persegi 1254x1254, latar terang — cocok untuk schema).
 * `sameAs` dibersihkan: entri tanpa label/url dibuang, didedup, maksimal 8.
 */
export function organizationSchema(baseUrl: string, opts: OrganizationOptions = {}) {
  const cleanBase = baseUrl.replace(/\/$/, '');

  const seen = new Set<string>();
  const sameAs: string[] = [];
  for (const link of opts.socialUrls ?? []) {
    const label = link?.label?.trim();
    const url = link?.url?.trim();
    if (!label || !url) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    sameAs.push(url);
    if (sameAs.length >= 8) break;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: opts.name ?? 'EnStudio',
    url: cleanBase,
    logo: {
      '@type': 'ImageObject',
      url: `${cleanBase}${opts.logoPath ?? '/logo/enstudio-mark-light.png'}`,
    },
    sameAs,
  };
}

interface WebSiteOptions {
  baseUrl: string;
  locale: string;
  name: string;
  searchUrlTemplate: string;
}

/** WebSite schema + SearchAction (endpoint pencarian katalog). */
export function webSiteSchema({ baseUrl, locale, name, searchUrlTemplate }: WebSiteOptions) {
  const cleanBase = baseUrl.replace(/\/$/, '');

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url: `${cleanBase}/${locale}`,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: searchUrlTemplate,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
