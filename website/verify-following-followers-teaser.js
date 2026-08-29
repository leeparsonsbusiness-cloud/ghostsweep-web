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
  console.log('TESTING FOLLOWING VS FOLLOWERS & TEASER PREVIEW');
  console.log('======================================================\n');

  // 1. API: Following targetType
  console.log('[1] Testing POST /api/audit (targetType: "following")...');
  const resFollowing = await fetch('http://localhost:3000/api/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'theleeparsons', targetType: 'following' })
  });
  const jsonFollowing = await resFollowing.json();
  assert(resFollowing.status === 200, 'POST following returns HTTP 200');
  assert(jsonFollowing.data.targetType === 'following', 'Target type is following');
  assert(jsonFollowing.data.demographics.malePct === 41, 'Following Male Pct is 41%');
  assert(jsonFollowing.data.demographics.femalePct === 53, 'Following Female Pct is 53%');
  assert(jsonFollowing.data.demographics.inactivePct === 6, 'Following Inactive Pct is 6%');
  assert(jsonFollowing.data.sampleAccounts.length === 3, 'Returns exactly 3 teaser accounts');
  assert(jsonFollowing.data.lockedCount > 0, 'Returns locked count');

  // 2. API: Followers targetType
  console.log('\n[2] Testing POST /api/audit (targetType: "followers")...');
  const resFollowers = await fetch('http://localhost:3000/api/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'theleeparsons', targetType: 'followers' })
  });
  const jsonFollowers = await resFollowers.json();
  assert(resFollowers.status === 200, 'POST followers returns HTTP 200');
  assert(jsonFollowers.data.targetType === 'followers', 'Target type is followers');
  assert(jsonFollowers.data.demographics.malePct === 48, 'Audience Male Pct is 48%');
  assert(jsonFollowers.data.demographics.femalePct === 38, 'Audience Female Pct is 38%');
  assert(jsonFollowers.data.demographics.inactivePct === 14, 'Audience Inactive Pct is 14%');
  assert(jsonFollowers.data.sampleAccounts.length === 3, 'Returns exactly 3 audience teaser accounts');

  // 3. Puppeteer Browser Testing
  console.log('\n[3] Testing Browser UI Flows with Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1100, deviceScaleFactor: 2 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Search for theleeparsons
  await page.focus('#search-input');
  await page.keyboard.down('Meta');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Meta');
  await page.keyboard.press('Backspace');
  await page.type('#search-input', 'theleeparsons');
  await page.click('#audit-submit-btn');
  await new Promise(r => setTimeout(r, 2500));

  // Verify Following View
  console.log('  -> Verifying Following analysis view & 3-segment demographic bar...');
  const followingText = await page.evaluate(() => document.body.textContent);
  assert(followingText.includes('Following ('), 'Rendered Following toggle button');
  assert(followingText.includes('Followers ('), 'Rendered Followers toggle button');
  assert(followingText.includes('41%') && followingText.includes('53%'), 'Rendered Following demographic percentages');
  assert(followingText.includes('@sophia.la') || followingText.includes('Sample #1'), 'Rendered teaser preview accounts');
  assert(followingText.includes('more accounts locked in this category'), 'Rendered locked accounts counter');
  assert(followingText.includes('GhostSweep runs securely in your Chrome browser to inspect the exact account names'), 'Rendered value proposition copy');

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'screenshot_following_view.png'),
    fullPage: false
  });
  console.log('  ✓ Saved screenshot_following_view.png');

  // Switch to Followers Toggle
  console.log('  -> Switching to Followers (Audience) analysis view...');
  await page.click('#target-toggle-followers');
  await new Promise(r => setTimeout(r, 400));
  const followersText = await page.evaluate(() => document.body.textContent);
  assert(followersText.includes('48%') && followersText.includes('38%'), 'Rendered Audience demographic percentages (48% M / 38% F)');
  assert(followersText.includes('Audience Demographics Split') || followersText.includes('Ghost Audience'), 'Updated labels for Audience view');

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'screenshot_followers_view.png'),
    fullPage: false
  });
  console.log('  ✓ Saved screenshot_followers_view.png');

  // Click Unlock CTA Button
  console.log('  -> Clicking Unlock Full List CTA button...');
  await page.click('#unlock-list-cta-btn');
  await new Promise(r => setTimeout(r, 500));
  const isModalOpen = await page.evaluate(() => document.body.textContent.includes('GhostSweep Lifetime License') && document.body.textContent.includes('$1.99'));
  assert(isModalOpen, 'Unlock button triggered $1.99 lifetime license modal');

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'screenshot_unlock_modal.png'),
    fullPage: false
  });
  console.log('  ✓ Saved screenshot_unlock_modal.png');

  await browser.close();
  console.log('\n======================================================');
  console.log('ALL FOLLOWING/FOLLOWERS & TEASER TESTS PASSED (100%)');
  console.log('======================================================');
}

run().catch(console.error);
