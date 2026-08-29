const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = '/Users/macbook/.gemini/antigravity/brain/90629609-6505-4bee-9910-b1029f2971da';

async function run() {
  console.log('Launching browser for animation capture...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  // 1. Capture at 0.7s (Door swing open & ghost in action)
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'ghost_anim_frame1_opening.png'),
    clip: { x: 390, y: 50, width: 500, height: 320 }
  });
  console.log('Saved ghost_anim_frame1_opening.png');

  // 2. Capture at 1.8s (Tossing mock profile pics)
  await new Promise(r => setTimeout(r, 1100));
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'ghost_anim_frame2_tossing.png'),
    clip: { x: 320, y: 40, width: 640, height: 350 }
  });
  console.log('Saved ghost_anim_frame2_tossing.png');

  // 3. Capture at 3.0s (Multiple profile pics in flight)
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'ghost_anim_frame3_active.png'),
    clip: { x: 320, y: 40, width: 640, height: 350 }
  });
  console.log('Saved ghost_anim_frame3_active.png');

  // 4. Capture at 5.5s (Door closed, clean settled still image)
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'ghost_anim_frame4_completed.png'),
    clip: { x: 390, y: 50, width: 500, height: 320 }
  });
  console.log('Saved ghost_anim_frame4_completed.png');

  await browser.close();
  console.log('All 4 animation stages captured successfully!');
}

run().catch(console.error);
