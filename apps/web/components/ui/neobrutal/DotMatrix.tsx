import type { HTMLAttributes } from 'react';

/**
 * DotMatrix — ornamen aksen dot-matrix geometris (neobrutalist).
 *
 * Matriks titik kotak kecil (3px) sebagai jangkar aksen visual, mis. di samping
 * eyebrow header atau di sudut container hero. Murni dekoratif:
 *   - `aria-hidden="true"` → diabaikan screen reader.
 *   - `pointer-events-none` → tidak mencegat klik/tab/scroll.
 *   - `select-none` + `overflow-hidden` → tidak mengganggu seleksi / scroll.
 *
 * Aturan desain (references/neobrutalist-overlay-ornaments.md §2):
 *   - 0 raw hex, 0 inline style → hanya token Tailwind (`bg-accent`, `bg-ink`, …).
 */

export type DotMatrixColor = 'accent' | 'ink' | 'primary';

export interface DotMatrixProps extends HTMLAttributes<HTMLDivElement> {
  /** Jumlah baris titik. Default 4. */
  rows?: number;
  /** Jumlah kolom titik. Default 4. */
  cols?: number;
  /** Token warna titik. Default 'accent'. */
  color?: DotMatrixColor;
  className?: string;
}

/*
 * Catatan: `grid-cols-4` adalah nilai base untuk grid inline; jumlah kolom
 * aktual diatur lewat `gridTemplateColumns` melalui class arbitrary Tailwind
 * `grid-cols-[repeat(var(--cols),...)]`? — hindari inline style, jadi pakai
 * varian class statis yang aman untuk jumlah kolom yang lazim (2/3/4).
 * Grid dibangun sebagai baris `flex` agar jumlah kolom arbitrer tetap bebas
 * tanpa inline style.
 */
const DOT_COLOR_CLS: Record<DotMatrixColor, string> = {
  accent: 'bg-accent',
  ink: 'bg-ink/30',
  primary: 'bg-primary',
};

export function DotMatrix({
  rows = 4,
  cols = 4,
  color = 'accent',
  className = '',
  ...rest
}: DotMatrixProps) {
  const rowCount = Math.max(1, Math.floor(rows));
  const colCount = Math.max(1, Math.floor(cols));
  const dotClass = DOT_COLOR_CLS[color];

  return (
    <div
      aria-hidden="true"
      className={`inline-flex flex-col gap-1.5 select-none pointer-events-none ${className}`}
      {...rest}
    >
      {Array.from({ length: rowCount }, (_, rowIndex) => (
        <div key={rowIndex} className="flex gap-1.5">
          {Array.from({ length: colCount }, (_, colIndex) => (
            <span
              key={colIndex}
              className={`block w-1 h-1 border border-ink ${dotClass}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
