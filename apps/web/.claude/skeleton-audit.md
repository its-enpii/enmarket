# Skeleton Audit Findings

> File ini dipakai sebagai coordination doc untuk fix parallel subagents.
> Dihasilkan dari audit loading.tsx vs page.tsx di apps/web/app.

## Design tokens (pakai di semua skeleton)

Neobrutalism colors:
- bg-surface = #F3F3F3 (default bg admin)
- bg-ink = #040303 (gelap, dipakai text/border default)
- bg-primary = #3D348B (purple)
- bg-accent = #E6AF2E (gold)
- text-ink = #040303

Pola skeleton admin:
- Section padding: `p-6 sm:p-8 space-y-6`
- Header: `border-b-4 border-ink pb-6` + eyebrow `font-label text-[10px] uppercase tracking-[0.3em] text-accent mb-3` + h1 `font-display text-5xl md:text-7xl font-black uppercase leading-[0.95] tracking-tight text-ink` + italic desc `mt-3 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4`
- Card surface: `bg-surface border-2 border-ink p-... shadow-[4px_4px_0_0_var(--color-ink)]`
- Filter bar: `bg-surface border-2 border-ink p-4 shadow-[3px_3px_0_0_var(--color-ink)]`
- Table: `border-2 border-ink bg-surface shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden`, header row `h-12 bg-primary`, body row `h-14 border-b border-ink/20`
- Button accent/skeleton: `bg-ink/10`, `bg-ink/15`, `bg-ink/20` (varying opacity)

Pola skeleton publik:
- Section padding: `px-6 md:px-12 py-16 md:py-24`
- Section border: `border-b-4 border-ink`
- Skeleton block color: `bg-ink/10`, `bg-ink/15`, `bg-ink/20`, `bg-accent/30-40`, `bg-primary/10-40`, `bg-surface/40`
- animate-pulse: di root div
- Heading: `h-9 w-32 bg-surface border-2 border-ink` atau `h-8 w-48 bg-surface border-2 border-ink`
- Image placeholder: `aspect-video bg-primary/10 border-b-2 border-ink`
- Card: `bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)]`

## Public route findings

### `(public)/loading.tsx` — HOMEPAGE (broken — old layout)
- Real page renders: `<Hero /> + <PillarsSection /> + <FeaturedSection /> + <JournalSection />` (in order)
- Each section is full-width with `px-6 md:px-12` padding, not `max-w-6xl`
- Section borders: `border-b-4 border-ink`
- Layout breakdown:
  1. Hero — `min-h-[80vh] flex flex-col items-center justify-center text-center`. Headline 2-3 baris (oversized), italic body 2-line, single CTA button. Background: surface. Border-b-4 ink.
  2. PillarsSection — `grid-cols-1 md:grid-cols-2` Discover|Develop atas, Display full-width bawah. Setiap pillar: 64x64 icon badge + headline + body + arrow link.
  3. FeaturedSection — Heading "Featured Developments" (2 baris) + "Artifacts / 001—004" label kanan. 4 row zig-zag: image col-8 + text col-4 (alternating). Image aspect-video.
  4. JournalSection — Heading "Latest / Display" + horizontal ink line. 2 journal entries alternating: image col-5 aspect-[4/3] + text col-7. Purple chip "JOURNAL" + date + headline + body + Read Entry arrow.
- Final CTA: bg-primary text-surface, gold "karya lain" highlight, "Kembali ke Develop" button. (BUKAN di loading, bisa skip)
- Skeleton saat ini: salah total, pakai layout lama (Kategori chips + Featured grid 3-col + Latest grid 3-col). Harus diganti.

### `(public)/keranjang/loading.tsx` — CART (broken)
- Real page layout (full-bleed, no max-w-4xl):
  1. Header section: `border-b-4 border-ink`, padding `px-6 md:px-12 py-16 md:py-20`. Eyebrow `font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-6` "✎ Selection". H1 `font-display text-6xl md:text-8xl font-black uppercase leading-[0.9] tracking-tight text-ink` "Your Selection" + "Back to Develop" link. Body italic max-w-2xl border-l-4 border-accent.
  2. Two-column section: `border-b-4 border-ink`, padding `px-6 md:px-12 py-12 md:py-16`, `grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-10 lg:gap-12 items-start`
     - LEFT: heading "Selected works" + items count. Each item: horizontal card (sm:flex-row) dengan thumbnail 32x32 + info panel (title, price tag gold, subtotal) + CartItemRow controls. Each card: `bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden`
     - RIGHT sticky: SummaryBlock (bg-primary text-surface, 4 col-span-5). Border-4 ink, shadow-[8px_8px_0]. Label eyebrow, subtotal, total gold block, CTA checkout. Below: TrustNote bordered block.
