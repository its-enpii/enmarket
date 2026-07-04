import type { ReactNode } from 'react';

import { LiveFilterBar } from './LiveFilterBar';
import type { FilterConfig } from './LiveFilterBar';

interface Props {
  q: string;
  sort: string;
  dir: 'asc' | 'desc';
  filters?: FilterConfig[];
  placeholder?: string;
  /** Extra fields yang harus di-passthrough (date_from, date_to, dll). */
  passthrough?: Record<string, string>;
  /** Primary action (tombol +) di kanan header — menyatu di dalam kotak filter. */
  action?: ReactNode;
  /** Optional secondary content di bawah filter bar (batch actions, dll). */
  secondary?: ReactNode;
  /** Optional date range filter — render di dalam shadow box yang sama dengan
   *  search/filter (sebelum Reset). Pakai untuk halaman yg butuh date range. */
  dateRange?: {
    from?: string;
    to?: string;
    paramFrom?: string;
    paramTo?: string;
  };
  debounceMs?: number;
}

/**
 * Standar header untuk halaman list admin.
 * Layout: 1 kotak shadow berisi search + filters + primary action (tombol +),
 * disusun 1 baris horizontal. Opsi secondary di bawah untuk form tambahan
 * (date range, insert form, dll).
 *
 * Untuk halaman tanpa search/filter, tetap pakai component ini dengan
 * filters=[] dan action saja — konsistensi visual antar halaman terjaga.
 */
export function AdminTableHeader({
  q,
  sort,
  dir,
  filters = [],
  placeholder,
  passthrough,
  action,
  secondary,
  dateRange,
  debounceMs,
}: Props) {
  return (
    <div className="space-y-3">
      <LiveFilterBar
        q={q}
        sort={sort}
        dir={dir}
        filters={filters}
        placeholder={placeholder}
        passthrough={passthrough}
        debounceMs={debounceMs}
        action={action}
        dateRange={dateRange}
      />
      {secondary}
    </div>
  );
}