# 02 — Arsitektur Aplikasi
# enpiistudio Store

---

## 1. Tech Stack

| Layer | Teknologi |
|---|---|
| Backend / API | Laravel (versi terbaru) |
| Frontend | Next.js (App Router) |
| Database | MySQL / PostgreSQL |
| File storage | EnStorage (orchestrator Google Drive milik enpiistudio) |
| Payment gateway | Tripay |
| Notifikasi WA | Evolution API (instance "enpiistudio") |
| Workflow otomasi | n8n |
| Hosting | VPS enpiistudio (existing infrastructure) |
| Reverse proxy | Nginx Proxy Manager (existing) |
| SSL | Certbot via Cloudflare DNS (existing) |

---

## 2. Komponen Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js (Frontend)                       │
│  ┌──────────────────────┐    ┌──────────────────────────┐   │
│  │   Halaman Publik      │    │   Dashboard Admin         │   │
│  │  - Produk & Katalog   │    │  - Kelola Produk          │   │
│  │  - Detail Produk      │    │  - Kelola Pesanan         │   │
│  │  - Alur Pembelian     │    │  - Kelola Lisensi         │   │
│  │  - Cek Pesanan        │    │  - Laporan                │   │
│  └──────────┬───────────┘    └────────────┬─────────────┘   │
└─────────────┼──────────────────────────────┼─────────────────┘
              │                              │
              ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Laravel API (Backend)                      │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────────────┐  │
│  │  Produk &    │ │  Pesanan &  │ │  Lisensi & Download   │  │
│  │  Kategori    │ │  Pembayaran │ │  Link Generator       │  │
│  └─────────────┘ └──────┬──────┘ └──────────────────────┘  │
└────────────────────────┬─┴──────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
   ┌────────────┐ ┌───────────┐ ┌────────────────┐
   │  Database   │ │  Tripay   │ │   EnStorage    │
   │ MySQL/PgSQL │ │  (PG)     │ │ (File hosting) │
   └────────────┘ └─────┬─────┘ └────────────────┘
                        │
                        ▼ callback pembayaran sukses
                  ┌───────────┐
                  │    n8n    │
                  │ (workflow)│
                  └─────┬─────┘
                        │
              ┌─────────┴──────────┐
              ▼                    ▼
       ┌────────────┐      ┌──────────────┐
       │   Email    │      │ Evolution API│
       │  (SMTP)    │      │  (WA notif)  │
       └────────────┘      └──────────────┘
```

---

## 3. Alur Pembelian (End-to-End)

Pembayaran sepenuhnya di dalam aplikasi menggunakan **QRIS via Tripay Direct API** — tidak ada redirect ke halaman eksternal.

```
Pembeli buka halaman produk
   │
   ▼
Klik "Beli Sekarang" → isi data diri (nama, email, nomor WA)
   │
   ▼
Laravel buat order (status: PENDING)
→ request QRIS ke Tripay Direct API (channel: QRIS)
← Tripay return: qr_string + qr_url (image QR code)
   │
   ▼
Next.js tampilkan QR code di halaman (in-app, tanpa redirect)
+ tampilkan countdown timer (batas waktu pembayaran dari Tripay)
+ polling status order setiap beberapa detik
   │
   ▼
Pembeli scan QR dari app manapun (GoPay, OVO, Dana, m-banking)
   │
   ▼
Tripay kirim callback ke Laravel endpoint setelah pembayaran terdeteksi
   │
   ▼
Laravel verifikasi HMAC signature callback
   │
   ├── [GAGAL] → log error, abaikan
   │
   └── [SUKSES] → update order status: PAID
         │
         ├─→ Generate license key (jika produk berlisensi)
         ├─→ Generate signed download URL dengan batas waktu (jika ada file)
         ├─→ Simpan ke tabel order_deliveries
         │
         └─→ Trigger n8n webhook "kirim produk"
               ├─→ Kirim email (link download + license key)
               └─→ Kirim WA via Evolution API
   │
   ▼
Polling di frontend mendeteksi status PAID
→ halaman otomatis update: tampilkan konfirmasi sukses + ringkasan pembelian
```

**Catatan polling**: frontend polling ke endpoint Laravel `/api/orders/{kode_order}/status` setiap 3–5 detik selama halaman QR terbuka. Alternatif yang lebih efisien adalah **Server-Sent Events (SSE)** — tapi polling sederhana cukup untuk v1 dan lebih mudah diimplementasikan.

---

## 4. Sistem Download Link

File produk disimpan di EnStorage (Google Drive). Pembeli **tidak** mendapat link langsung ke Google Drive — melainkan link yang di-generate Laravel, berupa signed URL dengan batas waktu:

```
https://store.enpiistudio.com/download/{token}
```

- Token di-generate saat pembayaran sukses, disimpan di database
- Batas waktu akses: misal 7 hari sejak generate (bisa dikonfigurasi per produk)
- Endpoint `/download/{token}` di Laravel: validasi token → ambil file dari EnStorage → stream ke pembeli
- Setelah token kadaluarsa: pembeli bisa minta generate ulang via halaman cek pesanan

---

## 5. Rendering Strategy (Next.js)

| Halaman | Strategy | Alasan |
|---|---|---|
| Halaman utama / katalog | ISR | Produk jarang update tiap detik, tapi harus bisa fresh saat ada produk baru |
| Detail produk | ISR | Sama seperti katalog |
| Alur pembelian (form + redirect) | Client-side | Interaktif, personal per pembeli |
| Cek pesanan | SSR atau client-side fetch | Data real-time per pembeli |
| Dashboard admin | SSR atau client-side fetch | Data selalu fresh, tidak perlu di-cache publik |

On-demand revalidation dipanggil dari Laravel setiap kali produk ditambah/diupdate di dashboard admin — supaya halaman publik langsung update tanpa rebuild penuh.

---

## 6. Integrasi Tripay (QRIS Direct API)

Tripay dipilih karena:
- Sudah dipakai di EnStore (integrasi dan akun sudah ada)
- Dokumentasi bersih, familiar untuk Laravel
- Mendukung QRIS via Direct API — bisa ditampilkan in-app tanpa redirect

Metode yang dipakai: **QRIS (channel code: `QRIS` atau `QRISC` tergantung akun Tripay)**

Flow teknis:
```
Laravel → POST /v2/tri/create (Tripay Direct API)
          body: { method: "QRIS", merchant_ref, amount, ... }
       ← response: { qr_string, qr_url, expired_time, reference }

Next.js tampilkan QR dari qr_url (atau generate dari qr_string via library)
+ polling status ke Laravel setiap 3–5 detik

Pembeli scan & bayar

Tripay → POST /callback (Laravel endpoint)
       → Header: X-Callback-Token (HMAC SHA256 verification)
Laravel verifikasi signature → update order → trigger pengiriman produk
```

Verifikasi HMAC signature callback Tripay menggunakan pola yang sama dengan yang sudah diimplementasikan di n8n webhook (HMAC-SHA256) — tinggal diterapkan di sisi Laravel.

**Catatan penting**: Tripay Direct API memerlukan approval channel QRIS dari Tripay — pastikan channel ini sudah aktif di akun sebelum implementasi.
