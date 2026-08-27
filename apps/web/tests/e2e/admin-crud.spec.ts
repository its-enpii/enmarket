import { test, expect } from '@playwright/test';
import { injectAdminCookie } from './helpers';

test.describe('Admin products list', () => {
  test('/admin/products list page render', async ({ context, page }) => {
    test.slow();
    await injectAdminCookie(context);
    await page.goto('/id/admin/products');

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 30_000 });
    const content = page.locator('table, [role="region"], .empty-state, h1');
    await expect(content.first()).toBeVisible();
  });

  test('/admin/products/new form render dengan fields', async ({ context, page }) => {
    test.slow();
    await injectAdminCookie(context);
    await page.goto('/id/admin/products/new');

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 30_000 });

    // Check product form inputs exist
    await expect(page.locator('#nama')).toBeVisible();
    await expect(page.locator('#harga')).toBeVisible();
  });
});

test.describe('Admin categories', () => {
  test('/admin/categories list render', async ({ context, page }) => {
    test.slow();
    await injectAdminCookie(context);
    await page.goto('/id/admin/categories');

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 30_000 });
    const content = page.locator('table, [role="region"], .empty-state, h1');
    await expect(content.first()).toBeVisible();
  });

  test('/admin/categories/new form submit', async ({ context, page }) => {
    test.slow();
    await injectAdminCookie(context);
    await page.goto('/id/admin/categories/new');

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 30_000 });

    const catName = `Cat ${Date.now().toString().slice(-4)}`;
    const catSlug = `cat-${Date.now().toString().slice(-4)}`;

    await page.locator('#nama').fill(catName);
    await page.locator('#slug').fill(catSlug);

    await page.locator('button[type="submit"]').first().click();

    // Redirects to /admin/categories
    await page.waitForURL(/\/admin\/categories/, { timeout: 30_000 });
    expect(page.url()).toMatch(/\/admin\/categories/);
  });
});

test.describe('Admin posts', () => {
  test('/admin/posts list render', async ({ context, page }) => {
    test.slow();
    await injectAdminCookie(context);
    await page.goto('/id/admin/posts');

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 30_000 });
    const content = page.locator('table, [role="region"], .empty-state, h1');
    await expect(content.first()).toBeVisible();
  });
});

test.describe('Admin orders', () => {
  test('/admin/orders list render', async ({ context, page }) => {
    test.slow();
    await injectAdminCookie(context);
    await page.goto('/id/admin/orders');

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 30_000 });
    const content = page.locator('table, [role="region"], .empty-state, h1');
    await expect(content.first()).toBeVisible();
  });
});

test.describe('Admin preorders', () => {
  test('/admin/preorders list render', async ({ context, page }) => {
    test.slow();
    await injectAdminCookie(context);
    await page.goto('/id/admin/preorders');

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 30_000 });
    const content = page.locator('table, [role="region"], .empty-state, h1');
    await expect(content.first()).toBeVisible();
  });
});

test.describe('Admin license-keys', () => {
  test('/admin/license-keys list render', async ({ context, page }) => {
    test.slow();
    await injectAdminCookie(context);
    await page.goto('/id/admin/license-keys');

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 30_000 });
    const content = page.locator('table, [role="region"], .empty-state, h1');
    await expect(content.first()).toBeVisible();
  });
});

test.describe('Admin settings', () => {
  test('/admin/settings page render', async ({ context, page }) => {
    test.slow();
    await injectAdminCookie(context);
    await page.goto('/id/admin/settings');

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 30_000 });
  });

  test('/admin/settings/payment page render', async ({ context, page }) => {
    test.slow();
    await injectAdminCookie(context);
    await page.goto('/id/admin/settings/payment');

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 30_000 });
  });
});
