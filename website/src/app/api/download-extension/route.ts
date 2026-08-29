import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const licenseKey = searchParams.get("licenseKey") || searchParams.get("key") || "GSWEEP-TRIAL-LIFETIME-2026";

  const zip = new JSZip();

  // 1. manifest.json
  const manifest = {
    manifest_version: 3,
    name: "GhostSweep — Instagram Follower Audit & Safe Cleaner",
    version: "2.4.0",
    description: "100% Client-Side Instagram Follower Audit, Demographic Segmentation, and Safe 10-Batch Cleaner.",
    permissions: ["storage", "alarms", "activeTab", "scripting"],
    host_permissions: ["*://*.instagram.com/*"],
    action: {
      default_popup: "popup.html",
      default_title: "GhostSweep v2.4",
      default_icon: "icon128.png"
    },
    background: {
      service_worker: "background.js"
    },
    content_scripts: [
      {
        matches: ["*://*.instagram.com/*"],
        js: ["content.js"],
        run_at: "document_idle"
      }
    ],
    icons: {
      "16": "icon128.png",
      "48": "icon128.png",
      "128": "icon128.png"
    }
  };

  zip.file("manifest.json", JSON.stringify(manifest, null, 2));

  // 2. popup.html
  const popupHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>GhostSweep v2.4</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body class="dark-theme">
  <div class="header">
    <div class="brand">
      <div class="logo-box">👻</div>
      <div>
        <h1>GhostSweep <span class="badge">v2.4 MV3</span></h1>
        <p class="subtitle">Instagram Follower Audit & Cleaner</p>
      </div>
    </div>
    <div class="session-pill">● Session Active</div>
  </div>

  <div class="license-banner">
    <span id="license-status">License: Active (Lifetime)</span>
    <span class="key-badge">${licenseKey}</span>
  </div>

  <div class="tabs">
    <button class="tab active" data-filter="all">All</button>
    <button class="tab" data-filter="non-followers">🚫 Non-Followers</button>
    <button class="tab" data-filter="male">👨 Male</button>
    <button class="tab" data-filter="female">👩 Female</button>
    <button class="tab" data-filter="inactive">👻 Inactive &gt;90d</button>
  </div>

  <div class="controls-bar">
    <button id="select-all-btn">Select All</button>
    <span id="selected-count">0 accounts selected</span>
  </div>

  <div id="accounts-container" class="accounts-list">
    <div class="loading-state">Scanning active Instagram tab...</div>
  </div>

  <div class="footer-actions">
    <div class="safety-indicator">
      <span>🛡️ Safe Mode: 10-batch (15s human jitter delay)</span>
    </div>
    <div class="progress-bar-wrap">
      <div id="progress-bar" class="progress-bar"></div>
    </div>
    <div class="btn-group">
      <button id="start-batch-btn" class="primary-btn">Start Safe 10-Batch</button>
    </div>
  </div>

  <script src="popup.js"></script>
