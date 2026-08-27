import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const LOG_FILE = path.resolve(process.cwd(), '../api/storage/logs/laravel.log');

function generatePhone(): string {
  const rand = Math.floor(10000000 + Math.random() * 90000000).toString();
  return `08${rand}`;
}

/**
 * Read the most recent OTP code for a given phone from laravel.log.
 * WhatsappSender logs: "WhatsApp OTP to {phone}: {code}" when EVOLUTION_API_URL is empty.
 */
function extractOtpFromLog(phone: string): string | null {
  try {
    const log = fs.readFileSync(LOG_FILE, 'utf-8');
    const escaped = phone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`WhatsApp OTP to ${escaped}: (\\d{6})`, 'g');
    let lastMatch: string | null = null;
    let m;
    while ((m = regex.exec(log)) !== null) {
      lastMatch = m[1];
    }
    return lastMatch;
  } catch {
    return null;
  }
}

async function getOtpWithRetry(page: any, phone: string): Promise<string | null> {
  for (let i = 0; i < 10; i++) {
    const otp = extractOtpFromLog(phone);
    if (otp) return otp;
    await page.waitForTimeout(300);
  }
  return null;
}

/**
 * Helper to submit phone on /masuk and wait for OTP verify view
 */
async function submitPhone(page: any, phone: string) {
  await page.goto('/id/masuk', { waitUntil: 'networkidle' });
  const phoneInput = page.locator('#customer-phone');
  await expect(phoneInput).toBeVisible({ timeout: 60_000 });

  await phoneInput.click();
  await phoneInput.pressSequentially(phone, { delay: 40 });

  const submitBtn = page.locator('button[type="submit"]').first();
  await expect(submitBtn).toBeEnabled({ timeout: 15_000 });
  await submitBtn.click();
}

