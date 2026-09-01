const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const ARTIFACTS_DIR = "/Users/macbook/.gemini/antigravity/brain/ef4060ab-6401-4191-bc50-367df5dbe80d/screenshots";
const BASE_URL = "http://localhost:3000";

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

async function verifyNightlifeUI() {
  console.log("Launching headless browser for visual verification...");
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1280, height: 900 },
  });

  const page = await browser.newPage();

  // 1. Capture Hero & Homepage
  console.log("1. Capturing Hero & Homepage with Dating & Nightlife copy...");
  await page.goto(BASE_URL, { waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "1-nightlife-hero.png"), fullPage: false });

  // 2. Perform Audit & Capture Preview Card with 5 Profiles + Timestamps + Paywall
  console.log("2. Performing Audit for @theleeparsons and capturing Preview Card...");
  await page.waitForSelector("#search-input");
  await page.click("#search-input", { clickCount: 3 });
  await page.type("#search-input", "theleeparsons");
  await page.click("#audit-submit-btn");

  await page.waitForSelector("#results-card", { timeout: 15000 });
  await page.waitForSelector("#unlock-list-cta-btn", { timeout: 10000 });
  await page.$eval("#results-card", (el) => el.scrollIntoView({ behavior: "instant", block: "start" }));
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "2-nightlife-5-previews-paywall.png"), fullPage: false });

  // 3. Open and Capture Tabbed Auth Modal
  console.log("3. Opening and capturing Tabbed Auth Modal (Sign In / Create Account)...");
  await page.goto(BASE_URL, { waitUntil: "networkidle2" });
  await page.click("#navbar-auth-btn");
  await page.waitForSelector("#auth-password-input", { timeout: 8000 });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "3-nightlife-tabbed-auth-modal.png"), fullPage: false });

  // 4. Open and Capture $1.99 Checkout Modal
  console.log("4. Opening and capturing $1.99 Checkout Modal...");
  await page.goto(BASE_URL, { waitUntil: "networkidle2" });
  await page.waitForSelector("#search-input");
  await page.type("#search-input", "theleeparsons");
  await page.click("#audit-submit-btn");
  await page.waitForSelector("#unlock-list-cta-btn", { timeout: 15000 });
  await page.click("#unlock-list-cta-btn");
  await page.waitForSelector("#checkout-submit-btn", { timeout: 8000 });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "4-nightlife-checkout-modal.png"), fullPage: false });

  // 5. Simulate Unlocked Report & Capture Unlocked Table with Gender Filters
  console.log("5. Simulating Unlocked Report Route & Capturing Table with Filters...");
  await page.goto(`${BASE_URL}/report/theleeparsons?unlocked=true&email=nightlife_pro@example.com`, { waitUntil: "networkidle2" });
  await page.waitForSelector("#results-card", { timeout: 15000 });
  await page.$eval("#results-card", (el) => el.scrollIntoView({ behavior: "instant", block: "start" }));
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "5-nightlife-unlocked-filters-table.png"), fullPage: false });

  await browser.close();
  console.log("Visual verification complete! Screenshots saved to artifacts directory.");
}

verifyNightlifeUI().catch((err) => {
  console.error("Visual verification error:", err);
  process.exit(1);
});
