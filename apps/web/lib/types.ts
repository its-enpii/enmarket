/**
 * Tipe data untuk komunikasi antara Next.js ↔ Laravel API.
 * Sesuaikan dengan Resource shape di apps/api/app/Http/Resources/.
 */

export type StatusProduct = 'aktif' | 'draft' | 'tidak_dijual';

export type PaymentGateway = 'tripay' | 'duitku';

export interface PaymentGatewayConfig {
  enabled: boolean;
}

export type PaymentGatewaysMap = Record<PaymentGateway, PaymentGatewayConfig>;

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
  // Produk gratis: badge "Gratis" menggantikan price display. harga selalu '0'
  // di DB (auto-set backend). Checkout skip payment gateway, status order='free'.
  is_free: boolean;
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
  rating_summary?: ProductRatingSummary;
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
  payment_gateways: PaymentGatewaysMap;
  sponsors?: PublicSponsor[];
}

export interface SiteFooter {
  text: string | null;
}

export interface SitePayment {
  tripay_merchant: string | null;
  tripay_api_key_masked: string | null;
  tripay_private_key_masked: string | null;
  tripay_mode: 'sandbox' | 'production';
  duitku_merchant_code: string | null;
  duitku_api_key_masked: string | null;
  duitku_mode: 'sandbox' | 'production';
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
  payment_gateways: PaymentGatewaysMap;
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

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'refunded' | 'preorder_deposit_paid' | 'free';
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
  id?: number;
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
  free: 'Gratis',
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
// ───── Wishlist ─────

export interface WishlistItem {
  id: number;
  session_id: string;
  product_id: number;
  product: Product;
  created_at: string | null;
  updated_at: string | null;
}

export interface WishlistResponse {
  data: WishlistItem[];
  count: number;
}

// ───── Coupons ─────

export type CouponType = 'percent' | 'fixed';

export interface Coupon {
  id: number;
  code: string;
  type: CouponType;
  value: number;
  min_order: number | null;
  max_uses: number | null;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  active: boolean;
  is_valid?: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface CouponStats {
  total: number;
  active: number;
  inactive: number;
  expired: number;
}

export interface ApplyCouponResult {
  valid: boolean;
  discount_amount: number;
  final_total: number;
  message: string;
}

// ───── Custom Requests ─────

export type JenisProyek = 'website' | 'mobile-app' | 'webapp' | 'automation' | 'other';
export type BudgetRange = '<5jt' | '5-15jt' | '15-50jt' | '50jt+' | 'discuss';
export type Timeline = '<2minggu' | '2-4minggu' | '1-3bulan' | '3-6bulan' | 'flexible';
export type CustomRequestStatus = 'baru' | 'diproses' | 'selesai' | 'dibatalkan';

export interface CustomRequest {
  id: number;
  nama: string;
  email: string;
  wa: string;
  jenis_proyek: JenisProyek;
  deskripsi: string;
  budget_range: BudgetRange;
  timeline: Timeline;
  status: CustomRequestStatus;
  status_label?: string;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CustomRequestStats {
  total: number;
  baru: number;
  diproses: number;
  selesai: number;
  dibatalkan: number;
}

// ───── Customer Auth & Account ─────

export interface CustomerUser {
  id: number;
  name: string | null;
  email: string | null;
  phone: string;
  is_admin: boolean;
  phone_verified_at: string | null;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string | null;
}


// ───── Reviews ─────

export interface ProductRatingSummary {
  average: number;
  count: number;
  distribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
}

export interface Review {
  id: number;
  product_id: number;
  product?: {
    id: number;
    nama: string;
    slug: string;
  };
  order_id: number;
  order_kode?: string;
  user_id?: number | null;
  buyer_name: string;
  rating: number;
  comment?: string | null;
  is_published: boolean;
  admin_notes?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ReviewStats {
  total: number;
  published: number;
  hidden: number;
  average_rating: number;
}

// ───── Game Top-up ─────

export interface Game {
  id: number;
  slug: string;
  nama: string;
  brand: string | null;
  icon_url: string | null;
  banner_url: string | null;
  requires_server_id: boolean;
  description: string | null;
  sort_order: number;
  active: boolean;
  digiflazz_category: string | null;
  items?: GameItem[];
  created_at: string | null;
  updated_at: string | null;
}

export interface GameItem {
  id: number;
  game_id: number;
  nama: string;
  harga: string;
  harga_formatted: string;
  digiflazz_sku: string;
  digiflazz_category: string | null;
  sort_order: number;
  active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface TopupPreview {
  game: string;
  item: string;
  harga: string;
  harga_formatted: string;
  total: number;
  contact_type: string;
  contact_value: string;
  payment_gateways: string[];
}

export type TopupStatus = 'pending' | 'processing' | 'success' | 'failed';

export interface TopupOrder extends Order {
  id: number;
  is_topup_order: boolean;
  game_id: number | null;
  game_item_id: number | null;
  game_user_id: string | null;
  game_server_id: string | null;
  contact_type: string | null;
  contact_value: string | null;
  topup_status: TopupStatus | null;
  digiflazz_trx_id: string | null;
  payment_gateway: string | null;
  game?: { id: number; nama: string; slug: string; icon_url: string | null } | null;
  game_item?: { id: number; nama: string; harga: string } | null;
}

export interface PublicSponsor {
  id: number;
  name: string;
  url: string;
  logo_url: string | null;
  description: string | null;
}

export interface Sponsor {
  id: number;
  domain: string;
  name: string;
  url: string;
  logo_url: string | null;
  description: string | null;
  fetched_description: string | null;
  amount: string;
  is_active: boolean;
  fetched_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}
