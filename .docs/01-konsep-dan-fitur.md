# 01 — Konsep & Fitur
# EnStudio

> Personal showcase studio & layanan custom milik **Enpii** — tagline publik: *"Studio solo · Showcase karya digital, riset, dan layanan custom."* Studio ini memperlihatkan **cara** Enpii bekerja (riset dan jurnal proses) sekaligus membagikan **hasilnya** sebagai artefak digital yang bisa dibeli dan sebagai jasa custom build. Bukan platform multi-tenant — satu studio, satu pemilik, full control.

---

## 1. Positioning

| Aspek | Keputusan |
|---|---|
| Tipe platform | Personal showcase studio + layanan custom — bukan marketplace multi-tenant, dan bukan sekadar toko |
| Pemilik | Enpii — solo studio, satu-satunya kreator & seller |
| Brand publik | **EnStudio** (navbar, footer, metadata SEO). Ditulis `enpiistudio` hanya sebagai identitas teknis internal — lihat catatan di bawah |
| Tiga pilar | **Discover** (riset & eksplorasi, `/discover`) · **Develop** (artefak digital siap dipakai, `/develop` + `/katalog`) · **Display** (jurnal proses, `/display`) |
| Jenis produk | Artefak digital hasil pengembangan sendiri: source code, lisensi, assets, bundle, dan akun manual (`account_manual`) |
| Layanan custom | Form **Custom Build** di `/layanan`: konsultasi, desain arsitektur, dan pembuatan software end-to-end (website, SaaS, mobile, otomasi). Masuk sebagai *custom request* yang dikelola admin |
| Pembayaran | Payment gateway otomatis via **Tripay** dan **Duitku** — admin mengaktifkan per gateway lewat *site settings*, pembeli memilih channel (QRIS / VA / e-wallet / convenience store) |
| Pengiriman produk | Otomatis via email dan/atau WhatsApp setelah pembayaran terkonfirmasi |
| Integrasi pengiriman | Laravel Mail + WhatsApp webhook agent Enpii (langsung dari backend, tanpa n8n) |
| Sponsor | Band sponsor di homepage + halaman `/sponsor` dengan pengajuan bid publik & leaderboard; otomatis aktif setelah pembayaran lunas |
| Yang bukan | Bukan agency dengan tim, bukan marketplace seller lain, bukan portofolio klien — karya di sini milik studio sendiri |

**Identitas teknis vs brand publik.** `enpiistudio` masih hidup di level infrastruktur: domain `store.enpiistudio.com`, seeder `studio_name`, dan pemancar email `noreply@enpiistudio.com`. Brand yang dilihat pengunjung tetap **EnStudio**; saat mengubah `studio_name` di admin, yang berubah hanya tampilan publik, bukan hostname atau alamat email.

**Referensi konsep serupa**: Gumroad / Lemon Squeezy untuk sisi *Develop*, personal site & digital garden untuk sisi *Discover* dan *Display* — tapi versi self-hosted dan personal, tanpa platform pihak ketiga.

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

Setelah Tripay mengirim callback pembayaran sukses ke Laravel (atau langsung saat checkout produk gratis):

```
Tripay callback → Laravel verifikasi signature → update status order
   │
   ├─→ Generate & simpan license key (jika produk berlisensi)
   │
   └─→ NotificationDispatcher kirim notifikasi langsung:
         ├─→ Email via Laravel Mail (invoice + link download / license key)
         └─→ WA via WhatsApp webhook agent enpiistudio (ringkasan + link/license)
```

**Produk gratis**: produk dengan flag `is_free` dijual Rp 0 — checkout skip payment gateway, order langsung berstatus `free`, dan produk bisa diunduh segera. Cart campuran free+berbayar ditolak (harus dipisah jadi dua pesanan).

---

## 3. Jenis Produk & Lisensi

Karena yang dijual adalah produk digital dengan berbagai jenis, perlu dibedakan dari awal:

| Jenis Produk | Cara Pengiriman | Perlu License Key? |
|---|---|---|
| Source code (zip/repo) | Link download (dari EnStorage) | Opsional |
| Lisensi software | License key saja, tanpa file | Ya |
| Assets (gambar, font, template) | Link download | Tidak |
| Bundel (code + lisensi) | Link download + license key | Ya |
| Produk gratis (`is_free`) | Link download / license — checkout skip pembayaran | Opsional |
| Akun manual (`account_manual`) | Aktivasi manual admin → kredensial dikirim via email & WA | Tidak |

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

> **Catatan**: keranjang belanja sudah diimplementasikan (berlawanan rencana awal "v1 tanpa keranjang"), termasuk aturan cart all-or-nothing: cart campuran pre-order+reguler atau free+berbayar ditolak saat checkout.
