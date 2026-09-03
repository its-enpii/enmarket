'use server';

/**
 * Server actions untuk admin Settings pages.
 *
 * Mirror pattern dari apps/web/app/admin/license-keys/actions.ts:
 * - ActionResult sebagai return shape
 * - apiPost/apiPatch dipanggil via shared helper
 * - revalidatePath untuk invalidate cached server fetches
 * - errorMessage + pickFieldError untuk normalize Laravel errors
 *
 * Backend endpoint: PATCH /api/admin/settings dengan body
 *   { group: 'identity'|'social'|'footer'|'payment'|'channels',
 *     values: { ...key-value... } }
 */

import { revalidatePath } from 'next/cache';

import { ApiRequestError, apiPatch, apiPost, apiPostForm, apiPut } from '@/lib/api';
import type { ActionResult } from '@/lib/action-result';
import type { NavMenuRecord, SiteSettings } from '@/lib/types';

export interface SettingsActionResult extends ActionResult {
  data?: SiteSettings;
}

function pickFieldError(err: ApiRequestError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  if (err.body?.errors) {
    for (const [k, v] of Object.entries(err.body.errors)) {
      if (v?.[0]) out[k] = [v[0]];
    }
  }
  return out;
}

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiRequestError) {
    return err.body?.message ?? `HTTP ${err.status}`;
  }
  return fallback;
}

// ───── Identity (studio_name, tagline, logo_url) ─────

export async function updateIdentity(
  _prev: SettingsActionResult,
  formData: FormData,
): Promise<SettingsActionResult> {
  const values = {
    studio_name: String(formData.get('studio_name') ?? '').trim(),
    tagline: String(formData.get('tagline') ?? '').trim(),
    logo_url: String(formData.get('logo_url') ?? '').trim(),
  };

  try {
    const res = await apiPatch<{ data: SiteSettings; message: string }>(
      '/api/admin/settings',
      { group: 'identity', values },
    );
    revalidatePath('/admin/settings');
    return { ok: true, message: res.message, data: res.data };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return {
        error: errorMessage(err, 'Gagal menyimpan identitas studio.'),
        fieldErrors: pickFieldError(err),
      };
    }
    return { error: 'Gagal menyimpan identitas studio.' };
  }
}

/**
 * Upload logo studio (PNG/SVG/JPEG/WebP, max 2MB) → EnStorage.
 * Return logo_url yang di-persist ke site_settings (server-side).
 */
export async function uploadLogo(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
  url?: string;
  message?: string;
}> {
  const file = formData.get('file');
  if (!file || !(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Pilih file logo terlebih dahulu.' };
  }

  try {
    const res = await apiPostForm<{ data: { logo_url: string }; message: string }>(
      '/api/admin/settings/logo',
      formData,
    );
    revalidatePath('/admin/settings');
    return { ok: true, url: res.data.logo_url, message: res.message };
  } catch (err) {
    return {
      ok: false,
      error: errorMessage(err, 'Gagal upload logo.'),
    };
  }
}

// ───── Social links (fully dynamic) ─────
//
// User-defined list of {label, url} — no predetermined platforms.
// Backend stores as JSON in site_settings.social_links.

export async function updateSocial(
  _prev: SettingsActionResult,
  formData: FormData,
): Promise<SettingsActionResult> {
  const raw = formData.get('social_links');
  if (typeof raw !== 'string') {
    return { error: 'Data social links tidak valid.' };
  }
  let links;
  try {
    links = JSON.parse(raw);
  } catch {
    return { error: 'Format social links tidak valid.' };
  }
  if (!Array.isArray(links)) {
    return { error: 'Social links harus berupa list.' };
  }

  try {
    const res = await apiPatch<{ data: SiteSettings; message: string }>(
      '/api/admin/settings',
      { group: 'social', values: { social_links: links } },
    );
    revalidatePath('/admin/settings');
    return { ok: true, message: res.message, data: res.data };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return {
        error: errorMessage(err, 'Gagal menyimpan social links.'),
        fieldErrors: pickFieldError(err),
      };
    }
    return { error: 'Gagal menyimpan social links.' };
  }
}

// ───── Footer text ─────

export async function updateFooter(
  _prev: SettingsActionResult,
  formData: FormData,
): Promise<SettingsActionResult> {
  const values = {
    footer_text: String(formData.get('footer_text') ?? '').trim(),
  };

  try {
    const res = await apiPatch<{ data: SiteSettings; message: string }>(
      '/api/admin/settings',
      { group: 'footer', values },
    );
    revalidatePath('/admin/settings');
    return { ok: true, message: res.message, data: res.data };
  } catch (err) {
    return { error: errorMessage(err, 'Gagal menyimpan footer text.') };
  }
}

