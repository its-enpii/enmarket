import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render: (row: T) => ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
  rowKey: (row: T) => string | number;
}

export function DataTable<T>({ columns, rows, emptyMessage = 'Tidak ada data.', rowKey }: Props<T>) {
  if (rows.length === 0) {
    return (
      <div className="bg-surface border-2 border-ink px-6 py-12 text-center shadow-[4px_4px_0_0_var(--color-ink)]">
        <p className="text-ink/60 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="border-2 border-ink bg-surface shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary text-surface">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className="text-left px-4 py-3 font-bold uppercase tracking-wide text-xs border-b-2 border-ink"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={rowKey(row)}
                className={
                  'border-b border-ink/20 last:border-b-0 ' +
                  (i % 2 === 0 ? 'bg-surface' : 'bg-surface/50')
                }
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-ink align-middle">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}