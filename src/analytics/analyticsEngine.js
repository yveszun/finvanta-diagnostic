/**
 * Analytical Calculations Module
 * 
 * Calculates cascades, financial metrics, and regional comparisons for
 * benefit implementation diagnostic analysis.
 * 
 * Safeguards:
 * - Never divides by zero
 * - Returns N/A for undefined rates
 * - Excludes missing dates from time calculations
 * - Reports missingness
 * - Does not run when validator reports blocking errors
 * - Uses distinct facility/claim IDs for counts
 * - Labels all outputs as synthetic/illustrative
 */

export class AnalyticsEngine {
  constructor(validationResults) {
    this.validationResults = validationResults;
    this.hasBlockingErrors = false;
    
    // Check for blocking errors from validator
    if (validationResults && validationResults.errors) {
      this.hasBlockingErrors = validationResults.errors.some(e => 
        e.severity === 'CRITICAL' || e.severity === 'ERROR'
      );
    }
  }

  /**
   * Main analysis entry point
   * Returns comprehensive analytics or error if validation failed
   */
  analyze(facilities, accreditations, claims, config = {}) {
    // Do not run calculations if validator reported blocking errors
    if (this.hasBlockingErrors) {
      return {
        error: 'VALIDATION_FAILED',
        message: 'Cannot run analytics: dataset has validation errors that must be corrected first',
        validationErrors: this.validationResults.errors
      };
    }

    // Handle empty/null datasets
    if (!facilities || !accreditations || !claims) {
      return {
        error: 'INSUFFICIENT_DATA',
        message: 'Cannot run analytics: missing required datasets',
        data: {
          facilities: facilities ? facilities.length : 0,
          accreditations: accreditations ? accreditations.length : 0,
          claims: claims ? claims.length : 0
        }
      };
    }

    return {
      facilityParticipationCascade: this.calculateFacilityParticipationCascade(facilities, accreditations, claims),
      claimsProcessingCascade: this.calculateClaimsProcessingCascade(claims),
      financialCalculations: this.calculateFinancialMetrics(claims),
      serviceSpecificAnalysis: this.calculateServiceSpecificMetrics(facilities, accreditations, claims),
      regionalComparisons: this.calculateRegionalMetrics(facilities, accreditations, claims),
      metadata: {
        timestamp: new Date().toISOString(),
        disclaimer: 'All data is synthetic for diagnostic purposes. Does not represent actual PhilHealth performance.',
        validation: {
          hasErrors: this.hasBlockingErrors,
          errors: this.validationResults?.errors?.length || 0,
          warnings: this.validationResults?.warnings?.length || 0
        }
      }
    };
  }

  /**
   * 1. Facility Participation Cascade
   * 
   * Tracks distinct facilities through implementation stages.
   * Uses Set() to ensure distinct facility counts.
   */
  calculateFacilityParticipationCascade(facilities, accreditations, claims) {
    // Stage 1: Eligible facilities (illustrative population)
    const eligibleFacilities = new Set(
      facilities.filter(f => f.facility_id).map(f => f.facility_id)
    );

    // Stage 2: Accredited facilities (distinct)
    const accreditedFacilities = new Set(
      accreditations.filter(a => a.facility_id).map(a => a.facility_id)
    );

    // Stage 3: Accredited facilities that submitted at least one claim (distinct)
    const claimingFacilities = new Set(
      claims
        .filter(c => c.facility_id && accreditedFacilities.has(c.facility_id))
        .map(c => c.facility_id)
    );

    // Stage 4: Facilities with at least one claim receiving payment (distinct)
    const paidFacilities = new Set(
      claims
        .filter(c => c.facility_id && (c.status === 'paid' || c.status === 'partial_payment'))
        .map(c => c.facility_id)
    );

    // Calculate rates with zero-denominator safeguards
    const accreditationRate = eligibleFacilities.size > 0
      ? (accreditedFacilities.size / eligibleFacilities.size) * 100
      : null;

    const claimingRate = accreditedFacilities.size > 0
      ? (claimingFacilities.size / accreditedFacilities.size) * 100
      : null;

    const paymentRate = claimingFacilities.size > 0
      ? (paidFacilities.size / claimingFacilities.size) * 100
      : null;

    return {
      stage1_eligible: {
        count: eligibleFacilities.size,
        numerator: eligibleFacilities.size,
        denominator: eligibleFacilities.size,
        label: 'Facilities in illustrative eligible population',
        note: 'Pending official PhilHealth eligibility criteria'
      },
      stage2_accredited: {
        count: accreditedFacilities.size,
        numerator: accreditedFacilities.size,
        denominator: eligibleFacilities.size,
        rate: accreditationRate !== null ? accreditationRate.toFixed(1) + '%' : 'N/A',
        label: 'Accredited facilities (distinct)',
        note: 'Uses distinct facility IDs'
      },
      stage3_claiming: {
        count: claimingFacilities.size,
        numerator: claimingFacilities.size,
        denominator: accreditedFacilities.size,
        rate: claimingRate !== null ? claimingRate.toFixed(1) + '%' : 'N/A',
        label: 'Accredited facilities that submitted at least one claim',
        note: 'Distinct facilities, not claim count'
      },
      stage4_receiving_payment: {
        count: paidFacilities.size,
        numerator: paidFacilities.size,
        denominator: claimingFacilities.size,
        rate: paymentRate !== null ? paymentRate.toFixed(1) + '%' : 'N/A',
        label: 'Facilities with at least one claim receiving payment',
        note: 'Includes both fully paid and partially paid claims'
      },
      summary: {
        eligible: eligibleFacilities.size,
        accredited: accreditedFacilities.size,
        claiming: claimingFacilities.size,
        receivingPayment: paidFacilities.size,
        dropoff_accreditation: eligibleFacilities.size - accreditedFacilities.size,
        dropoff_claiming: accreditedFacilities.size - claimingFacilities.size,
        dropoff_payment: claimingFacilities.size - paidFacilities.size
      }
    };
  }

