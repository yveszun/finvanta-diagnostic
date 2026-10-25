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
    this.config = config || {};
    
    // Define valid claim statuses
    this.validClaimStatuses = ['submitted', 'accepted', 'adjudicated', 'approved', 'paid', 'denied', 'partial_payment'];
    this.validPaymentStatuses = ['pending', 'paid_full', 'partial', 'denied', null];
    
    // Define required fields
    this.requiredFacilityFields = ['facility_id', 'facility_name', 'facility_type', 'region'];
    this.requiredAccreditationFields = ['accreditation_id', 'facility_id', 'accreditation_date', 'status', 'services_covered'];
    this.requiredClaimFields = ['claim_id', 'facility_id', 'service_date', 'service_code', 'billed_amount', 'submission_date', 'status'];
    
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

    // Check for empty datasets (CRITICAL if intended for analysis)
    this.validateDatasetCompleteness(facilities, accreditations, claims);

    // Validate required fields
    this.validateRequiredFields(facilities, accreditations, claims);

    // Validate claim and payment statuses
    this.validateStatuses(claims);

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
   * Validate dataset completeness (distinguish empty test fixtures from analysis-ready data)
   */
  validateDatasetCompleteness(facilities, accreditations, claims) {
    // Completely empty dataset
    if (!facilities || facilities.length === 0) {
      if (!accreditations || accreditations.length === 0) {
        if (!claims || claims.length === 0) {
          this.addError('CRITICAL', 'EMPTY_DATASET',
            'Dataset is completely empty. Not suitable for analysis.');
          return;
        }
      }
    }

    // Empty facilities
    if (!facilities || facilities.length === 0) {
      this.addError('CRITICAL', 'EMPTY_FACILITIES',
        'No facilities in dataset. Cannot validate accreditations or claims.');
    }

    // No accreditations (warning - could be valid for "no implementation" scenario)
    if (!accreditations || accreditations.length === 0) {
      this.addError('WARNING', 'NO_ACCREDITATIONS',
        'No accreditations in dataset. May be valid for zero-implementation scenario.');
    }

    // No claims (warning - could be valid for pre-launch scenario)
    if (!claims || claims.length === 0) {
      this.addError('WARNING', 'NO_CLAIMS',
        'No claims in dataset. May be valid for pre-utilization scenario.');
    }
  }

  /**
   * Validate required fields are present and non-empty
   */
  validateRequiredFields(facilities, accreditations, claims) {
    // Validate facilities
    if (facilities && facilities.length > 0) {
      const facilitiesWithMissingFields = [];
      facilities.forEach((facility, idx) => {
        const missing = this.requiredFacilityFields.filter(field => 
          facility[field] === null || 
          facility[field] === undefined || 
          facility[field] === ''
        );
        if (missing.length > 0) {
          facilitiesWithMissingFields.push({
            index: idx,
            facility_id: facility.facility_id || `[index ${idx}]`,
            missing_fields: missing
          });
        }
      });

      if (facilitiesWithMissingFields.length > 0) {
        this.addError('CRITICAL', 'FACILITIES_MISSING_REQUIRED_FIELDS',
          `${facilitiesWithMissingFields.length} facilities have missing required fields`,
          facilitiesWithMissingFields.slice(0, 5));
      }
    }

    // Validate accreditations
    if (accreditations && accreditations.length > 0) {
      const accreditationsWithMissingFields = [];
      accreditations.forEach((accred, idx) => {
        const missing = this.requiredAccreditationFields.filter(field => {
          if (field === 'services_covered') {
            return !Array.isArray(accred[field]) || accred[field].length === 0;
          }
          return accred[field] === null || 
                 accred[field] === undefined || 
                 accred[field] === '';
        });
        if (missing.length > 0) {
          accreditationsWithMissingFields.push({
            index: idx,
            accreditation_id: accred.accreditation_id || `[index ${idx}]`,
            missing_fields: missing
          });
        }
      });

      if (accreditationsWithMissingFields.length > 0) {
        this.addError('CRITICAL', 'ACCREDITATIONS_MISSING_REQUIRED_FIELDS',
          `${accreditationsWithMissingFields.length} accreditations have missing required fields`,
          accreditationsWithMissingFields.slice(0, 5));
      }
    }

    // Validate claims
    if (claims && claims.length > 0) {
      const claimsWithMissingFields = [];
      claims.forEach((claim, idx) => {
        const missing = this.requiredClaimFields.filter(field =>
          claim[field] === null || 
          claim[field] === undefined || 
          claim[field] === ''
        );
        if (missing.length > 0) {
          claimsWithMissingFields.push({
            index: idx,
            claim_id: claim.claim_id || `[index ${idx}]`,
            missing_fields: missing
          });
        }
      });

      if (claimsWithMissingFields.length > 0) {
        this.addError('CRITICAL', 'CLAIMS_MISSING_REQUIRED_FIELDS',
          `${claimsWithMissingFields.length} claims have missing required fields`,
          claimsWithMissingFields.slice(0, 5));
      }
    }
  }

  /**
   * Validate claim statuses and payment statuses against permitted values
   */
  validateStatuses(claims) {
    if (!claims || claims.length === 0) return;

    // Validate claim statuses
    const invalidClaimStatuses = [];
    claims.forEach(claim => {
      if (!this.validClaimStatuses.includes(claim.status)) {
        invalidClaimStatuses.push({
          claim_id: claim.claim_id,
          invalid_status: claim.status
        });
      }
    });

    if (invalidClaimStatuses.length > 0) {
      this.addError('CRITICAL', 'INVALID_CLAIM_STATUS',
        `${invalidClaimStatuses.length} claims have invalid status values. Permitted: ${this.validClaimStatuses.join(', ')}`,
        invalidClaimStatuses.slice(0, 5));
    }

    // Validate payment statuses
    const invalidPaymentStatuses = [];
    claims.forEach(claim => {
      if (claim.payment_status !== undefined && !this.validPaymentStatuses.includes(claim.payment_status)) {
        invalidPaymentStatuses.push({
          claim_id: claim.claim_id,
          invalid_payment_status: claim.payment_status
        });
      }
    });

    if (invalidPaymentStatuses.length > 0) {
      this.addError('ERROR', 'INVALID_PAYMENT_STATUS',
        `${invalidPaymentStatuses.length} claims have invalid payment_status values. Permitted: ${this.validPaymentStatuses.filter(s => s !== null).join(', ')}, null`,
        invalidPaymentStatuses.slice(0, 5));
    }
  }

  /**
   * 1. Validate uniqueness of IDs
   */
  validateUniqueness(facilities, accreditations, claims) {
    // Facility IDs
    if (facilities && facilities.length > 0) {
      const facilityIds = facilities.map(f => f.facility_id).filter(id => id); // Filter out null/undefined
      const uniqueFacilityIds = new Set(facilityIds);
      if (facilityIds.length !== uniqueFacilityIds.size) {
        this.addError('CRITICAL', 'DUPLICATE_FACILITY_IDS', 
          `Found ${facilityIds.length - uniqueFacilityIds.size} duplicate facility IDs`);
      }
    }

    // Accreditation IDs
    if (accreditations && accreditations.length > 0) {
      const accredIds = accreditations.map(a => a.accreditation_id).filter(id => id);
      const uniqueAccredIds = new Set(accredIds);
      if (accredIds.length !== uniqueAccredIds.size) {
        this.addError('CRITICAL', 'DUPLICATE_ACCREDITATION_IDS',
          `Found ${accredIds.length - uniqueAccredIds.size} duplicate accreditation IDs`);
      }
    }

    // Claim IDs
    if (claims && claims.length > 0) {
      const claimIds = claims.map(c => c.claim_id).filter(id => id);
      const uniqueClaimIds = new Set(claimIds);
      if (claimIds.length !== uniqueClaimIds.size) {
        this.addError('CRITICAL', 'DUPLICATE_CLAIM_IDS',
          `Found ${claimIds.length - uniqueClaimIds.size} duplicate claim IDs`);
      }
    }
  }

  /**
   * 2. Validate referential integrity
   */
  validateReferences(facilities, accreditations, claims) {
    if (!facilities || facilities.length === 0) return;

    const validFacilityIds = new Set(facilities.map(f => f.facility_id).filter(id => id));

    // Accreditations must reference valid facilities
    if (accreditations && accreditations.length > 0) {
      const invalidAccredRefs = accreditations.filter(a => a.facility_id && !validFacilityIds.has(a.facility_id));
      if (invalidAccredRefs.length > 0) {
        this.addError('CRITICAL', 'INVALID_ACCREDITATION_FACILITY_REFS',
          `${invalidAccredRefs.length} accreditations reference non-existent facilities`,
          invalidAccredRefs.slice(0, 5).map(a => a.accreditation_id));
      }
    }

    // Claims must reference valid facilities
    if (claims && claims.length > 0) {
      const invalidClaimRefs = claims.filter(c => c.facility_id && !validFacilityIds.has(c.facility_id));
      if (invalidClaimRefs.length > 0) {
        this.addError('CRITICAL', 'INVALID_CLAIM_FACILITY_REFS',
          `${invalidClaimRefs.length} claims reference non-existent facilities`,
          invalidClaimRefs.slice(0, 5).map(c => c.claim_id));
      }
    }
  }

  /**
   * 3. Validate chronology: service dates must be on or after accreditation
   */
  validateChronology(accreditations, claims) {
    if (!accreditations || accreditations.length === 0) return;
    if (!claims || claims.length === 0) return;

    // Build accreditation date map
    const accredDateMap = {};
    accreditations.forEach(a => {
      if (a.facility_id && a.accreditation_date) {
        accredDateMap[a.facility_id] = a.accreditation_date;
      }
    });

    const violations = [];
    claims.forEach(claim => {
      if (claim.service_date && claim.facility_id) {
        const accredDate = accredDateMap[claim.facility_id];
        if (accredDate && claim.service_date < accredDate) {
          violations.push({
            claim_id: claim.claim_id,
            service_date: claim.service_date,
            accreditation_date: accredDate
          });
        }
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
    if (!claims || claims.length === 0) return;
    if (!accreditations || accreditations.length === 0) return;
    if (!facilities || facilities.length === 0) return;

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

    // Check specialty eligibility based on configuration (if available)
    if (this.config && this.config.eligibility && this.config.eligibility.serviceDistinction) {
      const specialtyConfig = this.config.eligibility.serviceDistinction.specialty;
      
      if (specialtyConfig) {
        const specialtyViolations = [];
        claims.forEach(claim => {
          if (claim.service_code === 'PSYCH_CONSULT_SPEC') {
            const facility = facilityLevelMap[claim.facility_id];
            if (facility) {
              // Check if facility type is eligible
              if (!specialtyConfig.eligibleFacilityTypes.includes(facility.type)) {
                specialtyViolations.push({
                  claim_id: claim.claim_id,
                  facility_type: facility.type,
                  note: specialtyConfig.illustrativeAssumption || 'Eligibility restriction'
                });
              }
              // Check if facility level is eligible
              else if (!specialtyConfig.eligibleLevels.includes(facility.level)) {
                specialtyViolations.push({
                  claim_id: claim.claim_id,
                  facility_level: facility.level,
                  note: specialtyConfig.illustrativeAssumption || 'Eligibility restriction'
                });
              }
            }
          }
        });

        if (specialtyViolations.length > 0) {
          this.addError('ERROR', 'SPECIALTY_ELIGIBILITY_VIOLATION',
            `${specialtyViolations.length} specialty claims at facilities not meeting illustrative eligibility criteria (pending PhilHealth verification)`,
            specialtyViolations.slice(0, 5));
        }
      }
    } else {
      // No config provided - return warning instead of applying hardcoded rules
      const specialtyClaims = claims.filter(c => c.service_code === 'PSYCH_CONSULT_SPEC');
      if (specialtyClaims.length > 0) {
        this.addError('WARNING', 'MISSING_ELIGIBILITY_CONFIG',
          `Cannot validate specialty service eligibility: configuration not provided. ${specialtyClaims.length} specialty claims present.`,
          { note: 'Provide eligibility configuration to enable service-specific validation' });
      }
    }
  }

  /**
   * 5. Validate payment logic and status consistency
   */
  validatePaymentLogic(claims) {
    if (!claims || claims.length === 0) return;

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
    if (!claims || claims.length === 0) return;

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
    if (!claims || claims.length === 0) return;

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
    // Handle empty or null datasets
    const facilitiesArray = facilities || [];
    const accreditationsArray = accreditations || [];
    const claimsArray = claims || [];

    // Count distinct accredited facilities (not just accreditation records)
    const distinctAccreditedFacilities = new Set(
      accreditationsArray.map(a => a.facility_id)
    ).size;

    // Count facilities with general vs specialty accreditation (distinct facilities)
    const facilitiesWithGeneral = new Set();
    const facilitiesWithSpecialty = new Set();
    
    accreditationsArray.forEach(accred => {
      if (accred.services_covered) {
        if (accred.services_covered.includes('PSYCH_CONSULT_GEN')) {
          facilitiesWithGeneral.add(accred.facility_id);
        }
        if (accred.services_covered.includes('PSYCH_CONSULT_SPEC')) {
          facilitiesWithSpecialty.add(accred.facility_id);
        }
      }
    });

    const approvedClaims = claimsArray.filter(c => 
      c.approved_amount !== null && c.approved_amount > 0
    );
    const paidClaims = claimsArray.filter(c => c.status === 'paid');
    const approvedUnpaid = claimsArray.filter(c => 
      c.status === 'approved' && c.payment_date === null
    );
    const partialPayment = claimsArray.filter(c => c.status === 'partial_payment');
    const deniedClaims = claimsArray.filter(c => c.status === 'denied');

    const totalBilled = claimsArray.reduce((sum, c) => sum + (c.billed_amount || 0), 0);
    const totalApproved = approvedClaims.reduce((sum, c) => sum + c.approved_amount, 0);
    const totalDisbursed = claimsArray.reduce((sum, c) => sum + (c.disbursed_amount || 0), 0);
    const totalOutstanding = claimsArray.reduce((sum, c) => sum + (c.outstanding_balance || 0), 0);

    // Calculate rates with proper handling of zero denominators
    const accreditationRate = facilitiesArray.length > 0 
      ? ((distinctAccreditedFacilities / facilitiesArray.length) * 100).toFixed(1) + '%'
      : 'N/A';

    const approvalRate = totalBilled > 0 ? totalApproved / totalBilled : null;
    const disbursementRate = totalApproved > 0 ? totalDisbursed / totalApproved : null;

    this.results.summary = {
      facilities: {
        total: facilitiesArray.length,
        accredited: distinctAccreditedFacilities,
        accreditationRate: accreditationRate,
        withGeneralAccreditation: facilitiesWithGeneral.size,
        withSpecialtyAccreditation: facilitiesWithSpecialty.size
      },
      claims: {
        total: claimsArray.length,
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
        approvalRate: approvalRate,
        disbursementRate: disbursementRate
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
      if (results.summary.facilities.withGeneralAccreditation !== undefined) {
        lines.push(`  - With general accreditation: ${results.summary.facilities.withGeneralAccreditation}`);
      }
      if (results.summary.facilities.withSpecialtyAccreditation !== undefined) {
        lines.push(`  - With specialty accreditation: ${results.summary.facilities.withSpecialtyAccreditation}`);
      }
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
