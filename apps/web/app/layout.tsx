/**
 * Root layout — minimal pass-through.
 *
 * Render <html> + <body>. Font CSS variables di-set di sini (pada <html>)
 * agar variable inheritance cover full DOM tree (body, semua descendants).
 * Locale-specific UI (NextIntlClientProvider, ToastContainer, DialogContainer)
 * ada di app/[locale]/layout.tsx.
 */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
