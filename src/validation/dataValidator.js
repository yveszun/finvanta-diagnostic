/**
 * Data Validation Module
 * 
 * Validates synthetic benefit implementation data for integrity, consistency,
 * and compliance with business rules.
 * 
 * Returns validation results with severity levels:
 * - CRITICAL: Data integrity violation that makes the dataset unusable
 * - ERROR: Business rule violation that requires correction
 * - WARNING: Suspicious pattern that should be reviewed
 * - INFO: Informational message about data characteristics
 */

export class DataValidator {
  constructor(config = {}) {
    this.config = config;
    this.results = {
      valid: true,
      errors: [],
      warnings: [],
      info: [],
      summary: {}
    };
  }

  /**
   * Validate a complete scenario dataset
   */
  validate(facilities, accreditations, claims) {
    this.results = {
      valid: true,
      errors: [],
      warnings: [],
      info: [],
      summary: {}
    };

    // Run all validation checks
    this.validateUniqueness(facilities, accreditations, claims);
    this.validateReferences(facilities, accreditations, claims);
    this.validateChronology(accreditations, claims);
    this.validateServiceCompliance(facilities, accreditations, claims);
    this.validatePaymentLogic(claims);
    this.validateFinancialConsistency(claims);
    this.validateDateProgression(claims);

    // Generate summary
    this.generateSummary(facilities, accreditations, claims);

    // Set overall validity
    this.results.valid = this.results.errors.length === 0;

    return this.results;
  }

  /**
   * 1. Validate uniqueness of IDs
   */
  validateUniqueness(facilities, accreditations, claims) {
    // Facility IDs
    const facilityIds = facilities.map(f => f.facility_id);
    const uniqueFacilityIds = new Set(facilityIds);
    if (facilityIds.length !== uniqueFacilityIds.size) {
      this.addError('CRITICAL', 'DUPLICATE_FACILITY_IDS', 
        `Found ${facilityIds.length - uniqueFacilityIds.size} duplicate facility IDs`);
    }

    // Accreditation IDs
    const accredIds = accreditations.map(a => a.accreditation_id);
    const uniqueAccredIds = new Set(accredIds);
    if (accredIds.length !== uniqueAccredIds.size) {
      this.addError('CRITICAL', 'DUPLICATE_ACCREDITATION_IDS',
        `Found ${accredIds.length - uniqueAccredIds.size} duplicate accreditation IDs`);
    }

    // Claim IDs
    const claimIds = claims.map(c => c.claim_id);
    const uniqueClaimIds = new Set(claimIds);
    if (claimIds.length !== uniqueClaimIds.size) {
      this.addError('CRITICAL', 'DUPLICATE_CLAIM_IDS',
        `Found ${claimIds.length - uniqueClaimIds.size} duplicate claim IDs`);
    }
  }

  /**
   * 2. Validate referential integrity
   */
  validateReferences(facilities, accreditations, claims) {
    const validFacilityIds = new Set(facilities.map(f => f.facility_id));

    // Accreditations must reference valid facilities
    const invalidAccredRefs = accreditations.filter(a => !validFacilityIds.has(a.facility_id));
    if (invalidAccredRefs.length > 0) {
      this.addError('CRITICAL', 'INVALID_ACCREDITATION_FACILITY_REFS',
        `${invalidAccredRefs.length} accreditations reference non-existent facilities`,
        invalidAccredRefs.slice(0, 5).map(a => a.accreditation_id));
    }

    // Claims must reference valid facilities
    const invalidClaimRefs = claims.filter(c => !validFacilityIds.has(c.facility_id));
    if (invalidClaimRefs.length > 0) {
      this.addError('CRITICAL', 'INVALID_CLAIM_FACILITY_REFS',
        `${invalidClaimRefs.length} claims reference non-existent facilities`,
        invalidClaimRefs.slice(0, 5).map(c => c.claim_id));
    }
  }

  /**
   * 3. Validate chronology: service dates must be on or after accreditation
   */
  validateChronology(accreditations, claims) {
    // Build accreditation date map
    const accredDateMap = {};
    accreditations.forEach(a => {
      accredDateMap[a.facility_id] = a.accreditation_date;
    });

    const violations = [];
    claims.forEach(claim => {
      const accredDate = accredDateMap[claim.facility_id];
      if (accredDate && claim.service_date < accredDate) {
        violations.push({
          claim_id: claim.claim_id,
          service_date: claim.service_date,
          accreditation_date: accredDate
        });
      }
    });

    if (violations.length > 0) {
      this.addError('CRITICAL', 'CHRONOLOGY_VIOLATION',
        `${violations.length} claims have service dates before facility accreditation`,
        violations.slice(0, 5));
    }
  }

