# Phase 3 Analytics Report: High Activity

**Generated:** 2026-10-25T16:57:36.898Z

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
| Accredited | 514 | 34.3% |
| Submitted Claims | 358 | 69.6% |
| Receiving Payment | 292 | 81.6% |

**Note:** Each facility is counted only once, regardless of multiple claims or accreditations.

## Claims Processing Cascade

This cascade shows claim counts (not facility counts) at each stage:

**V3: Now includes pending acceptance and adjudication stages**

| Stage | Count | Rate |
|-------|-------|------|
| Submitted | 2,000 | - |
| **Pending Acceptance** | 115 | 5.8% |
| Accepted | 1,885 | 94.3% |
| **Pending Adjudication** | 162 | 8.6% |
| Adjudicated | 1,723 | 91.4% |
| Approved | 1,637 | 95.0% |
| Paid | 846 | 51.7% |

### Administrative Bottlenecks

| Bottleneck Stage | Count | Avg Days Pending |
|------------------|-------|------------------|
| Pending Acceptance | 115 | 57.7 days |
| Pending Adjudication | 162 | 55.5 days |

### Payment Breakdown

| Category | Count | Percentage |
|----------|-------|------------|
| Fully Paid | 803 | 40.2% |
| Partially Paid | 43 | 2.1% |
| Approved but Unpaid | 791 | 39.6% |
| → Avg time awaiting payment | 34.8 days (as of 2025-07-15) | - |
| Denied | 86 | 4.3% |
| Pending Earlier Stages | 277 | 13.9% |

**Note:** Approval ≠ Payment. Claims may be approved but remain unpaid. V3 tracks time since approval for unpaid claims.

## Financial Metrics

| Metric | Amount |
|--------|--------|
| Total Billed | ₱21,220,000 |
| Total Approved | ₱14,709,215 (69.3% of billed) |
| Total Disbursed | ₱7,453,306 (50.7% of approved) |
| Outstanding (Approved - Disbursed) | ₱7,255,909 |

### Approval-to-Disbursement Ratio

**50.7%** of approved amounts have been disbursed.

### Payment Processing Time

- **Average:** 22.3 days
- **Median:** 21.0 days
- **Sample Size:** 846 claims
- **Claims with Missing Dates:** 1,154

**Note:** Claims with missing dates excluded from time calculations.

### Reconciliation Check

**Status:** ✓ Balanced

## Service-Specific Analysis

### General Mental Health Services

| Metric | Value |
|--------|-------|
| Accredited Facilities | 514 |
| Claims Submitted | 1,540 |
| Total Billed | ₱13,860,000 |
| Total Approved | ₱9,665,167 |
| Total Disbursed | ₱4,980,228 |

### Specialty Mental Health Services

| Metric | Value |
|--------|-------|
| Accredited Facilities | 253 |
| Claims Submitted | 460 |
| Total Billed | ₱7,360,000 |
| Total Approved | ₱5,044,048 |
| Total Disbursed | ₱2,473,078 |

**Note:** No double-counting: facilities with both service types counted once

## Regional Comparisons

**⚠️ SIMULATED DATA:** Regional patterns are synthetically generated for illustrative purposes only. Do not interpret as real geographic disparities.

| Region | Facilities | Accredited | Claims | Total Billed | Total Approved |
|--------|------------|------------|--------|--------------|----------------|
| BARMM (Bangsamoro) | 92 | 32 (34.8%) | 110 | ₱1,137,000 | ₱784,553 |
| CAR (Cordillera Administrative Region) | 88 | 31 (35.2%) | 110 | ₱1,277,000 | ₱868,701 |
| National Capital Region | 88 | 43 (48.9%) | 234 | ₱2,477,000 | ₱1,864,399 |
| Region I (Ilocos Region) | 88 | 31 (35.2%) | 132 | ₱1,370,000 | ₱997,054 |
| Region II (Cagayan Valley) | 88 | 31 (35.2%) | 66 | ₱685,000 | ₱444,859 |
| Region III (Central Luzon) | 88 | 31 (35.2%) | 132 | ₱1,335,000 | ₱956,571 |
| Region IV-A (CALABARZON) | 88 | 31 (35.2%) | 132 | ₱1,377,000 | ₱952,839 |
| Region IV-B (MIMAROPA) | 88 | 31 (35.2%) | 132 | ₱1,370,000 | ₱1,008,833 |
| Region IX (Zamboanga Peninsula) | 88 | 12 (13.6%) | 40 | ₱409,000 | ₱286,717 |
| Region V (Bicol Region) | 88 | 31 (35.2%) | 132 | ₱1,482,000 | ₱896,904 |
| Region VI (Western Visayas) | 88 | 31 (35.2%) | 66 | ₱685,000 | ₱521,254 |
| Region VII (Central Visayas) | 88 | 43 (48.9%) | 234 | ₱2,540,000 | ₱1,663,148 |
| Region VIII (Eastern Visayas) | 88 | 31 (35.2%) | 110 | ₱1,151,000 | ₱791,542 |
| Region X (Northern Mindanao) | 88 | 31 (35.2%) | 110 | ₱1,263,000 | ₱780,121 |
| Region XI (Davao Region) | 88 | 31 (35.2%) | 110 | ₱1,158,000 | ₱839,782 |
| Region XII (SOCCSKSARGEN) | 88 | 12 (13.6%) | 40 | ₱374,000 | ₱276,145 |
| Region XIII (Caraga) | 88 | 31 (35.2%) | 110 | ₱1,130,000 | ₱775,793 |

**Disclaimer:** Regional patterns are synthetically generated for illustrative purposes only.

## Metadata

- **Analysis Timestamp:** 2026-10-25T16:57:36.898Z
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