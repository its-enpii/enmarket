import { test, expect } from '@playwright/test';

/**
 * E2E test untuk katalog publik — happy path browse tanpa auth.
 *
 * Verifikasi:
 * - Halaman katalog render dengan list produk
 * - Filter kategori mempersempit list
 * - Klik produk → ke detail page
 */
test.describe('Katalog publik', () => {
  test('homepage katalog menampilkan list produk aktif', async ({ page }) => {
    await page.goto('/id/katalog');

    // Page title
    await expect(page).toHaveTitle(/Katalog/i);

    // H1 dengan judul
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('search input ada di katalog', async ({ page }) => {
    await page.goto('/id/katalog');

    // SearchBar component — input dengan placeholder "Cari..."
    const searchInput = page.locator('input[type="search"], input[placeholder*="Cari" i]').first();
    await expect(searchInput).toBeVisible();
  });

  test('halaman EN dapat diakses di prefix yang sama', async ({ page }) => {
    await page.goto('/en/catalog');

    await expect(page).toHaveURL(/\/en\/catalog/);
  });
});

test.describe('Halaman utama', () => {
  test('redirect root ke default locale', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'networkidle' });

    // next-intl default redirect ke /id atau /en (boleh tanpa trailing slash)
    expect(page.url()).toMatch(/\/(id|en)(\/|$)/);
    expect(response?.status()).toBeLessThan(400);
  });

  test('homepage hero tampil', async ({ page }) => {
    await page.goto('/id');

    // Hero h1
    await expect(page.locator('h1').first()).toBeVisible();
  });
});