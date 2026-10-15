# Enmarket — Design System (Neobrutalism EnStudio)

Dokumen ini adalah **sumber kebenaran desain implementasi** untuk seluruh antarmuka
enmarket (storefront publik, akun customer, dan admin). Spesifikasi asli generik ada di
`.design/DESIGN.md`; dokumen ini mencatat **status nyata di kode** — bila keduanya
berbeda, yang berlaku adalah kode dan dokumen ini.

Cakupan: `apps/web` (Next.js 15 App Router, React 19, Tailwind CSS v4, next-intl).

---

## 1. Prinsip

1. **Satu tema, satu identitas.** Neobrutalism EnStudio bersifat *single-theme* —
   dark mode auto dimatikan di `globals.css`. Tidak ada varian tema kedua.
2. **Flat, tegas, tanpa kelembutan.** Dilarang gradient, blur, glassmorphism, dan
   decorative softness. Warna selalu solid (*printed-matter*).
3. **Sudut selalu tajam.** `* { border-radius: 0 }` ditegakkan global di
   `globals.css` — berlaku untuk semua elemen tanpa kecuali.
4. **Mekanik *press-down*, bukan lift.** Elemen interaktif "menekan ke arah
   bayangannya" saat disentuh (bayangan mengecil + translate positif) — meniru klik
   tombol mekanis fisik. Ini kebalikan dari gaya material "terangkat".
5. **Komponen dulu (component-first).** Halaman tidak menulis markup mentah —
   lihat §8.
6. **Ornamen menyatu, tidak berisik.** Hiasan berupa lapisan *tonal* pada
   background (lihat §7) — bukan stiker warna mencolok yang berebut dengan konten.

---

## 2. Palet Warna

Didefinisikan di `apps/web/app/globals.css` (`@theme inline`) — **satu-satunya
sumber warna**. File TSX/TS dilarang memuat hex mentah.

| Token | Hex | Peran |
|---|---|---|
| `primary` | `#3D348B` | Deep indigo — tombol utama, link, blok struktural besar |
| `accent` | `#E6AF2E` | Mustard — highlight, hover, status aktif, label harga |
| `surface` | `#F3F3F3` | Off-white — kanvas halaman & kartu |
| `ink` | `#040303` | Near-black — teks, seluruh border, hard shadow |
| `success` | `#276749` | Status sukses |
| `danger` | `#C53030` | Status gagal/berbahaya |
| `warning` | `#D69E2E` | Status peringatan |

Alias: `background = surface`, `foreground = ink`.

Aturan:
- `accent` dipakai **hemat** (CTA & highlight prioritas) — bukan warna latar luas.
- Teks di atas `primary` harus `text-surface`; teks di atas `accent` harus `text-ink`.
- Overlay/hiasan background hanya memakai `ink` ber-alpha rendah
  (`text-ink/15`–`text-ink/40`, `border-ink/15`–`border-ink/25`) — tanpa warna
  brand pekat (lihat §7).

---

## 3. Tipografi

Tiga font, dibebankan via `next/font/google` pada `app/[locale]/layout.tsx` sebagai CSS variable:

| Peran | Font | Variabel |
|---|---|---|
| Display headline | **Anybody** (700/800/900) | `--font-anybody` → `font-display` |
| Body | **Hanken Grotesk** (400/700) | `--font-hanken-grotesk` → `font-sans` |
| Label/metadata | **JetBrains Mono** (700) | `--font-jetbrains-mono` → `font-mono` |

Token ukuran (`@theme inline` → kelas Tailwind `text-*`):

| Token kelas | Size | Line-height | Catatan |
|---|---|---|---|
| `text-headline-xl` | 80px | 1.0 | weight 900, tracking `-0.04em` |
| `text-headline-lg` | 48px | 1.1 | weight 800, tracking `-0.02em` |
| `text-headline-lg-mobile` | 32px | 1.1 | varian mobile dari headline-lg |
| `text-headline-md` | 24px | 1.2 | weight 700 |
| `text-body-lg` | 20px | 1.6 | — |
| `text-body-md` | 16px | 1.6 | default body |
| `text-label-sm` | 14px | 1.0 | weight 700, tracking `0.05em` |
| `text-micro` / `text-fine` | 10px / 11px | — | metadata teknis |

Tracking utilitas: `tracking-label` `0.2em`, `tracking-label-lg` `0.3em`,
`tracking-otp` `0.5em`.

Aturan:
- Headline display **uppercase, tracking rapat** — teks berfungsi sebagai bentuk.
- Label/metadata SELALU `font-mono` + uppercase.
- Body tidak pernah `text-center` untuk paragraf panjang.

---

## 4. Spacing, Grid & Container

| Token | Nilai | Peran |
|---|---|---|
| `spacing-gutter` | 24px | Jarak antar blok konten |
| `spacing-margin-page` | 32px | Margin halaman minimum |
| `spacing-container-max` | 1280px | Lebar maks kontainer |

