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
  await page.setViewport({ width: 1280, height: 950, deviceScaleFactor: 2 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Clear input completely
  await page.focus('#search-input');
  await page.keyboard.down('Meta');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Meta');
  await page.keyboard.press('Backspace');
  await page.type('#search-input', 'theleeparsons');
  await new Promise(r => setTimeout(r, 200));

  // Click Audit
  await page.click('#audit-submit-btn');
  console.log('Submitted audit for @theleeparsons. Waiting for live result...');
  await new Promise(r => setTimeout(r, 3000));

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'live_theleeparsons_audit.png'),
    fullPage: false
  });
  console.log('Saved live_theleeparsons_audit.png');

  await browser.close();
}

run().catch(console.error);
