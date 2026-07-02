/**
 * Webhook revalidation — dipanggil Laravel setelah admin CRUD produk/kategori.
 * Verifikasi secret, lalu invalidate cache halaman terkait.
 */

import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const SECRET = process.env.REVALIDATE_SECRET ?? '';

interface RevalidateBody {
  paths: string[];
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret');
  if (!SECRET || secret !== SECRET) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let body: RevalidateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const paths = Array.isArray(body.paths) ? body.paths : [];
  if (paths.length === 0) {
    return NextResponse.json({ message: 'paths kosong' }, { status: 400 });
  }

  for (const path of paths) {
    if (typeof path === 'string' && path.startsWith('/')) {
      revalidatePath(path);
    }
  }

  return NextResponse.json({ revalidated: paths });
}