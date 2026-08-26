/**
 * Layout untuk route group (public) — semua halaman publik.
 * Render TopNav (client component) + WishlistBadge & CartBadge (server components) sebagai child.
 */

import { Footer } from '@/components/public/Footer';
import { TopNav } from '@/components/public/TopNav';
import { CartBadge } from '@/components/public/CartBadge';
import { WishlistBadge } from '@/components/public/WishlistBadge';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // bg-transparent: biar dot-grid pattern di <body> (globals.css) kelihatan.
    // Section yang butuh solid surface pasang `bg-surface` sendiri-sendiri.
    <div className="min-h-screen flex flex-col bg-transparent">
      <TopNav>
        <WishlistBadge />
        <CartBadge />
      </TopNav>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
