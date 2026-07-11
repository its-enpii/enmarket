/**
 * Root layout — minimal pass-through.
 *
 * Render <html> + <body>. Font CSS variables di-set di sini (pada <html>)
 * agar variable inheritance cover full DOM tree (body, semua descendants).
 * Locale-specific UI (NextIntlClientProvider, ToastContainer, DialogContainer)
 * ada di app/[locale]/layout.tsx.
 */

import type { Metadata } from 'next';
import { Anybody, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';

import './globals.css';

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
    default: 'enpiistudio — Discover, develop, display',
    template: '%s',
  },
  description:
    'Marketplace karya digital dari studio enpii — apa pun yang bisa diunduh, dipakai, atau dinikmati.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  ),
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params?: Promise<{ locale?: string }>;
}>) {
  const locale = (await params)?.locale ?? 'id';
  const fontClass = `${anybody.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable}`;

  return (
    <html lang={locale} className={`${fontClass} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