  /**
   * 4. Validate service-specific compliance
   */
  validateServiceCompliance(facilities, accreditations, claims) {
    // Build services covered map
    const servicesCoveredMap = {};
    accreditations.forEach(a => {
      servicesCoveredMap[a.facility_id] = a.services_covered || [];
    });

    // Build facility level map
    const facilityLevelMap = {};
    facilities.forEach(f => {
      facilityLevelMap[f.facility_id] = {
        type: f.facility_type,
        level: f.facility_level
      };
    });

    const violations = [];
    claims.forEach(claim => {
      const servicesCovered = servicesCoveredMap[claim.facility_id] || [];
      if (!servicesCovered.includes(claim.service_code)) {
        violations.push({
          claim_id: claim.claim_id,
          service_code: claim.service_code,
          services_covered: servicesCovered
        });
      }
    });

    if (violations.length > 0) {
      this.addError('ERROR', 'SERVICE_NOT_COVERED',
        `${violations.length} claims filed for services not covered by facility accreditation`,
        violations.slice(0, 5));
    }

    // Check Level 1 facilities don't have specialty services
    const level1SpecialtyViolations = [];
    claims.forEach(claim => {
      const facility = facilityLevelMap[claim.facility_id];
      if (facility && facility.level === 1 && claim.service_code === 'PSYCH_CONSULT_SPEC') {
        level1SpecialtyViolations.push(claim.claim_id);
      }
    });

    if (level1SpecialtyViolations.length > 0) {
      this.addError('ERROR', 'LEVEL1_SPECIALTY_VIOLATION',
        `${level1SpecialtyViolations.length} Level 1 facilities have specialty claims`,
        level1SpecialtyViolations.slice(0, 5));
    }
  }

  /**
   * 5. Validate payment logic and status consistency
   */
  validatePaymentLogic(claims) {
    // Paid claims must have payment date and disbursed amount
    const paidWithoutDate = claims.filter(c => 
      c.status === 'paid' && !c.payment_date
    );
    if (paidWithoutDate.length > 0) {
      this.addError('CRITICAL', 'PAID_WITHOUT_DATE',
        `${paidWithoutDate.length} paid claims missing payment_date`,
        paidWithoutDate.slice(0, 5).map(c => c.claim_id));
    }

    const paidWithoutDisbursed = claims.filter(c =>
      c.status === 'paid' && (c.disbursed_amount === null || c.disbursed_amount === undefined)
    );
    if (paidWithoutDisbursed.length > 0) {
      this.addError('CRITICAL', 'PAID_WITHOUT_DISBURSED',
        `${paidWithoutDisbursed.length} paid claims missing disbursed_amount`,
        paidWithoutDisbursed.slice(0, 5).map(c => c.claim_id));
    }

    // Approved-but-unpaid claims must NOT have payment date
    const approvedWithPayment = claims.filter(c =>
      c.status === 'approved' && c.payment_date !== null
    );
    if (approvedWithPayment.length > 0) {
      this.addError('ERROR', 'APPROVED_WITH_PAYMENT_DATE',
        `${approvedWithPayment.length} approved (unpaid) claims have payment_date`,
        approvedWithPayment.slice(0, 5).map(c => c.claim_id));
    }

    // Denied claims must NOT have approval or payment dates
    const deniedWithApproval = claims.filter(c =>
      c.status === 'denied' && c.approval_date !== null
    );
    if (deniedWithApproval.length > 0) {
      this.addError('ERROR', 'DENIED_WITH_APPROVAL',
        `${deniedWithApproval.length} denied claims have approval_date`,
        deniedWithApproval.slice(0, 5).map(c => c.claim_id));
    }

    const deniedWithPayment = claims.filter(c =>
      c.status === 'denied' && c.payment_date !== null
    );
    if (deniedWithPayment.length > 0) {
      this.addError('ERROR', 'DENIED_WITH_PAYMENT',
        `${deniedWithPayment.length} denied claims have payment_date`,
        deniedWithPayment.slice(0, 5).map(c => c.claim_id));
    }

    // Fully paid claims should have outstanding_balance = 0
    const paidWithOutstanding = claims.filter(c =>
      c.status === 'paid' && c.outstanding_balance > 0
    );
    if (paidWithOutstanding.length > 0) {
      this.addError('ERROR', 'PAID_WITH_OUTSTANDING',
        `${paidWithOutstanding.length} fully paid claims have non-zero outstanding balance`,
        paidWithOutstanding.slice(0, 5).map(c => ({
          claim_id: c.claim_id,
          approved: c.approved_amount,
          disbursed: c.disbursed_amount,
          outstanding: c.outstanding_balance
        })));
    }

    // Approved-but-unpaid should have outstanding = approved
    const approvedIncorrectOutstanding = claims.filter(c =>
      c.status === 'approved' && 
      c.payment_date === null &&
      c.outstanding_balance !== c.approved_amount
    );
    if (approvedIncorrectOutstanding.length > 0) {
      this.addError('ERROR', 'APPROVED_INCORRECT_OUTSTANDING',
        `${approvedIncorrectOutstanding.length} approved-unpaid claims have incorrect outstanding balance`,
        approvedIncorrectOutstanding.slice(0, 5).map(c => ({
          claim_id: c.claim_id,
          approved: c.approved_amount,
          outstanding: c.outstanding_balance,
          expected: c.approved_amount
        })));
    }
  }

