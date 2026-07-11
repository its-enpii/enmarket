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
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';

import { ToastContainer } from '@/components/ui/ToastContainer';
import { DialogContainer } from '@/components/ui/DialogContainer';
import { LocaleSync } from '@/components/LocaleSync';
import { routing } from '@/i18n/routing';

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

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleSync />
      {children}
      {/* Global UI containers — client components, mount sekali di locale segment */}
      <ToastContainer />
      <DialogContainer />
    </NextIntlClientProvider>
  );
}