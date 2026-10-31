# Phase 4.1 Preview Instructions

## Local Development Preview (Recommended)

### Prerequisites
- Node.js 18+ installed
- Git installed

### Steps

1. **Clone and checkout the branch:**
   ```bash
   git clone https://github.com/yveszun/finvanta-diagnostic.git
   cd finvanta-diagnostic
   git checkout phase4-1-executive-ux
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - Navigate to: `http://localhost:5173`
   - The app will load in **Executive View by default**

### Testing Both Views

#### Executive View (Default)
1. Page loads directly to Executive View
2. Observe:
   - Dynamic headline at top with system health status
   - Primary bottleneck card with severity badge
   - 3 key performance indicators
   - Simplified cascade visualization
   - Investigation recommendation (blue gradient card)

#### Analyst View
1. Click "Analyst View" button in top-right header
2. Navigate through 5 tabs:
   - **Overview:** Original ExecutiveOverview component
   - **Facility Cascade:** FacilityCascade component
   - **Claims Processing:** ClaimsProcessingCascade component
   - **Regional Analysis:** RegionalComparison component
   - **Diagnostic Insights:** DiagnosticInsights with scenario switching

#### View Persistence Test
1. Switch to Analyst View
2. Refresh the page (F5 or Cmd+R)
3. Verify: Should remain in Analyst View (localStorage persistence)
4. Click Executive View, refresh
5. Verify: Should remain in Executive View

### Scenario Switching Test

Test with all 3 scenarios to see dynamic bottleneck detection:

1. **Low Activity Scenario:**
   - Select "Low Activity" from dropdown (in Analyst View > Diagnostic Insights)
   - Return to Executive View
   - Expected bottleneck: Likely Accreditation (low participation)

2. **Moderate Activity Scenario (Default):**
   - Already loaded by default
   - Check which stage shows as primary bottleneck

3. **High Activity Scenario:**
   - Select "High Activity"
   - Return to Executive View
   - Bottleneck may shift to Claims Submission or Payment Receipt

### Mobile Responsive Testing

Test on various screen sizes:
- Desktop: 1920x1080
- Tablet: 768x1024
- Mobile: 375x667

**Note:** View toggle and cascades should adapt responsively.

---

## Alternative: Static Build Preview

If you cannot run dev server:

1. **Build static files:**
   ```bash
   npm run build
   ```

2. **Serve dist folder:**
   ```bash
   npx serve dist -p 5173
   ```

3. **Open:** `http://localhost:5173/finvanta-diagnostic/`
   - Note the `/finvanta-diagnostic/` base path (GitHub Pages structure)

---

## What to Review

### Executive View Quality Checks

#### 1. Headline Dynamic Content
- [ ] Shows correct percentage utilization
- [ ] Displays facility counts (active vs. eligible)
- [ ] Health status matches utilization level
- [ ] Color-coded appropriately (green=healthy, amber=moderate, orange=concerning, red=critical)

#### 2. Primary Bottleneck Accuracy
- [ ] Identifies correct stage with lowest conversion rate
- [ ] Severity badge displays (critical/high/moderate/low)
- [ ] Conversion rate percentage shown
- [ ] Facilities lost count accurate
- [ ] Finding text is clear and executive-appropriate

#### 3. Key Indicators
- [ ] Exactly 3 indicators shown
- [ ] Accreditation Rate calculated correctly
- [ ] Claims Activity calculated correctly
- [ ] Payment Success calculated correctly
- [ ] Status colors match performance (green=good, amber=moderate, red=poor)

#### 4. Simplified Cascade
- [ ] 4 stages visible (Eligible, Accredited, Claiming, Receiving Payment)
- [ ] Counts display with thousands separator
- [ ] Percentages calculated against eligible baseline
- [ ] Visual bars sized proportionally
- [ ] Arrow connectors between stages

#### 5. Investigation Recommendation
- [ ] Action text matches primary bottleneck
- [ ] Context provides facility count
- [ ] Data source suggestion included
- [ ] Visually distinct (blue gradient card)

### Analyst View Quality Checks

#### 1. Component Preservation
- [ ] All 5 tabs present and labeled correctly
- [ ] Overview tab shows original Phase 4 ExecutiveOverview
- [ ] Facility Cascade tab shows original component unchanged
- [ ] Claims Processing tab shows original component unchanged
- [ ] Regional Analysis tab shows original component unchanged
- [ ] Diagnostic Insights tab shows original component with scenario dropdown

#### 2. Functionality Preservation
- [ ] Scenario dropdown still works in Diagnostic Insights
- [ ] All metrics calculate correctly
- [ ] All Phase 4 visualizations render
- [ ] No console errors
- [ ] Recommendations still generate

### Cross-View Validation

#### 1. Data Consistency
- [ ] Switching views preserves loaded scenario
- [ ] Same data shown in both views (different presentations)
- [ ] Metrics in Analyst View match Executive View calculations

#### 2. Synthetic Data Warning
- [ ] Warning visible in Executive View
- [ ] Warning visible in Analyst View
- [ ] Cannot be dismissed or hidden
- [ ] Clearly distinguishes from real data

#### 3. View Toggle
- [ ] Toggle renders in header
- [ ] Active view highlighted
- [ ] Smooth transitions
- [ ] Accessible (ARIA labels, keyboard navigation)

---

## Performance Checks

1. **Load Time:**
   - Initial page load should be < 3 seconds
   - View switching should be instant (no data reload)

2. **Bundle Size:**
   - Main bundle: ~272KB (acceptable for scope)
   - CSS: ~30KB
   - Total gzipped: ~87KB

3. **Console Clean:**
   - No errors in browser console
   - No React warnings about keys, hooks, etc.
   - Only expected warnings: jsdom environment optimization suggestion

---

## Known Limitations

1. **Browser Cache:** If previously visited the deployed site, hard refresh may be needed (Ctrl+Shift+R or Cmd+Shift+R)
2. **Base Path:** Local dev uses `/`, production uses `/finvanta-diagnostic/`
3. **Data Files:** All scenarios use synthetic data (prominently disclosed)

---

## Troubleshooting

### Issue: Page loads but shows error
**Solution:** Check console for fetch errors. Ensure all scenario JSON files exist in `public/outputs/phase3_analytics/`

### Issue: View toggle doesn't work
**Solution:** Check localStorage in browser DevTools. Clear if corrupted: `localStorage.removeItem('finvanta-view-mode')`

### Issue: Styles look broken
**Solution:** Ensure Tailwind CSS processed correctly. Check that `dist/assets/index-*.css` exists after build.

### Issue: Tests fail locally
**Solution:** Run `npm install` again. Ensure Node.js 18+ is being used: `node --version`

---

## Contact

For issues with preview:
- Check PR discussion: https://github.com/yveszun/finvanta-diagnostic/pull/4
- Review implementation plan: `docs/PHASE4_1_IMPLEMENTATION_PLAN.md`
- Review UX report: `docs/PHASE4_1_UX_REPORT.md`
