'use client';

import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { Card } from '@/components/ui/neobrutal';

export interface Column<T> {
  key: string;
  header: ReactNode;
  width?: string;
  render: (row: T) => ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  /** Plain text fallback saat rows kosong (backward compat). */
  emptyMessage?: string;
  /**
   * Ilustratif empty state — komponen kompleks dengan action button, dll.
   * Prioritas lebih tinggi dari `emptyMessage`. Pakai `EmptyState` dari
   * `@/components/admin/EmptyState` untuk konsistensi visual.
   */
  emptyState?: ReactNode;
  rowKey: (row: T) => string | number;
}

export function DataTable<T>({ columns, rows, emptyMessage, emptyState, rowKey }: Props<T>) {
  const t = useTranslations('admin.shared');

  if (rows.length === 0) {
    if (emptyState) {
      return <>{emptyState}</>;
    }
    return (
      <Card variant="surface" hoverable={false} className="px-6 py-12 text-center">
        <p className="text-ink/60 font-medium">
          {emptyMessage ?? t('emptyFallback')}
        </p>
      </Card>
    );
  }

  return (
    <Card variant="surface" hoverable={false} elevation={4} className="relative">
      {/* Scroll indicator — gradient samar di kanan (mobile only) untuk kasih
          tahu user ada kolom yang off-screen. Pointer-events-none jadi tidak
          block scroll horizontal. Hidden di sm+ karena tabel biasanya fit. */}
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-surface to-transparent pointer-events-none sm:hidden z-10" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary text-surface">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className="px-4 py-3 text-left font-mono font-bold uppercase tracking-wider text-xs border-b-2 border-ink first:pl-5 last:pr-5"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-ink/15">
            {rows.map((row, idx) => (
              <tr
                key={rowKey(row)}
                className={`hover:bg-primary/5 transition-colors ${
                  idx % 2 === 0 ? 'bg-surface' : 'bg-surface/50'
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-ink align-middle first:pl-5 last:pr-5"
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
