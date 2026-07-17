'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { Input } from '@/components/ui/Input';
import { SelectSearch } from '@/components/ui/SelectSearch';
import { DatePicker } from '@/components/ui/DatePicker';
import { useAdminList } from './AdminListProvider';
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

interface DateRange {
  /** ISO date string (yyyy-mm-dd) untuk kolom "dari". */
  from?: string;
  /** ISO date string (yyyy-mm-dd) untuk kolom "sampai". */
  to?: string;
  /** Nama parameter URL. Default 'date_from' & 'date_to'. */
  paramFrom?: string;
  paramTo?: string;
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
  /** Primary action slot — dirender di akhir baris, di dalam shadow box.
   *  Pakai untuk tombol "+ Produk Baru" dll yang harus menyatu visual dengan filter. */
  action?: React.ReactNode;
  /** Optional date range filter — render 2 input date di dalam shadow box,
   *  sejajar dengan search/filter. Submit on change (live). */
  dateRange?: DateRange;
}

export function LiveFilterBar({
  q,
  sort,
  dir,
  filters = [],
  passthrough = {},
  placeholder: placeholderProp,
  debounceMs = 300,
  action,
  dateRange,
}: Props) {
  const t = useTranslations('admin.shared');
  const placeholder = placeholderProp ?? t('searchPlaceholderDefault');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { pending, startTransition } = useAdminList();

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
    <div className="bg-surface border-2 border-ink p-3 shadow-[3px_3px_0_0_var(--color-ink)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        {/* Live search */}
        <div className="w-full sm:flex-1 sm:min-w-[200px]">
          <label htmlFor="live-search" className="block text-xs font-bold uppercase tracking-wide mb-1">
            {t('search')}
            {pending && <span className="ml-2 text-primary normal-case font-normal">{t('searchPending')}</span>}
          </label>
          <Input
            id="live-search"
            variant="flat"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
          />
        </div>

        {/* Filters */}
        {filters.map((f) => {
          const current = searchParams.get(f.key) ?? '';
          const placeholder = f.options.find((o) => o.value === current)?.label ?? f.label;
          return (
            <div key={f.key} className="w-full sm:w-44">
              <SelectSearch
                name={f.key}
                label={f.label}
                value={current}
                placeholder={placeholder}
                options={f.options}
                onChange={(v) => pushFilter(f.key, v)}
                clearable={current !== ''}
              />
            </div>
          );
        })}

        {/* Date range — pakai router.replace via pushFilter biar soft navigation
            (tidak full reload, sama seperti search & filter lain). */}
        {dateRange && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <DatePicker
              label={t('dateFrom')}
              name={dateRange.paramFrom ?? 'date_from'}
              defaultValue={dateRange.from ?? ''}
              placeholder={t('dateFrom')}
              className="w-full sm:w-48"
              onChange={(v) => pushFilter(dateRange.paramFrom ?? 'date_from', v)}
            />
            <DatePicker
              label={t('dateTo')}
              name={dateRange.paramTo ?? 'date_to'}
              defaultValue={dateRange.to ?? ''}
              placeholder={t('dateTo')}
              align="right"
              className="w-full sm:w-48"
              onChange={(v) => pushFilter(dateRange.paramTo ?? 'date_to', v)}
            />
          </div>
        )}

        {/* Reset link — selalu tampil, no-op kalau tidak ada filter aktif.
            Pakai <Button href variant="ghost" size="md"> + manual hover bg-accent
            supaya sizing match dengan primary action button (44px min-h). */}
        <Button
          href={pathname}
          variant="ghost"
          size="md"
          className="w-full sm:w-auto hover:bg-accent"
        >
          {t('reset')}
        </Button>

        {/* Primary action — di dalam kotak, di akhir baris */}
        {action}
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
  const t = useTranslations('admin.shared');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { pending, startTransition } = useAdminList();

  const active = currentSort === field;
  const nextDir = active && currentDir === 'asc' ? 'desc' : 'asc';

  function push() {
    if (pending) return; // ignore kalau masih loading
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
      disabled={pending}
      className={
        'inline-flex items-center gap-1 font-bold uppercase tracking-wide text-xs transition-colors ' +
        (pending ? 'cursor-wait opacity-50 ' : 'cursor-pointer ') +
        (active ? 'text-accent' : 'text-surface hover:text-accent')
      }
      aria-label={t('sortBy', { field })}
    >
      {children}
      {active && (
        <span aria-hidden="true">{currentDir === 'asc' ? '↑' : '↓'}</span>
      )}
    </button>
  );
}
