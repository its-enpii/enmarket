import { PageFormLoading } from '@/components/admin/PageFormLoading';

/**
 * Skeleton untuk halaman tambah kategori.
 * Override parent (admin/categories/loading.tsx) yang menampilkan table — bukan form.
 */
export default function NewCategoryLoading() {
  return <PageFormLoading fieldCount={2} includeTextarea={false} includeActions />;
}
