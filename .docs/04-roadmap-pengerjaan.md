# 04 — Roadmap Pengerjaan
# enpiistudio Store

> Roadmap ini disusun dari yang paling fundamental ke paling dependen — tiap fase bisa ditest secara mandiri sebelum lanjut ke fase berikutnya.

---

## Fase 0 — Setup & Fondasi

**Tujuan**: Project berjalan di lokal dan VPS, struktur dasar siap.

- [ ] Init project Laravel (API) + Next.js (frontend)
- [ ] Setup database & jalankan migration semua tabel (`categories`, `products`, `orders`, `order_items`, `order_deliveries`, `license_keys`)
- [ ] Setup Docker Compose (Laravel + Next.js + DB)
- [ ] Konfigurasi Nginx Proxy Manager untuk domain store (misal `store.enpiistudio.com`)
- [ ] Setup SSL via Certbot + Cloudflare DNS
- [ ] Setup GitHub repo + CI/CD via GitHub Actions (reuse pola yang sudah ada di infrastruktur enpiistudio)
- [ ] Integrasi awal EnStorage untuk upload & retrieve file

**Deliverable**: Aplikasi kosong bisa diakses di domain, database terbentuk.

---

## Fase 1 — Manajemen Produk (Dashboard Admin)

**Tujuan**: Kamu bisa tambah & kelola produk dari dashboard.

- [ ] Auth admin sederhana (single user — kamu sendiri, cukup dengan token/session, tidak perlu sistem registrasi)
- [ ] CRUD kategori
- [ ] CRUD produk:
  - Upload file produk ke EnStorage
  - Upload preview images ke EnStorage
  - Set harga, tipe (download/license/bundle), status, fitur
- [ ] Halaman daftar produk di dashboard admin

**Deliverable**: Kamu bisa tambah produk lewat dashboard, data tersimpan di database.

---

## Fase 2 — Halaman Publik & Katalog

**Tujuan**: Pembeli bisa browse dan lihat produk.

- [ ] Halaman utama (hero + daftar produk unggulan/terbaru)
- [ ] Halaman katalog (semua produk, filter kategori, pencarian)
- [ ] Halaman detail produk (deskripsi, harga, fitur, preview images, tombol beli)
- [ ] Setup ISR + on-demand revalidation (dipanggil dari Laravel saat produk diupdate)
- [ ] SEO dasar: `generateMetadata()` per halaman produk (title, description, OG image)

**Deliverable**: Toko bisa dibuka publik, produk tampil dengan benar.

---

## Fase 3 — Alur Pembelian & Integrasi Tripay QRIS

**Tujuan**: Pembeli bisa melakukan transaksi end-to-end sepenuhnya di dalam aplikasi.

- [ ] Form checkout (nama, email, nomor WA) — tanpa pilih metode, QRIS satu-satunya
- [ ] Laravel: buat order (status `pending`) → request QRIS ke Tripay Direct API → return `qr_string` + `qr_url` + `expired_time`
- [ ] Halaman pembayaran in-app:
  - Tampilkan QR code (dari `qr_url` atau generate dari `qr_string`)
  - Countdown timer sampai QR expired
  - Polling status order ke Laravel setiap 3–5 detik
- [ ] Endpoint polling status: `GET /api/orders/{kode_order}/status` (return status order saat ini)
- [ ] Endpoint callback Tripay di Laravel:
  - Verifikasi HMAC signature
  - Update status order (`paid` / `failed` / `expired`)
- [ ] Frontend: deteksi status `paid` dari polling → otomatis update halaman ke konfirmasi sukses
- [ ] Halaman konfirmasi sukses (ringkasan pembelian, info bahwa produk segera dikirim)
- [ ] Halaman cek pesanan publik (input `kode_order` + email → tampilkan status & detail)
- [ ] Pastikan channel QRIS sudah aktif di akun Tripay sebelum test

**Deliverable**: Transaksi QRIS bisa dilakukan in-app dari awal sampai akhir tanpa keluar aplikasi, order tercatat di database.

---

## Fase 4 — Pengiriman Produk Otomatis

**Tujuan**: Produk terkirim otomatis ke pembeli setelah bayar.

- [ ] Generate `download_token` + `token_expired_at` setelah payment sukses
- [ ] Generate `license_key` untuk produk bertipe `license` atau `bundle`
- [ ] Simpan ke `order_deliveries`
- [ ] Endpoint `/download/{token}` di Laravel:
  - Validasi token & expiry
  - Stream file dari EnStorage ke pembeli
- [ ] Setup n8n workflow "kirim produk":
  - Trigger: webhook dari Laravel (setelah order `paid`)
  - Action 1: kirim email (link download + license key)
  - Action 2: kirim WA via Evolution API
- [ ] Update `email_sent_at` dan `wa_sent_at` di `order_deliveries` setelah terkirim
- [ ] Fitur "kirim ulang" di dashboard admin (jika pengiriman otomatis gagal)

**Deliverable**: Produk terkirim otomatis via email & WA setelah pembayaran sukses.

---

## Fase 5 — Manajemen Pesanan & Lisensi (Dashboard Admin)

**Tujuan**: Kamu bisa monitor dan kelola semua transaksi & lisensi.

- [ ] Halaman daftar pesanan (filter status, cari by email/kode order)
- [ ] Halaman detail pesanan (data pembeli, produk, status pengiriman)
- [ ] Manajemen license key (lihat status, cabut, perpanjang)
- [ ] Regenerate download link (untuk pembeli yang link-nya sudah expired)
- [ ] Laporan sederhana: total pendapatan, produk terlaris, riwayat transaksi

**Deliverable**: Dashboard lengkap untuk operasional toko sehari-hari.

---

## Fase 6 — Polish & Launch

**Tujuan**: Siap dipakai publik dengan kualitas yang layak.

- [ ] Desain UI halaman publik (branding enpiistudio — konsisten dengan identitas visual)
- [ ] Responsif mobile untuk semua halaman publik
- [ ] Halaman 404 & error handling yang proper
- [ ] Rate limiting pada endpoint checkout & download (mencegah abuse)
- [ ] Test end-to-end alur pembelian di Tripay sandbox
- [ ] Test pengiriman email & WA
- [ ] QA lintas browser & device
- [ ] Umumkan ke publik / early users

---

## Ringkasan Fase

| Fase | Fokus | Output Utama |
|---|---|---|
| 0 | Setup & fondasi | Project live di domain |
| 1 | Dashboard produk | Bisa tambah & kelola produk |
| 2 | Halaman publik | Toko bisa dibrowse publik |
| 3 | Pembelian & Tripay | Transaksi end-to-end berjalan |
| 4 | Pengiriman otomatis | Produk terkirim via email & WA |
| 5 | Dashboard pesanan & lisensi | Operasional toko terkontrol |
| 6 | Polish & launch | Siap dipakai publik |

---

## Catatan Prioritas

- **Fase 0–4 adalah inti** — tanpa keempatnya, toko belum bisa beroperasi
- **Fase 5** bisa dikerjakan paralel dengan Fase 4 (bagian dashboard pesanan bisa dimulai lebih awal)
- **Fase 6** bisa dikerjakan bertahap sejak Fase 2 (desain UI bisa paralel dengan backend)
- Fase 1–4 bisa dikerjakan dalam urutan yang agak fleksibel, tapi Fase 3 harus setelah Fase 1 (butuh produk yang ada untuk di-checkout)
