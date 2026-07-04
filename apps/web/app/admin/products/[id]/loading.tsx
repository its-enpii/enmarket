import { PageFormLoading } from '@/components/admin/PageFormLoading';

/**
 * Skeleton untuk halaman edit produk.
 * Override parent (admin/products/loading.tsx) yang menampilkan table — bukan form.
 */
export default function EditProductLoading() {
  return <PageFormLoading fieldCount={6} includeTextarea includeActions />;
}
