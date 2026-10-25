# Phase 3 Analytics Report: High Activity

**Generated:** 2026-10-25T16:47:19.611Z

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
| Accredited | 528 | 35.2% |
| Submitted Claims | 370 | 70.1% |
| Receiving Payment | 333 | 90.0% |

**Note:** Each facility is counted only once, regardless of multiple claims or accreditations.

## Claims Processing Cascade

This cascade shows claim counts (not facility counts) at each stage:

**V3: Now includes pending acceptance and adjudication stages**

| Stage | Count | Rate |
|-------|-------|------|
| Submitted | 2,000 | - |
| **Pending Acceptance** | 107 | 5.3% |
| Accepted | 1,893 | 94.7% |
| **Pending Adjudication** | 164 | 8.7% |
| Adjudicated | 1,729 | 91.3% |
| Approved | 1,637 | 94.7% |
| Paid | 1,235 | 75.4% |

### Administrative Bottlenecks

| Bottleneck Stage | Count | Avg Days Pending |
|------------------|-------|------------------|
| Pending Acceptance | 107 | 61.6 days |
| Pending Adjudication | 164 | 52.9 days |

### Payment Breakdown

| Category | Count | Percentage |
|----------|-------|------------|
| Fully Paid | 1,161 | 58.1% |
| Partially Paid | 74 | 3.7% |
| Approved but Unpaid | 402 | 20.1% |
| → Avg time awaiting payment | 48.2 days (as of 2025-07-15) | - |
| Denied | 92 | 4.6% |
| Pending Earlier Stages | 271 | 13.6% |

**Note:** Approval ≠ Payment. Claims may be approved but remain unpaid. V3 tracks time since approval for unpaid claims.

## Financial Metrics

| Metric | Amount |
|--------|--------|
| Total Billed | ₱21,346,000 |
| Total Approved | ₱14,867,673 (69.7% of billed) |
| Total Disbursed | ₱10,961,576 (73.7% of approved) |
| Outstanding (Approved - Disbursed) | ₱3,906,097 |

### Approval-to-Disbursement Ratio

**73.7%** of approved amounts have been disbursed.

### Payment Processing Time

- **Average:** 25.1 days
- **Median:** 25.0 days
- **Sample Size:** 1,235 claims
- **Claims with Missing Dates:** 765

**Note:** Claims with missing dates excluded from time calculations.

### Reconciliation Check

**Status:** ✓ Balanced

## Service-Specific Analysis

### General Mental Health Services

| Metric | Value |
|--------|-------|
| Accredited Facilities | 528 |
| Claims Submitted | 1,522 |
| Total Billed | ₱13,698,000 |
| Total Approved | ₱9,605,051 |
| Total Disbursed | ₱7,177,295 |

### Specialty Mental Health Services

| Metric | Value |
|--------|-------|
| Accredited Facilities | 256 |
| Claims Submitted | 478 |
| Total Billed | ₱7,648,000 |
| Total Approved | ₱5,262,622 |
| Total Disbursed | ₱3,784,281 |

**Note:** No double-counting: facilities with both service types counted once

## Regional Comparisons

**⚠️ SIMULATED DATA:** Regional patterns are synthetically generated for illustrative purposes only. Do not interpret as real geographic disparities.

| Region | Facilities | Accredited | Claims | Total Billed | Total Approved |
|--------|------------|------------|--------|--------------|----------------|
| BARMM (Bangsamoro) | 92 | 32 (34.8%) | 130 | ₱1,401,000 | ₱1,025,894 |
| CAR (Cordillera Administrative Region) | 88 | 31 (35.2%) | 135 | ₱1,432,000 | ₱984,357 |
| National Capital Region | 88 | 31 (35.2%) | 116 | ₱1,226,000 | ₱868,866 |
| Region I (Ilocos Region) | 88 | 31 (35.2%) | 141 | ₱1,479,000 | ₱1,009,197 |
| Region II (Cagayan Valley) | 88 | 31 (35.2%) | 118 | ₱1,300,000 | ₱906,365 |
| Region III (Central Luzon) | 88 | 31 (35.2%) | 105 | ₱1,225,000 | ₱834,731 |
| Region IV-A (CALABARZON) | 88 | 31 (35.2%) | 116 | ₱1,142,000 | ₱840,754 |
| Region IV-B (MIMAROPA) | 88 | 31 (35.2%) | 122 | ₱1,259,000 | ₱917,092 |
| Region IX (Zamboanga Peninsula) | 88 | 31 (35.2%) | 136 | ₱1,448,000 | ₱978,715 |
| Region V (Bicol Region) | 88 | 31 (35.2%) | 109 | ₱1,107,000 | ₱737,716 |
| Region VI (Western Visayas) | 88 | 31 (35.2%) | 111 | ₱1,237,000 | ₱811,603 |
| Region VII (Central Visayas) | 88 | 31 (35.2%) | 114 | ₱1,271,000 | ₱899,570 |
| Region VIII (Eastern Visayas) | 88 | 31 (35.2%) | 119 | ₱1,288,000 | ₱893,884 |
| Region X (Northern Mindanao) | 88 | 31 (35.2%) | 106 | ₱1,066,000 | ₱675,246 |
| Region XI (Davao Region) | 88 | 31 (35.2%) | 116 | ₱1,296,000 | ₱937,464 |
| Region XII (SOCCSKSARGEN) | 88 | 31 (35.2%) | 98 | ₱994,000 | ₱728,954 |
| Region XIII (Caraga) | 88 | 31 (35.2%) | 108 | ₱1,175,000 | ₱817,265 |

**Disclaimer:** Regional patterns are synthetically generated for illustrative purposes only.

## Metadata

- **Analysis Timestamp:** 2026-10-25T16:47:19.611Z
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