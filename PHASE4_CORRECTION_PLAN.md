# Phase 4 Correction Plan

## Critical Issues Identified

### 1. Data Reconciliation (CRITICAL)
**Status:** Dashboard is loading from non-existent `/public/outputs/` directory
**Issue:** App.jsx references `/outputs/phase3_analytics/` which doesn't exist in public directory
**Authoritative Source:** `/outputs/phase3_analytics/` contains validated Phase 3 data
**Action:** Copy validated analytics to correct public location or update App.jsx path

### 2. Recommendation Engine (CRITICAL)
**Issues:**
- Uses unsafe `eval()` for condition evaluation
- Incorrect metric mapping: `stage3_adjudicatedClaims: summary.total_claims`
- Zero-value calculation errors
- Incorrect facility vs. claim metric interpolation

### 3. React Hook Violations (HIGH)
**Issue:** RegionalComparison.jsx has conditional early return before useMemo hook
**Violation:** Breaks React's rules of hooks

### 4. Policy Assumptions (HIGH)
**Issue:** benefitConfig.json contains unverified "official" requirements
**Action:** Clearly label all assumptions as illustrative

### 5. Component Reliability (MEDIUM)
- Missing AbortController in App.jsx for scenario switching
- Inconsistent zero-denominator handling
- Hard-coded thresholds in RegionalComparison

### 6. Test Coverage (HIGH)
- Need comprehensive reconciliation tests
- Need recommendation engine safety tests
- Need React hook consistency tests

## Correction Sequence

1. ✅ Verify authoritative data locations
2. Fix App.jsx data loading path
3. Replace eval() in recommendationEngine.js
4. Correct metric mappings
5. Fix React hook violations
6. Update benefitConfig.json disclaimers
7. Add comprehensive tests
8. Verify all corrections
9. Generate reconciliation report
10. Package corrected deliverable
