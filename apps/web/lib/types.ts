/**
 * Tipe data untuk komunikasi antara Next.js ↔ Laravel API.
 * Sesuaikan dengan Resource shape di apps/api/app/Http/Resources/.
 */

export type StatusProduct = 'aktif' | 'draft' | 'tidak_dijual';
export type TipeProduct = 'download' | 'license' | 'bundle';

export interface Category {
  id: number;
  nama: string;
  slug: string;
  deskripsi: string | null;
  products_count?: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface Product {
  id: number;
  category_id: number | null;
  category: Pick<Category, 'id' | 'nama' | 'slug'> | null;
  nama: string;
  slug: string;
  deskripsi: string;
  harga: string; // decimal di-cast ke string
  harga_formatted: string;
  tipe: TipeProduct;
  file_url: string | null;
  download_expiry_days: number | null;
  preview_images: string[];
  fitur: string[];
  status: StatusProduct;
  is_featured: boolean;
  needs_license_key: boolean;
  has_downloadable_file: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface SingleResponse<T> {
  data: T;
  message?: string;
}

export interface ProductStats {
  total: number;
  aktif: number;
  draft: number;
  tidak_dijual: number;
}

export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}