- Grid editorial 12 kolom desktop / 4 kolom mobile; elemen boleh "pecah" grid secara
  terkendali untuk ketegangan visual asimetris.
- Kontainer luar membatasi lebar; blok konten yang lebih sempit dari viewport wajib
  `mx-auto` (sumbu halaman lurus).

---

## 5. Border, Shadow & Elevation

**Border** (`components/ui/neobrutal/styles.ts`):
- `BORDER = 'border-2 border-ink'` — kartu & kontrol standar.
- `BORDER_THICK = 'border-4 border-ink'` — kontainer hero/aksen berat.
- Sudut selalu 0 (global `border-radius: 0`).

**Shadow hard-offset** (token `--shadow-brutal-1…12`, tanpa blur, warna `ink` 100%):

| State | Offset | Kelas |
|---|---|---|
| Default (idle) | 6px 6px | `shadow-brutal-6` / `SHADOW_BASE` |
| Hover | 2px 2px | `SHADOW_PRESS` + `hover:translate-x-0.5 hover:translate-y-0.5` |
| Active (pressed) | 0–2px | `SHADOW_PRESS_DEEP` / `SHADOW_PRESS` |
| Compact (chip/nav) | 3px → 1px | `SHADOW_SM_BASE` → `SHADOW_SM_PRESS` |

`transition-all will-change-transform` dipakai untuk menghindari sub-pixel ghosting
Chromium pada elemen ber-border tebal.

**Z-index scale** (`globals.css`):
`raised (10) < topbar (30) < backdrop (40) < nav (50) < lightbox (60) < modal (120) < dialog (130) < toast (140)`.
Z-index lain dilarang di luar skala ini.

---

## 6. Layout & Struktur Halaman

### Route group & layout
- `app/[locale]/(public)/layout.tsx` → `SiteOverlay` + `TopNav` (dengan
  `WishlistBadge`, `CartBadge`) + `<main>` + `Footer`. Kontainer memakai
  `bg-transparent` agar pola dot-grid `<body>` tetap terlihat; section yang butuh
  latar solid memasang `bg-surface` sendiri-sendiri.
- `app/[locale]/(public)/akun/layout.tsx` → area akun customer (profil, pesanan,
  wishlist).
- `app/[locale]/admin/layout.tsx` → verifikasi sesi via `GET /api/admin/me`
  (gagal → redirect `/login`), lalu render `AdminShell` (Sidebar + AdminTopbar +
  drawer state).
- Locale: `id` & `en` lewat next-intl (`app/[locale]/…`). Semua teks UI lewat
  message catalog — **dilarang hardcoded string** di komponen.

### Halaman legal
- `LegalPage.tsx` menyatukan Terms/Privacy; `LegalToc.tsx` = daftar isi sticky
  dengan state aktif kontras tinggi (nomor 2-digit `text-ink font-black`, indikator
  square `bg-ink`, kartu aktif dengan border + shadow).

---

## 7. Background Berlapis & Hiasan Overlay (SiteOverlay)

### Lapisan background `<body>` (murni CSS, tanpa DOM tambahan)
Urutan `background` multi-layer di `globals.css` (layer pertama = paling atas):
1. Dot-grid radial — pattern utama.
2. Grid garis teknikal `ink` 1px tiap 96px (kertas milimeter tipis).
3. `var(--color-surface)` — kanvas off-white.

Pita diagonal accent 135° lama (terbaca zig-zag) sudah **dihapus permanen**.

### `SiteOverlay.tsx` — hiasan tonal ber-parallax
Komponen client `components/public/SiteOverlay.tsx`, dipasang di PublicLayout:

- Invarian WAJIB: `fixed inset-0 pointer-events-none -z-10 overflow-hidden
  select-none` + `aria-hidden="true"`. Tidak pernah mencegat klik/tab/scroll,
  tidak pernah memicu horizontal overflow (diukur: `scrollWidth - clientWidth = 0`).
- Isi (semua **tonal**, `ink` ber-alpha rendah, tanpa warna brand pekat):
  - **Layer deep**: 4 siku L-bracket di sudut viewport.
  - **Layer mid**: *artboard ruler ticks* tepi kiri (`- 00 … - 96`), *precision
    crosses* `+` + diamond outline tepi kanan.
  - **Layer fore**: koordinat registrasi `+ [CANVAS // 100VW]` dan
    `[WORKSPACE // CORE] +` di tepi atas, *rotating studio seal*
    (`★ ENSTUDIO DIGITAL CRAFT ★ 2026 ★`, putaran 25s), HUD chip
    `ENSTUDIO · DIGITAL WORKSPACE` kiri bawah.
- **Parallax**: GSAP `quickTo` — kursor menggerakkan 3 layer dengan kedalaman
  `deep 6px / mid 14px / fore 22px` (easing `power2.out`).
- **Aksesibilitas**: `prefers-reduced-motion: reduce` → semua tween dimatikan,
  posisi statis.