  /**
   * 2. Claims Processing Cascade
   * 
   * Tracks claims through processing milestones.
   * V3: Adds pending acceptance and adjudication stages.
   * Uses distinct claim IDs where applicable.
   */
  calculateClaimsProcessingCascade(claims) {
    // Get distinct claim IDs
    const distinctClaims = new Set(
      claims.filter(c => c.claim_id).map(c => c.claim_id)
    );

    // V3: Cumulative processing stages including pending states
    const submitted = claims.filter(c => c.claim_id).length; // All claims with IDs
    const pendingAcceptance = claims.filter(c => c.status === 'pending_acceptance').length;
    const accepted = claims.filter(c => c.acceptance_date).length;
    const pendingAdjudication = claims.filter(c => c.status === 'pending_adjudication').length;
    const adjudicated = claims.filter(c => c.adjudication_date).length;
    const approved = claims.filter(c => 
      c.status === 'approved' || c.status === 'paid' || c.status === 'partial_payment'
    ).length;
    const paid = claims.filter(c => 
      c.status === 'paid' || c.status === 'partial_payment'
    ).length;

    // Breakdown by final status
    const fullyPaid = claims.filter(c => c.status === 'paid').length;
    const partiallyPaid = claims.filter(c => c.status === 'partial_payment').length;
    const approvedUnpaid = claims.filter(c => c.status === 'approved' && !c.payment_date).length;
    const denied = claims.filter(c => c.status === 'denied').length;

    // Calculate rates with zero-denominator safeguards
    const acceptanceRate = submitted > 0 ? (accepted / submitted) * 100 : null;
    const adjudicationRate = accepted > 0 ? (adjudicated / accepted) * 100 : null;
    const approvalRate = adjudicated > 0 ? (approved / adjudicated) * 100 : null;
    const paymentRate = approved > 0 ? (paid / approved) * 100 : null;

    // V3: Average days pending for claims stuck in pending states
    const avgDaysPendingAcceptance = pendingAcceptance > 0
      ? claims.filter(c => c.status === 'pending_acceptance' && c.days_pending)
          .reduce((sum, c) => sum + c.days_pending, 0) / pendingAcceptance
      : null;
      
    const avgDaysPendingAdjudication = pendingAdjudication > 0
      ? claims.filter(c => c.status === 'pending_adjudication' && c.days_pending)
          .reduce((sum, c) => sum + c.days_pending, 0) / pendingAdjudication
      : null;

    return {
      stage1_submitted: {
        count: submitted,
        distinctClaims: distinctClaims.size,
        label: 'Submitted claims',
        note: 'All claims with claim IDs'
      },
      stage1a_pending_acceptance: {
        count: pendingAcceptance,
        numerator: pendingAcceptance,
        denominator: submitted,
        rate: submitted > 0 ? ((pendingAcceptance / submitted) * 100).toFixed(1) + '%' : 'N/A',
        avgDaysPending: avgDaysPendingAcceptance ? avgDaysPendingAcceptance.toFixed(1) + ' days' : 'N/A',
        label: 'Pending acceptance (administrative review)',
        note: 'V3: Claims awaiting acceptance'
      },
      stage2_accepted: {
        count: accepted,
        numerator: accepted,
        denominator: submitted,
        rate: acceptanceRate !== null ? acceptanceRate.toFixed(1) + '%' : 'N/A',
        label: 'Accepted for processing',
        note: 'Claims with acceptance_date'
      },
      stage2a_pending_adjudication: {
        count: pendingAdjudication,
        numerator: pendingAdjudication,
        denominator: accepted,
        rate: accepted > 0 ? ((pendingAdjudication / accepted) * 100).toFixed(1) + '%' : 'N/A',
        avgDaysPending: avgDaysPendingAdjudication ? avgDaysPendingAdjudication.toFixed(1) + ' days' : 'N/A',
        label: 'Pending adjudication (awaiting review)',
        note: 'V3: Claims awaiting adjudication'
      },
      stage3_adjudicated: {
        count: adjudicated,
        numerator: adjudicated,
        denominator: accepted,
        rate: adjudicationRate !== null ? adjudicationRate.toFixed(1) + '%' : 'N/A',
        label: 'Adjudicated',
        note: 'Claims with adjudication_date'
      },
      stage4_approved: {
        count: approved,
        numerator: approved,
        denominator: adjudicated,
        rate: approvalRate !== null ? approvalRate.toFixed(1) + '%' : 'N/A',
        label: 'Approved for payment',
        note: 'Includes paid, partial_payment, and approved (unpaid) statuses'
      },
      stage5_paid: {
        count: paid,
        numerator: paid,
        denominator: approved,
        rate: paymentRate !== null ? paymentRate.toFixed(1) + '%' : 'N/A',
        label: 'Receiving payment',
        note: 'Includes both fully paid and partially paid'
      },
      breakdown: {
        fullyPaid: {
          count: fullyPaid,
          percentage: submitted > 0 ? ((fullyPaid / submitted) * 100).toFixed(1) + '%' : 'N/A',
          label: 'Fully paid'
        },
        partiallyPaid: {
          count: partiallyPaid,
          percentage: submitted > 0 ? ((partiallyPaid / submitted) * 100).toFixed(1) + '%' : 'N/A',
          label: 'Partially paid'
        },
        approvedUnpaid: {
          count: approvedUnpaid,
          percentage: submitted > 0 ? ((approvedUnpaid / submitted) * 100).toFixed(1) + '%' : 'N/A',
          label: 'Approved but payment pending',
          avgDaysSinceApproval: this._calculateAvgDaysSinceApproval(claims.filter(c => c.status === 'approved' && !c.payment_date))
        },
        denied: {
          count: denied,
          percentage: submitted > 0 ? ((denied / submitted) * 100).toFixed(1) + '%' : 'N/A',
          label: 'Denied'
        },
        pendingEarlierStages: {
          count: pendingAcceptance + pendingAdjudication,
          percentage: submitted > 0 ? (((pendingAcceptance + pendingAdjudication) / submitted) * 100).toFixed(1) + '%' : 'N/A',
          label: 'Pending at earlier stages (acceptance/adjudication)'
        }
      },
      summary: {
        totalClaims: submitted,
        distinctClaims: distinctClaims.size,
        reachedPayment: paid,
        awaitingPayment: approvedUnpaid,
        denied: denied,
        pendingProcessing: pendingAcceptance + pendingAdjudication
      }
    };
  }