  /**
   * 6. Validate financial consistency
   */
  validateFinancialConsistency(claims) {
    // Disbursed <= Approved
    const disbursedExceedsApproved = claims.filter(c =>
      c.disbursed_amount !== null && 
      c.approved_amount !== null &&
      c.disbursed_amount > c.approved_amount
    );
    if (disbursedExceedsApproved.length > 0) {
      this.addError('CRITICAL', 'DISBURSED_EXCEEDS_APPROVED',
        `${disbursedExceedsApproved.length} claims have disbursed > approved`,
        disbursedExceedsApproved.slice(0, 5).map(c => ({
          claim_id: c.claim_id,
          approved: c.approved_amount,
          disbursed: c.disbursed_amount
        })));
    }

    // Approved <= Billed
    const approvedExceedsBilled = claims.filter(c =>
      c.approved_amount !== null &&
      c.approved_amount > c.billed_amount
    );
    if (approvedExceedsBilled.length > 0) {
      this.addError('ERROR', 'APPROVED_EXCEEDS_BILLED',
        `${approvedExceedsBilled.length} claims have approved > billed`,
        approvedExceedsBilled.slice(0, 5).map(c => ({
          claim_id: c.claim_id,
          billed: c.billed_amount,
          approved: c.approved_amount
        })));
    }

    // Outstanding balance calculation
    const incorrectOutstanding = claims.filter(c => {
      if (c.approved_amount === null) return false;
      const expected = c.disbursed_amount !== null 
        ? c.approved_amount - c.disbursed_amount 
        : c.approved_amount;
      return c.outstanding_balance !== expected;
    });
    if (incorrectOutstanding.length > 0) {
      this.addError('ERROR', 'INCORRECT_OUTSTANDING_CALCULATION',
        `${incorrectOutstanding.length} claims have incorrect outstanding_balance calculation`,
        incorrectOutstanding.slice(0, 5).map(c => ({
          claim_id: c.claim_id,
          approved: c.approved_amount,
          disbursed: c.disbursed_amount,
          outstanding: c.outstanding_balance,
          expected: c.disbursed_amount !== null ? c.approved_amount - c.disbursed_amount : c.approved_amount
        })));
    }
  }

  /**
   * 7. Validate date progression
   */
  validateDateProgression(claims) {
    const violations = [];
    
    claims.forEach(claim => {
      // Service date <= submission date
      if (claim.service_date > claim.submission_date) {
        violations.push({
          claim_id: claim.claim_id,
          issue: 'service_after_submission',
          service_date: claim.service_date,
          submission_date: claim.submission_date
        });
      }

      // Submission <= acceptance
      if (claim.submission_date > claim.acceptance_date) {
        violations.push({
          claim_id: claim.claim_id,
          issue: 'submission_after_acceptance',
          submission_date: claim.submission_date,
          acceptance_date: claim.acceptance_date
        });
      }

      // Acceptance <= adjudication
      if (claim.acceptance_date > claim.adjudication_date) {
        violations.push({
          claim_id: claim.claim_id,
          issue: 'acceptance_after_adjudication',
          acceptance_date: claim.acceptance_date,
          adjudication_date: claim.adjudication_date
        });
      }

      // For approved claims: adjudication <= approval
      if (claim.approval_date && claim.adjudication_date > claim.approval_date) {
        violations.push({
          claim_id: claim.claim_id,
          issue: 'adjudication_after_approval',
          adjudication_date: claim.adjudication_date,
          approval_date: claim.approval_date
        });
      }

      // For paid claims: approval <= payment
      if (claim.payment_date && claim.approval_date && claim.approval_date > claim.payment_date) {
        violations.push({
          claim_id: claim.claim_id,
          issue: 'approval_after_payment',
          approval_date: claim.approval_date,
          payment_date: claim.payment_date
        });
      }

      // Service date < payment date (the critical one for corruption detection)
      if (claim.payment_date && claim.service_date > claim.payment_date) {
        violations.push({
          claim_id: claim.claim_id,
          issue: 'service_after_payment',
          service_date: claim.service_date,
          payment_date: claim.payment_date
        });
      }
    });

    if (violations.length > 0) {
      this.addError('CRITICAL', 'DATE_PROGRESSION_VIOLATION',
        `${violations.length} claims have invalid date progression`,
        violations.slice(0, 5));
    }
  }