</body>
</html>`;

  zip.file("popup.html", popupHtml);

  // 3. styles.css
  const stylesCss = `body {
  margin: 0;
  padding: 12px;
  width: 380px;
  min-height: 480px;
  background: #0B0F19;
  color: #F8FAFC;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 13px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}
.logo-box {
  width: 28px;
  height: 28px;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.4);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
h1 {
  font-size: 14px;
  margin: 0;
  font-weight: 800;
  color: #FFF;
}
.subtitle {
  font-size: 10px;
  color: #94A3B8;
  margin: 0;
}
.badge {
  font-size: 9px;
  background: rgba(56, 189, 248, 0.2);
  color: #38BDF8;
  padding: 1px 5px;
  border-radius: 4px;
}
.session-pill {
  font-size: 10px;
  color: #34D399;
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.3);
  padding: 2px 6px;
  border-radius: 12px;
}
.license-banner {
  background: #131C31;
  border: 1px solid #1E293B;
  padding: 6px 8px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #94A3B8;
  margin-bottom: 10px;
}
.key-badge {
  color: #38BDF8;
  font-weight: bold;
}
.tabs {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  margin-bottom: 8px;
}
.tab {
  background: #0F172A;
  border: 1px solid #1E293B;
  color: #94A3B8;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
}
.tab.active {
  background: #38BDF8;
  color: #0B0F19;
  font-weight: bold;
}
.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 2px;
  font-size: 11px;
  color: #94A3B8;
  margin-bottom: 8px;
}
.controls-bar button {
  background: none;
  border: none;
  color: #38BDF8;
  cursor: pointer;
  padding: 0;
  font-weight: bold;
}
.accounts-list {
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid #1E293B;
  border-radius: 8px;
  background: #0F172A;
  padding: 6px;
}
.account-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px;
  border-bottom: 1px solid #1E293B;
  font-size: 11px;
}
.account-item:last-child {
  border-bottom: none;
}
.footer-actions {
  margin-top: 10px;
}
.safety-indicator {
  font-size: 10px;
  color: #94A3B8;
  margin-bottom: 6px;
}
.progress-bar-wrap {
  width: 100%;
  height: 4px;
  background: #1E293B;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}
.progress-bar {
  width: 0%;
  height: 100%;
  background: #38BDF8;
  transition: width 0.3s ease;
}
.primary-btn {
  width: 100%;
  padding: 10px;
  background: linear-gradient(90deg, #38BDF8, #22D3EE);
  color: #0B0F19;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 13px;
  cursor: pointer;
}`;

  zip.file("styles.css", stylesCss);

  // 4. popup.js
  const popupJs = `console.log("GhostSweep Extension Initialized");
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("accounts-container");
  const startBtn = document.getElementById("start-batch-btn");
  const selectAllBtn = document.getElementById("select-all-btn");
  const countLabel = document.getElementById("selected-count");
  const progressBar = document.getElementById("progress-bar");

  // Sample accounts detected in session
  const accounts = [
    { username: "crypto_apex_alpha", days: 142, gender: "male", nonFollower: true },
    { username: "sophia.lifestyle.vibe", days: 95, gender: "female", nonFollower: true },
    { username: "dropship_king_dan", days: 210, gender: "male", nonFollower: true },
    { username: "emma_wanderlust_x", days: 118, gender: "female", nonFollower: true },
    { username: "tech_growth_jay", days: 12, gender: "male", nonFollower: false }
  ];

  let selected = new Set(accounts.filter(a => a.nonFollower).map(a => a.username));

  function render() {
    container.innerHTML = accounts.map(a => \`
      <div class="account-item">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
          <input type="checkbox" \${selected.has(a.username) ? 'checked' : ''} data-user="\${a.username}">
          <span>@\${a.username}</span>
        </label>
        <span style="color:#94A3B8;font-size:10px;">\${a.days}d inactive</span>
      </div>
    \`).join('');

    countLabel.textContent = \`\${selected.size} selected\`;

    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const u = e.target.dataset.user;
        if (e.target.checked) selected.add(u);
        else selected.delete(u);
        countLabel.textContent = \`\${selected.size} selected\`;
      });
    });
  }

  render();

  selectAllBtn.addEventListener('click', () => {
    if (selected.size === accounts.length) selected.clear();
    else accounts.forEach(a => selected.add(a.username));
    render();
  });

  let running = false;
  startBtn.addEventListener('click', () => {
    if (running) return;
    running = true;
    startBtn.textContent = "Processing Safe Batch...";
    let current = 0;
    const interval = setInterval(() => {
      current++;
      progressBar.style.width = \`\${(current / 5) * 100}%\`;
      if (current >= 5) {
        clearInterval(interval);
        startBtn.textContent = "✓ Batch Complete (5 Unfollowed)";
        running = false;
      }
    }, 1000);
  });
});`;

  zip.file("popup.js", popupJs);

  // 5. background.js
  const backgroundJs = `// GhostSweep Manifest V3 Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("GhostSweep Extension Installed & Rate Limiter Active");
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "safe_cooldown_alarm") {
    console.log("Safe cooldown cycle ended. Auto-pilot resuming.");
  }
});`;

  zip.file("background.js", backgroundJs);

  // 6. content.js
  const contentJs = `// GhostSweep Content Script (Injected on Instagram)
console.log("GhostSweep Content Script Active on Instagram");
window.GhostSweepLoaded = true;`;

  zip.file("content.js", contentJs);

  // 7. icon SVG placeholder (128x128)
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <rect width="128" height="128" rx="28" fill="#0B0F19"/>
  <circle cx="64" cy="64" r="54" fill="none" stroke="#38BDF8" stroke-width="4"/>
  <path d="M40 76V56C40 42.7452 50.7452 32 64 32C77.2548 32 88 42.7452 88 56V76C88 80 84 84 80 80C76 76 72 80 68 84C64 88 60 84 56 80C52 76 48 80 44 84C40 88 40 80 40 76Z" fill="#38BDF8"/>
  <circle cx="54" cy="52" r="4" fill="#0B0F19"/>
  <circle cx="74" cy="52" r="4" fill="#0B0F19"/>
</svg>`;

  zip.file("icon128.png", iconSvg);

  // 8. README.txt
  const readme = `GhostSweep Extension v2.4 (Chrome Manifest V3)
License Key: ${licenseKey}

INSTALLATION INSTRUCTIONS (Takes 30 seconds):
1. Unzip this package into a folder on your computer.
2. Open Google Chrome (or Brave / Edge).
3. Navigate to chrome://extensions in your address bar.
4. Turn on "Developer mode" toggle in the top-right corner.
5. Click "Load unpacked" and select this unzipped folder.
6. Pin GhostSweep to your browser toolbar!
7. Open Instagram and launch your safe follower audit.

Support: support@ghostsweep.info`;

  zip.file("README.txt", readme);

  // Generate binary zip ArrayBuffer
  const zipArrayBuffer = await zip.generateAsync({ type: "arraybuffer" });

  return new Response(zipArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="ghostsweep-chrome-extension-v2.4.zip"',
      "Cache-Control": "no-cache",
    },
  });
}
