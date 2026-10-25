# Phase 3 Analytics Report: Moderate Activity

**Generated:** 2026-10-25T16:47:19.575Z

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
| Accredited | 222 | 14.8% |
| Submitted Claims | 89 | 40.1% |
| Receiving Payment | 79 | 88.8% |

**Note:** Each facility is counted only once, regardless of multiple claims or accreditations.

## Claims Processing Cascade

This cascade shows claim counts (not facility counts) at each stage:

**V3: Now includes pending acceptance and adjudication stages**

| Stage | Count | Rate |
|-------|-------|------|
| Submitted | 600 | - |
| **Pending Acceptance** | 44 | 7.3% |
| Accepted | 556 | 92.7% |
| **Pending Adjudication** | 46 | 8.3% |
| Adjudicated | 510 | 91.7% |
| Approved | 474 | 92.9% |
| Paid | 356 | 75.1% |

### Administrative Bottlenecks

| Bottleneck Stage | Count | Avg Days Pending |
|------------------|-------|------------------|
| Pending Acceptance | 44 | 64.3 days |
| Pending Adjudication | 46 | 55.5 days |

### Payment Breakdown

| Category | Count | Percentage |
|----------|-------|------------|
| Fully Paid | 342 | 57.0% |
| Partially Paid | 14 | 2.3% |
| Approved but Unpaid | 118 | 19.7% |
| → Avg time awaiting payment | 58.3 days (as of 2025-07-15) | - |
| Denied | 36 | 6.0% |
| Pending Earlier Stages | 90 | 15.0% |

**Note:** Approval ≠ Payment. Claims may be approved but remain unpaid. V3 tracks time since approval for unpaid claims.

## Financial Metrics

| Metric | Amount |
|--------|--------|
| Total Billed | ₱6,338,000 |
| Total Approved | ₱4,210,197 (66.4% of billed) |
| Total Disbursed | ₱3,088,273 (73.4% of approved) |
| Outstanding (Approved - Disbursed) | ₱1,121,924 |

### Approval-to-Disbursement Ratio

**73.4%** of approved amounts have been disbursed.

### Payment Processing Time

- **Average:** 24.6 days
- **Median:** 25.0 days
- **Sample Size:** 356 claims
- **Claims with Missing Dates:** 244

**Note:** Claims with missing dates excluded from time calculations.

### Reconciliation Check

**Status:** ✓ Balanced

## Service-Specific Analysis

### General Mental Health Services

| Metric | Value |
|--------|-------|
| Accredited Facilities | 222 |
| Claims Submitted | 466 |
| Total Billed | ₱4,194,000 |
| Total Approved | ₱2,850,056 |
| Total Disbursed | ₱2,172,612 |

### Specialty Mental Health Services

| Metric | Value |
|--------|-------|
| Accredited Facilities | 122 |
| Claims Submitted | 134 |
| Total Billed | ₱2,144,000 |
| Total Approved | ₱1,360,141 |
| Total Disbursed | ₱915,661 |

**Note:** No double-counting: facilities with both service types counted once

## Regional Comparisons

**⚠️ SIMULATED DATA:** Regional patterns are synthetically generated for illustrative purposes only. Do not interpret as real geographic disparities.

| Region | Facilities | Accredited | Claims | Total Billed | Total Approved |
|--------|------------|------------|--------|--------------|----------------|
| BARMM (Bangsamoro) | 92 | 14 (15.2%) | 46 | ₱435,000 | ₱277,837 |
| CAR (Cordillera Administrative Region) | 88 | 13 (14.8%) | 58 | ₱648,000 | ₱419,489 |
| National Capital Region | 88 | 13 (14.8%) | 34 | ₱411,000 | ₱267,743 |
| Region I (Ilocos Region) | 88 | 13 (14.8%) | 41 | ₱404,000 | ₱261,611 |
| Region II (Cagayan Valley) | 88 | 13 (14.8%) | 26 | ₱255,000 | ₱175,276 |
| Region III (Central Luzon) | 88 | 13 (14.8%) | 40 | ₱395,000 | ₱302,355 |
| Region IV-A (CALABARZON) | 88 | 13 (14.8%) | 27 | ₱292,000 | ₱195,697 |
| Region IV-B (MIMAROPA) | 88 | 13 (14.8%) | 41 | ₱411,000 | ₱260,097 |
| Region IX (Zamboanga Peninsula) | 88 | 13 (14.8%) | 14 | ₱126,000 | ₱83,568 |
| Region V (Bicol Region) | 88 | 13 (14.8%) | 28 | ₱315,000 | ₱214,278 |
| Region VI (Western Visayas) | 88 | 13 (14.8%) | 13 | ₱131,000 | ₱97,041 |
| Region VII (Central Visayas) | 88 | 13 (14.8%) | 31 | ₱328,000 | ₱198,906 |
| Region VIII (Eastern Visayas) | 88 | 13 (14.8%) | 48 | ₱488,000 | ₱340,880 |
| Region X (Northern Mindanao) | 88 | 13 (14.8%) | 35 | ₱399,000 | ₱263,751 |
| Region XI (Davao Region) | 88 | 13 (14.8%) | 41 | ₱446,000 | ₱295,934 |
| Region XII (SOCCSKSARGEN) | 88 | 13 (14.8%) | 28 | ₱301,000 | ₱199,584 |
| Region XIII (Caraga) | 88 | 13 (14.8%) | 49 | ₱553,000 | ₱356,150 |

**Disclaimer:** Regional patterns are synthetically generated for illustrative purposes only.

## Metadata

- **Analysis Timestamp:** 2026-10-25T16:47:19.575Z
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