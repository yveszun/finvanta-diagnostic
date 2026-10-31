# GitHub Pages Deployment Guide

**Deployment URL:** https://yveszun.github.io/finvanta-diagnostic/

---

## 🎯 Overview

This guide covers deploying the Finvanta Health Diagnostic dashboard to GitHub Pages with automated CI/CD via GitHub Actions.

## ✅ Pre-Deployment Verification

### Tests Passed
- ✅ **329 tests passed** (0 failures)
- ✅ All analytical integrity tests verified
- ✅ Synthetic data validation confirmed
- ✅ Dashboard rendering tests passed
- ✅ Recommendation engine validated

### Build Verification
- ✅ Production build completed successfully
- ✅ Base path configured: `/finvanta-diagnostic/`
- ✅ All scenario data files included
- ✅ Assets correctly referenced with base path
- ✅ Bundle size: 256.71 kB (JS), 26.82 kB (CSS)

### Security & Data Integrity
- ✅ **100% synthetic data** (no real PhilHealth records)
- ✅ Synthetic data warnings prominently displayed
- ✅ No real PII or confidential information
- ✅ Prototype badge visible in header
- ✅ Page title clearly indicates synthetic data

---

## 🚀 Deployment Setup

### 1. Enable GitHub Pages in Repository Settings

**One-time setup required:**

1. Go to your repository: https://github.com/yveszun/finvanta-diagnostic
2. Click **Settings** tab
3. In the left sidebar, click **Pages**
4. Under **Source**, select:
   - Source: **GitHub Actions** (not "Deploy from a branch")
5. Save settings

### 2. Merge Deployment Branch to Main

The deployment configuration is ready on the `github-pages-deployment` branch.

**To deploy:**

```bash
# Option A: Merge via pull request (recommended)
# - Review the PR created for this deployment
# - Merge it to main branch
# - GitHub Actions will automatically deploy

# Option B: Merge locally
git checkout main
git merge github-pages-deployment
git push origin main
```

### 3. Monitor Deployment

After merging to main:

1. Go to **Actions** tab in GitHub
2. You'll see "Deploy to GitHub Pages" workflow running
3. Wait for both jobs to complete:
   - **build**: Runs tests, builds production bundle
   - **deploy**: Deploys to GitHub Pages
4. Deployment typically takes 2-3 minutes

### 4. Verify Deployment

Once deployment completes:

1. Visit: https://yveszun.github.io/finvanta-diagnostic/
2. Verify all scenarios load:
   - Low Activity scenario
   - Moderate Activity scenario (default)
   - High Activity scenario
3. Check that all visualizations render correctly:
   - Executive Overview cards
   - Facility Cascade (waterfall chart)
   - Claims Processing Cascade
   - Regional Comparison
   - Diagnostic Insights

---

## 🔧 Configuration Details

### Vite Configuration

The `vite.config.js` has been updated with:

```javascript
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/finvanta-diagnostic/' : '/',
  build: {
    assetsDir: 'assets',
    sourcemap: false,
    outDir: 'dist',
  },
})
```

**Key points:**
- `base` path automatically set for GitHub Pages
- Works locally with `base: '/'` (for development)
- Assets correctly referenced with base path

### GitHub Actions Workflow

The workflow (`.github/workflows/deploy-gh-pages.yml`) runs on:
- **Push to main branch** (automatic deployment)
- **Manual trigger** via Actions tab (workflow_dispatch)

**Workflow steps:**
1. Checkout code
2. Setup Node.js 20
3. Install dependencies (`npm ci`)
4. **Run test suite** (`npm test -- --run`)
5. Run linter (`npm run lint`)
6. **Build for GitHub Pages** (`GITHUB_PAGES=true npm run build`)
7. Verify build output
8. Deploy to GitHub Pages

### Asset Paths

All public assets are correctly included:
- `/outputs/phase3_analytics/*.json` - Scenario data
- `/config/recommendationRules.json` - Recommendation engine rules
- `/data/*` - Supporting data files
- `/favicon.svg`, `/icons.svg` - UI assets

These are automatically available under the base path when deployed.

---

## 🧪 Local Testing with Base Path

To test the production build locally with the GitHub Pages base path:

```bash
# Build with GitHub Pages base path
GITHUB_PAGES=true npm run build

# Preview the built site
npm run preview

# Open browser to: http://localhost:4173/finvanta-diagnostic/
```

**Note:** The preview server automatically serves from the configured base path.

---

## 🔄 Updating the Deployed Site

Any push to the `main` branch will trigger automatic redeployment:

```bash
# Make your changes
git add .
git commit -m "Update dashboard calculations"
git push origin main

# Deployment happens automatically via GitHub Actions
```

### Manual Deployment Trigger

You can also trigger deployment manually:

1. Go to **Actions** tab
2. Click **Deploy to GitHub Pages** workflow
3. Click **Run workflow** dropdown
4. Select branch: `main`
5. Click **Run workflow** button

---

## 🚨 Important Notes