// ───── Payment (Tripay config + mode) ─────

export async function updatePayment(
  _prev: SettingsActionResult,
  formData: FormData,
): Promise<SettingsActionResult> {
  const values = {
    tripay_merchant: String(formData.get('tripay_merchant') ?? '').trim(),
    // Kirim string kosong kalau tidak diubah (backend skip empty secret)
    tripay_api_key: String(formData.get('tripay_api_key') ?? '').trim(),
    tripay_private_key: String(formData.get('tripay_private_key') ?? '').trim(),
    tripay_mode: String(formData.get('tripay_mode') ?? 'sandbox'),
    duitku_merchant_code: String(formData.get('duitku_merchant_code') ?? '').trim(),
    duitku_api_key: String(formData.get('duitku_api_key') ?? '').trim(),
    duitku_mode: String(formData.get('duitku_mode') ?? 'sandbox'),
  };

  try {
    const res = await apiPatch<{ data: SiteSettings; message: string }>(
      '/api/admin/settings',
      { group: 'payment', values },
    );
    revalidatePath('/admin/settings/payment');
    return { ok: true, message: res.message, data: res.data };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return {
        error: errorMessage(err, 'Gagal menyimpan payment config.'),
        fieldErrors: pickFieldError(err),
      };
    }
    return { error: 'Gagal menyimpan payment config.' };
  }
}

// ───── Channels (QRIS, VA, E-Wallet, Convenience Store) ─────

export async function updateChannels(
  _prev: SettingsActionResult,
  formData: FormData,
): Promise<SettingsActionResult> {
  const values = {
    channel_qris: formData.get('channel_qris') === 'on',
    channel_va: formData.get('channel_va') === 'on',
    channel_ewallet: formData.get('channel_ewallet') === 'on',
    channel_convenience_store: formData.get('channel_convenience_store') === 'on',
  };

  try {
    const res = await apiPatch<{ data: SiteSettings; message: string }>(
      '/api/admin/settings',
      { group: 'channels', values },
    );
    revalidatePath('/admin/settings/payment');
    return { ok: true, message: res.message, data: res.data };
  } catch (err) {
    return { error: errorMessage(err, 'Gagal menyimpan payment channels.') };
  }
}

// ───── Payment Gateways (Tripay / Duitku enable toggles) ─────

export async function updatePaymentGateways(
  _prev: SettingsActionResult,
  formData: FormData,
): Promise<SettingsActionResult> {
  const values = {
    tripay: { enabled: formData.get('gateway_tripay') === 'on' },
    duitku: { enabled: formData.get('gateway_duitku') === 'on' },
  };

  try {
    const res = await apiPatch<{ data: SiteSettings; message: string }>(
      '/api/admin/settings',
      { group: 'payment_gateways', values },
    );
    revalidatePath('/admin/settings/payment');
    return { ok: true, message: res.message, data: res.data };
  } catch (err) {
    return { error: errorMessage(err, 'Gagal menyimpan payment gateways.') };
  }
}

// ───── Maintenance toggle ─────

export async function setMaintenance(
  _prev: SettingsActionResult,
  formData: FormData,
): Promise<SettingsActionResult> {
  const enabled = formData.get('enabled') === '1';
  const message = String(formData.get('message') ?? '').trim();

  try {
    const res = await apiPost<{ data: { enabled: boolean; message: string }; message: string }>(
      '/api/admin/maintenance/toggle',
      { enabled, message },
    );
    revalidatePath('/admin/settings/maintenance');
    revalidatePath('/admin');
    return { ok: true, message: res.message, data: res.data as unknown as SiteSettings };
  } catch (err) {
    return { error: errorMessage(err, 'Gagal mengubah maintenance mode.') };
  }
}

// ───── Public navbar menus ─────

export async function updateNavMenus(
  _prev: SettingsActionResult,
  formData: FormData,
): Promise<SettingsActionResult> {
  const ids = formData
    .getAll('nav_menu_ids')
    .map((value) => String(value))
    .filter((value) => value.length > 0);

  try {
    const updates = await Promise.all(ids.map(async (id) => {
      const response = await apiPut<{ data: NavMenuRecord; message: string }>(
        `/api/admin/nav-menus/${id}`,
        {
          is_enabled: formData.get(`enabled_${id}`) === 'on',
          label: String(formData.get(`label_${id}`) ?? '').trim(),
          sort_order: Number(formData.get(`sort_order_${id}`) ?? 0),
        },
      );
      return response;
    }));

    revalidatePath('/admin/settings/navigation');
    revalidatePath('/');
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return {
        error: errorMessage(err, 'save_failed'),
        fieldErrors: pickFieldError(err),
      };
    }
    return { error: 'save_failed' };
  }
}
