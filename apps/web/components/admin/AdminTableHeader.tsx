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
  /** Heading oversized di atas filter bar (oversized pattern sama seperti
   *  public page headers — `font-display text-3xl md:text-4xl font-black uppercase`).
   *  Pakai untuk "statement" halaman list, konsisten dengan public page headers. */
  heading?: ReactNode;
  /** Sub-heading 1-line italic ink/60 — penjelasan singkat di bawah heading. */
  subheading?: string;
}

/**
 * Standar header untuk halaman list admin.
 * Layout: optional heading + subheading, lalu 1 kotak shadow berisi search +
 * filters + primary action. Opsi secondary di bawah untuk form tambahan.
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
  heading,
  subheading,
}: Props) {
  return (
    <div className="space-y-4">
      {(heading || subheading) && (
        <div>
          {heading && (
            <h2 className="font-display text-3xl md:text-4xl font-black uppercase leading-[0.95] tracking-tight text-ink">
              {heading}
            </h2>
          )}
          {subheading && (
            <p className="mt-2 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4">
              {subheading}
            </p>
          )}
        </div>
      )}
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
      {secondary && <div className="mt-4">{secondary}</div>}
    </div>
  );
}