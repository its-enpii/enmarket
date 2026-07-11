/**
 * Layout untuk route group (public) — semua halaman publik.
 * Render TopNav (client component) + CartBadge (server component) sebagai child,
 * supaya CartBadge tetap bisa pakai async fetch + cookies() (server only).
 */

import { Footer } from '@/components/public/Footer';
import { TopNav } from '@/components/public/TopNav';
import { CartBadge } from '@/components/public/CartBadge';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <TopNav>
        <CartBadge />
      </TopNav>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}