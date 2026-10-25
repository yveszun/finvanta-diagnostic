# Phase 3 Analytics Report: Low Activity

**Generated:** 2026-10-25T16:47:19.560Z

---

## Validation Status

- **Valid:** Yes
- **Has Blocking Errors:** No
- **Errors:** 0
- **Warnings:** 1

## Facility Participation Cascade

This cascade shows distinct facilities at each stage:

| Stage | Count | Rate |
|-------|-------|------|
| Eligible Population | 1,500 | - |
| Accredited | 69 | 4.6% |
| Submitted Claims | 14 | 20.3% |
| Receiving Payment | 13 | 92.9% |

**Note:** Each facility is counted only once, regardless of multiple claims or accreditations.

## Claims Processing Cascade

This cascade shows claim counts (not facility counts) at each stage:

**V3: Now includes pending acceptance and adjudication stages**

| Stage | Count | Rate |
|-------|-------|------|
| Submitted | 150 | - |
| **Pending Acceptance** | 8 | 5.3% |
| Accepted | 142 | 94.7% |
| **Pending Adjudication** | 15 | 10.6% |
| Adjudicated | 127 | 89.4% |
| Approved | 106 | 83.5% |
| Paid | 79 | 74.5% |

### Administrative Bottlenecks

| Bottleneck Stage | Count | Avg Days Pending |
|------------------|-------|------------------|
| Pending Acceptance | 8 | 61.4 days |
| Pending Adjudication | 15 | 55.3 days |

### Payment Breakdown

| Category | Count | Percentage |
|----------|-------|------------|
| Fully Paid | 75 | 50.0% |
| Partially Paid | 4 | 2.7% |
| Approved but Unpaid | 27 | 18.0% |
| → Avg time awaiting payment | 31.8 days (as of 2025-07-15) | - |
| Denied | 21 | 14.0% |
| Pending Earlier Stages | 23 | 15.3% |

**Note:** Approval ≠ Payment. Claims may be approved but remain unpaid. V3 tracks time since approval for unpaid claims.

## Financial Metrics

| Metric | Amount |
|--------|--------|
| Total Billed | ₱1,476,000 |
| Total Approved | ₱903,938 (61.2% of billed) |
| Total Disbursed | ₱677,171 (74.9% of approved) |
| Outstanding (Approved - Disbursed) | ₱226,767 |

### Approval-to-Disbursement Ratio

**74.9%** of approved amounts have been disbursed.

### Payment Processing Time

- **Average:** 25.6 days
- **Median:** 25.0 days
- **Sample Size:** 79 claims
- **Claims with Missing Dates:** 71

**Note:** Claims with missing dates excluded from time calculations.

### Reconciliation Check

**Status:** ✓ Balanced

## Service-Specific Analysis

### General Mental Health Services

| Metric | Value |
|--------|-------|
| Accredited Facilities | 69 |
| Claims Submitted | 132 |
| Total Billed | ₱1,188,000 |
| Total Approved | ₱689,335 |
| Total Disbursed | ₱490,281 |

### Specialty Mental Health Services

| Metric | Value |
|--------|-------|
| Accredited Facilities | 37 |
| Claims Submitted | 18 |
| Total Billed | ₱288,000 |
| Total Approved | ₱214,603 |
| Total Disbursed | ₱186,890 |

**Note:** No double-counting: facilities with both service types counted once

## Regional Comparisons

**⚠️ SIMULATED DATA:** Regional patterns are synthetically generated for illustrative purposes only. Do not interpret as real geographic disparities.

| Region | Facilities | Accredited | Claims | Total Billed | Total Approved |
|--------|------------|------------|--------|--------------|----------------|
| BARMM (Bangsamoro) | 92 | 5 (5.4%) | 22 | ₱275,000 | ₱172,261 |
| CAR (Cordillera Administrative Region) | 88 | 4 (4.5%) | 21 | ₱217,000 | ₱161,873 |
| National Capital Region | 88 | 4 (4.5%) | 10 | ₱90,000 | ₱71,637 |
| Region I (Ilocos Region) | 88 | 4 (4.5%) | 0 | ₱0 | ₱0 |
| Region II (Cagayan Valley) | 88 | 4 (4.5%) | 22 | ₱198,000 | ₱83,630 |
| Region III (Central Luzon) | 88 | 4 (4.5%) | 11 | ₱99,000 | ₱53,511 |
| Region IV-A (CALABARZON) | 88 | 4 (4.5%) | 0 | ₱0 | ₱0 |
| Region IV-B (MIMAROPA) | 88 | 4 (4.5%) | 0 | ₱0 | ₱0 |
| Region IX (Zamboanga Peninsula) | 88 | 4 (4.5%) | 11 | ₱99,000 | ₱59,147 |
| Region V (Bicol Region) | 88 | 4 (4.5%) | 0 | ₱0 | ₱0 |
| Region VI (Western Visayas) | 88 | 4 (4.5%) | 22 | ₱198,000 | ₱108,280 |
| Region VII (Central Visayas) | 88 | 4 (4.5%) | 10 | ₱90,000 | ₱39,032 |
| Region VIII (Eastern Visayas) | 88 | 4 (4.5%) | 10 | ₱90,000 | ₱62,109 |
| Region X (Northern Mindanao) | 88 | 4 (4.5%) | 0 | ₱0 | ₱0 |
| Region XI (Davao Region) | 88 | 4 (4.5%) | 0 | ₱0 | ₱0 |
| Region XII (SOCCSKSARGEN) | 88 | 4 (4.5%) | 11 | ₱120,000 | ₱92,458 |
| Region XIII (Caraga) | 88 | 4 (4.5%) | 0 | ₱0 | ₱0 |

**Disclaimer:** Regional patterns are synthetically generated for illustrative purposes only.

## Metadata

- **Analysis Timestamp:** 2026-10-25T16:47:19.559Z
- **Validation Errors:** 0
- **Validation Warnings:** 1

## Disclaimers

1. All data is synthetic for diagnostic purposes. Does not represent actual PhilHealth performance.
2. Regional patterns are simulated and do not reflect actual geographic disparities
3. Payment processing times are synthetically generated for illustrative purposes

## Known Limitations

1. **Synthetic Data:** All data is synthetically generated for diagnostic purposes
2. **Simulated Regional Patterns:** Geographic patterns do not reflect real PhilHealth data
3. **Illustrative Time Calculations:** Payment processing times are simulated
4. **No Real-World Validation:** Results have not been compared against actual PhilHealth records
5. **Configuration-Dependent:** Eligibility validation requires configuration (warning issued if missing)

---

*End of Report*