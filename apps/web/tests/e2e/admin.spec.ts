import { test, expect } from '@playwright/test';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? 'dev-admin-token-12345';

/**
 * E2E test untuk flow admin.
 *
 * Karena Next.js middleware baca cookie `admin_token` di middleware.ts,
 * kita set cookie di context sebelum navigate. Cookie value di-pass ke
 * API request via Authorization header di server-side fetch (lib/api.ts).
 */
test.describe('Admin login + protected pages', () => {
  test('redirect ke login saat tidak ada cookie', async ({ page }) => {
    const response = await page.goto('/id/admin', { waitUntil: 'domcontentloaded' });

    // Middleware harus redirect ke /id/login?next=/id/admin
    expect(page.url()).toMatch(/\/id\/login/);
    expect(response?.status()).toBeLessThan(400);
  });

  test('login form submit dengan token valid → redirect ke dashboard', async ({ page }) => {
    await page.goto('/id/login');

    // Form login: input token + button submit
    const tokenInput = page.locator('input[name="token"], input[type="password"]').first();
    await expect(tokenInput).toBeVisible();
    await tokenInput.fill(ADMIN_TOKEN);

    await page.locator('button[type="submit"]').first().click();

    // Setelah login sukses, redirect ke /id/admin
    await page.waitForURL(/\/id\/admin/, { timeout: 30_000 });
    await expect(page).toHaveURL(/\/id\/admin/);
  });

  test('login dengan token salah tampilkan error', async ({ page }) => {
    await page.goto('/id/login');

    await page.locator('input[name="token"], input[type="password"]').first().fill('wrong-token-xxx');
    await page.locator('button[type="submit"]').first().click();

    // Tunggu error message muncul (FormMessage atau toast)
    await expect(page.locator('text=/token|tidak valid|salah/i').first()).toBeVisible({ timeout: 10_000 });
  });

  test('admin dapat akses dashboard dengan cookie', async ({ context, page }) => {
    // Set admin_token cookie langsung via context — bypass UI login
    await context.addCookies([
      {
        name: 'admin_token',
        value: ADMIN_TOKEN,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    await page.goto('/id/admin');

    // Dashboard load — cek heading
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 30_000 });
  });
});

test.describe('Admin account-provisionings page', () => {
  test('antrean aktivasi dapat diakses dengan auth', async ({ context, page }) => {
    await context.addCookies([
      {
        name: 'admin_token',
        value: ADMIN_TOKEN,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    await page.goto('/id/admin/account-provisionings');

    // H1 atau title page
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 30_000 });
  });
});

test.describe('Admin product edit page (real-case with linked posts)', () => {
  test('edit produk demo memuat section linked posts + picker', async ({ context, page }) => {
    await context.addCookies([
      {
        name: 'admin_token',
        value: ADMIN_TOKEN,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    // Cari ID produk demo via API publik dulu (lebih reliable daripada scraping HTML).
    const apiResp = await page.request.get('http://localhost:8000/api/public/products/starter-pack-demo');
    expect(apiResp.ok()).toBeTruthy();
    const productId = (await apiResp.json()).data.id;

    await page.goto(`/id/admin/products/${productId}`, { waitUntil: 'domcontentloaded' });

    // H1 — product name.
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 60_000 });

    // Section 'Linked Posts' terlihat (cari text dari i18n).
    const linkedSection = page.getByText(/catatan terkait|linked posts/i).first();
    await expect(linkedSection).toBeVisible({ timeout: 30_000 });

    // Existing linked posts dari seeder — minimal 2 (panduan + warning).
    const linkedItems = page.locator('input[type="hidden"][name="linked_posts"]');
    await expect(linkedItems).toHaveCount(2, { timeout: 10_000 });
  });
});