  /**
   * V3: Helper to calculate average days since approval for approved-but-unpaid claims
   */
  _calculateAvgDaysSinceApproval(approvedUnpaidClaims) {
    const daysArray = approvedUnpaidClaims
      .filter(c => c.days_since_approval !== null && c.days_since_approval !== undefined)
      .map(c => c.days_since_approval);
    
    if (daysArray.length === 0) return 'N/A';
    
    const avg = daysArray.reduce((sum, d) => sum + d, 0) / daysArray.length;
    return `${avg.toFixed(1)} days (as of ${approvedUnpaidClaims[0]?.analysis_cutoff_date || 'analysis cutoff'})`;
  }

  /**
   * 3. Financial Calculations
   * 
   * Calculates financial metrics with reconciliation checks.
   */
  calculateFinancialMetrics(claims) {
    const totalBilled = claims.reduce((sum, c) => sum + (c.billed_amount || 0), 0);
    const totalApproved = claims
      .filter(c => c.approved_amount !== null && c.approved_amount !== undefined)
      .reduce((sum, c) => sum + c.approved_amount, 0);
    const totalDisbursed = claims.reduce((sum, c) => sum + (c.disbursed_amount || 0), 0);
    const totalOutstanding = claims.reduce((sum, c) => sum + (c.outstanding_balance || 0), 0);

    // Approval-to-disbursement ratio
    const approvalToDisbursementRatio = totalApproved > 0
      ? (totalDisbursed / totalApproved) * 100
      : null;

    // Payment processing time (where dates are available)
    const paymentTimes = claims
      .filter(c => c.approval_date && c.payment_date && c.approval_date <= c.payment_date)
      .map(c => {
        const approvalDate = new Date(c.approval_date);
        const paymentDate = new Date(c.payment_date);
        const days = Math.floor((paymentDate - approvalDate) / (1000 * 60 * 60 * 24));
        return days;
      });

    const avgPaymentTime = paymentTimes.length > 0
      ? paymentTimes.reduce((sum, d) => sum + d, 0) / paymentTimes.length
      : null;

    const medianPaymentTime = paymentTimes.length > 0
      ? this.calculateMedian(paymentTimes)
      : null;

    // Reconciliation check
    const expectedOutstanding = totalApproved - totalDisbursed;
    const reconciles = Math.abs(totalOutstanding - expectedOutstanding) < 1; // Allow 1 peso rounding

    return {
      totalBilled: {
        amount: totalBilled,
        formatted: '₱' + totalBilled.toLocaleString(),
        label: 'Total billed'
      },
      totalApproved: {
        amount: totalApproved,
        formatted: '₱' + totalApproved.toLocaleString(),
        percentage: totalBilled > 0 ? ((totalApproved / totalBilled) * 100).toFixed(1) + '%' : 'N/A',
        label: 'Total approved',
        note: 'Percentage of billed amount'
      },
      totalDisbursed: {
        amount: totalDisbursed,
        formatted: '₱' + totalDisbursed.toLocaleString(),
        percentage: totalApproved > 0 ? ((totalDisbursed / totalApproved) * 100).toFixed(1) + '%' : 'N/A',
        label: 'Total disbursed',
        note: 'Percentage of approved amount'
      },
      totalOutstanding: {
        amount: totalOutstanding,
        formatted: '₱' + totalOutstanding.toLocaleString(),
        percentage: totalApproved > 0 ? ((totalOutstanding / totalApproved) * 100).toFixed(1) + '%' : 'N/A',
        label: 'Total outstanding',
        note: 'Approved but not yet disbursed'
      },
      approvalToDisbursementRatio: {
        ratio: approvalToDisbursementRatio !== null ? approvalToDisbursementRatio.toFixed(1) + '%' : 'N/A',
        label: 'Approval-to-disbursement ratio',
        note: 'Percentage of approved amounts that have been disbursed'
      },
      paymentProcessingTime: {
        average: avgPaymentTime !== null ? avgPaymentTime.toFixed(1) + ' days' : 'N/A',
        median: medianPaymentTime !== null ? medianPaymentTime.toFixed(1) + ' days' : 'N/A',
        sampleSize: paymentTimes.length,
        missingDates: claims.length - paymentTimes.length,
        label: 'Payment processing time (approval to payment)',
        note: 'Excludes claims with missing dates. Reports missingness: ' + (claims.length - paymentTimes.length) + ' claims'
      },
      reconciliation: {
        reconciles: reconciles,
        expected: expectedOutstanding,
        actual: totalOutstanding,
        difference: Math.abs(totalOutstanding - expectedOutstanding),
        status: reconciles ? 'PASS' : 'FAIL',
        note: 'Outstanding should equal Approved minus Disbursed'
      }
    };
  }

