# Finvanta Health Benefit Diagnostic - Setup Instructions

## Quick Start

```bash
# 1. Extract the ZIP file
unzip finvanta-phase4-complete.zip
cd finvanta-diagnostic

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Open browser to: http://localhost:5173
```

The dashboard should load immediately with the Moderate scenario selected by default.

---

## System Requirements

### Minimum Requirements
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **RAM:** 4GB
- **Disk Space:** 500MB

### Recommended
- **Node.js:** v22.x (latest LTS)
- **npm:** v10.x
- **RAM:** 8GB
- **Browser:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Check Your Versions
```bash
node --version   # Should show v18.0.0 or higher
npm --version    # Should show v9.0.0 or higher
```

---

## Installation Steps

### 1. Install Node.js (if needed)

**macOS:**
```bash
# Using Homebrew
brew install node

# Or download from: https://nodejs.org
```

**Windows:**
```bash
# Download installer from: https://nodejs.org
# Run the .msi installer
# Restart terminal after installation
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Extract Project Files

```bash
# Navigate to download location
cd ~/Downloads

# Extract ZIP
unzip finvanta-phase4-complete.zip

# Navigate to project
cd finvanta-diagnostic

# Verify files extracted
ls -la
# Should see: src/, public/, package.json, etc.
```

### 3. Install Dependencies

```bash
# From project root directory
npm install

# This will install:
# - React 18
# - Vite 8
# - Tailwind CSS 3
# - Vitest (testing)
# - And other dependencies
#
# Installation takes ~2-3 minutes
```

**Troubleshooting npm install:**
- If you see permission errors, never use `sudo npm install`
- Instead, fix npm permissions: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally
- If installation fails, delete `node_modules/` and `package-lock.json`, then retry

### 4. Start Development Server

```bash
npm run dev

# Expected output:
#   VITE v8.3.5  ready in XX ms
#
#   ➜  Local:   http://localhost:5173/
#   ➜  Network: use --host to expose
#   ➜  press h + enter to show help
```

**Server Options:**
```bash
# Default (port 5173)
npm run dev

# Custom port
npm run dev -- --port 3000

# Expose to network
npm run dev -- --host

# Custom host and port
npm run dev -- --host 0.0.0.0 --port 8080
```

### 5. Open Dashboard

Open your browser to: **http://localhost:5173**

You should see:
1. Yellow warning banner at top (synthetic data warning)
2. Blue header: "Finvanta Health Benefit Implementation Diagnostic"
3. Scenario selector showing "Moderate Activity"
4. Executive Overview with 6 key indicators
5. Facility Implementation Cascade
6. Claims Processing Cascade
7. Regional Implementation Comparison
8. Diagnostic Insights

---

## Production Build

### Build for Production

```bash
npm run build

# Expected output:
#   vite v8.3.5 building for production...
#   ✓ XX modules transformed.
#   dist/index.html                   0.XX kB
#   dist/assets/index-XXXXX.css      XX.XX kB
#   dist/assets/index-XXXXX.js      XXX.XX kB
#   ✓ built in XXXms
```

Build artifacts are in `dist/` directory.

### Preview Production Build

```bash
npm run preview

# Opens at: http://localhost:4173
```

### Serve Production Build

```bash
# Using Python
cd dist
python3 -m http.server 8000
# Opens at: http://localhost:8000

# Using Node.js serve
npx serve dist
# Opens at: http://localhost:3000

# Using any static file server
```

---

## Running Tests

### Run All Tests

```bash
npm test

# Expected output:
#   Test Files  10 passed (10)
#   Tests       273 passed (273)
#   Start at    XX:XX:XX
#   Duration    X.XXs
```

### Run Specific Test File

```bash
# Dashboard tests
npm test -- dashboard

# Validator tests
npm test -- validator

# Analytics tests
npm test -- analytics
```

### Run Tests with Coverage

```bash
npm test -- --coverage

# Coverage report will be in: coverage/
```

### Run Tests in Watch Mode

```bash
npm test -- --watch

# Tests will re-run on file changes
```

### Run Tests in UI Mode

```bash
npm test -- --ui

# Opens interactive test UI in browser
```

---

## Project Structure

```
finvanta-diagnostic/
├── public/                     # Static assets
│   ├── config/                # Configuration files
│   │   ├── benefitConfig.json
│   │   ├── cutoffConfig.json
│   │   ├── recommendationRules.json
│   │   └── metricsSchema.json
│   └── data/                  # Synthetic datasets
│       ├── low_bottleneck_mix/
│       ├── moderate_bottleneck_mix/
│       └── high_bottleneck_mix/
│
├── src/                       # Source code
│   ├── components/            # React components
│   │   ├── ExecutiveOverview.jsx
│   │   ├── FacilityCascade.jsx
│   │   ├── ClaimsProcessingCascade.jsx
│   │   ├── RegionalComparison.jsx
│   │   ├── DiagnosticInsights.jsx
│   │   ├── LoadingState.jsx
│   │   ├── ErrorState.jsx
│   │   └── SyntheticDataNotice.jsx
│   │
│   ├── utils/                 # Utilities
│   │   ├── formatters.js
│   │   └── recommendationEngine.js
│   │
│   ├── analytics/             # Analytics engine
│   │   └── analyticsEngine.js
│   │
│   ├── validation/            # Data validator
│   │   └── dataValidator.js
│   │
│   ├── tests/                 # Test files
│   │   ├── dashboard.test.js
│   │   ├── analyticsEngine.test.js
│   │   ├── validatorIntegration.test.js
│   │   └── ... (10 test files total)
│   │
│   ├── App.jsx                # Main app component
│   └── main.jsx               # Entry point
│
├── scripts/                   # Data generation scripts
│   ├── generateData.js
│   ├── generateAnalytics.js
│   └── auditCutoff.js
│
├── outputs/                   # Generated analytics
│   └── phase3_analytics/
│
├── package.json               # Dependencies
├── vite.config.js            # Vite configuration
├── vitest.config.js          # Test configuration
├── tailwind.config.js        # Tailwind configuration
│
└── README.md                 # Project overview
```

---

## Common Issues and Solutions

### Issue: Port 5173 already in use

**Solution:**
```bash
# Use a different port
npm run dev -- --port 3000

