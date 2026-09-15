/**
 * Locale-aware segment layout.
 *
 * Bertanggung jawab:
 * - Set locale untuk server components (unstable_setRequestLocale)
 * - Provide messages via NextIntlClientProvider ke children client components
 * - Mount global UI containers (toast, dialog)
 *
 * NOTE: tidak render <html>/<body> shell — itu kerjaan root layout.
 * Font CSS variables di-set di root <html> (app/layout.tsx) untuk cover
 * full DOM tree.
 */

import { NextIntlClientProvider } from 'next-intl';
import type { Metadata } from 'next';
import { Anybody, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';

import { ToastContainer } from '@/components/ui/ToastContainer';
import { DialogContainer } from '@/components/ui/DialogContainer';
import { LocaleSync } from '@/components/LocaleSync';
import { routing } from '@/i18n/routing';
import '../globals.css';

const anybody = Anybody({
  variable: '--font-anybody',
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  display: 'swap',
});

const hankenGrotesk = Hanken_Grotesk({
  variable: '--font-hanken-grotesk',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'EnStudio — Discover, develop, display',
    template: '%s',
  },
  description:
    'Marketplace karya digital dari EnStudio — apa pun yang bisa diunduh, dipakai, atau dinikmati.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  ),
  openGraph: {
    siteName: 'EnStudio',
    type: 'website',
    locale: 'id_ID',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  unstable_setRequestLocale(locale);
  const messages = await getMessages();
  const fontClass = `${anybody.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable}`;

  return (
    <html lang={locale} className={`${fontClass} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LocaleSync />
          {children}
          {/* Global UI containers — client components, mount sekali di locale segment */}
          <ToastContainer />
          <DialogContainer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
