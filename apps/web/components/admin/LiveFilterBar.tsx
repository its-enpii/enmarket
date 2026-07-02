'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';

import { useDebouncedValue } from '@/lib/hooks';

/**
 * LiveFilterBar — search input debounced + instant filter dropdowns + sort.
 * Update URL via router.replace (no full reload) → Server Component re-fetch.
 *
 * Props:
 * - q: initial search value
 * - sort, dir: initial sort state
 * - filters: daftar filter dropdown { key, label, options }
 */

interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

interface Props {
  q: string;
  sort: string;
  dir: 'asc' | 'desc';
  filters?: FilterConfig[];
  /** Extra fields yang harus di-passthrough (date_from, date_to, etc.) */
  passthrough?: Record<string, string>;
  placeholder?: string;
  /** Custom debounce delay (ms). Default 300. */
  debounceMs?: number;
}

export function LiveFilterBar({
  q,
  sort,
  dir,
  filters = [],
  passthrough = {},
  placeholder = 'Cari…',
  debounceMs = 300,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [input, setInput] = useState(q);
  const debounced = useDebouncedValue(input, debounceMs);

  // Build URL dari state terbaru + passthrough fields
  function buildUrl(updates: Record<string, string | null>): string {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === '') sp.delete(k);
      else sp.set(k, v);
    }
    // Reset page ke 1 setiap perubahan filter
    sp.delete('page');
    const qs = sp.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  // Debounced search push
  useEffect(() => {
    if (debounced === q) return;
    const url = buildUrl({ q: debounced });
    startTransition(() => router.replace(url, { scroll: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  function pushFilter(key: string, value: string) {
    const url = buildUrl({ [key]: value });
    startTransition(() => router.replace(url, { scroll: false }));
  }

  function toggleSort(field: string) {
    const newDir = sort === field && dir === 'asc' ? 'desc' : 'asc';
    const url = buildUrl({ sort: field, dir: newDir });
    startTransition(() => router.replace(url, { scroll: false }));
  }

  return (
    <div className="bg-surface border-2 border-ink p-4 shadow-[3px_3px_0_0_var(--color-ink)]">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Live search */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="live-search" className="block text-xs font-bold uppercase tracking-wide mb-1">
            Cari
            {pending && <span className="ml-2 text-primary normal-case font-normal">⟳ memuat…</span>}
          </label>
          <input
            id="live-search"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-surface border-2 border-ink px-3 py-2 text-sm focus:outline-none focus:shadow-[3px_3px_0_0_var(--color-ink)] transition-all"
          />
        </div>

        {/* Filters */}
        {filters.map((f) => {
          const current = searchParams.get(f.key) ?? '';
          return (
            <div key={f.key}>
              <label htmlFor={`filter-${f.key}`} className="block text-xs font-bold uppercase tracking-wide mb-1">
                {f.label}
              </label>
              <select
                id={`filter-${f.key}`}
                value={current}
                onChange={(e) => pushFilter(f.key, e.target.value)}
                className="bg-surface border-2 border-ink px-3 py-2 text-sm focus:outline-none focus:shadow-[3px_3px_0_0_var(--color-ink)] transition-all"
              >
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}

        {/* Sort indicator */}
        <div className="flex items-center gap-2 text-xs text-ink/60 ml-auto">
          {sort !== 'created_at' && sort !== 'id' && (
            <span>Sort: {sort} {dir}</span>
          )}
        </div>

        {/* Reset link */}
        {(q || searchParams.toString() !== '') && (
          <Link href={pathname} className="border-2 border-ink bg-surface text-ink px-3 py-2 text-sm font-bold shadow-[3px_3px_0_0_var(--color-ink)] hover:bg-accent hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--color-ink)] transition-all min-h-[44px] inline-flex items-center">
            Reset
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * SortableHeader — Link element yang toggle sort field & dir.
 * Wrap column title di admin DataTable.
 */
interface HeaderProps {
  field: string;
  currentSort: string;
  currentDir: 'asc' | 'desc';
  children: React.ReactNode;
}

export function SortableHeader({ field, currentSort, currentDir, children }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const active = currentSort === field;
  const nextDir = active && currentDir === 'asc' ? 'desc' : 'asc';

  function push() {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('sort', field);
    sp.set('dir', nextDir);
    sp.delete('page');
    const qs = sp.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    startTransition(() => router.replace(url, { scroll: false }));
  }

  return (
    <button
      type="button"
      onClick={push}
      className={
        'inline-flex items-center gap-1 font-bold uppercase tracking-wide text-xs ' +
        (active ? 'text-accent' : 'text-surface hover:text-accent') +
        ' transition-colors'
      }
      aria-label={`Sort by ${field}`}
    >
      {children}
      {active && (
        <span aria-hidden="true">{currentDir === 'asc' ? '↑' : '↓'}</span>
      )}
    </button>
  );
}
