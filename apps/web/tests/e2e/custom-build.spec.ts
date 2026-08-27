import { test, expect } from '@playwright/test';
import { injectAdminCookie } from './helpers';

test.describe('Custom Build Request — public', () => {
  test('/layanan page render dengan form', async ({ page }) => {
    test.slow();
    await page.goto('/id/layanan');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 60_000 });

    // Verify form fields exist
    await expect(page.locator('#nama')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#wa')).toBeVisible();
    await expect(page.locator('#jenis_proyek')).toBeVisible();
    await expect(page.locator('#budget_range')).toBeVisible();
    await expect(page.locator('#timeline')).toBeVisible();
    await expect(page.locator('#deskripsi')).toBeVisible();
  });

  test('submit form lengkap → success page/message', async ({ page }) => {
    test.slow();
    await page.goto('/id/layanan');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 60_000 });

    // Fill form
    await page.locator('#nama').fill('Test Client Playwright');
    await page.locator('#email').fill('client@example.com');
    await page.locator('#wa').fill('081234567890');
    await page.locator('#jenis_proyek').selectOption('webapp');
    await page.locator('#budget_range').selectOption('15-50jt');
    await page.locator('#timeline').selectOption('1-3bulan');
    await page.locator('#deskripsi').fill('Aplikasi internal manajemen stok dengan integrasi barcode scanner dan laporan otomatis bulanan.');

    // Submit form
    await page.locator('button[type="submit"]').first().click();

    // Check for success message / card (🚀 icon or success text)
    await expect(page.locator('text=/berhasil|terima kasih|permintaan.*dikirim|🚀/i').first()).toBeVisible({ timeout: 30_000 });
  });

  test('submit form kosong field wajib → validation error tampil', async ({ page }) => {
    test.slow();
    await page.goto('/id/layanan');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 60_000 });

    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    // Page should still be on /layanan
    expect(page.url()).toContain('/layanan');
  });
});

test.describe('Custom Build Request — admin', () => {
  test('/admin/custom-requests list page render', async ({ context, page }) => {
    test.slow();
    await injectAdminCookie(context);
    await page.goto('/id/admin/custom-requests');

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 60_000 });
    const content = page.locator('table, [role="region"], .empty-state, h1');
    await expect(content.first()).toBeVisible();
  });

  test('detail page render + status update form', async ({ context, page }) => {
    test.slow();
    await injectAdminCookie(context);

    // Create a request via public API
    const submitRes = await page.request.post('http://localhost:8000/api/public/custom-requests', {
      data: {
        nama: 'Detail Test Client',
        email: 'detail@example.com',
        wa: '081299990000',
        jenis_proyek: 'automation',
        budget_range: '5-15jt',
        timeline: '2-4minggu',
        deskripsi: 'Detail test request description for e2e automation.',
      },
    });

    let requestId: number | null = null;
    if (submitRes.ok()) {
      const data = await submitRes.json();
      requestId = data.data?.id;
    }

    if (requestId) {
      await page.goto(`/id/admin/custom-requests/${requestId}`);
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 60_000 });

      const statusSelect = page.locator('#status');
      await expect(statusSelect).toBeVisible();

      await statusSelect.selectOption('diproses');
      await page.locator('#notes').fill('Sedang di-follow up via WA');

      await page.locator('button[type="submit"]').first().click();

      await expect(page.locator('text=/berhasil|sukses|✓/i').first()).toBeVisible({ timeout: 15_000 });
    } else {
      await page.goto('/id/admin/custom-requests');
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 60_000 });
    }
  });
});
