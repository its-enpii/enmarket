/**
 * Public proxy ke Laravel catalog API — untuk client-side fetch (infinite scroll).
 *
 * Browser tidak bisa hit `http://api:8000` langsung karena:
 *   1. CORS — Laravel endpoint tidak set Access-Control-Allow-Origin untuk web origin.
 *   2. DNS — `api:8000` adalah Docker-internal hostname, tidak resolve dari browser.
 *
 * Solusi: proxy via Next.js Route Handler. Server-to-server fetch (Next → Laravel)
 * sudah jalan di `lib/public-api.ts`. Handler ini reuse helper itu.
 *
 * Cache strategy: `cache: 'no-store'` (sama dengan server component) — setiap
 * request fetch fresh. Client bisa cache via HTTP cache-control kalau perlu.
 */

import { NextRequest, NextResponse } from 'next/server';

import { publicApi, PublicFetchError } from '@/lib/public-api';

const VALID_TIPE = ['download', 'license', 'bundle', 'account_manual'] as const;
type Tipe = (typeof VALID_TIPE)[number];

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const pageNum = Math.max(1, parseInt(sp.get('page') ?? '1', 10) || 1);
  const q = sp.get('q')?.trim() || undefined;
  const tipeRaw = sp.get('tipe');
  const tipe: Tipe | undefined =
    tipeRaw && VALID_TIPE.includes(tipeRaw as Tipe) ? (tipeRaw as Tipe) : undefined;
  const perPage = Math.min(24, Math.max(1, parseInt(sp.get('per_page') ?? '9', 10) || 9));

  try {
    const result = await publicApi.catalog({
      page: pageNum,
      per_page: perPage,
      tipe,
      q,
    });
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    if (err instanceof PublicFetchError) {
      return NextResponse.json(
        { data: [], meta: { current_page: 1, last_page: 1, per_page: perPage, total: 0 } },
        { status: 200 }, // Return empty success — biar client UI fallback gracefully
      );
    }
    return NextResponse.json({ error: 'fetch_failed' }, { status: 500 });
  }
}