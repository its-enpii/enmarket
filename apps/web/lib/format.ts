/**
 * Helper format tampilan UI.
 */

/** Format angka ke Rupiah string. Support input number atau string decimal. */
export function formatRupiah(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(num)) return 'Rp 0';
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.round(num));
}

/** Format ISO date jadi dd MMM yyyy (id-ID). */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/** Format ISO datetime jadi dd MMM yyyy HH:mm (id-ID). */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

/** Slugify string — fallback kalau backend tidak auto-generate. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Label bahasa Indonesia untuk enum. */
export const STATUS_LABEL: Record<string, string> = {
  aktif: 'Aktif',
  draft: 'Draft',
  tidak_dijual: 'Tidak Dijual',
};

export const TIPE_LABEL: Record<string, string> = {
  download: 'Download',
  license: 'License',
  bundle: 'Bundle',
};

/** Extract relative path dari URL/file_url storage. */
export function extractStoragePath(url: string | null): string | null {
  if (!url) return null;
  // Laravel storage path biasanya "enstorage/products/..."
  // Strip leading "/storage/" kalau ada
  if (url.startsWith('/storage/')) return url.substring('/storage/'.length);
  return url;
}