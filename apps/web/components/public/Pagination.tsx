import Link from 'next/link';

import type { PaginationMeta } from '@/lib/types';

interface Props {
  meta: PaginationMeta;
  basePath: string; // mis. "/katalog"
  /** Search params existing (selain page) — untuk preserve filter */
  searchParams: Record<string, string | undefined>;
}

/**
 * Pagination — link prev/next + nomor halaman. Pakai query string page=N.
 */
export function Pagination({ meta, basePath, searchParams }: Props) {
  if (meta.last_page <= 1) return null;

  function buildHref(page: number): string {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v) sp.set(k, v);
    }
    sp.set('page', String(page));
    return `${basePath}?${sp.toString()}`;
  }

  const pages: number[] = [];
  for (let i = 1; i <= meta.last_page; i++) pages.push(i);

  const isPrevDisabled = meta.current_page <= 1;
  const isNextDisabled = meta.current_page >= meta.last_page;

  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
      <Link
        href={buildHref(Math.max(1, meta.current_page - 1))}
        aria-disabled={isPrevDisabled}
        className={
          'border-2 border-ink px-3 py-2 text-sm font-bold shadow-[3px_3px_0_0_var(--color-ink)] transition-all ' +
          (isPrevDisabled
            ? 'bg-surface text-ink/40 pointer-events-none'
            : 'bg-surface text-ink hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[5px_5px_0_0_var(--color-ink)]')
        }
      >
        ← Prev
      </Link>

      {pages.map((p) => {
        const isActive = p === meta.current_page;
        return (
          <Link
            key={p}
            href={buildHref(p)}
            aria-current={isActive ? 'page' : undefined}
            className={
              'border-2 border-ink px-3 py-2 text-sm font-bold shadow-[3px_3px_0_0_var(--color-ink)] transition-all ' +
              (isActive
                ? 'bg-primary text-surface pointer-events-none'
                : 'bg-surface text-ink hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[5px_5px_0_0_var(--color-ink)]')
            }
          >
            {p}
          </Link>
        );
      })}

      <Link
        href={buildHref(Math.min(meta.last_page, meta.current_page + 1))}
        aria-disabled={isNextDisabled}
        className={
          'border-2 border-ink px-3 py-2 text-sm font-bold shadow-[3px_3px_0_0_var(--color-ink)] transition-all ' +
          (isNextDisabled
            ? 'bg-surface text-ink/40 pointer-events-none'
            : 'bg-surface text-ink hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[5px_5px_0_0_var(--color-ink)]')
        }
      >
        Next →
      </Link>
    </nav>
  );
}