/**
 * Pagination — shared component untuk list admin.
 *
 * Style: chunky buttons dengan hard shadow. Active page = bordered + shadow,
 * inactive = ghost button (compact). Pakai Button primitive dari
 * @/components/ui/neobrutal untuk konsistensi.
 *
 * Props:
 * - currentPage, lastPage: state pagination
 * - basePath: URL base (misal '/admin/products')
 * - queryParams: filter/sort/date fields yang harus di-passthrough saat
 *   navigasi ke page lain. Keys dengan empty/undefined value di-skip.
 *
 * Hanya render kalau lastPage > 1 (caller biasanya wrap dengan conditional).
 */

import Link from 'next/link';

import { Button } from '@/components/ui/neobrutal';

interface Props {
  currentPage: number;
  lastPage: number;
  basePath: string;
  /**
   * Filter/sort/date fields yang harus di-passthrough. Object biasa
   * dengan optional string values. Untuk fleksibilitas, tipe longgar
   * (`unknown`) — Pagination hanya baca string values via String() coercion.
   */
  queryParams: Record<string, string | string[] | undefined>;
}

export function Pagination({ currentPage, lastPage, basePath, queryParams }: Props) {
  function pageHref(p: number): string {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(queryParams)) {
      if (v != null && v !== '') {
        sp.set(k, Array.isArray(v) ? v[0] : v);
      }
    }
    if (p > 1) sp.set('page', String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  // Windowed pagination: 1 ... [current-2, current-1, current, current+1, current+2] ... last
  // Plus 1 dan last selalu muncul.
  const pages: (number | '…')[] = [];
  for (let p = 1; p <= lastPage; p++) {
    if (p === 1 || p === lastPage || Math.abs(p - currentPage) <= 2) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  return (
    <div className="flex gap-2 justify-center flex-wrap items-center">
      {currentPage > 1 && (
        <Link href={pageHref(currentPage - 1)}>
          <Button variant="ghost" size="sm">← Prev</Button>
        </Link>
      )}
      {pages.map((p, i) =>
        p === '…' ? (
          <span
            key={`gap-${i}`}
            className="px-2 py-1.5 text-ink/60 font-bold select-none"
          >
            …
          </span>
        ) : p === currentPage ? (
          <span
            key={p}
            aria-current="page"
            className="inline-flex items-center justify-center min-w-[40px] h-[36px] bg-primary text-surface border-2 border-ink px-3 text-sm font-bold uppercase tracking-wide shadow-[2px_2px_0_0_var(--color-ink)]"
          >
            {p}
          </span>
        ) : (
          <Link key={p} href={pageHref(p)}>
            <Button variant="ghost" size="sm">{p}</Button>
          </Link>
        ),
      )}
      {currentPage < lastPage && (
        <Link href={pageHref(currentPage + 1)}>
          <Button variant="ghost" size="sm">Next →</Button>
        </Link>
      )}
    </div>
  );
}