  /**
   * 4. Service-Specific Analysis
   * 
   * Separate calculations for general and specialty services.
   * No double-counting of facilities.
   */
  calculateServiceSpecificMetrics(facilities, accreditations, claims) {
    // Distinct facilities by service type
    const facilitiesWithGeneral = new Set();
    const facilitiesWithSpecialty = new Set();

    accreditations.forEach(a => {
      if (a.services_covered) {
        if (a.services_covered.includes('PSYCH_CONSULT_GEN')) {
          facilitiesWithGeneral.add(a.facility_id);
        }
        if (a.services_covered.includes('PSYCH_CONSULT_SPEC')) {
          facilitiesWithSpecialty.add(a.facility_id);
        }
      }
    });

    // Claims by service type
    const generalClaims = claims.filter(c => c.service_code === 'PSYCH_CONSULT_GEN');
    const specialtyClaims = claims.filter(c => c.service_code === 'PSYCH_CONSULT_SPEC');

    // Financial metrics by service
    const generalFinancials = {
      totalClaims: generalClaims.length,
      totalBilled: generalClaims.reduce((sum, c) => sum + (c.billed_amount || 0), 0),
      totalApproved: generalClaims.reduce((sum, c) => sum + (c.approved_amount || 0), 0),
      totalDisbursed: generalClaims.reduce((sum, c) => sum + (c.disbursed_amount || 0), 0)
    };

    const specialtyFinancials = {
      totalClaims: specialtyClaims.length,
      totalBilled: specialtyClaims.reduce((sum, c) => sum + (c.billed_amount || 0), 0),
      totalApproved: specialtyClaims.reduce((sum, c) => sum + (c.approved_amount || 0), 0),
      totalDisbursed: specialtyClaims.reduce((sum, c) => sum + (c.disbursed_amount || 0), 0)
    };

    return {
      general: {
        accreditedFacilities: facilitiesWithGeneral.size,
        claims: generalClaims.length,
        financial: {
          billed: '₱' + generalFinancials.totalBilled.toLocaleString(),
          approved: '₱' + generalFinancials.totalApproved.toLocaleString(),
          disbursed: '₱' + generalFinancials.totalDisbursed.toLocaleString()
        },
        label: 'General mental health consultation',
        serviceCode: 'PSYCH_CONSULT_GEN'
      },
      specialty: {
        accreditedFacilities: facilitiesWithSpecialty.size,
        claims: specialtyClaims.length,
        financial: {
          billed: '₱' + specialtyFinancials.totalBilled.toLocaleString(),
          approved: '₱' + specialtyFinancials.totalApproved.toLocaleString(),
          disbursed: '₱' + specialtyFinancials.totalDisbursed.toLocaleString()
        },
        label: 'Specialty mental health services',
        serviceCode: 'PSYCH_CONSULT_SPEC'
      },
      overallAccreditation: {
        totalFacilities: new Set([...facilitiesWithGeneral, ...facilitiesWithSpecialty]).size,
        note: 'No double-counting: facilities with both service types counted once'
      }
    };
  }

