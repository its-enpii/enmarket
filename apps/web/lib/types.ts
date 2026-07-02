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

// ───── Cart ─────

export interface CartItem {
  product_id: number;
  qty: number;
  product: Product;
  subtotal: number;
  subtotal_formatted: string;
}

export interface Cart {
  session_id: string;
  expires_at: string | null;
  items: CartItem[];
  total: number;
  total_formatted: string;
  item_count: number;
}

// ───── Order ─────

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'refunded';
export type TipeOrder = 'download' | 'license' | 'bundle';

export interface OrderItem {
  id: number;
  product_id: number;
  nama_produk: string;
  harga_saat_beli: string;
  harga_saat_beli_formatted: string;
  tipe_produk: TipeOrder;
}

export interface Order {
  kode_order: string;
  nama_pembeli: string;
  email_pembeli: string;
  wa_pembeli: string;
  total_harga: string;
  total_harga_formatted: string;
  status: OrderStatus;
  tripay_reference: string | null;
  qr_string: string | null;
  qr_url: string | null;
  qr_expired_at: string | null;
  paid_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  items?: OrderItem[];
}

export interface OrderStatusSummary {
  kode_order: string;
  status: OrderStatus;
  paid_at: string | null;
  qr_expired_at: string | null;
  total_harga_formatted: string;
  item_count?: number;
}