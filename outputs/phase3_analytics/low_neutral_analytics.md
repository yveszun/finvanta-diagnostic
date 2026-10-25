# Phase 3 Analytics Report: Low Activity

**Generated:** 2026-10-25T16:46:14.510Z

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
| Receiving Payment | 14 | 100.0% |

**Note:** Each facility is counted only once, regardless of multiple claims or accreditations.

## Claims Processing Cascade

This cascade shows claim counts (not facility counts) at each stage:

| Stage | Count | Rate |
|-------|-------|------|
| Submitted | 150 | - |
| Accepted | 150 | 100.0% |
| Adjudicated | 150 | 100.0% |
| Approved | 134 | 89.3% |
| Paid | 112 | 83.6% |

### Payment Breakdown

| Category | Count | Percentage |
|----------|-------|------------|
| Fully Paid | 110 | 73.3% |
| Partially Paid | 2 | 1.3% |
| Approved but Unpaid | 22 | 14.7% |
| Denied | 16 | 10.7% |

**Note:** Approval ≠ Payment. Claims may be approved but remain unpaid.

## Financial Metrics

| Metric | Amount |
|--------|--------|
| Total Billed | ₱1,504,000 |
| Total Approved | ₱1,163,785 (77.4% of billed) |
| Total Disbursed | ₱953,463 (81.9% of approved) |
| Outstanding (Approved - Disbursed) | ₱210,322 |

### Approval-to-Disbursement Ratio

**81.9%** of approved amounts have been disbursed.

### Payment Processing Time

- **Average:** 25.9 days
- **Median:** 25.5 days
- **Sample Size:** 112 claims
- **Claims with Missing Dates:** 38

**Note:** Claims with missing dates excluded from time calculations.

### Reconciliation Check

**Status:** ✓ Balanced

## Service-Specific Analysis

### General Mental Health Services

| Metric | Value |
|--------|-------|
| Accredited Facilities | 69 |
| Claims Submitted | 128 |
| Total Billed | ₱1,152,000 |
| Total Approved | ₱880,069 |
| Total Disbursed | ₱752,834 |

### Specialty Mental Health Services

| Metric | Value |
|--------|-------|
| Accredited Facilities | 37 |
| Claims Submitted | 22 |
| Total Billed | ₱352,000 |
| Total Approved | ₱283,716 |
| Total Disbursed | ₱200,629 |

**Note:** No double-counting: facilities with both service types counted once

## Regional Comparisons

**⚠️ SIMULATED DATA:** Regional patterns are synthetically generated for illustrative purposes only. Do not interpret as real geographic disparities.

| Region | Facilities | Accredited | Claims | Total Billed | Total Approved |
|--------|------------|------------|--------|--------------|----------------|
| BARMM (Bangsamoro) | 92 | 5 (5.4%) | 22 | ₱254,000 | ₱204,253 |
| CAR (Cordillera Administrative Region) | 88 | 4 (4.5%) | 21 | ₱231,000 | ₱184,663 |
| National Capital Region | 88 | 4 (4.5%) | 10 | ₱90,000 | ₱78,367 |
| Region I (Ilocos Region) | 88 | 4 (4.5%) | 0 | ₱0 | ₱0 |
| Region II (Cagayan Valley) | 88 | 4 (4.5%) | 22 | ₱198,000 | ₱156,730 |
| Region III (Central Luzon) | 88 | 4 (4.5%) | 11 | ₱99,000 | ₱77,010 |
| Region IV-A (CALABARZON) | 88 | 4 (4.5%) | 0 | ₱0 | ₱0 |
| Region IV-B (MIMAROPA) | 88 | 4 (4.5%) | 0 | ₱0 | ₱0 |
| Region IX (Zamboanga Peninsula) | 88 | 4 (4.5%) | 11 | ₱99,000 | ₱69,407 |
| Region V (Bicol Region) | 88 | 4 (4.5%) | 0 | ₱0 | ₱0 |
| Region VI (Western Visayas) | 88 | 4 (4.5%) | 22 | ₱226,000 | ₱183,066 |
| Region VII (Central Visayas) | 88 | 4 (4.5%) | 10 | ₱90,000 | ₱61,614 |
| Region VIII (Eastern Visayas) | 88 | 4 (4.5%) | 10 | ₱90,000 | ₱64,195 |
| Region X (Northern Mindanao) | 88 | 4 (4.5%) | 0 | ₱0 | ₱0 |
| Region XI (Davao Region) | 88 | 4 (4.5%) | 0 | ₱0 | ₱0 |
| Region XII (SOCCSKSARGEN) | 88 | 4 (4.5%) | 11 | ₱127,000 | ₱84,480 |
| Region XIII (Caraga) | 88 | 4 (4.5%) | 0 | ₱0 | ₱0 |

**Disclaimer:** Regional patterns are synthetically generated for illustrative purposes only.

## Metadata

- **Analysis Timestamp:** 2026-10-25T16:46:14.509Z
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