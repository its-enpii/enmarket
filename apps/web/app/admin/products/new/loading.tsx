import { PageFormLoading } from '@/components/admin/PageFormLoading';

/**
 * Skeleton untuk halaman tambah produk.
 * Override parent (admin/products/loading.tsx) yang menampilkan table — bukan form.
 */
export default function NewProductLoading() {
  return <PageFormLoading fieldCount={6} includeTextarea includeActions />;
}