- Skeleton saat ini: max-w-4xl single column with single summary box. Harus diganti full-bleed + 2-col layout.

### `(public)/checkout/loading.tsx` — CHECKOUT (sudah match, tidak diubah)
- Real page: max-w-4xl px-6 py-8, heading + 2-col grid lg:grid-cols-[1fr_22rem] gap-8, form card + summary aside primary + back link.
- Skeleton match.

### `(public)/katalog/loading.tsx` — KATALOG (sudah match)
- Real page: max-w-6xl px-6 py-8, heading + 2-col md:grid-cols-[16rem_1fr] sidebar+content. Content: 3-col grid (ProductGrid) + pagination.
- Skeleton match.

### `(public)/develop/[slug]/loading.tsx` — WORK DETAIL (sudah match)
- Real page: 6 sections — breadcrumb, hero 2-col [3fr_2fr] (image + info), about 2-col [5fr_4fr] (pull-quote + quick facts), details 4-col grid + fitur checklist, gallery, related 3-col.
- Skeleton match.

### `(public)/display/loading.tsx` — DISPLAY (cover [slug] detail, but also covers list page)
- Real [slug] page: breadcrumb, cover, title+byline meta strip, article body max-w-3xl mx-auto, tags, reaction, related 3-col.
- Real list page: header + tag pills + featured + asymmetric grid + footer CTA.
- One file covers both. Skeleton saat ini detail-shaped (cover, title, byline, article body, related). Acceptable for [slug] (the dominant route). For list page it's over-mimicked but brief flash only.
- Keep as-is OR consider making it lighter for the list page. For now: keep.

### `(public)/pembayaran/[kodeOrder]/loading.tsx` — PEMBAYARAN (broken — too simple)
- Real page: max-w-4xl, back link + heading + PaymentPoller (client component) which renders:
  1. Optional status banner (bg-primary or bg-accent or bg-ink)
  2. Countdown box (bg-accent, big mono time)
  3. 2-col grid lg:grid-cols-2 gap-6
     - LEFT: QR card (bg-surface, aspect-square image + caption)
     - RIGHT: info boxes + "Saya sudah bayar" button + "Lihat detail pesanan" link
- Skeleton saat ini: hanya QR centered + 2 button boxes. Harus expand dengan countdown + 2-col grid (QR | info+button).

## Admin route findings