### Larangan ornament (keputusan desain, berlaku permanen)
1. **Marquee/ticker dilarang** — tidak ada teks berjalan di UI. Token
   `--animate-marquee` dan `components/public/MarqueeStrip.tsx` hanya sisa
   warisan (tidak diimpor halaman mana pun); jangan dipakai kembali.
2. **Badge/stiker warna pekat melayang di overlay dilarang** (keputusan setelah
   uji visual: bertabrakan dengan konten). Hiasan overlay = tonal saja.
3. **Teks zine/konstruksi asing** (`[ZINE-EDITION…]`, `[00°00'N…]`, dll.) sudah
   dihapus — jangan dikembalikan.

### Ornamen hero yang dipertahankan (identitas)
- `Hero.tsx`: stiker `⚡ RAW ARCHITECTURE // SPEC 01` dan
  `● INDEPENDENT DIGITAL STUDIO`, Technical Tag Ribbon
  `[REF: 04.34.8B] · [GRID 12-COL] · [LAT: -7.4705°] · [ZINE ISSUE: 01]`,
  `CornerCrosshairs`.
- `PageHeader.tsx`: `CornerCrosshairs` + badge `[ARCHIVE // SPEC-01]`.

---

## 8. Kit Komponen Neobrutal (component-first)

Barrel: `components/ui/neobrutal` — import lewat
`import { Button, Card, NLink } from '@/components/ui/neobrutal'`.

| Kebutuhan | Komponen | Catatan |
|---|---|---|
| Tombol berlabel | `Button` | variant: `primary \| accent \| surface \| outline \| ink`; size: `tiny \| sm \| md \| lg \| compact \| icon \| icon-sm` |
| Link neobrutal | `NLink` | `LINK_VARIANT_CLS` dari `styles.ts` |
| Kartu/kontainer | `Card` | border ink + hard shadow; padding internal 24px |
| Label eyebrow | `Eyebrow` | `font-mono` uppercase |
| Disclosure/accordion | `Disclosure` | — |
| Titik matrix dekoratif | `DotMatrix` | dipakai terbatas, jangan bertumpuk dengan ornamen lain |
| Skeleton loader | `Skeleton`, `SkeletonCard`, `SkeletonPageHeader…` | `animate-pulse` + token saja |
| Loader halaman | `PageLoader`, `AdminListLoader`, `AdminTableLoader` | — |

Satu-satunya sumber style interaktif = `components/ui/neobrutal/styles.ts`
(`BORDER`, `SHADOW_*`, `LIFT_*`, `INTERACTIVE_BASE`, `*_VARIANT_CLS`).
Perubahan style cukup menyentuh satu file ini agar menyebar ke seluruh app.

**Aturan keras:**
- **Zero raw hex** — semua warna lewat token Tailwind (`bg-primary`, `border-ink`, …).
- **Zero inline style** — `style="…"` dilarang; transform/animasi lewat kelas atau
  GSAP.
- **Zero raw control elements** di halaman: `<button>`, `<input>`, `<select>`,
  `<textarea>`, `<table>` mentah wajib lewat komponen kit.
- Badge/status memakai pola kit (`Eyebrow`/kartu status), bukan `<span>` ber-badge
  tulisan tangan.

---

## 9. Skeleton Loader per Halaman

- Setiap route punya `loading.tsx` sendiri yang **meniru bentuk halaman
  tujuannya** (tabel → header + N kolom + baris; form → kartu + field; grid →
  kartu media), bukan template blok seragam.
- Materi skeleton: `animate-pulse` + token (`bg-ink/10-20`, `bg-accent/*`,
  `border-2 border-ink`) — tanpa hex, tanpa inline style.
- `PageLoader.tsx` (header banner + 2 kolom) hanya untuk route yang memang tidak
  punya bentuk khusus (login, dsb).

---

## 10. Motion & Aksesibilitas

- Interaksi hover/press mengikuti mekanik press-down §5 (transisi halus, tanpa
  spring berlebihan).
- Semua motion overlay menghormati `prefers-reduced-motion: reduce`.
- Target sentuh minimum 44px — token `@utility min-h-touch { min-height: 44px }`.
- Overlay `aria-hidden` dan dekoratif murni; status tidak pernah dikomunikasikan
  lewat warna saja (selalu teks).

---

## 11. Quality Gates (wajib lulus sebelum commit/push)

| Gate | Perintah | Syarat |
|---|---|---|
| i18n parity | `node scripts/check-message-parity.mjs` | PASS (1726+ keys) |
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint` | exit 0 |
| Build | `npm run build` | exit 0 |
| Sweep | grep agregat | raw-hex = 0, inline-style = 0, raw-control = 0 |
| Overflow | probe Playwright 1440/768/390 | `scrollWidth - innerWidth = 0` |

Deploy: push ke `main` memicu GHA `Web CI (Next.js)` + `Deploy Production
(sim-sppg)` (SSH → build image → recreate container `enmarket-web`/`enmarket-api`).
Verifikasi produksi: `https://enpiistudio.com` → HTTP 200 + marker DOM
terkonfirmasi.