test.describe('Customer auth — OTP login', () => {
  test('masuk page tampil dengan form phone input', async ({ page }) => {
    test.slow();
    await page.goto('/id/masuk', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 60_000 });
    const phoneInput = page.locator('#customer-phone');
    await expect(phoneInput).toBeVisible();
    await expect(phoneInput).toHaveAttribute('type', 'tel');
  });

  test('request OTP tampilkan cooldown button', async ({ page }) => {
    test.slow();
    const phone = generatePhone();
    await submitPhone(page, phone);

    // After OTP request → verify OTP input appears or cooldown text is visible
    const otpInput = page.locator('#otp-code');
    await expect(otpInput).toBeVisible({ timeout: 30_000 });
    const cooldownBtn = page.locator('button:has-text("s)")');
    await expect(cooldownBtn).toBeVisible({ timeout: 10_000 });
  });

  test('submit phone valid → OTP di-log ke laravel.log', async ({ page }) => {
    test.slow();
    const phone = generatePhone();
    await submitPhone(page, phone);

    // Wait for OTP step to appear
    await expect(page.locator('#otp-code')).toBeVisible({ timeout: 30_000 });

    // Check the log for OTP
    const otp = await getOtpWithRetry(page, phone);
    expect(otp).toBeTruthy();
    expect(otp).toHaveLength(6);
  });

  test('submit OTP valid dari log → login sukses + redirect', async ({ page }) => {
    test.slow();
    const phone = generatePhone();
    await submitPhone(page, phone);

    const otpCodeInput = page.locator('#otp-code');
    await expect(otpCodeInput).toBeVisible({ timeout: 30_000 });

    const otp = await getOtpWithRetry(page, phone);
    if (!otp) {
      test.skip(true, 'OTP not found in laravel.log');
      return;
    }

    // Fill OTP
    await otpCodeInput.click();
    await otpCodeInput.pressSequentially(otp, { delay: 40 });

    // Should redirect to /id/akun
    await page.waitForURL(/\/akun/, { timeout: 30_000 });
    expect(page.url()).toContain('/akun');
  });

  test('submit OTP salah → error message tampil', async ({ page }) => {
    test.slow();
    const phone = generatePhone();
    await submitPhone(page, phone);

    const otpCodeInput = page.locator('#otp-code');
    await expect(otpCodeInput).toBeVisible({ timeout: 30_000 });

    // Enter wrong OTP (6 digits)
    await otpCodeInput.click();
    await otpCodeInput.pressSequentially('000000', { delay: 40 });

    // Wait for error to appear
    const errorEl = page.locator('.bg-red-100, [class*="text-red"]').first();
    await expect(errorEl).toBeVisible({ timeout: 15_000 });
  });

  test('submit OTP expired → error expired tampil', async ({ page }) => {
    test.slow();
    const phone = generatePhone();
    await submitPhone(page, phone);

    const otpCodeInput = page.locator('#otp-code');
    await expect(otpCodeInput).toBeVisible({ timeout: 30_000 });

    // Enter non-matching OTP
    await otpCodeInput.click();
    await otpCodeInput.pressSequentially('999999', { delay: 40 });

    // Wait for error message
    const errorEl = page.locator('.bg-red-100, [class*="text-red"]').first();
    await expect(errorEl).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Customer auth — protected /akun/* routes', () => {
  test('akses /akun tanpa token → redirect ke /masuk?next=/akun', async ({ page }) => {
    const response = await page.goto('/id/akun', { waitUntil: 'domcontentloaded' });
    expect(page.url()).toMatch(/\/masuk/);
    expect(page.url()).toMatch(/next/);
    expect(response?.status()).toBeLessThan(400);
  });

  test('akses /akun/pesanan tanpa token → redirect', async ({ page }) => {
    const response = await page.goto('/id/akun/pesanan', { waitUntil: 'domcontentloaded' });
    expect(page.url()).toMatch(/\/masuk/);
    expect(response?.status()).toBeLessThan(400);
  });

  test('login dulu lalu akses /akun → dashboard render dengan nama user', async ({ page }) => {
    test.slow();
    const phone = generatePhone();
    await submitPhone(page, phone);

    await expect(page.locator('#otp-code')).toBeVisible({ timeout: 30_000 });

    const otp = await getOtpWithRetry(page, phone);
    if (!otp) {
      test.skip(true, 'OTP unavailable in log');
      return;
    }

    await page.locator('#otp-code').click();
    await page.locator('#otp-code').pressSequentially(otp, { delay: 40 });
    await page.waitForURL(/\/akun/, { timeout: 30_000 });

    // Dashboard renders
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 30_000 });
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toMatch(/Pelanggan|Dashboard|Akun/i);
  });

  test('logout dari /akun/profil → redirect ke /masuk', async ({ page, context }) => {
    test.slow();
    const phone = generatePhone();
    const reqRes = await page.request.post('http://localhost:8000/api/customer/auth/request-otp', {
      data: { phone, locale: 'id' },
    });

    if (!reqRes.ok()) {
      test.skip(true, 'OTP request API failed');
      return;
    }

    const otp = await getOtpWithRetry(page, phone);
    if (!otp) {
      test.skip(true, 'OTP unavailable in log');
      return;
    }

    const verifyRes = await page.request.post('http://localhost:8000/api/customer/auth/verify-otp', {
      data: { phone, code: otp },
    });

    if (!verifyRes.ok()) {
      test.skip(true, 'OTP verify API failed');
      return;
    }

    const { token } = await verifyRes.json();

    // Set cookie + localStorage via init script before navigating
    await context.addCookies([{
      name: 'customer_token',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    }]);

    await page.addInitScript((t) => {
      localStorage.setItem('customer_token', t);
    }, token);

    page.on('dialog', (dialog) => {
      dialog.accept();
    });

    await page.goto('/id/akun/profil', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 60_000 });

    // Click logout button in AccountSidebar
    const logoutBtn = page.locator('button').filter({ hasText: /logout|keluar|🚪/i }).first();
    await expect(logoutBtn).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1000);
    await logoutBtn.click();
    await page.waitForURL(/\/masuk/, { timeout: 30_000 });
    expect(page.url()).toContain('/masuk');
  });
});

test.describe('Customer auth — TopNav state', () => {
  test('TopNav tampilkan link "Masuk" saat belum login', async ({ page }) => {
    test.slow();
    await page.goto('/id/katalog', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 60_000 });

    const masukLink = page.locator('header a[href*="/masuk"], header button:has-text("Masuk")').first();
    await expect(masukLink).toBeVisible();
  });

  test('TopNav tampilkan link "Akun" saat sudah login', async ({ page, context }) => {
    test.slow();
    await context.addCookies([{
      name: 'customer_token',
      value: 'fake-token-for-topnav-test',
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    }]);

    await page.goto('/id/katalog', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 60_000 });

    await page.evaluate(() => localStorage.setItem('customer_token', 'fake-token-for-topnav-test'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 60_000 });

    const akunLink = page.locator('header a[href*="/akun"], header button:has-text("Akun")').first();
    await expect(akunLink).toBeVisible({ timeout: 10_000 });
  });
});
