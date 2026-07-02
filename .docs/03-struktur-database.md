# 03 — Struktur Database
# enpiistudio Store

---

## 1. Daftar Tabel

```
categories
products
orders
order_items
order_deliveries
license_keys
```

---

## 2. Skema Tabel

### `categories`
Kategori produk digital yang dijual.

```
categories
├── id                (PK)
├── nama              (varchar)
├── slug              (varchar, unique — untuk URL)
├── deskripsi         (text, nullable)
├── created_at, updated_at
```

---

### `products`
Produk digital yang dijual di toko.

```
products
├── id                (PK)
├── category_id       (FK → categories.id, nullable)
├── nama              (varchar)
├── slug              (varchar, unique — untuk URL)
├── deskripsi         (text)
├── harga             (decimal 10,2)
├── tipe              (enum: download | license | bundle)
│                     download  = hanya file, tanpa license key
│                     license   = hanya license key, tanpa file
│                     bundle    = file + license key
├── file_url          (text, nullable — path file di EnStorage)
├── download_expiry_days  (integer, default 7 — masa berlaku link download)
├── preview_images    (JSON array — URL gambar preview/screenshot)
├── fitur             (JSON array — daftar fitur/isi produk, untuk halaman detail)
├── status            (enum: aktif | draft | tidak_dijual)
├── created_at, updated_at
```

---

### `orders`
Transaksi pembelian oleh pembeli.

```
orders
├── id                (PK)
├── kode_order        (varchar, unique — misal: EPS-20240701-XXXX, untuk cek pesanan)
├── nama_pembeli      (varchar)
├── email_pembeli     (varchar)
├── wa_pembeli        (varchar)
├── total_harga       (decimal 10,2)
├── status            (enum: pending | paid | failed | expired | refunded)
├── tripay_reference  (varchar, nullable — reference dari Tripay)
├── qr_string         (text, nullable — raw QR string dari Tripay untuk generate QR code)
├── qr_url            (text, nullable — URL gambar QR code dari Tripay)
├── qr_expired_at     (timestamp, nullable — batas waktu QR berlaku)
├── paid_at           (timestamp, nullable)
├── created_at, updated_at
```

---

### `order_items`
Detail produk yang dibeli dalam satu order.

```
order_items
├── id                (PK)
├── order_id          (FK → orders.id)
├── product_id        (FK → products.id)
├── nama_produk       (varchar — snapshot nama saat transaksi)
├── harga_saat_beli   (decimal 10,2 — snapshot harga saat transaksi)
├── tipe_produk       (enum: download | license | bundle — snapshot tipe saat transaksi)
```

> Catatan: `nama_produk`, `harga_saat_beli`, dan `tipe_produk` sengaja di-snapshot saat transaksi terjadi — bukan relasi langsung ke `products` — agar riwayat pesanan tetap akurat meski produk diupdate atau dihapus di kemudian hari.

---

### `order_deliveries`
Rekaman pengiriman produk ke pembeli (link download & license key).

```
order_deliveries
├── id                (PK)
├── order_item_id     (FK → order_items.id)
├── download_token    (varchar, unique, nullable — untuk signed download URL)
├── download_url      (text, nullable — path file di EnStorage yang akan di-stream)
├── token_expired_at  (timestamp, nullable — kapan download link kadaluarsa)
├── license_key_id    (FK → license_keys.id, nullable)
├── email_sent_at     (timestamp, nullable)
├── wa_sent_at        (timestamp, nullable)
├── created_at, updated_at
```

---

### `license_keys`
License key yang di-generate per pembelian produk berlisensi.

```
license_keys
├── id                (PK)
├── product_id        (FK → products.id)
├── key               (varchar, unique — license key yang dikirim ke pembeli)
├── status            (enum: aktif | digunakan | kadaluarsa | dicabut)
├── activated_at      (timestamp, nullable)
├── expired_at        (timestamp, nullable)
├── created_at, updated_at
```

---

## 3. Relasi Antar Tabel

```
categories 1───N products

orders 1───N order_items
order_items N───1 products

order_items 1───1 order_deliveries
order_deliveries N───1 license_keys (nullable)

license_keys N───1 products
```

---

## 4. Catatan Desain

**Snapshot data di `order_items`**
`nama_produk`, `harga_saat_beli`, dan `tipe_produk` disimpan langsung di `order_items` (bukan cuma FK ke `products`) — supaya riwayat transaksi tetap akurat meski produk diubah harganya atau dihapus setelah transaksi terjadi. Ini pola standar untuk tabel order di sistem e-commerce.

**`kode_order` untuk cek pesanan tanpa login**
Pembeli tidak perlu akun — cukup gunakan `kode_order` (misal `EPS-20240701-A3KX`) + email untuk cek status pesanan di halaman publik. Format kode bisa dikonfigurasi, tapi cukup unik dan mudah dibaca.

**Download link sementara, bukan link permanen**
`download_token` di `order_deliveries` adalah token acak (UUID/random string) yang di-generate saat pembayaran sukses. Endpoint Laravel `/download/{token}` memvalidasi token + expiry sebelum stream file dari EnStorage — link tidak bisa disebarkan bebas karena ada batas waktu (`token_expired_at`). Pembeli bisa minta generate ulang token via halaman cek pesanan jika link kadaluarsa.

**`license_keys` terpisah dari `order_deliveries`**
Dipisah supaya satu license key bisa dikelola mandiri (dicabut, diperpanjang, dicek status) tanpa harus melalui order. Ini memudahkan pengelolaan lisensi di dashboard admin.

**Tidak ada tabel `users` untuk pembeli**
Pembeli tidak perlu registrasi atau login — ini kesederhanaan yang disengaja untuk v1. Identitas pembeli cukup dari `email_pembeli` + `kode_order` di tabel `orders`.

---

## 5. Contoh Data Flow Saat Pembelian

```
[1] Pembeli checkout produk "EnStore Source Code" seharga Rp 299.000

[2] Laravel insert:
    orders: { kode_order: "EPS-20240701-A3KX", email: "pembeli@gmail.com", 
              total: 299000, status: "pending",
              qr_string: "00020101...", qr_url: "https://tripay.co.id/qr/...",
              qr_expired_at: "2024-07-01 12:15:00" }
    order_items: { order_id: 1, product_id: 3, nama_produk: "EnStore Source Code",
                   harga_saat_beli: 299000, tipe_produk: "bundle" }

[3] Tripay callback sukses → Laravel update:
    orders: { status: "paid", tripay_reference: "T...", paid_at: now() }

[4] Laravel generate:
    license_keys: { product_id: 3, key: "ENSTORE-XXXX-XXXX-XXXX", status: "aktif" }
    order_deliveries: { order_item_id: 1, download_token: "uuid-random",
                        token_expired_at: now()+7days, license_key_id: 1 }

[5] Trigger n8n → kirim email + WA ke pembeli
    order_deliveries update: { email_sent_at: now(), wa_sent_at: now() }
```
