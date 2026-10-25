# Phase 3 Analytics Report: Moderate Activity

**Generated:** 2026-10-25T16:29:09.531Z

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
| Receiving Payment | 89 | 100.0% |

**Note:** Each facility is counted only once, regardless of multiple claims or accreditations.

## Claims Processing Cascade

This cascade shows claim counts (not facility counts) at each stage:

| Stage | Count | Rate |
|-------|-------|------|
| Submitted | 600 | - |
| Accepted | 600 | 100.0% |
| Adjudicated | 600 | 100.0% |
| Approved | 557 | 92.8% |
| Paid | 465 | 83.5% |

### Payment Breakdown

| Category | Count | Percentage |
|----------|-------|------------|
| Fully Paid | 438 | 73.0% |
| Partially Paid | 27 | 4.5% |
| Approved but Unpaid | 92 | 15.3% |
| Denied | 43 | 7.2% |

**Note:** Approval ≠ Payment. Claims may be approved but remain unpaid.

## Financial Metrics

| Metric | Amount |
|--------|--------|
| Total Billed | ₱6,457,000 |
| Total Approved | ₱5,102,150 (79.0% of billed) |
| Total Disbursed | ₱4,176,372 (81.9% of approved) |
| Outstanding (Approved - Disbursed) | ₱925,778 |

### Approval-to-Disbursement Ratio

**81.9%** of approved amounts have been disbursed.

### Payment Processing Time

- **Average:** 24.8 days
- **Median:** 24.0 days
- **Sample Size:** 465 claims
- **Claims with Missing Dates:** 135

**Note:** Claims with missing dates excluded from time calculations.

### Reconciliation Check

**Status:** ✓ Balanced

## Service-Specific Analysis

### General Mental Health Services

| Metric | Value |
|--------|-------|
| Accredited Facilities | 222 |
| Claims Submitted | 449 |
| Total Billed | ₱4,041,000 |
| Total Approved | ₱3,152,536 |
| Total Disbursed | ₱2,608,278 |

### Specialty Mental Health Services

| Metric | Value |
|--------|-------|
| Accredited Facilities | 122 |
| Claims Submitted | 151 |
| Total Billed | ₱2,416,000 |
| Total Approved | ₱1,949,614 |
| Total Disbursed | ₱1,568,094 |

**Note:** No double-counting: facilities with both service types counted once

## Regional Comparisons

**⚠️ SIMULATED DATA:** Regional patterns are synthetically generated for illustrative purposes only. Do not interpret as real geographic disparities.

| Region | Facilities | Accredited | Claims | Total Billed | Total Approved |
|--------|------------|------------|--------|--------------|----------------|
| BARMM (Bangsamoro) | 92 | 14 (15.2%) | 46 | ₱442,000 | ₱344,193 |
| CAR (Cordillera Administrative Region) | 88 | 13 (14.8%) | 58 | ₱662,000 | ₱506,570 |
| National Capital Region | 88 | 13 (14.8%) | 34 | ₱383,000 | ₱311,371 |
| Region I (Ilocos Region) | 88 | 13 (14.8%) | 41 | ₱439,000 | ₱306,112 |
| Region II (Cagayan Valley) | 88 | 13 (14.8%) | 26 | ₱283,000 | ₱244,226 |
| Region III (Central Luzon) | 88 | 13 (14.8%) | 40 | ₱402,000 | ₱330,698 |
| Region IV-A (CALABARZON) | 88 | 13 (14.8%) | 27 | ₱306,000 | ₱239,246 |
| Region IV-B (MIMAROPA) | 88 | 13 (14.8%) | 41 | ₱453,000 | ₱361,179 |
| Region IX (Zamboanga Peninsula) | 88 | 13 (14.8%) | 14 | ₱126,000 | ₱106,392 |
| Region V (Bicol Region) | 88 | 13 (14.8%) | 28 | ₱294,000 | ₱232,028 |
| Region VI (Western Visayas) | 88 | 13 (14.8%) | 13 | ₱124,000 | ₱104,558 |
| Region VII (Central Visayas) | 88 | 13 (14.8%) | 31 | ₱370,000 | ₱284,759 |
| Region VIII (Eastern Visayas) | 88 | 13 (14.8%) | 48 | ₱495,000 | ₱394,696 |
| Region X (Northern Mindanao) | 88 | 13 (14.8%) | 35 | ₱385,000 | ₱301,726 |
| Region XI (Davao Region) | 88 | 13 (14.8%) | 41 | ₱460,000 | ₱351,938 |
| Region XII (SOCCSKSARGEN) | 88 | 13 (14.8%) | 28 | ₱287,000 | ₱232,004 |
| Region XIII (Caraga) | 88 | 13 (14.8%) | 49 | ₱546,000 | ₱450,454 |

**Disclaimer:** Regional patterns are synthetically generated for illustrative purposes only.

## Metadata

- **Analysis Timestamp:** 2026-10-25T16:29:09.531Z
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