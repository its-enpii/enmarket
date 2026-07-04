interface Props {
  columnCount: number;
  /** Lebar per kolom (CSS value). Optional.
   *  Kalau di-pass, skeleton cell `<td>` pakai width yang sama persis dengan
   *  DataTable real → tidak ada layout shift saat loading→loaded. */
  columnWidths?: (string | undefined)[];
  count?: number;
}

// Lebar fallback decorative bar (random per cell agar terlihat natural).
// Hanya untuk inner skeleton BAR, bukan untuk cell `<td>` width.
const FALLBACK_BAR_WIDTHS = [60, 80, 45, 70, 55, 90, 40, 65];

function barWidth(rowIdx: number, colIdx: number, columnCount: number): string {
  const seed = FALLBACK_BAR_WIDTHS[(rowIdx * columnCount + colIdx) % FALLBACK_BAR_WIDTHS.length];
  return `${seed}%`;
}

function cellWidth(columnWidth?: string): string | undefined {
  return columnWidth;
}

/**
 * Skeleton tabel — generic. Lebar tiap `<td>` pakai columnWidths kalau ada,
 * sehingga pas loading→loaded tidak ada layout shift. Bar di dalam cell
 * pakai decorative random width agar terlihat natural. NO rounded (brand).
 */
export function TableSkeleton({ columnCount, columnWidths, count = 10 }: Props) {
  return (
    <div className="border-2 border-ink bg-surface shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-busy="true">
          <thead>
            <tr className="bg-primary text-surface">
              {Array.from({ length: columnCount }).map((_, j) => (
                <th
                  key={j}
                  style={{ width: cellWidth(columnWidths?.[j]) }}
                  className="text-left px-4 py-3 font-bold uppercase tracking-wide text-xs border-b-2 border-ink"
                >
                  <div className="h-3 bg-surface/30 animate-pulse w-3/4" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: count }).map((_, i) => (
              <tr
                key={i}
                className={
                  'border-b border-ink/20 last:border-b-0 ' +
                  (i % 2 === 0 ? 'bg-surface' : 'bg-surface/50')
                }
              >
                {Array.from({ length: columnCount }).map((_, j) => (
                  <td
                    key={j}
                    style={{ width: cellWidth(columnWidths?.[j]) }}
                    className="px-4 py-3 align-middle"
                  >
                    <div
                      className="h-4 bg-ink/15 animate-pulse"
                      style={{ width: barWidth(i, j, columnCount) }}
                    />
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