import { NextResponse } from 'next/server';
import { getApiBase } from '@/lib/api-base';

/**
 * Fallback proxy route untuk Tripay IPN callback tanpa prefix `/api/`.
 * Forward request ke endpoint resmi Laravel: POST http://api:8000/api/tripay/callback
 */
export async function POST(request: Request) {
  const apiBase = getApiBase();
  const body = await request.text();

  const headers: Record<string, string> = {
    'Content-Type': request.headers.get('content-type') || 'application/json',
  };

  const sig = request.headers.get('x-callback-signature');
  if (sig) headers['X-Callback-Signature'] = sig;

  const event = request.headers.get('x-callback-event');
  if (event) headers['X-Callback-Event'] = event;

  try {
    const res = await fetch(`${apiBase}/api/tripay/callback`, {
      method: 'POST',
      headers,
      body,
    });

    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('content-type') || 'application/json',
      },
    });
  } catch (err) {
    console.error('Tripay fallback callback proxy error:', err);
    return NextResponse.json({ message: 'Callback proxy error' }, { status: 500 });
  }
}
