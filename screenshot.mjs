import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:3456';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function screenshot(page, name, url, waitMs = 1500) {
  console.log(`  -> ${name} (${url})`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(waitMs);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, name),
    fullPage: true,
  });
  const currentUrl = page.url();
  console.log(`     final URL: ${currentUrl}`);
  return currentUrl;
}

(async () => {
  // Launch with explicit proxy bypass
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-proxy-server',
      '--proxy-bypass-list=localhost,127.0.0.1,::1',
    ],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  // ── 1. Navigate to login, fill form, and sign in ──
  console.log('1. Navigating to login page...');
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });

  // Fill in credentials
  console.log('2. Filling login form...');
  await page.fill('input#email', 'demo@copilot.test');
  await page.fill('input#password', 'demo123456');

  // Click the submit button (type=submit)
  console.log('3. Clicking submit...');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);

  let finalUrl = page.url();
  console.log(`   URL after submit: ${finalUrl}`);

  // If still on /login, try switching to sign-up tab first, then back to login
  if (finalUrl.includes('/login')) {
    console.log('4. Still on login, checking for error messages...');
    // Check page content for errors
    const bodyText = await page.textContent('body');
    if (bodyText.includes('Invalid') || bodyText.includes('错误')) {
      console.log('   Error detected on page');
    }

    // Try clicking sign up first
    const signUpBtn = page.locator('button:has-text("注册")');
    if (await signUpBtn.isVisible().catch(() => false)) {
      console.log('5. Clicking sign up tab...');
      await signUpBtn.click();
      await page.waitForTimeout(500);
      // Fill sign up form
      await page.fill('input#email', 'demo2@copilot.test');
      await page.fill('input#password', 'demo123456');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
      finalUrl = page.url();
      console.log(`   URL after signup: ${finalUrl}`);
    }

    // If still not authenticated, try login one more time
    if (finalUrl.includes('/login')) {
      console.log('6. Switching back to login...');
      const loginTab = page.locator('button:has-text("登录")');
      if (await loginTab.isVisible().catch(() => false)) {
        await loginTab.click();
        await page.waitForTimeout(300);
        await page.fill('input#email', 'demo@copilot.test');
        await page.fill('input#password', 'demo123456');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(5000);
        finalUrl = page.url();
        console.log(`   URL after retry: ${finalUrl}`);
      }
    }
  }

  // ── Take screenshots ──
  const urlsToScreenshot = [
    ['01_login', `${BASE}/login`],
    ['02_chat', `${BASE}/chat`],
    ['03_products', `${BASE}/products`],
    ['04_solutions', `${BASE}/solutions`],
    ['05_solutions_new', `${BASE}/solutions/new`],
  ];

  const isAuthed = !finalUrl.includes('/login');
  console.log(`\n7. Authenticated: ${isAuthed}. Taking screenshots...`);

  for (const [name, url] of urlsToScreenshot) {
    await screenshot(page, `${name}.png`, url);
  }

  await browser.close();
  console.log(`\nDone! Screenshots saved to: ${SCREENSHOT_DIR}`);

  // List files
  const files = fs.readdirSync(SCREENSHOT_DIR);
  files.forEach(f => {
    const stat = fs.statSync(path.join(SCREENSHOT_DIR, f));
    console.log(`  ${f} (${(stat.size / 1024).toFixed(1)} KB)`);
  });
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