  /**
   * Generate validation summary
   */
  generateSummary(facilities, accreditations, claims) {
    const approvedClaims = claims.filter(c => 
      c.approved_amount !== null && c.approved_amount > 0
    );
    const paidClaims = claims.filter(c => c.status === 'paid');
    const approvedUnpaid = claims.filter(c => 
      c.status === 'approved' && c.payment_date === null
    );
    const partialPayment = claims.filter(c => c.status === 'partial_payment');
    const deniedClaims = claims.filter(c => c.status === 'denied');

    const totalBilled = claims.reduce((sum, c) => sum + c.billed_amount, 0);
    const totalApproved = approvedClaims.reduce((sum, c) => sum + c.approved_amount, 0);
    const totalDisbursed = claims.reduce((sum, c) => sum + (c.disbursed_amount || 0), 0);
    const totalOutstanding = claims.reduce((sum, c) => sum + (c.outstanding_balance || 0), 0);

    this.results.summary = {
      facilities: {
        total: facilities.length,
        accredited: accreditations.length,
        accreditationRate: (accreditations.length / facilities.length * 100).toFixed(1) + '%'
      },
      claims: {
        total: claims.length,
        approved: approvedClaims.length,
        fullyPaid: paidClaims.length,
        approvedUnpaid: approvedUnpaid.length,
        partialPayment: partialPayment.length,
        denied: deniedClaims.length
      },
      financial: {
        totalBilled: totalBilled,
        totalApproved: totalApproved,
        totalDisbursed: totalDisbursed,
        totalOutstanding: totalOutstanding,
        approvalRate: totalApproved / totalBilled,
        disbursementRate: totalDisbursed / totalApproved
      }
    };
  }

  /**
   * Helper: Add error to results
   */
  addError(severity, code, message, details = null) {
    const error = {
      severity,
      code,
      message,
      details
    };

    if (severity === 'CRITICAL' || severity === 'ERROR') {
      this.results.errors.push(error);
    } else if (severity === 'WARNING') {
      this.results.warnings.push(error);
    } else {
      this.results.info.push(error);
    }
  }

  /**
   * Format validation results as a report
   */
  formatReport(results = this.results) {
    const lines = [];
    
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('DATA VALIDATION REPORT');
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('');
    
    lines.push(`Overall Status: ${results.valid ? '✅ VALID' : '❌ INVALID'}`);
    lines.push(`Errors: ${results.errors.length}`);
    lines.push(`Warnings: ${results.warnings.length}`);
    lines.push('');

    if (results.errors.length > 0) {
      lines.push('ERRORS:');
      lines.push('-------');
      results.errors.forEach(err => {
        lines.push(`[${err.severity}] ${err.code}: ${err.message}`);
        if (err.details && err.details.length > 0) {
          lines.push(`  Examples: ${JSON.stringify(err.details.slice(0, 3), null, 2)}`);
        }
        lines.push('');
      });
    }

    if (results.warnings.length > 0) {
      lines.push('WARNINGS:');
      lines.push('---------');
      results.warnings.forEach(warn => {
        lines.push(`[${warn.severity}] ${warn.code}: ${warn.message}`);
        lines.push('');
      });
    }

    if (results.summary) {
      lines.push('SUMMARY:');
      lines.push('--------');
      lines.push(`Facilities: ${results.summary.facilities.total} (${results.summary.facilities.accredited} accredited, ${results.summary.facilities.accreditationRate})`);
      lines.push(`Claims: ${results.summary.claims.total} total`);
      lines.push(`  - Fully Paid: ${results.summary.claims.fullyPaid}`);
      lines.push(`  - Partial Payment: ${results.summary.claims.partialPayment}`);
      lines.push(`  - Approved (Unpaid): ${results.summary.claims.approvedUnpaid}`);
      lines.push(`  - Denied: ${results.summary.claims.denied}`);
      lines.push(`Financial:`);
      lines.push(`  - Total Billed: ₱${results.summary.financial.totalBilled.toLocaleString()}`);
      lines.push(`  - Total Approved: ₱${results.summary.financial.totalApproved.toLocaleString()}`);
      lines.push(`  - Total Disbursed: ₱${results.summary.financial.totalDisbursed.toLocaleString()}`);
      lines.push(`  - Total Outstanding: ₱${results.summary.financial.totalOutstanding.toLocaleString()}`);
      lines.push('');
    }

    lines.push('═══════════════════════════════════════════════════════════');

    return lines.join('\n');
  }
}
