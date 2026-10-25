# Phase 3 Analytics Report: Low Activity

**Generated:** 2026-10-25T16:57:36.848Z

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
| Submitted Claims | 15 | 21.7% |
| Receiving Payment | 12 | 80.0% |

**Note:** Each facility is counted only once, regardless of multiple claims or accreditations.

## Claims Processing Cascade

This cascade shows claim counts (not facility counts) at each stage:

**V3: Now includes pending acceptance and adjudication stages**

| Stage | Count | Rate |
|-------|-------|------|
| Submitted | 150 | - |
| **Pending Acceptance** | 9 | 6.0% |
| Accepted | 141 | 94.0% |
| **Pending Adjudication** | 14 | 9.9% |
| Adjudicated | 127 | 90.1% |
| Approved | 109 | 85.8% |
| Paid | 47 | 43.1% |

### Administrative Bottlenecks

| Bottleneck Stage | Count | Avg Days Pending |
|------------------|-------|------------------|
| Pending Acceptance | 9 | 45.3 days |
| Pending Adjudication | 14 | 61.1 days |

### Payment Breakdown

| Category | Count | Percentage |
|----------|-------|------------|
| Fully Paid | 42 | 28.0% |
| Partially Paid | 5 | 3.3% |
| Approved but Unpaid | 62 | 41.3% |
| → Avg time awaiting payment | 22.6 days (as of 2025-07-15) | - |
| Denied | 18 | 12.0% |
| Pending Earlier Stages | 23 | 15.3% |

**Note:** Approval ≠ Payment. Claims may be approved but remain unpaid. V3 tracks time since approval for unpaid claims.

## Financial Metrics

| Metric | Amount |
|--------|--------|
| Total Billed | ₱1,546,000 |
| Total Approved | ₱943,643 (61.0% of billed) |
| Total Disbursed | ₱410,270 (43.5% of approved) |
| Outstanding (Approved - Disbursed) | ₱533,373 |

### Approval-to-Disbursement Ratio

**43.5%** of approved amounts have been disbursed.

### Payment Processing Time

- **Average:** 20.7 days
- **Median:** 17.0 days
- **Sample Size:** 47 claims
- **Claims with Missing Dates:** 103

**Note:** Claims with missing dates excluded from time calculations.

### Reconciliation Check

**Status:** ✓ Balanced

## Service-Specific Analysis

### General Mental Health Services

| Metric | Value |
|--------|-------|
| Accredited Facilities | 69 |
| Claims Submitted | 122 |
| Total Billed | ₱1,098,000 |
| Total Approved | ₱671,104 |
| Total Disbursed | ₱264,238 |

### Specialty Mental Health Services

| Metric | Value |
|--------|-------|
| Accredited Facilities | 30 |
| Claims Submitted | 28 |
| Total Billed | ₱448,000 |
| Total Approved | ₱272,539 |
| Total Disbursed | ₱146,032 |

**Note:** No double-counting: facilities with both service types counted once

## Regional Comparisons

**⚠️ SIMULATED DATA:** Regional patterns are synthetically generated for illustrative purposes only. Do not interpret as real geographic disparities.

| Region | Facilities | Accredited | Claims | Total Billed | Total Approved |
|--------|------------|------------|--------|--------------|----------------|
| BARMM (Bangsamoro) | 92 | 5 (5.4%) | 10 | ₱125,000 | ₱106,719 |
| CAR (Cordillera Administrative Region) | 88 | 4 (4.5%) | 10 | ₱132,000 | ₱75,330 |
| National Capital Region | 88 | 6 (6.8%) | 20 | ₱180,000 | ₱120,866 |
| Region I (Ilocos Region) | 88 | 4 (4.5%) | 10 | ₱90,000 | ₱38,034 |
| Region II (Cagayan Valley) | 88 | 4 (4.5%) | 0 | ₱0 | ₱0 |
| Region III (Central Luzon) | 88 | 4 (4.5%) | 10 | ₱104,000 | ₱78,163 |
| Region IV-A (CALABARZON) | 88 | 4 (4.5%) | 10 | ₱90,000 | ₱60,225 |
| Region IV-B (MIMAROPA) | 88 | 4 (4.5%) | 10 | ₱97,000 | ₱50,540 |
| Region IX (Zamboanga Peninsula) | 88 | 2 (2.3%) | 0 | ₱0 | ₱0 |
| Region V (Bicol Region) | 88 | 4 (4.5%) | 10 | ₱90,000 | ₱36,135 |
| Region VI (Western Visayas) | 88 | 4 (4.5%) | 0 | ₱0 | ₱0 |
| Region VII (Central Visayas) | 88 | 6 (6.8%) | 20 | ₱180,000 | ₱137,377 |
| Region VIII (Eastern Visayas) | 88 | 4 (4.5%) | 10 | ₱90,000 | ₱59,387 |
| Region X (Northern Mindanao) | 88 | 4 (4.5%) | 10 | ₱111,000 | ₱60,266 |
| Region XI (Davao Region) | 88 | 4 (4.5%) | 10 | ₱132,000 | ₱60,895 |
| Region XII (SOCCSKSARGEN) | 88 | 2 (2.3%) | 0 | ₱0 | ₱0 |
| Region XIII (Caraga) | 88 | 4 (4.5%) | 10 | ₱125,000 | ₱59,706 |

**Disclaimer:** Regional patterns are synthetically generated for illustrative purposes only.

## Metadata

- **Analysis Timestamp:** 2026-10-25T16:57:36.847Z
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