### `admin/loading.tsx` — ADMIN HOME (broken — major restructure)
- Real page layout (`p-6 sm:p-8 space-y-8`):
  1. Header: `border-b-4 border-ink pb-6`, eyebrow "✎ Dashboard", h1 "Beranda.", italic desc.
  2. Stat tiles: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4` with 6 tiles. Color order: SURF | ACCENT | PRIMARY | ACCENT | PRIMARY | SURF. Each Card variant (filled-primary/filled-accent/surface) with label + big number.
  3. Pending Orders + Recent Activity: `grid grid-cols-1 lg:grid-cols-2 gap-6` (2 panels, both surface Card with title bar + list/empty)
  4. Quick action buttons: `grid grid-cols-2 md:grid-cols-4 gap-3` (4 buttons)
- Skeleton saat ini: hanya 4 stat tiles. Harus diganti total — header + 6 tiles + 2-col panels (each with list skeleton) + 4 button row.

### `admin/products/loading.tsx` — PRODUCTS LIST (missing header)
- Real page: header (h1 "Produk.") + AdminTableHeader (search + 2 filters + Action button) + DataTable 7-col + Pagination.
- Skeleton saat ini: filter bar (4 input) + 7-col table (7 col). Missing: header, missing search bar in filter (current bar has 4 inputs; should be search + 2 filter + action).
- Add: header block + adjust filter bar to show 5 items (1 search flex-1, 2 filter w-32 each, 1 action w-32 ml-auto).

### `admin/products/new/loading.tsx` — NEW PRODUCT FORM
- Real page: header (h1 "Produk Baru.") + Card with ProductForm.
- ProductForm has ~9 fields (Nama, Slug, Kategori, Harga, Tipe, Status, Deskripsi, Fitur dynamic, File) + action buttons.
- Skeleton: just PageFormLoading fieldCount=6 includeTextarea includeActions. Add header + bump fieldCount to 8.

### `admin/products/[id]/loading.tsx` — EDIT PRODUCT
- Real page: header (h1 product name) + quick-info card (status badge + tipe + harga + kategori + back link) + Card with ProductForm + Card with Preview Images Manager (media section).
- Skeleton: just PageFormLoading fieldCount=6. Add: header + quick-info card row + preview images section.

### `admin/categories/loading.tsx` — CATEGORIES LIST (missing header)
- Real page: header (h1 "Kategori.") + AdminTableHeader (search + Action) + DataTable 5-col.
- Skeleton: filter bar (1 search flex-1 + 1 action w-32 ml-auto) + 5-col table. Missing header. Bar has wrong count (3 inputs; should be 1 search + 1 action = 2 inputs).

### `admin/categories/new/loading.tsx` — NEW CATEGORY FORM
- Real page: header (h1 "Kategori Baru.") + Card with CategoryForm.
- CategoryForm has 3 fields (Nama, Slug, Deskripsi) + actions.
- Skeleton: PageFormLoading fieldCount=2 includeTextarea={false} includeActions. Add header + bump fieldCount=3 + includeTextarea (deskripsi is textarea).

### `admin/categories/[id]/loading.tsx` — EDIT CATEGORY
- Same as new. Edit: same loader structure.

### `admin/license-keys/loading.tsx` — LICENSE KEYS (missing header)
- Real page: header (h1 "License Keys.") + AdminTableHeader (search + 2 filter + Action trigger + secondary form card) + DataTable 7-col + Pagination.
- Skeleton: filter bar (3 inputs) + 7-col table. Missing header. Bar should be 4 inputs (1 search flex-1 + 2 filter + 1 action).

### `admin/orders/loading.tsx` — ORDERS LIST (missing header + date range)
- Real page: header (h1 "Pesanan.") + AdminTableHeader (search + 1 filter + 2 date inputs) + DataTable 6-col + Pagination.
- Skeleton: filter bar (3 inputs: 1 search + 1 filter + 1 something) + 6-col table. Missing header. Date range inputs (2 separate w-32 boxes) not represented.

### `admin/orders/[kodeOrder]/loading.tsx` — ORDER DETAIL (significantly under-built)
- Real page: header (h1 kode_order) + status/actions quick info card + Buyer card (4 fields 2-col) + optional warning card + Items table (4-col) + optional QR card.
- Skeleton: just h-16 header + 1 card with 3 lines + 3-row table. Add: status bar card + buyer card 2-col + items table 4-col header.

## Coordination plan — parallel subagents

Spawn one subagent per route cluster. Each reads the page.tsx + neighbors, applies the audit, and writes the loading.tsx. Per the user's directive, each subagent handles its assigned route end-to-end.

Clustering (so subagents don't collide):
1. Public: `(public)/loading.tsx` (homepage) — agent A
2. Public: `(public)/keranjang/loading.tsx` + `(public)/pembayaran/[kodeOrder]/loading.tsx` — agent B
3. Admin: `admin/loading.tsx` (home) — agent C
4. Admin: `admin/products/**` (3 loaders) — agent D
5. Admin: `admin/categories/**` (3 loaders) — agent E
6. Admin: `admin/license-keys/loading.tsx` + `admin/orders/**` (2 loaders) — agent F

## Constraints

- Match exactly the real page structure: same outer wrapper (p-6 sm:p-8 space-y-6 for admin, full-bleed px-6 md:px-12 for public full-width sections), same column counts, same sections in order.
- Keep the same neobrutalism skeleton style tokens (bg-ink/10, bg-ink/15, bg-accent/30-40, bg-primary/10, border-2 border-ink, shadow-[Npx_Npx_0_0_var(--color-ink)], animate-pulse).
- DO NOT change the visual loading tokens (use bg-ink/10 not bg-ink/5 for skeleton blocks).
- DO NOT introduce new shared components — keep each loading.tsx self-contained.
- Use unique consistent patterns already in the codebase.
- When in doubt, lean toward LESS detail in skeleton (don't try to mimic every micro element).
