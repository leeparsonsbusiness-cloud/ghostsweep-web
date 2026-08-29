const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const JSZip = require('jszip');

const BASE_URL = 'http://localhost:3000';
const ARTIFACTS_DIR = '/Users/macbook/.gemini/antigravity/brain/90629609-6505-4bee-9910-b1029f2971da';

async function runTests() {
  console.log('========================================');
  console.log('STARTING BACKEND & UI TEST SUITE');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // TEST 1: Health Check Endpoint
  console.log('[1] Testing /api/health...');
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    assert(res.status === 200, 'Health endpoint returns HTTP 200');
    assert(data.status === 'ok' && data.service === 'GhostSweep API', 'Health response payload is valid');
  } catch (err) {
    assert(false, `Health endpoint failed: ${err.message}`);
  }

  // TEST 2: Audit API (GET)
  console.log('\n[2] Testing /api/audit (GET with known username)...');
  try {
    const res = await fetch(`${BASE_URL}/api/audit?username=theleeparsons`);
    const json = await res.json();
    assert(res.status === 200, 'Audit GET returns HTTP 200');
    assert(json.success === true, 'Audit GET success flag is true');
    assert(json.data.username === 'theleeparsons', 'Audited username matches query');
    assert(json.data.isLiveRealData === true, 'Live Instagram data is fetched successfully');
    assert(json.data.followers === 2386, 'Fetched exact real follower count (2,386)');
    assert(json.data.following > 2500, 'Fetched live real following count');
    assert(json.data.ratio > 0.5, 'Calculated live real ratio');
    assert(json.data.healthScore >= 0 && json.data.healthScore <= 100, 'Health score is within 0-100');
    assert(json.data.sampleAccounts.length > 0, 'Returns sample demographic accounts');
  } catch (err) {
    assert(false, `Audit GET failed: ${err.message}`);
  }

  // TEST 3: Audit API (POST custom metrics)
  console.log('\n[3] Testing /api/audit (POST with custom stats)...');
  try {
    const res = await fetch(`${BASE_URL}/api/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'growth_tester',
        followers: 15000,
        following: 1200,
        avgLikes: 600
      })
    });
    const json = await res.json();
    assert(res.status === 200, 'Audit POST returns HTTP 200');
    assert(json.data.ratio === 12.5, 'Calculates correct 12.5x ratio');
    assert(json.data.ratioRating === 'Elite', 'Classifies as Elite ratio rating');
  } catch (err) {
    assert(false, `Audit POST failed: ${err.message}`);
  }

  // TEST 4: Checkout API (Valid & Invalid)
  console.log('\n[4] Testing /api/checkout...');
  let generatedLicense = '';
  try {
    // Valid email
    const res = await fetch(`${BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'creator@ghostsweep.info' })
    });
    const json = await res.json();
    assert(res.status === 200, 'Checkout POST returns HTTP 200 for valid email');
    assert(json.success === true, 'Checkout success is true');
    assert(/^GSWEEP-[A-Z0-9]{4}-[A-Z0-9]{4}-2026$/.test(json.licenseKey), 'Generated valid license key format');
    generatedLicense = json.licenseKey;

    // Invalid email
    const invalidRes = await fetch(`${BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' })
    });
    assert(invalidRes.status === 400, 'Checkout returns HTTP 400 for invalid email');
  } catch (err) {
    assert(false, `Checkout failed: ${err.message}`);
  }

  // TEST 5: Verify License API
  console.log('\n[5] Testing /api/verify-license...');
  try {
    const validRes = await fetch(`${BASE_URL}/api/verify-license?key=${generatedLicense}`);
    const validJson = await validRes.json();
    assert(validRes.status === 200 && validJson.valid === true, 'Validates newly issued license key');

    const invalidRes = await fetch(`${BASE_URL}/api/verify-license?key=INVALID-KEY-1234`);
    assert(invalidRes.status === 401, 'Rejects invalid license key with HTTP 401');
  } catch (err) {
    assert(false, `License verification failed: ${err.message}`);
  }

  // TEST 6: Download Extension ZIP Package API
  console.log('\n[6] Testing /api/download-extension (ZIP generation)...');
  try {
    const res = await fetch(`${BASE_URL}/api/download-extension?licenseKey=${generatedLicense}`);
    assert(res.status === 200, 'Download endpoint returns HTTP 200');
    assert(res.headers.get('content-type') === 'application/zip', 'Content-Type is application/zip');

    const arrayBuffer = await res.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    assert(zip.file('manifest.json') !== null, 'ZIP includes manifest.json');
    assert(zip.file('popup.html') !== null, 'ZIP includes popup.html');
    assert(zip.file('popup.js') !== null, 'ZIP includes popup.js');
    assert(zip.file('styles.css') !== null, 'ZIP includes styles.css');
    assert(zip.file('background.js') !== null, 'ZIP includes background.js');
    assert(zip.file('content.js') !== null, 'ZIP includes content.js');

    const manifestContent = JSON.parse(await zip.file('manifest.json').async('string'));
    assert(manifestContent.manifest_version === 3, 'Manifest is Chrome Manifest V3 compliant');
  } catch (err) {
    assert(false, `Download extension failed: ${err.message}`);
  }

  // TEST 7: End-to-End Browser UI & Interaction Testing
  console.log('\n[7] Testing Minimalist Browser UI Flows with Puppeteer...');
  try {
    const browser = await puppeteer.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));

    // Check title
    const title = await page.title();
    assert(title.includes('GhostSweep'), 'Page title contains GhostSweep');

    // Test Search Input
    console.log('  -> Executing search for @theleeparsons...');
    await page.waitForSelector('#search-input', { visible: true });
    await page.click('#search-input');
    await page.keyboard.down('Meta');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Meta');
    await page.keyboard.press('Backspace');
    await page.type('#search-input', 'theleeparsons');
    await page.click('#audit-submit-btn');
    await new Promise(r => setTimeout(r, 2500));

    const cardVisible = await page.evaluate(() => {
      return document.body.textContent.includes('theleeparsons') && document.body.textContent.includes('Live IG Data');
    });
    assert(cardVisible, 'Search successfully fetched and rendered real live Instagram profile for @theleeparsons');

    // Test Theme Toggle
    console.log('  -> Testing Dark/Light Theme Toggle...');
    const themeBtn = await page.$('header button[aria-label="Toggle theme"]');
    if (themeBtn) {
      await themeBtn.click();
      await new Promise(r => setTimeout(r, 400));
      const isLight = await page.evaluate(() => !document.documentElement.classList.contains('dark'));
      assert(isLight, 'Theme toggle switched document to Light Mode');

      await themeBtn.click();
      await new Promise(r => setTimeout(r, 400));
      const isDarkAgain = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      assert(isDarkAgain, 'Theme toggle restored Dark Mode');
    }

    // Test Checkout Modal
    console.log('  -> Opening and completing checkout flow...');
    await page.waitForSelector('#navbar-cta-btn', { visible: true });
    await page.click('#navbar-cta-btn');
    await new Promise(r => setTimeout(r, 800));

    await page.waitForSelector('#checkout-email-input', { visible: true });
    await page.type('#checkout-email-input', 'user@example.com');
    await new Promise(r => setTimeout(r, 200));
    await page.click('#checkout-submit-btn');
    await new Promise(r => setTimeout(r, 1500));

    const purchaseSuccess = await page.evaluate(() => {
      return document.body.textContent.includes('Purchase Complete') || document.body.textContent.includes('GSWEEP-');
    });
    assert(purchaseSuccess, 'End-to-end checkout successfully completed and delivered license key');

    await browser.close();
  } catch (err) {
    assert(false, `Browser UI testing failed: ${err.message}`);
  }

  console.log('\n========================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
