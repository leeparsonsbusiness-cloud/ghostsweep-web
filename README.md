# 👻 GhostSweep Monorepo

GhostSweep is a high-converting Instagram profile auditor and Chrome extension cleaner designed to inspect follower ratios, demographic splits, and safely clean ghost followers and non-reciprocal accounts on auto-pilot.

---

## 📁 Repository Structure

```
ghostsweeper/
├── extension/             # Chrome Extension (Manifest V3)
│   ├── manifest.json      # MV3 configuration & permissions
│   ├── popup.html         # Extension popup UI
│   ├── popup.js           # Extension controller & queue processor
│   ├── popup.css          # Extension styling
│   ├── background.js      # Service worker & rate-limiter
│   ├── content.js         # Instagram DOM & session scraper
│   ├── ExtPay.js          # Extension payment integration
│   └── icons/             # App icons (16px, 48px, 128px, 512px)
│
├── website/               # Next.js 14 Web Application & API
│   ├── src/
│   │   ├── app/           # App Router (audit API, proxy, checkout)
│   │   ├── components/    # Minimalist UI components
│   │   └── lib/           # Utility helpers
│   ├── public/            # Static assets and media
│   └── package.json       # Website dependencies
│
├── package.json           # Root workspace configuration
└── README.md              # Project documentation
```

---

## 🚀 Getting Started

### 1. Website Development (Next.js)

```bash
# Install website dependencies
cd website
npm install

# Run the development server
npm run dev
# or from the root:
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 2. Chrome Extension Installation (Manifest V3)

1. Open Google Chrome (or Brave / Edge).
2. Navigate to `chrome://extensions/` in your browser.
3. Enable **"Developer mode"** in the top-right corner.
4. Click **"Load unpacked"** and select the `extension/` directory.
5. Pin GhostSweep to your toolbar and open Instagram!

---

## 🧪 Testing

```bash
# Run automated verification suite
npm test
```
