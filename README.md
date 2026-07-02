# enmarket — enpiistudio Store

Toko digital personal milik **enpiistudio** untuk menjual produk-produk digital: source code, lisensi, assets, dan sejenisnya. Self-hosted, single-seller, full control.

> Mirror konsep: Gumroad / Lemon Squeezy / Creative Market — tapi versi self-hosted & personal.

## Stack

| Layer | Teknologi |
|---|---|
| Backend / API | [Laravel 13](https://laravel.com) (PHP 8.4) |
| Frontend | [Next.js 15](https://nextjs.org) (App Router, TypeScript) |
| Database | MySQL 8 |
| File storage | EnStorage (Google Drive orchestrator enpiistudio) |
| Payment gateway | Tripay (QRIS Direct API) |
| Notifikasi WA | Evolution API |
| Workflow otomasi | n8n |
| Containerization | Docker Compose |

## Struktur Repo

```
.
├── apps/
│   ├── api/           Laravel 13 — REST API backend
│   └── web/           Next.js 15 — frontend (publik + admin)
├── infra/
│   ├── docker-compose.yml
│   ├── docker/        Dockerfile per service
│   └── nginx/         Template Nginx Proxy Manager
├── .github/workflows/ CI/CD (GitHub Actions)
└── .docs/             Spesifikasi produk & roadmap
```

## Memulai (Lokal)

Prasyarat: Docker Desktop, Node 22+, PHP 8.4+ & Composer (untuk development di luar container).

```bash
# 1. Copy env
cp .env.example .env

# 2. Build & jalankan
docker compose -f infra/docker-compose.yml up -d --build

# 3. Migrate database
docker compose -f infra/docker-compose.yml exec api php artisan migrate

# 4. Generate APP_KEY (otomatis oleh entrypoint jika kosong)
docker compose -f infra/docker-compose.yml exec api php artisan key:generate

# 5. Akses
# Web: http://localhost:3000
# API: http://localhost:8000
```

## Dokumentasi

Detail lengkap lihat folder [`.docs/`](./.docs):

- [`.docs/01-konsep-dan-fitur.md`](./.docs/01-konsep-dan-fitur.md) — Konsep produk & breakdown fitur
- [`.docs/02-arsitektur-aplikasi.md`](./.docs/02-arsitektur-aplikasi.md) — Tech stack, komponen, alur end-to-end
- [`.docs/03-struktur-database.md`](./.docs/03-struktur-database.md) — Skema 6 tabel + relasi
- [`.docs/04-roadmap-pengerjaan.md`](./.docs/04-roadmap-pengerjaan.md) — Roadmap 7 fase

## Status Roadmap

| Fase | Fokus | Status |
|---|---|---|
| 0 | Setup & fondasi | 🚧 In progress |
| 1 | Dashboard produk | ⏳ Pending |
| 2 | Halaman publik | ⏳ Pending |
| 3 | Pembelian & Tripay QRIS | ⏳ Pending |
| 4 | Pengiriman otomatis | ⏳ Pending |
| 5 | Dashboard pesanan & lisensi | ⏳ Pending |
| 6 | Polish & launch | ⏳ Pending |

## Lisensi

Proprietary — © enpiistudio. Tidak untuk distribusi publik.