  /**
   * 5. Regional Comparisons
   * 
   * Calculates indicators by region.
   * Clearly labeled as simulated patterns.
   */
  calculateRegionalMetrics(facilities, accreditations, claims) {
    // Group facilities by region
    const regions = {};
    facilities.forEach(f => {
      if (f.region) {
        if (!regions[f.region]) {
          regions[f.region] = {
            facilities: new Set(),
            accreditedFacilities: new Set(),
            claims: [],
            totalBilled: 0,
            totalApproved: 0,
            totalDisbursed: 0
          };
        }
        regions[f.region].facilities.add(f.facility_id);
      }
    });

    // Add accreditations
    accreditations.forEach(a => {
      const facility = facilities.find(f => f.facility_id === a.facility_id);
      if (facility && facility.region && regions[facility.region]) {
        regions[facility.region].accreditedFacilities.add(a.facility_id);
      }
    });

    // Add claims
    claims.forEach(c => {
      const facility = facilities.find(f => f.facility_id === c.facility_id);
      if (facility && facility.region && regions[facility.region]) {
        regions[facility.region].claims.push(c);
        regions[facility.region].totalBilled += c.billed_amount || 0;
        regions[facility.region].totalApproved += c.approved_amount || 0;
        regions[facility.region].totalDisbursed += c.disbursed_amount || 0;
      }
    });

    // Calculate metrics for each region
    const regionalMetrics = {};
    Object.keys(regions).forEach(region => {
      const data = regions[region];
      const accreditationRate = data.facilities.size > 0
        ? ((data.accreditedFacilities.size / data.facilities.size) * 100).toFixed(1) + '%'
        : 'N/A';

      regionalMetrics[region] = {
        facilities: data.facilities.size,
        accredited: data.accreditedFacilities.size,
        accreditationRate: accreditationRate,
        claims: data.claims.length,
        financial: {
          billed: '₱' + data.totalBilled.toLocaleString(),
          approved: '₱' + data.totalApproved.toLocaleString(),
          disbursed: '₱' + data.totalDisbursed.toLocaleString()
        }
      };
    });

    return {
      byRegion: regionalMetrics,
      disclaimer: 'Simulated regional patterns using synthetic data. Does not represent actual PhilHealth regional performance.',
      limitations: [
        'Does not infer causation from regional differences',
        'Does not infer patient access from facility counts',
        'Does not infer clinical outcomes from claims data',
        'Regional patterns are illustrative for diagnostic purposes only'
      ]
    };
  }

  /**
   * Helper: Calculate median
   */
  calculateMedian(arr) {
    if (arr.length === 0) return null;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }
}

