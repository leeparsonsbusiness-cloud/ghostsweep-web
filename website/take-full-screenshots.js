const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = '/Users/macbook/.gemini/antigravity/brain/90629609-6505-4bee-9910-b1029f2971da';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1400, deviceScaleFactor: 2 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  await page.focus('#search-input');
  await page.keyboard.down('Meta');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Meta');
  await page.keyboard.press('Backspace');
  await page.type('#search-input', 'theleeparsons');
  await page.click('#audit-submit-btn');
  await new Promise(r => setTimeout(r, 2500));

  // Full page screenshot of Following view with drawer & CTA
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'screenshot_full_following_view.png'),
    fullPage: false
  });

  // Switch to Followers
  await page.click('#target-toggle-followers');
  await new Promise(r => setTimeout(r, 500));

  // Full page screenshot of Followers view with drawer & CTA
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'screenshot_full_followers_view.png'),
    fullPage: false
  });

  await browser.close();
}

run().catch(console.error);
