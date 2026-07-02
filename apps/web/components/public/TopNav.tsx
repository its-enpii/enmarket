import Link from 'next/link';

import { publicApi } from '@/lib/public-api';

/**
 * TopNav publik — logo + link Katalog + link Admin (login).
 * Mengambil jumlah produk aktif dari API publik (cached).
 */
export async function TopNav() {
  // Pakai latestProducts saja untuk hit 1 endpoint; tidak menampilkan count di sini
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'enpiistudio Store';

  return (
    <header className="border-b-4 border-ink bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight text-ink hover:text-primary transition-colors"
        >
          <span className="bg-primary text-surface border-2 border-ink px-2 py-0.5 text-sm">
            enpii
          </span>
          <span className="hidden sm:inline">{siteName}</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/katalog"
            className="px-3 py-1.5 text-sm sm:text-base font-bold text-ink hover:text-primary transition-colors"
          >
            Katalog
          </Link>
          <Link
            href="/login"
            className="bg-ink text-surface border-2 border-ink px-3 py-1.5 text-sm font-bold shadow-[3px_3px_0_0_var(--color-primary)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[5px_5px_0_0_var(--color-primary)] transition-all"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}