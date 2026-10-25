/**
 * Phase 3 V3.2 - Cutoff Enforcement Validation Tests
 * 
 * Deliberately corrupted test cases to verify that each blocking
 * validation issue is correctly detected.
 */

import { describe, it, expect } from 'vitest';
import { DataValidator } from '../validation/dataValidator.js';

describe('Cutoff Enforcement Validation Tests', () => {
  const validator = new DataValidator();

  describe('Missing Cutoff Date', () => {
    it('should detect claims without analysis_cutoff_date', () => {
      const facilities = [{ facility_id: 'FAC001', facility_name: 'Test Facility' }];
      const accreditations = [];
      const claims = [
        {
          claim_id: 'CLM001',
          facility_id: 'FAC001',
          status: 'paid',
          submission_date: '2025-06-01',
          acceptance_date: '2025-06-02',
          adjudication_date: '2025-06-10',
          approval_date: '2025-06-10',
          payment_date: '2025-06-20'
          // Missing analysis_cutoff_date
        }
      ];

      const results = validator.validate(facilities, accreditations, claims);
      
      expect(results.valid).toBe(false);
      expect(results.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'TEMPORAL_VALIDATION_BLOCKING',
            severity: 'CRITICAL'
          })
        ])
      );
      
      const blockingError = results.errors.find(e => e.code === 'TEMPORAL_VALIDATION_BLOCKING');
      expect(blockingError.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            claim_id: 'CLM001',
            issue: 'missing_cutoff_date',
            severity: 'BLOCKING'
          })
        ])
      );
    });
  });

  describe('Inconsistent Cutoff Dates', () => {
    it('should detect multiple different cutoff dates', () => {
      const facilities = [{ facility_id: 'FAC001', facility_name: 'Test Facility' }];
      const accreditations = [];
      const claims = [
        {
          claim_id: 'CLM001',
          facility_id: 'FAC001',
          status: 'paid',
          submission_date: '2025-06-01',
          analysis_cutoff_date: '2025-07-15T23:59:59.000Z'
        },
        {
          claim_id: 'CLM002',
          facility_id: 'FAC001',
          status: 'paid',
          submission_date: '2025-06-02',
          analysis_cutoff_date: '2025-08-15T00:00:00.000Z' // Different cutoff
        }
      ];

      const results = validator.validate(facilities, accreditations, claims);
      
      expect(results.valid).toBe(false);
      const blockingError = results.errors.find(e => e.code === 'TEMPORAL_VALIDATION_BLOCKING');
      expect(blockingError.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            claim_id: 'CLM002',
            issue: 'inconsistent_cutoff_date',
            severity: 'BLOCKING'
          })
        ])
      );
    });
  });

  describe('Events After Cutoff', () => {
    it('should detect submission after cutoff', () => {
      const facilities = [{ facility_id: 'FAC001', facility_name: 'Test Facility' }];
      const accreditations = [];
      const claims = [
        {
          claim_id: 'CLM001',
          facility_id: 'FAC001',
          status: 'paid',
          submission_date: '2025-07-20', // After cutoff
          analysis_cutoff_date: '2025-07-15T23:59:59.000Z'
        }
      ];

      const results = validator.validate(facilities, accreditations, claims);
      
      expect(results.valid).toBe(false);
      const blockingError = results.errors.find(e => e.code === 'TEMPORAL_VALIDATION_BLOCKING');
      expect(blockingError.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            claim_id: 'CLM001',
            issue: 'submission_after_cutoff',
            severity: 'BLOCKING'
          })
        ])
      );
    });

    it('should detect acceptance after cutoff', () => {
      const facilities = [{ facility_id: 'FAC001', facility_name: 'Test Facility' }];
      const accreditations = [];
      const claims = [
        {
          claim_id: 'CLM001',
          facility_id: 'FAC001',
          status: 'paid',
          submission_date: '2025-06-01',
          acceptance_date: '2025-07-20', // After cutoff
          analysis_cutoff_date: '2025-07-15T23:59:59.000Z'
        }
      ];

      const results = validator.validate(facilities, accreditations, claims);
      
      expect(results.valid).toBe(false);
      const blockingError = results.errors.find(e => e.code === 'TEMPORAL_VALIDATION_BLOCKING');
      expect(blockingError.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            claim_id: 'CLM001',
            issue: 'acceptance_after_cutoff',
            severity: 'BLOCKING'
          })
        ])
      );
    });

    it('should detect adjudication after cutoff', () => {
      const facilities = [{ facility_id: 'FAC001', facility_name: 'Test Facility' }];
      const accreditations = [];
      const claims = [
        {
          claim_id: 'CLM001',
          facility_id: 'FAC001',
          status: 'approved',
          submission_date: '2025-06-01',
          acceptance_date: '2025-06-02',
          adjudication_date: '2025-07-20', // After cutoff
          approval_date: '2025-07-20',
          analysis_cutoff_date: '2025-07-15T23:59:59.000Z'
        }
      ];

      const results = validator.validate(facilities, accreditations, claims);
      
      expect(results.valid).toBe(false);
      const blockingError = results.errors.find(e => e.code === 'TEMPORAL_VALIDATION_BLOCKING');
      expect(blockingError.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            claim_id: 'CLM001',
            issue: 'adjudication_after_cutoff',
            severity: 'BLOCKING'
          })
        ])
      );
    });

    it('should detect approval after cutoff', () => {
      const facilities = [{ facility_id: 'FAC001', facility_name: 'Test Facility' }];
      const accreditations = [];
      const claims = [
        {
          claim_id: 'CLM001',
          facility_id: 'FAC001',
          status: 'approved',
          submission_date: '2025-06-01',
          acceptance_date: '2025-06-02',
          adjudication_date: '2025-06-10',
          approval_date: '2025-07-20', // After cutoff
          analysis_cutoff_date: '2025-07-15T23:59:59.000Z'
        }
      ];

      const results = validator.validate(facilities, accreditations, claims);
      
      expect(results.valid).toBe(false);
      const blockingError = results.errors.find(e => e.code === 'TEMPORAL_VALIDATION_BLOCKING');
      expect(blockingError.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            claim_id: 'CLM001',
            issue: 'approval_after_cutoff',
            severity: 'BLOCKING'
          })
        ])
      );
    });

    it('should detect payment after cutoff', () => {
      const facilities = [{ facility_id: 'FAC001', facility_name: 'Test Facility' }];
      const accreditations = [];
      const claims = [
        {
          claim_id: 'CLM001',
          facility_id: 'FAC001',
          status: 'paid',
          submission_date: '2025-06-01',
          acceptance_date: '2025-06-02',
          adjudication_date: '2025-06-10',
          approval_date: '2025-06-10',
          payment_date: '2025-07-20', // After cutoff
          analysis_cutoff_date: '2025-07-15T23:59:59.000Z'
        }
      ];

      const results = validator.validate(facilities, accreditations, claims);
      
      expect(results.valid).toBe(false);
      const blockingError = results.errors.find(e => e.code === 'TEMPORAL_VALIDATION_BLOCKING');
      expect(blockingError.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            claim_id: 'CLM001',
            issue: 'payment_after_cutoff',
            severity: 'BLOCKING'
          })
        ])
      );
    });
  });

  describe('Chronology Violations', () => {
    it('should detect acceptance before submission', () => {
      const facilities = [{ facility_id: 'FAC001', facility_name: 'Test Facility' }];
      const accreditations = [];
      const claims = [
        {
          claim_id: 'CLM001',
          facility_id: 'FAC001',
          status: 'paid',
          submission_date: '2025-06-10',
          acceptance_date: '2025-06-05', // Before submission
          analysis_cutoff_date: '2025-07-15T23:59:59.000Z'
        }
      ];

      const results = validator.validate(facilities, accreditations, claims);
      
      expect(results.valid).toBe(false);
      const blockingError = results.errors.find(e => e.code === 'TEMPORAL_VALIDATION_BLOCKING');
      expect(blockingError.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            claim_id: 'CLM001',
            issue: 'acceptance_before_submission',
            severity: 'BLOCKING'
          })
        ])
      );
    });

    it('should detect adjudication before acceptance', () => {
      const facilities = [{ facility_id: 'FAC001', facility_name: 'Test Facility' }];
      const accreditations = [];
      const claims = [
        {
          claim_id: 'CLM001',
          facility_id: 'FAC001',
          status: 'approved',
          submission_date: '2025-06-01',
          acceptance_date: '2025-06-10',
          adjudication_date: '2025-06-05', // Before acceptance
          approval_date: '2025-06-05',
          analysis_cutoff_date: '2025-07-15T23:59:59.000Z'
        }
      ];

      const results = validator.validate(facilities, accreditations, claims);
      
      expect(results.valid).toBe(false);
      const blockingError = results.errors.find(e => e.code === 'TEMPORAL_VALIDATION_BLOCKING');
      expect(blockingError.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            claim_id: 'CLM001',
            issue: 'adjudication_before_acceptance',
            severity: 'BLOCKING'
          })
        ])
      );
    });

    it('should detect approval before adjudication', () => {
      const facilities = [{ facility_id: 'FAC001', facility_name: 'Test Facility' }];
      const accreditations = [];
      const claims = [
        {
          claim_id: 'CLM001',
          facility_id: 'FAC001',
          status: 'approved',
          submission_date: '2025-06-01',
          acceptance_date: '2025-06-02',
          adjudication_date: '2025-06-10',
          approval_date: '2025-06-05', // Before adjudication
          analysis_cutoff_date: '2025-07-15T23:59:59.000Z'
        }
      ];

      const results = validator.validate(facilities, accreditations, claims);
      
      expect(results.valid).toBe(false);
      const blockingError = results.errors.find(e => e.code === 'TEMPORAL_VALIDATION_BLOCKING');
      expect(blockingError.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            claim_id: 'CLM001',
            issue: 'approval_before_adjudication',
            severity: 'BLOCKING'
          })
        ])
      );
    });

    it('should detect payment before approval', () => {
      const facilities = [{ facility_id: 'FAC001', facility_name: 'Test Facility' }];
      const accreditations = [];
      const claims = [
        {
          claim_id: 'CLM001',
          facility_id: 'FAC001',
          status: 'paid',
          submission_date: '2025-06-01',
          acceptance_date: '2025-06-02',
          adjudication_date: '2025-06-10',
          approval_date: '2025-06-15',
          payment_date: '2025-06-12', // Before approval
          analysis_cutoff_date: '2025-07-15T23:59:59.000Z'
        }
      ];

      const results = validator.validate(facilities, accreditations, claims);
      
      expect(results.valid).toBe(false);
      const blockingError = results.errors.find(e => e.code === 'TEMPORAL_VALIDATION_BLOCKING');
      expect(blockingError.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            claim_id: 'CLM001',
            issue: 'payment_before_approval',
            severity: 'BLOCKING'
          })
        ])
      );
    });
  });

  describe('Negative Temporal Fields', () => {
    it('should detect negative days_pending', () => {
      const facilities = [{ facility_id: 'FAC001', facility_name: 'Test Facility' }];
      const accreditations = [];
      const claims = [
        {
          claim_id: 'CLM001',
          facility_id: 'FAC001',
          status: 'pending_acceptance',
          submission_date: '2025-06-01',
          days_pending: -5, // Negative
          analysis_cutoff_date: '2025-07-15T23:59:59.000Z'
        }
      ];

      const results = validator.validate(facilities, accreditations, claims);
      
      expect(results.valid).toBe(false);
      const blockingError = results.errors.find(e => e.code === 'TEMPORAL_VALIDATION_BLOCKING');
      expect(blockingError.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            claim_id: 'CLM001',
            issue: 'negative_days_pending',
            severity: 'BLOCKING'
          })
        ])
      );
    });

    it('should detect negative days_since_approval', () => {
      const facilities = [{ facility_id: 'FAC001', facility_name: 'Test Facility' }];
      const accreditations = [];
      const claims = [
        {
          claim_id: 'CLM001',
          facility_id: 'FAC001',
          status: 'approved',
          submission_date: '2025-06-01',
          acceptance_date: '2025-06-02',
          adjudication_date: '2025-06-10',
          approval_date: '2025-08-01', // After cutoff - should trigger negative calc
          days_since_approval: -10,
          analysis_cutoff_date: '2025-07-15T23:59:59.000Z'
        }
      ];

      const results = validator.validate(facilities, accreditations, claims);
      
      expect(results.valid).toBe(false);
      // Should have BLOCKING error (either negative days or approval after cutoff)
      const blockingError = results.errors.find(e => e.code === 'TEMPORAL_VALIDATION_BLOCKING');
      expect(blockingError).toBeDefined();
    });
  });

  describe('Valid Claims', () => {
    it('should pass validation for correctly structured claims', () => {
      const facilities = [{ 
        facility_id: 'FAC001', 
        facility_name: 'Test Facility',
        facility_type: 'hospital',
        facility_level: 2,
        region: 'NCR',
        province: 'Metro Manila'
      }];
      const accreditations = [{
        accreditation_id: 'ACC001',
        facility_id: 'FAC001',
        accreditation_date: '2025-01-15',
        services_covered: ['PSYCH_CONSULT_GEN'],
        status: 'active'
      }];
      const claims = [
        {
          claim_id: 'CLM001',
          facility_id: 'FAC001',
          patient_id: 'PAT001',
          status: 'paid',
          service_date: '2025-06-01',
          service_type: 'general',
          service_code: 'PSYCH_CONSULT_GEN',
          billed_amount: 10000,
          submission_date: '2025-06-01',
          acceptance_date: '2025-06-02',
          adjudication_date: '2025-06-10',
          approval_date: '2025-06-10',
          approved_amount: 8500,
          payment_date: '2025-06-20',
          disbursed_amount: 8500,
          outstanding_balance: 0,
          payment_status: 'paid_full',
          denial_reason: null,
          days_since_approval: null,
          analysis_cutoff_date: '2025-07-15T23:59:59.000Z'
        },
        {
          claim_id: 'CLM002',
          facility_id: 'FAC001',
          patient_id: 'PAT002',
          status: 'pending_acceptance',
          service_date: '2025-06-15',
          service_type: 'general',
          service_code: 'PSYCH_CONSULT_GEN',
          billed_amount: 10000,
          submission_date: '2025-06-15',
          acceptance_date: null,
          adjudication_date: null,
          approval_date: null,
          approved_amount: null,
          payment_date: null,
          disbursed_amount: null,
          outstanding_balance: null,
          payment_status: 'not_applicable',
          denial_reason: null,
          days_pending: 30,
          days_since_approval: null,
          analysis_cutoff_date: '2025-07-15T23:59:59.000Z'
        }
      ];

      const results = validator.validate(facilities, accreditations, claims);
      
      expect(results.valid).toBe(true);
      expect(results.errors).toHaveLength(0);
    });
  });
});
