/**
 * Tipe data untuk komunikasi antara Next.js ↔ Laravel API.
 * Sesuaikan dengan Resource shape di apps/api/app/Http/Resources/.
 */

export type StatusProduct = 'aktif' | 'draft' | 'tidak_dijual';
export type TipeProduct = 'download' | 'license' | 'bundle' | 'account_manual';

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
  // Pre-order fields. Null/undefined untuk produk non-pre-order.
  // release_date/deposit_percent/deposit_amount/remaining_amount nullable
  // ketika is_pre_order=false (lihat ProductResource).
  is_pre_order: boolean;
  release_date?: string | null;
  deposit_percent?: number | null;
  deposit_amount?: number | null;
  remaining_amount?: number | null;
  needs_license_key: boolean;
  has_downloadable_file: boolean;
  /** Blog posts yang di-link dari produk ini (panduan, warning, catatan teknis). */
  linked_posts?: LinkedPost[];
  created_at: string | null;
  updated_at: string | null;
}

/** Snapshot ringkas post yang di-link dari produk — buyer-facing. */
export interface LinkedPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  thumbnail: string | null;
  urutan?: number;
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

// ───── Admin: Site Settings, Maintenance, Activity ─────

export interface SiteIdentity {
  studio_name: string | null;
  tagline: string | null;
  logo_url: string | null;
}

export interface SocialLink {
  label: string;
  url: string;
}

export type SiteSocial = SocialLink[];

/** Public site-config yang aman di-expose ke storefront. */
export interface PublicSiteConfig {
  studio_name: string | null;
  tagline: string | null;
  logo_url: string | null;
  social: SiteSocial;
  footer: SiteFooter;
}

export interface SiteFooter {
  text: string | null;
}

export interface SitePayment {
  tripay_merchant: string | null;
  tripay_api_key_masked: string | null;
  tripay_private_key_masked: string | null;
  tripay_mode: 'sandbox' | 'production';
}

export interface SiteChannels {
  qris: boolean;
  va: boolean;
  ewallet: boolean;
  convenience_store: boolean;
}

export interface SiteMaintenanceConfig {
  message: string | null;
}

export interface SiteSettings {
  identity: SiteIdentity;
  social: SiteSocial;
  footer: SiteFooter;
  payment: SitePayment;
  channels: SiteChannels;
  maintenance: SiteMaintenanceConfig;
}

export interface MaintenanceStatus {
  enabled: boolean;
  message: string | null;
}

export interface ActivityLog {
  id: number;
  action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'maintenance_toggled';
  subject_type: string;
  subject_id: number | null;
  subject_label: string | null;
  changes: Record<string, unknown> | null;
  actor: string;
  created_at: string | null;
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

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'refunded' | 'preorder_deposit_paid';
export type TipeOrder = 'download' | 'license' | 'bundle' | 'account_manual';

export interface OrderDeliveryInfo {
  has_download: boolean;
  download_token: string | null;
  download_url: string | null;
  token_expired_at: string | null;
  license_key: string | null;
  email_sent_at: string | null;
  wa_sent_at: string | null;
}

export interface OrderItem {
  id: number;
  product_id: number;
  nama_produk: string;
  harga_saat_beli: string;
  harga_saat_beli_formatted: string;
  tipe_produk: TipeOrder;
  delivery?: OrderDeliveryInfo | null;
  account_provisioning?: AccountProvisioningInfo | null;
}

/** Account provisioning info (untuk produk bertipe `account_manual`). */
export interface AccountProvisioningInfo {
  status: 'menunggu_admin' | 'siap' | 'gagal' | 'dibatalkan';
  is_ready: boolean;
  /** Null sampai status='siap'. Sembunyikan di UI saat masih menunggu. */
  credentials: { username?: string; password?: string; server?: string; profile?: string; expiry?: string } | null;
  catatan: string | null;
  ready_at: string | null;
  email_sent_at: string | null;
  wa_sent_at: string | null;
}

export interface Order {
  kode_order: string;
  nama_pembeli: string;
  email_pembeli: string;
  wa_pembeli: string;
  total_harga: string;
  total_harga_formatted: string;
  status: OrderStatus;
  // Pre-order fields — null/undefined untuk non-preorder orders.
  is_preorder?: boolean;
  preorder_release_date?: string | null;
  preorder_deposit_amount?: string | null;
  preorder_remaining_amount?: string | null;
  preorder_deposit_paid_at?: string | null;
  preorder_release_processed_at?: string | null;
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
  is_preorder?: boolean;
  preorder_release_date?: string | null;
  item_count?: number;
}

// ───── Admin: Order stats & License keys ─────

export type LicenseStatus = 'aktif' | 'digunakan' | 'kadaluarsa' | 'dicabut';

export interface AdminOrderStats {
  total: number;
  pending: number;
  paid: number;
  failed: number;
  expired: number;
  refunded: number;
  /** Raw number (decimal), frontend format pakai formatRupiah */
  revenue_month: number;
  paid_month: number;
}

export interface AdminLicenseKey {
  id: number;
  product_id: number;
  product: { id: number; nama: string; slug: string } | null;
  key: string;
  status: LicenseStatus;
  activated_at: string | null;
  expired_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  deliveries_count?: number;
}

/** Status label Indonesia untuk Order. */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  expired: 'Expired',
  refunded: 'Refunded',
  preorder_deposit_paid: 'DP Diterima',
};

/** Status label Indonesia untuk LicenseKey. */
export const LICENSE_STATUS_LABEL: Record<LicenseStatus, string> = {
  aktif: 'Aktif',
  digunakan: 'Digunakan',
  kadaluarsa: 'Kadaluarsa',
  dicabut: 'Dicabut',
};

/** Status label Indonesia untuk AccountProvisioning. */
export type ProvisioningStatus = 'menunggu_admin' | 'siap' | 'gagal' | 'dibatalkan';
export const PROVISIONING_STATUS_LABEL: Record<ProvisioningStatus, string> = {
  menunggu_admin: 'Menunggu Admin',
  siap: 'Siap',
  gagal: 'Gagal',
  dibatalkan: 'Dibatalkan',
};

/** Statistik antrian provisioning (untuk dashboard tile). */
export interface AdminProvisioningStats {
  menunggu_admin: number;
  siap: number;
  gagal: number;
  dibatalkan: number;
  total: number;
}

/** Row provisioning untuk halaman admin/account-provisionings. */
export interface AdminProvisioning {
  id: number;
  order_item_id: number;
  status: ProvisioningStatus;
  credentials: Record<string, string> | null;
  catatan_admin: string | null;
  ready_by_admin: string | null;
  ready_at: string | null;
  email_sent_at: string | null;
  wa_sent_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  orderItem: {
    id: number;
    product_id: number;
    nama_produk: string;
    tipe_produk: TipeOrder;
    order: {
      id: number;
      kode_order: string;
      nama_pembeli: string;
      email_pembeli: string;
      status: OrderStatus;
      paid_at: string | null;
    } | null;
  } | null;
}

// ───── Blog post (Catatan) ─────

export type PostStatus = 'draft' | 'published' | 'archived';

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  /** HTML dari Tiptap editor. Disertakan admin-only via flag, publik dapat via `post(slug)`. */
  content?: string;
  thumbnail: string | null;
  status: PostStatus;
  published_at: string | null;
  /** Estimasi baca, dihitung di backend. Default 1. */
  reading_time_minutes?: number;
  created_at: string | null;
  updated_at: string | null;
}

/** Status label Indonesia untuk Post. */
export const POST_STATUS_LABEL: Record<PostStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Diarsipkan',
};