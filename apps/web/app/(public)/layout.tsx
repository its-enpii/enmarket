/**
 * Layout untuk route group (public) — semua halaman publik.
 * Render TopNav + Footer + main wrapper.
 *
 * Catatan: middleware.ts tidak gate /admin/* ke sini, jadi (public) cocok
 * untuk halaman yang boleh diakses publik.
 */

import { Footer } from '@/components/public/Footer';
import { TopNav } from '@/components/public/TopNav';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <TopNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}