# Or kill the process using port 5173
# macOS/Linux:
lsof -ti:5173 | xargs kill -9

# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Issue: npm install fails with EACCES error

**Solution:**
```bash
# Never use sudo with npm!
# Fix npm permissions instead:
# https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally

# Or use nvm (recommended):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
nvm use node
```

### Issue: Dashboard shows blank page

**Check console for errors:**
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests

**Common causes:**
- Data files not found (check `public/data/` exists)
- Config files missing (check `public/config/` exists)
- JavaScript error (check browser console)

**Solution:**
```bash
# Verify all files extracted properly
ls -R public/data/
ls -R public/config/

# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run dev
```

### Issue: Tests fail to run

**Solution:**
```bash
# Make sure you're in project root
cd finvanta-diagnostic

# Reinstall dependencies
rm -rf node_modules
npm install

# Run tests again
npm test
```

### Issue: Build fails

**Solution:**
```bash
# Clear cache
rm -rf dist .vite

# Rebuild
npm run build

# If still failing, check Node.js version
node --version  # Must be v18+
```

---

## Verification Checklist

After installation, verify everything works:

### ✅ Installation Verification

```bash
cd finvanta-diagnostic

# 1. Dependencies installed
[ -d node_modules ] && echo "✅ node_modules exists" || echo "❌ Run npm install"

# 2. Data files present
[ -f public/data/moderate_bottleneck_mix/claims.json ] && echo "✅ Data files exist" || echo "❌ Data missing"

# 3. Config files present
[ -f public/config/recommendationRules.json ] && echo "✅ Config files exist" || echo "❌ Config missing"

# 4. Tests pass
npm test 2>&1 | grep -q "273 passed" && echo "✅ All tests pass" || echo "❌ Tests failing"

# 5. Build succeeds
npm run build 2>&1 | grep -q "built" && echo "✅ Build successful" || echo "❌ Build failed"
```

### ✅ Dashboard Verification

Open http://localhost:5173 and verify:

1. [ ] Yellow warning banner visible at top
2. [ ] Warning text: "SYNTHETIC DEMONSTRATION DATA"
3. [ ] Cutoff date shown: "July 15, 2025"
4. [ ] Scenario selector shows "Moderate Activity"
5. [ ] Executive Overview displays 6 metrics
6. [ ] Facility Cascade shows 4 stages
7. [ ] Claims Cascade shows 9 categories
8. [ ] Regional table shows 17 regions
9. [ ] Can sort regional table by clicking headers
10. [ ] Diagnostic Insights shows recommendations
11. [ ] Can change scenario to "Low" or "High"
12. [ ] Dashboard updates when scenario changes
13. [ ] No console errors (check browser DevTools)

---

## Performance Optimization

### Development Server
- Hot Module Replacement (HMR) enabled by default
- Changes reflect immediately without full reload
- Fast refresh for React components

### Production Build
- Code splitting enabled
- Minification and tree-shaking
- Gzip compression
- Asset optimization

**Build Size:**
- HTML: ~0.5 KB
- CSS: ~26 KB (gzipped: ~6 KB)
- JS: ~256 KB (gzipped: ~76 KB)
- **Total (gzipped): ~82 KB**

Very fast load times even on slow connections.

---

## Browser Compatibility

### Tested and Supported
- ✅ Chrome 90+ (Windows, macOS, Linux)
- ✅ Firefox 88+ (Windows, macOS, Linux)
- ✅ Safari 14+ (macOS, iOS)
- ✅ Edge 90+ (Windows, macOS)

### Not Supported
- ❌ Internet Explorer (any version)
- ❌ Chrome < 90
- ❌ Firefox < 88
- ❌ Safari < 14

**Note:** Dashboard uses modern JavaScript (ES2020+) and requires a modern browser.

---

## Getting Help

### Check Documentation
1. README.md - Project overview
2. PHASE4_COMPLETE.md - Feature documentation
3. This file - Setup instructions

### Check Console
- Browser DevTools (F12) → Console tab
- Look for error messages
- Red errors indicate problems

### Verify Installation
```bash
# Check versions
node --version
npm --version

# Verify files
ls -la public/data/
ls -la public/config/

# Run tests
npm test

# Check for errors
npm run build
```

### Common Solutions
1. Delete `node_modules/` and run `npm install`
2. Delete `.vite/` and `dist/` and restart dev server
3. Check Node.js version (must be v18+)
4. Check port availability (5173 must be free)
5. Check firewall settings

---

## Next Steps

1. ✅ Complete setup following this guide
2. ✅ Verify dashboard loads successfully
3. ✅ Run test suite to confirm all passing
4. ✅ Explore dashboard features
5. ✅ Read PHASE4_COMPLETE.md for detailed documentation
6. ⏸️ **Stop here** - Submit for independent review
7. ⏸️ Do NOT proceed to deployment or Phase 5

---

**Setup Status:** Complete ✅  
**Dashboard Running:** http://localhost:5173  
**Tests Passing:** 273/273 (100%)  
**Ready for Use:** YES
