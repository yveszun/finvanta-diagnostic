# Phase 4.1 Visual Acceptance Testing Guide

**Branch:** `phase4-1-executive-ux`  
**Date:** October 25, 2026  
**Status:** Ready for visual review

---

## 🚀 Quick Start

### Start the Development Server

**From the terminal, run:**

```bash
cd /projects/sandbox/finvanta-diagnostic
npm run dev
```

**The server will display:**
```
VITE v8.3.5  ready in [time] ms

➜  Local:   http://localhost:5173/
➜  Network: http://[ip]:5173/
```

### Open in Browser

**Navigate to:** `http://localhost:5173/`

The application will load in **Executive View by default**.

---

## 📊 Bottleneck Detection Logic - CLARIFICATION

### What is "Primary Bottleneck"?

**The primary bottleneck represents the stage with the LOWEST CONVERSION RATE**, not the largest absolute facility drop.

#### Mathematical Definition

The system calculates 3 conversion rates:

1. **Accreditation:** `stage2_accredited / stage1_eligible`
2. **Claims Submission:** `stage3_claiming / stage2_accredited`
3. **Payment Receipt:** `stage4_receiving_payment / stage3_claiming`

**Primary Bottleneck = Stage with minimum conversion rate**

```javascript
// From bottleneckDetector.js line 42-44
const bottleneck = conversions.reduce((min, current) => 
  current.rate < min.rate ? current : min
);
```

#### Example Scenario

**Moderate Activity Scenario Data:**
- Stage 1 (Eligible): 1,000 facilities
- Stage 2 (Accredited): 700 facilities (70% conversion) ← 300 lost
- Stage 3 (Claiming): 600 facilities (86% conversion) ← 100 lost
- Stage 4 (Payment): 550 facilities (92% conversion) ← 50 lost

**Analysis:**
- Accreditation: 70% conversion, 300 facilities lost
- Claims: 86% conversion, 100 facilities lost
- Payment: 92% conversion, 50 facilities lost

**Primary Bottleneck: Accreditation (lowest rate at 70%)**

Even though the absolute drop is largest (300), the PRIMARY BOTTLENECK is identified by lowest conversion percentage, representing the stage that constrains the most facilities proportionally.

### Interface Labels

**The UI clearly displays both metrics:**

1. **Conversion Rate** - The percentage metric used to identify the bottleneck
2. **Facilities Lost** - The absolute drop shown for context

**Example display:**
```
Primary Bottleneck                    [CRITICAL]

Accreditation is the primary barrier to facility participation

300 facilities eligible but not accredited

Conversion Rate    Stage
70%                Accreditation
```

**Verdict:** ✅ The interface accurately labels the distinction between conversion rate (identification criterion) and absolute facility loss (impact metric).

---

## 🎯 Visual Acceptance Test Checklist

### Executive View (Default Load)

#### 1. Dynamic Headline
- [ ] Shows percentage and facility counts
- [ ] Health status color-coded:
  - Green/Emerald: Healthy (≥70%)
  - Amber: Moderate (50-70%)
  - Orange: Concerning (30-50%)
  - Red: Critical (<30%)
- [ ] Icon matches health status (✓, ◐, ◑, ⚠)

#### 2. Primary Bottleneck Card
- [ ] Displays stage with LOWEST conversion rate
- [ ] Severity badge (CRITICAL/HIGH/MODERATE/LOW)
- [ ] Finding statement clear and executive-appropriate
- [ ] Shows two metrics:
  - Conversion Rate (%) ← Used to identify bottleneck
  - Facilities Lost (count) ← Impact measurement
- [ ] Stage name displayed clearly

#### 3. Key Performance Indicators
- [ ] Exactly 3 indicators shown
- [ ] Labels: "Accreditation Rate", "Claims Activity", "Payment Success"
- [ ] Status badges (✓ good, ◐ moderate, ✗ poor)
- [ ] Large percentage values
- [ ] Descriptions clear

#### 4. Simplified Cascade
- [ ] 4 stages visible with labels
- [ ] Facility counts with thousand separators
- [ ] Percentages calculated correctly
- [ ] Visual bars proportional to percentages
- [ ] Arrow connectors between stages
- [ ] Colors progress from indigo → blue → emerald → green

#### 5. Investigation Recommendation
- [ ] Blue gradient card at bottom
- [ ] Magnifying glass icon (🔍)
- [ ] Action statement matches bottleneck stage
- [ ] Context shows facility count
- [ ] Data source suggestion included

#### 6. Synthetic Data Warning
- [ ] Yellow banner visible at top
- [ ] Text: "⚠️ SYNTHETIC DEMONSTRATION DATA"
- [ ] Cannot be dismissed
- [ ] Clearly distinguishes from real data

### Analyst View (Click Toggle)

#### 7. View Toggle
- [ ] Toggle button in header (top-right)
- [ ] "Executive View" / "Analyst View" labels
- [ ] Active view highlighted with white background
- [ ] Smooth transition when clicked

#### 8. Tab Navigation
- [ ] 5 tabs visible:
  - 📊 Overview
  - 🏥 Facility Cascade
  - 📋 Claims Processing
  - 🗺️ Regional Analysis
  - 💡 Diagnostic Insights
- [ ] Active tab highlighted (indigo background)
- [ ] Content changes when clicking tabs

#### 9. Component Preservation
- [ ] Overview tab: Shows original ExecutiveOverview
- [ ] Facility Cascade: Shows original Phase 4 component
- [ ] Claims Processing: Shows original Phase 4 component
- [ ] Regional Analysis: Shows original Phase 4 component
- [ ] Diagnostic Insights: Shows original Phase 4 component with scenario dropdown

