const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = '/Users/macbook/.gemini/antigravity/brain/90629609-6505-4bee-9910-b1029f2971da';

async function run() {
  console.log('Launching browser with system Chrome...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1024, deviceScaleFactor: 2 });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Hero View
  console.log('Capturing Hero...');
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'hero_view.png'),
    clip: { x: 0, y: 0, width: 1440, height: 860 }
  });

  // 2. Health Analyzer
  console.log('Capturing Health Analyzer...');
  const analyzerEl = await page.$('#analyzer');
  if (analyzerEl) {
    await analyzerEl.screenshot({
      path: path.join(ARTIFACTS_DIR, 'analyzer_view.png')
    });
  }

  // 3. Extension Sandbox
  console.log('Capturing Sandbox...');
  const sandboxEl = await page.$('#sandbox');
  if (sandboxEl) {
    await sandboxEl.screenshot({
      path: path.join(ARTIFACTS_DIR, 'sandbox_view.png')
    });
  }

  // 4. Feature Matrix
  console.log('Capturing Feature Matrix...');
  const featuresEl = await page.$('#features');
  if (featuresEl) {
    await featuresEl.screenshot({
      path: path.join(ARTIFACTS_DIR, 'features_view.png')
    });
  }

  // 5. Pricing
  console.log('Capturing Pricing...');
  const pricingEl = await page.$('#pricing');
  if (pricingEl) {
    await pricingEl.screenshot({
      path: path.join(ARTIFACTS_DIR, 'pricing_view.png')
    });
  }

  // 6. Checkout Modal
  console.log('Triggering and capturing Checkout Modal...');
  await page.evaluate(() => {
    // Click the main Get GhostSweep Extension CTA button
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('Add to Chrome') || b.textContent.includes('Get GhostSweep'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'checkout_modal_view.png'),
    clip: { x: 320, y: 80, width: 800, height: 800 }
  });

  // 7. Test interactive batch simulation in Sandbox
  console.log('Testing Interactive Sandbox batch run...');
  // close modal first
  await page.evaluate(() => {
    const closeBtn = document.querySelector('.fixed button');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Click Male Demographics tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('#sandbox button'));
    const maleTab = tabs.find(t => t.textContent.includes('Male Demographics'));
    if (maleTab) maleTab.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'sandbox_male_tab.png'),
    clip: { x: 200, y: 1500, width: 1040, height: 750 }
  });

  // 8. Mobile Viewport (iPhone 14 Pro size)
  console.log('Capturing Mobile View...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'mobile_hero_view.png'),
    clip: { x: 0, y: 0, width: 390, height: 844 }
  });

  await browser.close();
  console.log('Screenshots and interaction verification complete!');
}

run().catch(err => {
  console.error('Error in capture script:', err);
  process.exit(1);
});
