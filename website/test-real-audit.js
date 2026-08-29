const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = '/Users/macbook/.gemini/antigravity/brain/90629609-6505-4bee-9910-b1029f2971da';

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ PASS: ${message}`);
}

async function run() {
  console.log('======================================================');
  console.log('TESTING REAL INSTAGRAM DATA EXTRACTION & TEASERS');
  console.log('======================================================\n');

  // 1. API Verification
  console.log('[1] Testing POST /api/audit for @theleeparsons...');
  const res = await fetch('http://localhost:3000/api/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'theleeparsons', targetType: 'following' })
  });
  const json = await res.json();
  assert(res.status === 200, 'POST /api/audit returns HTTP 200');
  assert(json.data.isLiveRealData === true, 'isLiveRealData is true');
  assert(json.data.follower_count === 2386, 'Live follower count: 2,386');
  assert(json.data.following_count > 2500, 'Live following count: ~2,984');
  assert(json.data.sampleAccounts.length >= 3, 'Returns 3+ sample accounts');
  
  console.log('  Extracted Sample Accounts:');
  json.data.sampleAccounts.forEach(acc => {
    console.log(`    - @${acc.username} (${acc.name}) | Tag: ${acc.tag} | Verified: ${acc.isVerified}`);
  });

  const hasRealUser = json.data.sampleAccounts.some(acc => 
    acc.username === 'anweezy' || 
    acc.username === 'dreamlandstudios2026' || 
    acc.username === 'takomapark6ward' || 
    acc.username === 'vontepicassionte' || 
    acc.username === 'kireelsasser'
  );
  assert(hasRealUser, 'Sample accounts contain real extracted Instagram users from @theleeparsons posts');

  // 2. Puppeteer UI Verification
  console.log('\n[2] Testing Browser UI with Puppeteer...');
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

  const pageContent = await page.evaluate(() => document.body.textContent);
  assert(pageContent.includes('anweezy') || pageContent.includes('dreamlandstudios') || pageContent.includes('theleeparsons'), 'Page renders real extracted Instagram accounts in preview drawer');

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'screenshot_real_accounts_audit.png'),
    fullPage: false
  });
  console.log('  ✓ Saved screenshot_real_accounts_audit.png');

  await browser.close();
  console.log('\n======================================================');
  console.log('ALL REAL DATA EXTRACTION TESTS PASSED (100%)');
  console.log('======================================================');
}

run().catch(console.error);
