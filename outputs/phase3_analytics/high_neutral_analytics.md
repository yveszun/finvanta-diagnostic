# Phase 3 Analytics Report: High Activity

**Generated:** 2026-10-25T16:46:14.556Z

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
| Receiving Payment | 370 | 100.0% |

**Note:** Each facility is counted only once, regardless of multiple claims or accreditations.

## Claims Processing Cascade

This cascade shows claim counts (not facility counts) at each stage:

| Stage | Count | Rate |
|-------|-------|------|
| Submitted | 2,000 | - |
| Accepted | 2,000 | 100.0% |
| Adjudicated | 2,000 | 100.0% |
| Approved | 1,906 | 95.3% |
| Paid | 1,632 | 85.6% |

### Payment Breakdown

| Category | Count | Percentage |
|----------|-------|------------|
| Fully Paid | 1,551 | 77.5% |
| Partially Paid | 81 | 4.0% |
| Approved but Unpaid | 274 | 13.7% |
| Denied | 94 | 4.7% |

**Note:** Approval ≠ Payment. Claims may be approved but remain unpaid.

## Financial Metrics

| Metric | Amount |
|--------|--------|
| Total Billed | ₱21,486,000 |
| Total Approved | ₱17,420,842 (81.1% of billed) |
| Total Disbursed | ₱14,749,833 (84.7% of approved) |
| Outstanding (Approved - Disbursed) | ₱2,671,009 |

### Approval-to-Disbursement Ratio

**84.7%** of approved amounts have been disbursed.

### Payment Processing Time

- **Average:** 25.0 days
- **Median:** 25.0 days
- **Sample Size:** 1,632 claims
- **Claims with Missing Dates:** 368

**Note:** Claims with missing dates excluded from time calculations.

### Reconciliation Check

**Status:** ✓ Balanced

## Service-Specific Analysis

### General Mental Health Services

| Metric | Value |
|--------|-------|
| Accredited Facilities | 528 |
| Claims Submitted | 1,502 |
| Total Billed | ₱13,518,000 |
| Total Approved | ₱10,939,780 |
| Total Disbursed | ₱9,160,364 |

### Specialty Mental Health Services

| Metric | Value |
|--------|-------|
| Accredited Facilities | 256 |
| Claims Submitted | 498 |
| Total Billed | ₱7,968,000 |
| Total Approved | ₱6,481,062 |
| Total Disbursed | ₱5,589,469 |

**Note:** No double-counting: facilities with both service types counted once

## Regional Comparisons

**⚠️ SIMULATED DATA:** Regional patterns are synthetically generated for illustrative purposes only. Do not interpret as real geographic disparities.

| Region | Facilities | Accredited | Claims | Total Billed | Total Approved |
|--------|------------|------------|--------|--------------|----------------|
| BARMM (Bangsamoro) | 92 | 32 (34.8%) | 130 | ₱1,303,000 | ₱1,092,632 |
| CAR (Cordillera Administrative Region) | 88 | 31 (35.2%) | 135 | ₱1,474,000 | ₱1,192,921 |
| National Capital Region | 88 | 31 (35.2%) | 116 | ₱1,226,000 | ₱1,017,102 |
| Region I (Ilocos Region) | 88 | 31 (35.2%) | 141 | ₱1,535,000 | ₱1,265,073 |
| Region II (Cagayan Valley) | 88 | 31 (35.2%) | 118 | ₱1,307,000 | ₱987,165 |
| Region III (Central Luzon) | 88 | 31 (35.2%) | 105 | ₱1,253,000 | ₱1,021,710 |
| Region IV-A (CALABARZON) | 88 | 31 (35.2%) | 116 | ₱1,156,000 | ₱939,257 |
| Region IV-B (MIMAROPA) | 88 | 31 (35.2%) | 122 | ₱1,252,000 | ₱1,042,733 |
| Region IX (Zamboanga Peninsula) | 88 | 31 (35.2%) | 136 | ₱1,427,000 | ₱1,148,964 |
| Region V (Bicol Region) | 88 | 31 (35.2%) | 109 | ₱1,170,000 | ₱907,636 |
| Region VI (Western Visayas) | 88 | 31 (35.2%) | 111 | ₱1,230,000 | ₱988,906 |
| Region VII (Central Visayas) | 88 | 31 (35.2%) | 114 | ₱1,292,000 | ₱1,057,274 |
| Region VIII (Eastern Visayas) | 88 | 31 (35.2%) | 119 | ₱1,274,000 | ₱1,048,505 |
| Region X (Northern Mindanao) | 88 | 31 (35.2%) | 106 | ₱1,087,000 | ₱861,832 |
| Region XI (Davao Region) | 88 | 31 (35.2%) | 116 | ₱1,338,000 | ₱1,072,028 |
| Region XII (SOCCSKSARGEN) | 88 | 31 (35.2%) | 98 | ₱1,001,000 | ₱810,028 |
| Region XIII (Caraga) | 88 | 31 (35.2%) | 108 | ₱1,161,000 | ₱967,076 |

**Disclaimer:** Regional patterns are synthetically generated for illustrative purposes only.

## Metadata

- **Analysis Timestamp:** 2026-10-25T16:46:14.556Z
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