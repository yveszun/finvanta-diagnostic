# Phase 3 Analytics Report: Moderate Activity

**Generated:** 2026-10-25T17:09:11.830Z

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
| Accredited | 216 | 14.4% |
| Submitted Claims | 84 | 38.9% |
| Receiving Payment | 69 | 82.1% |

**Note:** Each facility is counted only once, regardless of multiple claims or accreditations.

## Claims Processing Cascade

This cascade shows claim counts (not facility counts) at each stage:

**V3: Now includes pending acceptance and adjudication stages**

| Stage | Count | Rate |
|-------|-------|------|
| Submitted | 600 | - |
| **Pending Acceptance** | 48 | 8.0% |
| Accepted | 552 | 92.0% |
| **Pending Adjudication** | 41 | 7.4% |
| Adjudicated | 511 | 92.6% |
| Approved | 466 | 91.2% |
| Paid | 259 | 55.6% |

### Administrative Bottlenecks

| Bottleneck Stage | Count | Avg Days Pending |
|------------------|-------|------------------|
| Pending Acceptance | 48 | 52.3 days |
| Pending Adjudication | 41 | 46.4 days |

### Payment Breakdown

| Category | Count | Percentage |
|----------|-------|------------|
| Fully Paid | 250 | 41.7% |
| Partially Paid | 9 | 1.5% |
| Approved but Unpaid | 207 | 34.5% |
| → Avg time awaiting payment | 29.4 days (as of 2025-07-15T00:00:00.000Z) | - |
| Denied | 45 | 7.5% |
| Pending Earlier Stages | 89 | 14.8% |

**Note:** Approval ≠ Payment. Claims may be approved but remain unpaid. V3 tracks time since approval for unpaid claims.

## Financial Metrics

| Metric | Amount |
|--------|--------|
| Total Billed | ₱6,534,000 |
| Total Approved | ₱4,298,500 (65.8% of billed) |
| Total Disbursed | ₱2,356,034 (54.8% of approved) |
| Outstanding (Approved - Disbursed) | ₱1,942,466 |

### Approval-to-Disbursement Ratio

**54.8%** of approved amounts have been disbursed.

### Payment Processing Time

- **Average:** 21.2 days
- **Median:** 19.0 days
- **Sample Size:** 259 claims
- **Claims with Missing Dates:** 341

**Note:** Claims with missing dates excluded from time calculations.

### Reconciliation Check

**Status:** ✓ Balanced

## Service-Specific Analysis

### General Mental Health Services

| Metric | Value |
|--------|-------|
| Accredited Facilities | 216 |
| Claims Submitted | 438 |
| Total Billed | ₱3,942,000 |
| Total Approved | ₱2,585,382 |
| Total Disbursed | ₱1,442,180 |

### Specialty Mental Health Services

| Metric | Value |
|--------|-------|
| Accredited Facilities | 113 |
| Claims Submitted | 162 |
| Total Billed | ₱2,592,000 |
| Total Approved | ₱1,713,118 |
| Total Disbursed | ₱913,854 |

**Note:** No double-counting: facilities with both service types counted once

## Regional Comparisons

**⚠️ SIMULATED DATA:** Regional patterns are synthetically generated for illustrative purposes only. Do not interpret as real geographic disparities.

| Region | Facilities | Accredited | Claims | Total Billed | Total Approved |
|--------|------------|------------|--------|--------------|----------------|
| BARMM (Bangsamoro) | 92 | 14 (15.2%) | 42 | ₱462,000 | ₱297,977 |
| CAR (Cordillera Administrative Region) | 88 | 13 (14.8%) | 35 | ₱392,000 | ₱299,466 |
| National Capital Region | 88 | 18 (20.5%) | 72 | ₱844,000 | ₱512,468 |
| Region I (Ilocos Region) | 88 | 13 (14.8%) | 38 | ₱433,000 | ₱266,978 |
| Region II (Cagayan Valley) | 88 | 13 (14.8%) | 21 | ₱210,000 | ₱152,595 |
| Region III (Central Luzon) | 88 | 13 (14.8%) | 35 | ₱336,000 | ₱205,816 |
| Region IV-A (CALABARZON) | 88 | 13 (14.8%) | 35 | ₱378,000 | ₱263,357 |
| Region IV-B (MIMAROPA) | 88 | 13 (14.8%) | 35 | ₱371,000 | ₱238,951 |
| Region IX (Zamboanga Peninsula) | 88 | 5 (5.7%) | 14 | ₱154,000 | ₱106,647 |
| Region V (Bicol Region) | 88 | 13 (14.8%) | 35 | ₱399,000 | ₱247,794 |
| Region VI (Western Visayas) | 88 | 13 (14.8%) | 21 | ₱196,000 | ₱142,762 |
| Region VII (Central Visayas) | 88 | 18 (20.5%) | 63 | ₱728,000 | ₱486,231 |
| Region VIII (Eastern Visayas) | 88 | 13 (14.8%) | 35 | ₱364,000 | ₱246,133 |
| Region X (Northern Mindanao) | 88 | 13 (14.8%) | 35 | ₱413,000 | ₱207,962 |
| Region XI (Davao Region) | 88 | 13 (14.8%) | 35 | ₱357,000 | ₱259,449 |
| Region XII (SOCCSKSARGEN) | 88 | 5 (5.7%) | 14 | ₱161,000 | ₱119,152 |
| Region XIII (Caraga) | 88 | 13 (14.8%) | 35 | ₱336,000 | ₱244,762 |

**Disclaimer:** Regional patterns are synthetically generated for illustrative purposes only.

## Metadata

- **Analysis Timestamp:** 2026-10-25T17:09:11.830Z
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