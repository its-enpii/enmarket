const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  // Fake login to access admin
  await page.route('**/api/admin/me', async route => {
    await route.fulfill({ status: 200, json: { data: { id: 1, email: 'admin' } } });
  });

  await page.goto('http://localhost:3000/id/admin', { waitUntil: 'domcontentloaded' });
  const tile = page.locator('div:has-text("TOTAL PRODUCTS")').locator('..').first();
  await tile.waitFor({ state: 'visible', timeout: 10000 });

  const inspect = async (stateName) => {
    const data = await tile.evaluate((node) => {
      const s = getComputedStyle(node);
      return {
        transform: s.transform,
        translate: s.translate,
        boxShadow: s.boxShadow,
      };
    });
    console.log(`--- ADMIN TILE ${stateName} ---`);
    console.log('transform:', data.transform);
    console.log('translate:', data.translate);
    console.log('boxShadow:', data.boxShadow);
  };

  await inspect('IDLE');
  await tile.hover();
  await page.waitForTimeout(400);
  await inspect('HOVER');

  await browser.close();
})();
