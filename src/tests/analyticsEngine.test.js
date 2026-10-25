import { describe, it, expect, beforeAll } from 'vitest';
import { AnalyticsEngine } from '../analytics/analyticsEngine.js';
import { DataValidator } from '../validation/dataValidator.js';
import fs from 'fs';
import path from 'path';

/**
 * Analytics Engine Tests
 * 
 * Tests Phase 3 requirements:
 * 1. Facility participation cascade
 * 2. Claims processing cascade
 * 3. Financial calculations
 * 4. Service-specific analysis
 * 5. Regional comparisons
 * 6. Analytical safeguards
 */

describe('Analytics Engine - Phase 3', () => {
  let sampleFacilities, sampleAccreditations, sampleClaims;
  let validationResults, benefitConfig;

  beforeAll(() => {
    // Load sample data
    const dataDir = path.resolve(process.cwd(), 'public/data/moderate_neutral');
    sampleFacilities = JSON.parse(fs.readFileSync(path.join(dataDir, 'facilities.json'), 'utf-8'));
    sampleAccreditations = JSON.parse(fs.readFileSync(path.join(dataDir, 'accreditations.json'), 'utf-8'));
    sampleClaims = JSON.parse(fs.readFileSync(path.join(dataDir, 'claims.json'), 'utf-8'));

    // Load config
    const configDir = path.resolve(process.cwd(), 'public/config');
    benefitConfig = JSON.parse(fs.readFileSync(path.join(configDir, 'benefitConfig.json'), 'utf-8'));

    // Run validation
    const validator = new DataValidator({ eligibility: benefitConfig.eligibility });
    validationResults = validator.validate(sampleFacilities, sampleAccreditations, sampleClaims);
  });

  describe('1. Facility Participation Cascade', () => {
    it('should calculate all four cascade stages', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      expect(results.facilityParticipationCascade).toBeDefined();
      expect(results.facilityParticipationCascade.stage1_eligible).toBeDefined();
      expect(results.facilityParticipationCascade.stage2_accredited).toBeDefined();
      expect(results.facilityParticipationCascade.stage3_claiming).toBeDefined();
      expect(results.facilityParticipationCascade.stage4_receiving_payment).toBeDefined();
    });

    it('should count distinct facilities, not claim counts', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      const cascade = results.facilityParticipationCascade;
      
      // Stage 3 (claiming) should be distinct facilities, not total claims
      expect(cascade.stage3_claiming.count).toBeLessThanOrEqual(cascade.stage2_accredited.count);
      expect(cascade.stage3_claiming.note).toContain('Distinct facilities');
    });

    it('should provide clear numerators and denominators', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      const cascade = results.facilityParticipationCascade;
      
      // Each stage should have numerator and denominator
      expect(cascade.stage2_accredited.numerator).toBeDefined();
      expect(cascade.stage2_accredited.denominator).toBeDefined();
      expect(cascade.stage3_claiming.numerator).toBeDefined();
      expect(cascade.stage3_claiming.denominator).toBeDefined();
      expect(cascade.stage4_receiving_payment.numerator).toBeDefined();
      expect(cascade.stage4_receiving_payment.denominator).toBeDefined();
    });

    it('should not double-count facilities that filed multiple claims', () => {
      const engine = new AnalyticsEngine(validationResults);
      
      // Find facility with multiple claims
      const facilityClaimCounts = {};
      sampleClaims.forEach(c => {
        facilityClaimCounts[c.facility_id] = (facilityClaimCounts[c.facility_id] || 0) + 1;
      });
      
      const facilitiesWithMultipleClaims = Object.keys(facilityClaimCounts).filter(
        fid => facilityClaimCounts[fid] > 1
      );
      
      expect(facilitiesWithMultipleClaims.length).toBeGreaterThan(0); // Confirm test is valid
      
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);
      const claimingCount = results.facilityParticipationCascade.stage3_claiming.count;
      const totalClaims = sampleClaims.length;
      
      // Claiming count should be less than total claims (proving distinct counting)
      expect(claimingCount).toBeLessThan(totalClaims);
    });

    it('should calculate cascade with empty datasets', () => {
      const engine = new AnalyticsEngine({ valid: true, errors: [] });
      const results = engine.analyze(sampleFacilities, [], []);

      expect(results.facilityParticipationCascade.stage2_accredited.count).toBe(0);
      expect(results.facilityParticipationCascade.stage2_accredited.rate).toBe('0.0%');
    });
  });

  describe('2. Claims Processing Cascade', () => {
    it('should calculate all five processing stages', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      expect(results.claimsProcessingCascade).toBeDefined();
      expect(results.claimsProcessingCascade.stage1_submitted).toBeDefined();
      expect(results.claimsProcessingCascade.stage2_accepted).toBeDefined();
      expect(results.claimsProcessingCascade.stage3_adjudicated).toBeDefined();
      expect(results.claimsProcessingCascade.stage4_approved).toBeDefined();
      expect(results.claimsProcessingCascade.stage5_paid).toBeDefined();
    });

    it('should track distinct claim IDs', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      const cascade = results.claimsProcessingCascade;
      
      expect(cascade.stage1_submitted.distinctClaims).toBeDefined();
      expect(cascade.summary.distinctClaims).toBeDefined();
      expect(cascade.summary.distinctClaims).toBe(cascade.stage1_submitted.count); // Should equal total
    });

    it('should distinguish fully paid, partially paid, approved-unpaid, and denied', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      const breakdown = results.claimsProcessingCascade.breakdown;
      
      expect(breakdown.fullyPaid).toBeDefined();
      expect(breakdown.partiallyPaid).toBeDefined();
      expect(breakdown.approvedUnpaid).toBeDefined();
      expect(breakdown.denied).toBeDefined();
      
      // Each should have count and percentage
      expect(breakdown.fullyPaid.count).toBeGreaterThanOrEqual(0);
      expect(breakdown.fullyPaid.percentage).toBeDefined();
    });

    it('should not treat approval as equivalent to payment', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      const cascade = results.claimsProcessingCascade;
      
      // Approved count should include unpaid
      // Paid count should only include actual payments
      expect(cascade.stage4_approved.count).toBeGreaterThanOrEqual(cascade.stage5_paid.count);
      
      // Breakdown should show approved-unpaid separately
      expect(cascade.breakdown.approvedUnpaid.count).toBeGreaterThanOrEqual(0);
    });

    it('should calculate rates as cumulative processing milestones', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      const cascade = results.claimsProcessingCascade;
      
      // Each stage should have a rate relative to previous stage
      expect(cascade.stage2_accepted.rate).toBeDefined();
      expect(cascade.stage3_adjudicated.rate).toBeDefined();
      expect(cascade.stage4_approved.rate).toBeDefined();
      expect(cascade.stage5_paid.rate).toBeDefined();
    });
  });

  describe('3. Financial Calculations', () => {
    it('should calculate all financial metrics', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      const financial = results.financialCalculations;
      
      expect(financial.totalBilled).toBeDefined();
      expect(financial.totalApproved).toBeDefined();
      expect(financial.totalDisbursed).toBeDefined();
      expect(financial.totalOutstanding).toBeDefined();
      expect(financial.approvalToDisbursementRatio).toBeDefined();
      expect(financial.paymentProcessingTime).toBeDefined();
    });

    it('should reconcile financial totals', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      const financial = results.financialCalculations;
      const reconciliation = financial.reconciliation;
      
      expect(reconciliation.reconciles).toBeDefined();
      expect(reconciliation.status).toBe('PASS');
      
      // Outstanding should equal Approved - Disbursed
      const expected = financial.totalApproved.amount - financial.totalDisbursed.amount;
      expect(Math.abs(financial.totalOutstanding.amount - expected)).toBeLessThan(1);
    });

    it('should calculate payment processing time excluding missing dates', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      const processingTime = results.financialCalculations.paymentProcessingTime;
      
      expect(processingTime.average).toBeDefined();
      expect(processingTime.median).toBeDefined();
      expect(processingTime.sampleSize).toBeDefined();
      expect(processingTime.missingDates).toBeDefined();
      
      // Should report missingness
      expect(processingTime.note).toContain('missingness');
    });

    it('should handle zero denominators in financial ratios', () => {
      const engine = new AnalyticsEngine({ valid: true, errors: [] });
      const zeroClaims = sampleClaims.slice(0, 10).map(c => ({
        ...c,
        billed_amount: 0,
        approved_amount: 0,
        disbursed_amount: 0
      }));
      
      const results = engine.analyze(sampleFacilities, sampleAccreditations, zeroClaims);
      const financial = results.financialCalculations;
      
      // Should not crash and should return N/A for undefined ratios
      expect(financial.totalApproved.percentage).toBeDefined();
    });
  });

  describe('4. Service-Specific Analysis', () => {
    it('should calculate separate metrics for general and specialty', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      const serviceAnalysis = results.serviceSpecificAnalysis;
      
      expect(serviceAnalysis.general).toBeDefined();
      expect(serviceAnalysis.specialty).toBeDefined();
      expect(serviceAnalysis.general.accreditedFacilities).toBeDefined();
      expect(serviceAnalysis.specialty.accreditedFacilities).toBeDefined();
    });

    it('should not double-count facilities in overall accreditation', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      const serviceAnalysis = results.serviceSpecificAnalysis;
      
      // Overall should be <= sum of general + specialty
      const sum = serviceAnalysis.general.accreditedFacilities + serviceAnalysis.specialty.accreditedFacilities;
      expect(serviceAnalysis.overallAccreditation.totalFacilities).toBeLessThanOrEqual(sum);
      
      // Should have note about no double-counting
      expect(serviceAnalysis.overallAccreditation.note).toContain('No double-counting');
    });

    it('should provide financial breakdown by service type', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      const serviceAnalysis = results.serviceSpecificAnalysis;
      
      expect(serviceAnalysis.general.financial.billed).toBeDefined();
      expect(serviceAnalysis.general.financial.approved).toBeDefined();
      expect(serviceAnalysis.general.financial.disbursed).toBeDefined();
      
      expect(serviceAnalysis.specialty.financial.billed).toBeDefined();
      expect(serviceAnalysis.specialty.financial.approved).toBeDefined();
      expect(serviceAnalysis.specialty.financial.disbursed).toBeDefined();
    });
  });

  describe('5. Regional Comparisons', () => {
    it('should calculate indicators by region', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      const regional = results.regionalComparisons;
      
      expect(regional.byRegion).toBeDefined();
      expect(Object.keys(regional.byRegion).length).toBeGreaterThan(0);
    });

    it('should label regional patterns as simulated', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      const regional = results.regionalComparisons;
      
      expect(regional.disclaimer).toContain('Simulated');
      expect(regional.disclaimer).toContain('synthetic');
      expect(regional.disclaimer).toContain('Does not represent actual');
    });

    it('should include limitation notes', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      const regional = results.regionalComparisons;
      
      expect(regional.limitations).toBeDefined();
      expect(Array.isArray(regional.limitations)).toBe(true);
      expect(regional.limitations.length).toBeGreaterThan(0);
      
      // Should include key limitations
      const limitationsText = regional.limitations.join(' ');
      expect(limitationsText).toContain('causation');
      expect(limitationsText.toLowerCase()).toContain('patient access');
    });

    it('should calculate accreditation rate per region', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      const regional = results.regionalComparisons.byRegion;
      
      Object.keys(regional).forEach(region => {
        expect(regional[region].facilities).toBeDefined();
        expect(regional[region].accredited).toBeDefined();
        expect(regional[region].accreditationRate).toBeDefined();
      });
    });
  });

  describe('6. Analytical Safeguards', () => {
    it('should never divide by zero', () => {
      const engine = new AnalyticsEngine({ valid: true, errors: [] });
      
      // Test with zero facilities
      const results = engine.analyze([], [], []);
      
      // Should not crash
      expect(results).toBeDefined();
    });

    it('should display undefined rates as N/A', () => {
      const engine = new AnalyticsEngine({ valid: true, errors: [] });
      const results = engine.analyze(sampleFacilities, [], []);

      const cascade = results.facilityParticipationCascade;
      
      // Stage 3 rate should be N/A when no accreditations
      expect(cascade.stage3_claiming.rate).toBe('N/A');
    });

    it('should exclude missing dates from time calculations', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      const processingTime = results.financialCalculations.paymentProcessingTime;
      
      // Should have smaller sample size than total claims
      expect(processingTime.sampleSize).toBeLessThanOrEqual(sampleClaims.length);
      
      // Should report how many were excluded
      expect(processingTime.missingDates).toBeGreaterThanOrEqual(0);
    });

    it('should not run calculations when validator reports blocking errors', () => {
      const errorResults = {
        valid: false,
        errors: [{ severity: 'CRITICAL', code: 'EMPTY_DATASET' }],
        warnings: []
      };
      
      const engine = new AnalyticsEngine(errorResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);
      
      expect(results.error).toBe('VALIDATION_FAILED');
      expect(results.message).toContain('validation errors');
    });

    it('should handle insufficient data gracefully', () => {
      const engine = new AnalyticsEngine({ valid: true, errors: [] });
      const results = engine.analyze(null, null, null);
      
      expect(results.error).toBe('INSUFFICIENT_DATA');
      expect(results.message).toContain('missing required datasets');
    });

    it('should not infer patient access from facility counts', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      const regional = results.regionalComparisons;
      
      // Should have limitation about not inferring patient access
      const limitations = regional.limitations.join(' ');
      expect(limitations.toLowerCase()).toContain('patient access');
    });

    it('should not infer causation from regional differences', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      const regional = results.regionalComparisons;
      
      // Should have limitation about causation
      const limitations = regional.limitations.join(' ');
      expect(limitations.toLowerCase()).toContain('causation');
    });
  });

  describe('Edge Cases and Missing Data', () => {
    it('should handle claims with null approved amounts', () => {
      const engine = new AnalyticsEngine(validationResults);
      const claimsWithNulls = sampleClaims.map((c, i) => 
        i < 5 ? { ...c, approved_amount: null } : c
      );
      
      const results = engine.analyze(sampleFacilities, sampleAccreditations, claimsWithNulls);
      
      // Should not crash
      expect(results.financialCalculations.totalApproved.amount).toBeGreaterThanOrEqual(0);
    });

    it('should handle facilities with no region', () => {
      const engine = new AnalyticsEngine(validationResults);
      const facilitiesNoRegion = sampleFacilities.map((f, i) => 
        i < 5 ? { ...f, region: null } : f
      );
      
      const results = engine.analyze(facilitiesNoRegion, sampleAccreditations, sampleClaims);
      
      // Should not crash
      expect(results.regionalComparisons.byRegion).toBeDefined();
    });

    it('should handle claims without payment dates', () => {
      const engine = new AnalyticsEngine(validationResults);
      const claimsNoPaymentDate = sampleClaims.map((c, i) => 
        i < 10 ? { ...c, payment_date: null } : c
      );
      
      const results = engine.analyze(sampleFacilities, sampleAccreditations, claimsNoPaymentDate);
      
      // Processing time should exclude these
      expect(results.financialCalculations.paymentProcessingTime.missingDates).toBeGreaterThan(0);
    });
  });

  describe('Metadata and Disclaimers', () => {
    it('should include metadata with timestamp', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      expect(results.metadata).toBeDefined();
      expect(results.metadata.timestamp).toBeDefined();
      expect(new Date(results.metadata.timestamp)).toBeInstanceOf(Date);
    });

    it('should include synthetic data disclaimer', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      expect(results.metadata.disclaimer).toContain('synthetic');
      expect(results.metadata.disclaimer).toContain('diagnostic purposes');
      expect(results.metadata.disclaimer).toContain('Does not represent actual');
    });

    it('should report validation status in metadata', () => {
      const engine = new AnalyticsEngine(validationResults);
      const results = engine.analyze(sampleFacilities, sampleAccreditations, sampleClaims);

      expect(results.metadata.validation).toBeDefined();
      expect(results.metadata.validation.hasErrors).toBeDefined();
      expect(results.metadata.validation.errors).toBeDefined();
      expect(results.metadata.validation.warnings).toBeDefined();
    });
  });
});
