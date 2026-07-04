'use client';

import type { ReactNode } from 'react';

import { TableSkeleton } from './TableSkeleton';
import { useAdminList } from './AdminListProvider';

interface Props {
  /** Jumlah kolom — dipakai TableSkeleton untuk render baris skeleton. */
  columnCount: number;
  /** Lebar tiap kolom (CSS string). Optional, fallback ke array deterministik. */
  columnWidths?: (string | undefined)[];
  /** Jumlah skeleton baris. Default 10. Biasanya = per_page. */
  skeletonCount?: number;
  children: ReactNode;
}

/**
 * Wrapper Client Component yang pilih antara skeleton (saat pending) atau
 * children (DataTable asli). Memakai useAdminList() untuk baca state
 * useTransition shared dengan LiveFilterBar.
 *
 * Catatan: tidak terima Column<T>[] secara langsung karena function `render`
 * tidak bisa di-serialize dari Server Component ke Client Component.
 * Cukup column count + widths (string serializable).
 */
export function DataTableArea({
  columnCount,
  columnWidths,
  skeletonCount = 10,
  children,
}: Props) {
  const { pending } = useAdminList();

  if (pending) {
    return (
      <TableSkeleton
        columnCount={columnCount}
        columnWidths={columnWidths}
        count={skeletonCount}
      />
    );
  }
  return <>{children}</>;
}