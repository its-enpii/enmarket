# 01 — Konsep & Fitur
# enpiistudio Store

> Toko digital personal milik enpiistudio untuk menjual produk-produk digital hasil pengembangan sendiri: source code, lisensi, assets, dan sejenisnya. Bukan platform multi-tenant — satu toko, satu pemilik, full control.

---

## 1. Positioning

| Aspek | Keputusan |
|---|---|
| Tipe platform | Toko digital personal (bukan marketplace multi-tenant) |
| Pemilik | enpiistudio (Enpii) — satu-satunya seller |
| Jenis produk | Produk digital: source code, lisensi, assets, dll |
| Pembayaran | Payment gateway otomatis via Tripay |
| Pengiriman produk | Otomatis via email dan/atau WhatsApp setelah pembayaran terkonfirmasi |
| Integrasi pengiriman | Evolution API + n8n (sudah tersedia di infrastruktur enpiistudio) |
| Branding | enpiistudio |

**Referensi konsep serupa**: Gumroad, Lemon Squeezy, Creative Market — tapi versi self-hosted dan personal, tanpa platform pihak ketiga.

---

## 2. Breakdown Fitur

### 2.1 Sisi Pembeli (Halaman Publik)

**Halaman Utama**
- Hero section (branding enpiistudio)
- Daftar produk unggulan / terbaru
- Filter & pencarian produk berdasarkan kategori dan kata kunci

**Halaman Kategori**
- Daftar produk per kategori (Source Code, Lisensi, Assets, dll)

**Halaman Detail Produk**
- Nama, deskripsi lengkap, harga
- Preview / screenshot produk
- Informasi lisensi yang berlaku
- Daftar fitur atau isi produk
- Tombol "Beli Sekarang"

**Alur Pembelian**
- Pembeli isi data diri (nama, email, nomor WA)
- Pembayaran via QRIS — QR code ditampilkan langsung di halaman (tanpa redirect ke luar aplikasi)
- Pembeli scan QR dari app manapun (GoPay, OVO, Dana, m-banking, dll)
- Halaman otomatis update setelah pembayaran terdeteksi
- Produk dikirim otomatis via email & WA
- Pembeli dapat halaman konfirmasi + ringkasan pembelian

**Halaman Cek Pesanan**
- Pembeli bisa cek status pesanan berdasarkan email atau kode order
- Tanpa perlu akun/login

### 2.2 Sisi Admin (Kamu — Dashboard Internal)

**Manajemen Produk**
- CRUD produk: nama, deskripsi, harga, kategori, preview image, file produk
- Upload file produk ke EnStorage (source code, asset, dll)
- Status produk: aktif / draft / tidak dijual

**Manajemen Kategori**
- CRUD kategori produk

**Manajemen Pesanan**
- Daftar semua pesanan (status, produk, pembeli, total)
- Detail pesanan per transaksi
- Kirim ulang produk manual (jika ada masalah pengiriman otomatis)

**Manajemen Lisensi**
- Generate & kelola license key per pembelian (untuk produk yang butuh lisensi)
- Validasi status lisensi (aktif / digunakan / kadaluarsa)

**Laporan Sederhana**
- Total pendapatan
- Produk terlaris
- Riwayat transaksi

### 2.3 Sistem Otomasi Pengiriman

Setelah Tripay mengirim callback pembayaran sukses ke Laravel:

```
Tripay callback → Laravel verifikasi signature → update status order
   │
   ├─→ Trigger n8n workflow "kirim produk"
   │     ├─→ Kirim email (link download / license key)
   │     └─→ Kirim WA via Evolution API (ringkasan + link/license)
   │
   └─→ Generate & simpan license key (jika produk berlisensi)
```

---

## 3. Jenis Produk & Lisensi

Karena yang dijual adalah produk digital dengan berbagai jenis, perlu dibedakan dari awal:

| Jenis Produk | Cara Pengiriman | Perlu License Key? |
|---|---|---|
| Source code (zip/repo) | Link download (dari EnStorage) | Opsional |
| Lisensi software | License key saja, tanpa file | Ya |
| Assets (gambar, font, template) | Link download | Tidak |
| Bundel (code + lisensi) | Link download + license key | Ya |

Pembeli mendapatkan **link download yang memiliki batas waktu akses** (bukan link permanen publik) — untuk mencegah link disebarkan bebas. Link di-generate saat pengiriman, bukan link langsung ke file EnStorage.

---

## 4. Yang Tidak Ada di V1

| Fitur | Alasan ditunda |
|---|---|
| Akun pembeli / login | Tidak perlu untuk toko personal — cek pesanan cukup via email/kode order |
| Review / rating produk | Bisa ditambah nanti setelah ada transaksi nyata |
| Kode diskon / voucher | Nice-to-have, bukan blocker fungsi inti |
| Afiliasi / referral | Terlalu kompleks untuk v1 |
| Multi-seller | Bukan tujuan platform ini |
| Keranjang belanja | Produk digital biasanya dibeli satu per satu — bisa ditambah v2 jika dibutuhkan |
