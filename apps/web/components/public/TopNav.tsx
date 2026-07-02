import Link from 'next/link';

import { CartBadge } from './CartBadge';

/**
 * TopNav publik — logo + link Katalog + Cart badge + Admin link.
 */
export async function TopNav() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'enpiistudio Store';

  return (
    <header className="border-b-4 border-ink bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight text-ink hover:text-primary transition-colors"
        >
          <span className="bg-primary text-surface border-2 border-ink px-2 py-0.5 text-sm">
            enpii
          </span>
          <span className="hidden sm:inline">{siteName}</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/katalog"
            className="px-2 sm:px-3 py-1.5 text-sm sm:text-base font-bold text-ink hover:text-primary transition-colors"
          >
            Katalog
          </Link>
          <CartBadge />
          <Link
            href="/login"
            className="bg-ink text-surface border-2 border-ink px-3 py-1.5 text-sm font-bold shadow-[3px_3px_0_0_var(--color-primary)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[5px_5px_0_0_var(--color-primary)] transition-all hidden sm:inline-block"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}