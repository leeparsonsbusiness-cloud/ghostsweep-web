const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = '/Users/macbook/.gemini/antigravity/brain/90629609-6505-4bee-9910-b1029f2971da';

async function run() {
  console.log('Launching browser to capture minimalist layout...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

  console.log('1. Loading Dark Mode...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  // Dark Mode Full View
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'minimal_dark_mode_full.png'),
    fullPage: false
  });
  console.log('Saved minimal_dark_mode_full.png');

  // 2. Toggle to Light Mode
  console.log('2. Toggling to Light Mode...');
  const themeToggle = await page.$('header button[aria-label="Toggle theme"]');
  if (themeToggle) {
    await themeToggle.click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'minimal_light_mode_full.png'),
      fullPage: false
    });
    console.log('Saved minimal_light_mode_full.png');
  }

  // 3. Test Checkout Modal
  console.log('3. Triggering Checkout Modal in Light Mode...');
  const extensionBtn = await page.$('#navbar-cta-btn');
  if (extensionBtn) {
    await extensionBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'minimal_checkout_modal.png'),
      fullPage: false
    });
    console.log('Saved minimal_checkout_modal.png');

    // Close modal
    const closeBtn = await page.$('.fixed button');
    if (closeBtn) await closeBtn.click();
    await new Promise(r => setTimeout(r, 400));
  }

  // 4. Test Reach Penalty Tab
  console.log('4. Testing Reach Penalty Tab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const tab = tabs.find(b => b.textContent.includes('REACH PENALTY'));
    if (tab) tab.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'minimal_penalty_tab.png'),
    fullPage: false
  });
  console.log('Saved minimal_penalty_tab.png');

  // 5. Mobile Viewport (iPhone size)
  console.log('5. Capturing Mobile Viewport...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  // Switch back to Profile Audit tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const tab = tabs.find(b => b.textContent.includes('PROFILE AUDIT'));
    if (tab) tab.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'minimal_mobile_view.png'),
    fullPage: false
  });
  console.log('Saved minimal_mobile_view.png');

  await browser.close();
  console.log('All minimal screenshots captured successfully!');
}

run().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