#### 10. Functionality Preservation
- [ ] Scenario dropdown works (in Diagnostic Insights tab)
- [ ] All metrics display correctly
- [ ] All Phase 4 visualizations render
- [ ] No console errors (check browser DevTools)

### Cross-View Validation

#### 11. View Persistence
- [ ] Switch to Analyst View
- [ ] Refresh page (F5 / Cmd+R)
- [ ] Should remain in Analyst View
- [ ] Switch to Executive View
- [ ] Refresh page
- [ ] Should remain in Executive View

#### 12. Data Consistency
- [ ] Metrics in Analyst View match Executive View calculations
- [ ] Same scenario loaded in both views
- [ ] Bottleneck stage consistent across views

#### 13. Scenario Switching
Test with all 3 scenarios:

**Low Activity:**
- [ ] Select "Low Activity" from dropdown (Analyst View > Diagnostic Insights)
- [ ] Return to Executive View
- [ ] Bottleneck should reflect low participation pattern
- [ ] Conversion rate should be lowest stage

**Moderate Activity (Default):**
- [ ] Default scenario loads correctly
- [ ] Bottleneck identified correctly

**High Activity:**
- [ ] Select "High Activity"
- [ ] Return to Executive View
- [ ] Bottleneck may shift to different stage
- [ ] Verify conversion rate logic still applies

### Responsive Design

#### 14. Desktop (1920x1080)
- [ ] All elements visible without scrolling (except footer)
- [ ] Cards well-spaced with consistent margins
- [ ] Typography readable and hierarchical
- [ ] No layout breaks

#### 15. Tablet (768x1024)
- [ ] View toggle still accessible
- [ ] Cards stack appropriately
- [ ] Text remains readable
- [ ] No horizontal scroll

#### 16. Mobile (375x667)
- [ ] Executive View readable on small screen
- [ ] Cascade adapts to narrow width
- [ ] Toggle accessible
- [ ] Tab navigation works

---

## 🐛 Known Issues to Check

### Console Errors
Open browser DevTools (F12) and check Console tab:
- [ ] No React errors
- [ ] No "Cannot read properties of undefined"
- [ ] Only expected warnings (jsdom optimization suggestion is OK)

### Performance
- [ ] Initial load < 3 seconds
- [ ] View switching is instant
- [ ] No lag when scrolling

### Browser Compatibility
Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

---

## 📝 Acceptance Criteria

### Must Pass
1. ✅ Executive View loads by default
2. ✅ Primary Bottleneck correctly identifies lowest conversion rate
3. ✅ Interface clearly labels conversion rate vs. facilities lost
4. ✅ All Phase 4 components accessible via Analyst View
5. ✅ Synthetic data warning visible in both views
6. ✅ View persistence works (localStorage)
7. ✅ No console errors

### Should Pass
1. Responsive layout works on common screen sizes
2. All 3 scenarios switch correctly
3. Visual design is professional and executive-appropriate
4. Performance is acceptable (< 3s load)

### Nice to Have
1. Smooth animations/transitions
2. Keyboard navigation works
3. Touch gestures work on mobile

---

## 🔍 What to Look For

### Design Quality
- **Professional appearance** suitable for PhilHealth executives
- **Clear visual hierarchy** (headlines > sections > details)
- **Consistent spacing** and alignment
- **Readable typography** at all sizes
- **Appropriate color usage** (not overwhelming)

### Executive Experience
- **Can I understand the system health in 5 seconds?** (headline)
- **Can I identify the primary constraint in 10 seconds?** (bottleneck card)
- **Can I see key metrics in 15 seconds?** (indicators)
- **Can I understand the flow in 20 seconds?** (cascade)
- **Do I know what to do next in 30 seconds?** (recommendation)

### Analyst Experience
- **Can I access all technical details?** (tabs)
- **Is the original functionality preserved?** (components unchanged)
- **Can I switch scenarios?** (dropdown)
- **Do I have all Phase 4 capabilities?** (no loss of features)

---

## 📸 Screenshot Checklist

If capturing screenshots for documentation:

**Desktop (1920x1080):**
1. Executive View - Full page
2. Executive View - Bottleneck card close-up
3. Analyst View - Overview tab
4. Analyst View - Diagnostic Insights tab with scenario dropdown
5. View Toggle - Both states

**Mobile (375x667):**
1. Executive View - Top half
2. Executive View - Bottleneck card
3. Analyst View - Tab navigation

---

## ✅ Approval Decision

After completing visual acceptance testing:

**If satisfied:**
- Comment on PR #4: "Visual acceptance testing complete. Approved for merge."
- Specify any minor refinements needed (can be addressed in follow-up)

**If changes needed:**
- Comment on PR #4 with specific feedback
- Reference this testing guide checklist items
- Request modifications before merge

**If major concerns:**
- Document issues clearly
- Provide screenshots if possible
- Discuss alternative approaches

---

## 🚫 Reminder: Do Not Merge Yet

This is visual acceptance testing only. The PR should not be merged until you explicitly approve it after review.

---

## 📞 Support

**Issues during testing?**
- Check `docs/PREVIEW_INSTRUCTIONS.md` for troubleshooting
- Review `docs/PHASE4_1_AUDIT_REPORT.md` for technical details
- Comment on PR #4 with questions

**Bottleneck logic questions?**
- Review the "Bottleneck Detection Logic" section above
- Check `src/analytics/bottleneckDetector.js` source code
- Verify interface labels in `src/components/executive/PrimaryFinding.jsx`

---

**Ready to test!** Run `npm run dev` and open `http://localhost:5173/`
