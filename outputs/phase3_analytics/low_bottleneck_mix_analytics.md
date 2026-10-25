# Phase 3 Analytics Report: Low Activity

**Generated:** 2026-10-25T17:17:32.621Z

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
| **Pending Acceptance** | 10 | 6.7% |
| Accepted | 140 | 93.3% |
| **Pending Adjudication** | 16 | 11.4% |
| Adjudicated | 124 | 88.6% |
| Approved | 108 | 87.1% |
| Paid | 46 | 42.6% |

### Administrative Bottlenecks

| Bottleneck Stage | Count | Avg Days Pending |
|------------------|-------|------------------|
| Pending Acceptance | 10 | 48.3 days |
| Pending Adjudication | 16 | 54.8 days |

### Payment Breakdown

| Category | Count | Percentage |
|----------|-------|------------|
| Fully Paid | 42 | 28.0% |
| Partially Paid | 4 | 2.7% |
| Approved but Unpaid | 62 | 41.3% |
| → Avg time awaiting payment | 22.5 days (as of 2025-07-15T23:59:59.000Z) | - |
| Denied | 16 | 10.7% |
| Pending Earlier Stages | 26 | 17.3% |

**Note:** Approval ≠ Payment. Claims may be approved but remain unpaid. V3 tracks time since approval for unpaid claims.

## Financial Metrics

| Metric | Amount |
|--------|--------|
| Total Billed | ₱1,553,000 |
| Total Approved | ₱935,666 (60.2% of billed) |
| Total Disbursed | ₱405,045 (43.3% of approved) |
| Outstanding (Approved - Disbursed) | ₱530,621 |

### Approval-to-Disbursement Ratio

**43.3%** of approved amounts have been disbursed.

### Payment Processing Time

- **Average:** 20.8 days
- **Median:** 16.5 days
- **Sample Size:** 46 claims
- **Claims with Missing Dates:** 104

**Note:** Claims with missing dates excluded from time calculations.

### Reconciliation Check

**Status:** ✓ Balanced

## Service-Specific Analysis

### General Mental Health Services

| Metric | Value |
|--------|-------|
| Accredited Facilities | 69 |
| Claims Submitted | 121 |
| Total Billed | ₱1,089,000 |
| Total Approved | ₱663,127 |
| Total Disbursed | ₱259,013 |

### Specialty Mental Health Services

| Metric | Value |
|--------|-------|
| Accredited Facilities | 30 |
| Claims Submitted | 29 |
| Total Billed | ₱464,000 |
| Total Approved | ₱272,539 |
| Total Disbursed | ₱146,032 |

**Note:** No double-counting: facilities with both service types counted once

## Regional Comparisons

**⚠️ SIMULATED DATA:** Regional patterns are synthetically generated for illustrative purposes only. Do not interpret as real geographic disparities.

| Region | Facilities | Accredited | Claims | Total Billed | Total Approved |
|--------|------------|------------|--------|--------------|----------------|
| BARMM (Bangsamoro) | 92 | 5 (5.4%) | 10 | ₱125,000 | ₱106,147 |
| CAR (Cordillera Administrative Region) | 88 | 4 (4.5%) | 10 | ₱132,000 | ₱75,440 |
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
| Region VIII (Eastern Visayas) | 88 | 4 (4.5%) | 10 | ₱90,000 | ₱58,874 |
| Region X (Northern Mindanao) | 88 | 4 (4.5%) | 10 | ₱118,000 | ₱52,730 |
| Region XI (Davao Region) | 88 | 4 (4.5%) | 10 | ₱132,000 | ₱68,431 |
| Region XII (SOCCSKSARGEN) | 88 | 2 (2.3%) | 0 | ₱0 | ₱0 |
| Region XIII (Caraga) | 88 | 4 (4.5%) | 10 | ₱125,000 | ₱52,704 |

**Disclaimer:** Regional patterns are synthetically generated for illustrative purposes only.

## Metadata

- **Analysis Timestamp:** 2026-10-25T17:17:32.621Z
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