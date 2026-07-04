import { PageFormLoading } from '@/components/admin/PageFormLoading';

/**
 * Skeleton untuk halaman edit kategori.
 * Override parent (admin/categories/loading.tsx) yang menampilkan table — bukan form.
 */
export default function EditCategoryLoading() {
  return <PageFormLoading fieldCount={2} includeTextarea={false} includeActions />;
}
