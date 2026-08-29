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
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Find button containing "Add to Chrome" in header
  const headerBtn = await page.$('header button');
  if (headerBtn) {
    console.log('Clicking header CTA button...');
    await headerBtn.click();
    await new Promise(r => setTimeout(r, 1000));

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'checkout_modal_view.png'),
      fullPage: false
    });
    console.log('Saved checkout_modal_view.png');
  }

  // Also test legal modal
  const privacyBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('footer button'));
    const b = btns.find(x => x.textContent.includes('Privacy Policy'));
    if (b) {
      b.click();
      return true;
    }
    return false;
  });

  if (privacyBtn) {
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'legal_modal_view.png'),
      fullPage: false
    });
    console.log('Saved legal_modal_view.png');
  }

  await browser.close();
}

run().catch(console.error);
