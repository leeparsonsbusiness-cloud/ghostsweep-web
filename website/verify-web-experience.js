const puppeteer = require("puppeteer");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const http = require("http");

function waitForServer(port, timeout = 15000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(`http://localhost:${port}/api/health`, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          setTimeout(check, 300);
        }
      });
      req.on("error", () => {
        if (Date.now() - start > timeout) {
          reject(new Error("Timeout waiting for server to start"));
        } else {
          setTimeout(check, 300);
        }
      });
    };
    check();
  });
}

async function run() {
  console.log("=== Visual Verification Runner for Final Flow ===");
  const testPort = 3098;
  const server = spawn("npx", ["next", "start", "-p", String(testPort)], {
    cwd: __dirname,
    stdio: "pipe",
    env: { ...process.env, PORT: String(testPort) }
  });

  server.stdout.on("data", (d) => process.stdout.write(`[Server] ${d.toString()}`));
  server.stderr.on("data", (d) => process.stderr.write(`[Server ERR] ${d.toString()}`));

  console.log(`Waiting for server on http://localhost:${testPort}...`);
  await waitForServer(testPort);
  console.log("Server is online and healthy!");

  const screenshotsDir = path.join(__dirname, "public", "screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,1100"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1100 });

  try {
    // 1. Capture Main Locked Experience (5 Female + 5 Male previews & Lock CTA)
    console.log(`\n1. Navigating to http://localhost:${testPort}...`);
    await page.goto(`http://localhost:${testPort}`, { waitUntil: "networkidle2" });
    await page.waitForSelector("#results-card", { timeout: 20000 });
    await new Promise((r) => setTimeout(r, 1000));

    await page.screenshot({
      path: path.join(screenshotsDir, "1-locked-10-previews.png"),
      fullPage: true
    });
    console.log("✓ Saved 1-locked-10-previews.png");

    // 2. Open Checkout Modal
    console.log("\n2. Opening $1.99 Checkout Modal...");
    const unlockBtn = await page.$("#unlock-list-cta-btn");
    if (unlockBtn) {
      await unlockBtn.click();
      await page.waitForSelector("#checkout-email-input", { timeout: 5000 });
      await new Promise((r) => setTimeout(r, 500));
      await page.screenshot({
        path: path.join(screenshotsDir, "2-stripe-checkout-modal.png")
      });
      console.log("✓ Saved 2-stripe-checkout-modal.png");
      await page.keyboard.press("Escape");
      await new Promise((r) => setTimeout(r, 500));
    }

    // 3. Capture Unlocked State with [All] [Female Only] [Male Only] Filters
    console.log(`\n3. Navigating to Unlocked Profile View (?unlocked=true&username=alex.creator)...`);
    await page.goto(`http://localhost:${testPort}/?unlocked=true&username=alex.creator&email=test@example.com`, { waitUntil: "networkidle2" });
    await page.waitForSelector("#results-card", { timeout: 20000 });
    await new Promise((r) => setTimeout(r, 1000));

    await page.screenshot({
      path: path.join(screenshotsDir, "3-unlocked-filters-table.png"),
      fullPage: true
    });
    console.log("✓ Saved 3-unlocked-filters-table.png");

    // 4. Capture Dedicated /report/theleeparsons Route
    console.log(`\n4. Navigating to /report/theleeparsons...`);
    await page.goto(`http://localhost:${testPort}/report/theleeparsons`, { waitUntil: "networkidle2" });
    await page.waitForSelector("#results-card", { timeout: 20000 });
    await new Promise((r) => setTimeout(r, 1000));

    await page.screenshot({
      path: path.join(screenshotsDir, "4-report-dedicated-page.png"),
      fullPage: true
    });
    console.log("✓ Saved 4-report-dedicated-page.png");

    console.log("\n✨ Visual verification completed successfully!");
  } catch (err) {
    console.error("Puppeteer verification error:", err);
  } finally {
    await browser.close();
    server.kill();
    process.exit(0);
  }
}

run();