### Data Integrity
- ❌ **Do NOT add real PhilHealth data** to this repository
- ❌ **Do NOT modify synthetic data generators** without verification
- ❌ **Do NOT change diagnostic calculations** without running full test suite

### Testing Requirements
- ✅ **Always run `npm test -- --run`** before deploying manually
- ✅ **Verify build succeeds** with `npm run build`
- ✅ **Check for console errors** in browser after deployment

### Synthetic Data Warnings
The following warnings **must remain visible** on the deployed site:
- ✅ Red banner: "SYNTHETIC DATA DEMONSTRATION"
- ✅ Yellow "PROTOTYPE" badge in header
- ✅ Page title: "Finvanta Health Prototype (Synthetic Data)"
- ✅ Footer: "Phase 4 MVP • Synthetic Data Only"

---

## 🐛 Troubleshooting

### Build Fails on GitHub Actions

**Check:**
1. All tests passing locally: `npm test -- --run`
2. Build succeeds locally: `npm run build`
3. No TypeScript/linting errors: `npm run lint`

**Review:**
- GitHub Actions logs under **Actions** tab
- Look for test failures or build errors

### Assets Not Loading (404 errors)

**Cause:** Base path misconfiguration

**Fix:**
1. Verify `vite.config.js` has correct base path
2. Rebuild: `GITHUB_PAGES=true npm run build`
3. Check `dist/index.html` - links should start with `/finvanta-diagnostic/`

### Scenarios Not Switching

**Check:**
1. Browser console for errors (F12)
2. Network tab - verify JSON files load correctly
3. Paths should be: `/finvanta-diagnostic/outputs/phase3_analytics/*.json`

### Deployment Succeeds but Site Shows 404

**Likely causes:**
1. GitHub Pages not enabled in repository settings
2. Wrong source selected (should be "GitHub Actions")
3. Deployment still in progress (wait 2-3 minutes)

**Fix:**
1. Go to repository Settings → Pages
2. Ensure Source is set to "GitHub Actions"
3. Re-run deployment workflow

---

## 📊 Monitoring & Analytics

### GitHub Actions Status

Monitor deployment health:
- **Actions** tab shows all workflow runs
- Green checkmark = successful deployment
- Red X = deployment failed (check logs)

### Site Performance

After deployment, verify:
- Page load time (should be < 3 seconds)
- All charts render within 1 second
- Scenario switching is instant
- No console errors or warnings

---

## 🔐 Security Considerations

### Public Deployment
- ✅ Site is publicly accessible at https://yveszun.github.io/finvanta-diagnostic/
- ✅ All data is **synthetic only** - no real patient information
- ✅ Prototype warnings prominently displayed
- ✅ Suitable for demonstrations and validation

### NOT Suitable For:
- ❌ Real PhilHealth data analysis
- ❌ Production medical decision-making
- ❌ Processing actual patient records

### If Real Data Needed:
- See `docs/PRE_DEPLOYMENT_SECURITY_AUDIT.md`
- Requires comprehensive security audit
- Backend infrastructure with authentication
- Encrypted data handling
- HIPAA/data protection compliance

---

## 📞 Support

### Deployment Issues
1. Check GitHub Actions logs
2. Review `docs/DEPLOYMENT_GUIDE.md` for general deployment guidance
3. Verify tests pass: `npm test -- --run`

### Functionality Issues
1. Check browser console (F12)
2. Verify scenario data files exist in `public/outputs/`
3. Run local preview: `npm run preview`

### Security Questions
- See `docs/PRE_DEPLOYMENT_SECURITY_AUDIT.md`
- Comprehensive security review completed October 26, 2026

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] All tests passing (`npm test -- --run`)
- [ ] Build succeeds (`npm run build`)
- [ ] No linting errors (`npm run lint`)
- [ ] Local preview works (`npm run preview`)
- [ ] Synthetic data warnings visible
- [ ] No real PhilHealth data added
- [ ] GitHub Pages enabled in repository settings
- [ ] Pull request reviewed and approved
- [ ] Changes merged to main branch

After deployment:

- [ ] Site loads at https://yveszun.github.io/finvanta-diagnostic/
- [ ] All three scenarios work (low, moderate, high)
- [ ] Charts and visualizations render correctly
- [ ] No console errors
- [ ] Mobile responsive layout works
- [ ] Synthetic data warnings visible
- [ ] Recommendation engine shows insights

---

## 🎉 Success!

Your Finvanta Health Diagnostic dashboard is now live at:

**https://yveszun.github.io/finvanta-diagnostic/**

**Next steps:**
1. Share URL with stakeholders for Phase 5 validation
2. Collect feedback using `docs/DEMO_CHECKLIST.md`
3. Iterate based on validation results

---

**Document Version:** 1.0  
**Created:** October 31, 2026  
**Deployment Method:** GitHub Pages with GitHub Actions  
**Test Suite Status:** ✅ 329 tests passed  
**Build Status:** ✅ Production-ready
