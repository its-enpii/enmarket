import type { BrowserContext } from '@playwright/test';

export const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? 'dev-admin-token-12345';

/**
 * Inject admin_token cookie into context — bypass UI login.
 * Mirrors the pattern from admin.spec.ts.
 */
export async function injectAdminCookie(context: BrowserContext): Promise<void> {
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
}
