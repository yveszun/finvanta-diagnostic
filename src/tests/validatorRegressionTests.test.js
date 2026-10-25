import { describe, it, expect, beforeAll } from 'vitest';
import { DataValidator } from '../validation/dataValidator.js';
import fs from 'fs';
import path from 'path';

/**
 * Regression Tests - Independent Review Findings
 * 
 * These tests reproduce the issues identified in the independent audit:
 * 1. Empty datasets
 * 2. Zero denominators
 * 3. Unknown claim statuses
 * 4. Missing required fields
 * 5. Multiple accreditation records for one facility
 * 6. General and specialty accreditation counting
 * 7. Configurable eligibility restrictions
 */

describe('Validator Regression Tests - Independent Review Findings', () => {
  let sampleFacilities, sampleAccreditations, sampleClaims;
  let eligibilityConfig;

  beforeAll(() => {
    // Load sample data
    const dataDir = path.resolve(process.cwd(), 'public/data/moderate_neutral');
    sampleFacilities = JSON.parse(fs.readFileSync(path.join(dataDir, 'facilities.json'), 'utf-8'));
    sampleAccreditations = JSON.parse(fs.readFileSync(path.join(dataDir, 'accreditations.json'), 'utf-8'));
    sampleClaims = JSON.parse(fs.readFileSync(path.join(dataDir, 'claims.json'), 'utf-8'));

    // Load eligibility config
    const configDir = path.resolve(process.cwd(), 'public/config');
    const benefitConfig = JSON.parse(fs.readFileSync(path.join(configDir, 'benefitConfig.json'), 'utf-8'));
    eligibilityConfig = benefitConfig.eligibility;
  });

  describe('1. Empty Dataset Handling', () => {
    it('should reject completely empty dataset', () => {
      const validator = new DataValidator();
      const results = validator.validate([], [], []);
      
      expect(results.valid).toBe(false);
      expect(results.errors.some(e => e.code === 'EMPTY_DATASET')).toBe(true);
      expect(results.errors.find(e => e.code === 'EMPTY_DATASET').severity).toBe('CRITICAL');
    });

    it('should reject empty facilities', () => {
      const validator = new DataValidator();
      const results = validator.validate([], sampleAccreditations, sampleClaims);
      
      expect(results.valid).toBe(false);
      expect(results.errors.some(e => e.code === 'EMPTY_FACILITIES')).toBe(true);
    });

    it('should warn on no accreditations (may be valid scenario)', () => {
      const validator = new DataValidator();
      const results = validator.validate(sampleFacilities, [], sampleClaims);
      
      // Should have warning, not error
      expect(results.warnings.some(w => w.code === 'NO_ACCREDITATIONS')).toBe(true);
      expect(results.warnings.find(w => w.code === 'NO_ACCREDITATIONS').severity).toBe('WARNING');
    });

    it('should warn on no claims (may be valid scenario)', () => {
      const validator = new DataValidator();
      const results = validator.validate(sampleFacilities, sampleAccreditations, []);
      
      // Should have warning, not error
      expect(results.warnings.some(w => w.code === 'NO_CLAIMS')).toBe(true);
      expect(results.warnings.find(w => w.code === 'NO_CLAIMS').severity).toBe('WARNING');
    });
  });

  describe('2. Zero Denominators and N/A Rates', () => {
    it('should return N/A for accreditation rate with zero facilities', () => {
      const validator = new DataValidator();
      const results = validator.validate([], [], []);
      
      expect(results.summary.facilities.accreditationRate).toBe('N/A');
    });

    it('should handle null approval rate when total billed is zero', () => {
      const validator = new DataValidator();
      const zeroBilledClaims = sampleClaims.slice(0, 10).map(c => ({
        ...c,
        billed_amount: 0,
        approved_amount: 0,
        disbursed_amount: 0
      }));
      
      const results = validator.validate(sampleFacilities, sampleAccreditations, zeroBilledClaims);
      
      // Should be null, not NaN
      expect(results.summary.financial.approvalRate).toBeNull();
    });

    it('should handle null disbursement rate when total approved is zero', () => {
      const validator = new DataValidator();
      const zeroApprovedClaims = sampleClaims.slice(0, 10).map(c => ({
        ...c,
        billed_amount: c.billed_amount,
        approved_amount: null,
        disbursed_amount: null,
        status: 'denied'
      }));
      
      const results = validator.validate(sampleFacilities, sampleAccreditations, zeroApprovedClaims);
      
      // Should be null, not NaN
      expect(results.summary.financial.disbursementRate).toBeNull();
    });
  });

  describe('3. Unknown Claim Statuses', () => {
    it('should detect invalid claim status', () => {
      const validator = new DataValidator();
      const invalidClaims = [...sampleClaims.slice(0, 10)];
      invalidClaims[0] = {
        ...invalidClaims[0],
        status: 'INVALID_STATUS'
      };
      
      const results = validator.validate(sampleFacilities, sampleAccreditations, invalidClaims);
      
      expect(results.valid).toBe(false);
      expect(results.errors.some(e => e.code === 'INVALID_CLAIM_STATUS')).toBe(true);
      expect(results.errors.find(e => e.code === 'INVALID_CLAIM_STATUS').severity).toBe('CRITICAL');
    });

    it('should detect invalid payment status', () => {
      const validator = new DataValidator();
      const invalidClaims = [...sampleClaims.slice(0, 10)];
      invalidClaims[0] = {
        ...invalidClaims[0],
        payment_status: 'INVALID_PAYMENT_STATUS'
      };
      
      const results = validator.validate(sampleFacilities, sampleAccreditations, invalidClaims);
      
      expect(results.valid).toBe(false);
      expect(results.errors.some(e => e.code === 'INVALID_PAYMENT_STATUS')).toBe(true);
    });

    it('should list permitted claim statuses in error message', () => {
      const validator = new DataValidator();
      const invalidClaims = [...sampleClaims.slice(0, 10)];
      invalidClaims[0] = {
        ...invalidClaims[0],
        status: 'UNKNOWN'
      };
      
      const results = validator.validate(sampleFacilities, sampleAccreditations, invalidClaims);
      
      const error = results.errors.find(e => e.code === 'INVALID_CLAIM_STATUS');
      expect(error.message).toContain('submitted');
      expect(error.message).toContain('paid');
      expect(error.message).toContain('denied');
    });
  });

  describe('4. Missing Required Fields', () => {
    it('should detect facility with missing facility_id', () => {
      const validator = new DataValidator();
      const invalidFacilities = [...sampleFacilities.slice(0, 10)];
      invalidFacilities[0] = {
        ...invalidFacilities[0],
        facility_id: null
      };
      
      const results = validator.validate(invalidFacilities, sampleAccreditations, sampleClaims);
      
      expect(results.valid).toBe(false);
      expect(results.errors.some(e => e.code === 'FACILITIES_MISSING_REQUIRED_FIELDS')).toBe(true);
      expect(results.errors.find(e => e.code === 'FACILITIES_MISSING_REQUIRED_FIELDS').severity).toBe('CRITICAL');
    });

    it('should detect facility with missing facility_name', () => {
      const validator = new DataValidator();
      const invalidFacilities = [...sampleFacilities.slice(0, 10)];
      invalidFacilities[0] = {
        ...invalidFacilities[0],
        facility_name: ''
      };
      
      const results = validator.validate(invalidFacilities, sampleAccreditations, sampleClaims);
      
      expect(results.valid).toBe(false);
      expect(results.errors.some(e => e.code === 'FACILITIES_MISSING_REQUIRED_FIELDS')).toBe(true);
    });

    it('should detect accreditation with missing services_covered', () => {
      const validator = new DataValidator();
      const invalidAccreditations = [...sampleAccreditations.slice(0, 10)];
      invalidAccreditations[0] = {
        ...invalidAccreditations[0],
        services_covered: []
      };
      
      const results = validator.validate(sampleFacilities, invalidAccreditations, sampleClaims);
      
      expect(results.valid).toBe(false);
      expect(results.errors.some(e => e.code === 'ACCREDITATIONS_MISSING_REQUIRED_FIELDS')).toBe(true);
    });

    it('should detect claim with missing service_code', () => {
      const validator = new DataValidator();
      const invalidClaims = [...sampleClaims.slice(0, 10)];
      invalidClaims[0] = {
        ...invalidClaims[0],
        service_code: null
      };
      
      const results = validator.validate(sampleFacilities, sampleAccreditations, invalidClaims);
      
      expect(results.valid).toBe(false);
      expect(results.errors.some(e => e.code === 'CLAIMS_MISSING_REQUIRED_FIELDS')).toBe(true);
    });

    it('should detect claim with missing service_date', () => {
      const validator = new DataValidator();
      const invalidClaims = [...sampleClaims.slice(0, 10)];
      invalidClaims[0] = {
        ...invalidClaims[0],
        service_date: undefined
      };
      
      const results = validator.validate(sampleFacilities, sampleAccreditations, invalidClaims);
      
      expect(results.valid).toBe(false);
      expect(results.errors.some(e => e.code === 'CLAIMS_MISSING_REQUIRED_FIELDS')).toBe(true);
    });

    it('should list missing fields in error details', () => {
      const validator = new DataValidator();
      const invalidClaims = [...sampleClaims.slice(0, 10)];
      invalidClaims[0] = {
        ...invalidClaims[0],
        service_code: null,
        service_date: null
      };
      
      const results = validator.validate(sampleFacilities, sampleAccreditations, invalidClaims);
      
      const error = results.errors.find(e => e.code === 'CLAIMS_MISSING_REQUIRED_FIELDS');
      expect(error.details[0].missing_fields).toContain('service_code');
      expect(error.details[0].missing_fields).toContain('service_date');
    });
  });

  describe('5. Multiple Accreditation Records for One Facility', () => {
    it('should count distinct facilities, not accreditation records', () => {
      const validator = new DataValidator();
      
      // Create multiple accreditation records for the same facility
      const duplicateAccred = [...sampleAccreditations.slice(0, 5)];
      const facilityId = duplicateAccred[0].facility_id;
      duplicateAccred.push({
        ...duplicateAccred[0],
        accreditation_id: 'ACC_DUPLICATE_001',
        accreditation_date: '2025-02-01',
        services_covered: ['PSYCH_CONSULT_SPEC']
      });
      
      const results = validator.validate(sampleFacilities, duplicateAccred, sampleClaims);
      
      // Should count 5 distinct facilities, not 6 accreditation records
      expect(results.summary.facilities.accredited).toBe(5);
    });

    it('should count facilities with general and specialty separately', () => {
      const validator = new DataValidator();
      
      // Create test data with 3 facilities:
      // - Facility 1: General only
      // - Facility 2: Specialty only  
      // - Facility 3: Both (via 2 accreditation records)
      const testFacilities = sampleFacilities.slice(0, 3);
      const testAccreditations = [
        { ...sampleAccreditations[0], facility_id: testFacilities[0].facility_id, services_covered: ['PSYCH_CONSULT_GEN'] },
        { ...sampleAccreditations[1], facility_id: testFacilities[1].facility_id, services_covered: ['PSYCH_CONSULT_SPEC'] },
        { ...sampleAccreditations[2], facility_id: testFacilities[2].facility_id, services_covered: ['PSYCH_CONSULT_GEN'] },
        { 
          ...sampleAccreditations[3], 
          accreditation_id: 'ACC_ADDITIONAL', 
          facility_id: testFacilities[2].facility_id, 
          services_covered: ['PSYCH_CONSULT_SPEC'] 
        }
      ];
      
      const results = validator.validate(testFacilities, testAccreditations, []);
      
      // 2 facilities with general (facility 1 and 3)
      expect(results.summary.facilities.withGeneralAccreditation).toBe(2);
      // 2 facilities with specialty (facility 2 and 3)
      expect(results.summary.facilities.withSpecialtyAccreditation).toBe(2);
      // 3 total accredited facilities
      expect(results.summary.facilities.accredited).toBe(3);
    });
  });

  describe('6. General and Specialty Accreditation Counting', () => {
    it('should not double-count facilities with both general and specialty', () => {
      const validator = new DataValidator();
      
      const testFacilities = sampleFacilities.slice(0, 5);
      const testAccreditations = [
        { ...sampleAccreditations[0], facility_id: testFacilities[0].facility_id, services_covered: ['PSYCH_CONSULT_GEN'] },
        { ...sampleAccreditations[1], facility_id: testFacilities[1].facility_id, services_covered: ['PSYCH_CONSULT_GEN', 'PSYCH_CONSULT_SPEC'] },
        { ...sampleAccreditations[2], facility_id: testFacilities[2].facility_id, services_covered: ['PSYCH_CONSULT_SPEC'] }
      ];
      
      const results = validator.validate(testFacilities, testAccreditations, []);
      
      // 2 with general (facility 0 and 1)
      expect(results.summary.facilities.withGeneralAccreditation).toBe(2);
      // 2 with specialty (facility 1 and 2)
      expect(results.summary.facilities.withSpecialtyAccreditation).toBe(2);
      // Only 3 distinct facilities accredited
      expect(results.summary.facilities.accredited).toBe(3);
    });

    it('should handle facility with only specialty accreditation', () => {
      const validator = new DataValidator();
      
      const testFacilities = sampleFacilities.slice(0, 1);
      const testAccreditations = [
        { ...sampleAccreditations[0], facility_id: testFacilities[0].facility_id, services_covered: ['PSYCH_CONSULT_SPEC'] }
      ];
      
      const results = validator.validate(testFacilities, testAccreditations, []);
      
      expect(results.summary.facilities.withGeneralAccreditation).toBe(0);
      expect(results.summary.facilities.withSpecialtyAccreditation).toBe(1);
      expect(results.summary.facilities.accredited).toBe(1);
    });
  });

  describe('7. Configurable Eligibility Restrictions', () => {
    it('should use config-driven specialty eligibility validation', () => {
      const validator = new DataValidator({ eligibility: eligibilityConfig });
      
      // Create a Level 1 facility with specialty claim
      const level1Facility = sampleFacilities.find(f => f.facility_level === 1);
      if (!level1Facility) return; // Skip if no Level 1 facilities in sample
      
      const testClaim = {
        ...sampleClaims[0],
        facility_id: level1Facility.facility_id,
        service_code: 'PSYCH_CONSULT_SPEC'
      };
      
      const results = validator.validate(
        sampleFacilities, 
        sampleAccreditations, 
        [testClaim]
      );
      
      expect(results.valid).toBe(false);
      expect(results.errors.some(e => e.code === 'SPECIALTY_ELIGIBILITY_VIOLATION')).toBe(true);
    });

    it('should include illustrative assumption label in eligibility error', () => {
      const validator = new DataValidator({ eligibility: eligibilityConfig });
      
      const level1Facility = sampleFacilities.find(f => f.facility_level === 1);
      if (!level1Facility) return;
      
      const testClaim = {
        ...sampleClaims[0],
        facility_id: level1Facility.facility_id,
        service_code: 'PSYCH_CONSULT_SPEC'
      };
      
      const results = validator.validate(
        sampleFacilities, 
        sampleAccreditations, 
        [testClaim]
      );
      
      const error = results.errors.find(e => e.code === 'SPECIALTY_ELIGIBILITY_VIOLATION');
      expect(error.message).toContain('illustrative');
      expect(error.message).toContain('PhilHealth verification');
    });

    it('should validate facility type eligibility from config', () => {
      const validator = new DataValidator({ eligibility: eligibilityConfig });
      
      // According to config, only Hospitals are eligible for specialty
      const nonHospitalFacility = sampleFacilities.find(f => f.facility_type !== 'Hospital');
      if (!nonHospitalFacility) return;
      
      const testClaim = {
        ...sampleClaims[0],
        facility_id: nonHospitalFacility.facility_id,
        service_code: 'PSYCH_CONSULT_SPEC'
      };
      
      const results = validator.validate(
        sampleFacilities, 
        sampleAccreditations, 
        [testClaim]
      );
      
      if (results.errors.some(e => e.code === 'SPECIALTY_ELIGIBILITY_VIOLATION')) {
        const error = results.errors.find(e => e.code === 'SPECIALTY_ELIGIBILITY_VIOLATION');
        expect(error.details[0].facility_type).toBe(nonHospitalFacility.facility_type);
      }
    });

    it('should fall back to hardcoded check with label when config not provided', () => {
      const validator = new DataValidator(); // No config
      
      const level1Facility = sampleFacilities.find(f => f.facility_level === 1);
      if (!level1Facility) return;
      
      const testClaim = {
        ...sampleClaims[0],
        facility_id: level1Facility.facility_id,
        service_code: 'PSYCH_CONSULT_SPEC'
      };
      
      const results = validator.validate(
        sampleFacilities, 
        sampleAccreditations, 
        [testClaim]
      );
      
      // Should still detect violation with fallback check
      expect(results.errors.some(e => 
        e.code === 'LEVEL1_SPECIALTY_VIOLATION' || 
        e.code === 'SPECIALTY_ELIGIBILITY_VIOLATION'
      )).toBe(true);
      
      // Should include illustrative label
      const error = results.errors.find(e => 
        e.code === 'LEVEL1_SPECIALTY_VIOLATION' || 
        e.code === 'SPECIALTY_ELIGIBILITY_VIOLATION'
      );
      expect(error.message.toLowerCase()).toContain('illustrative');
    });
  });

  describe('Comprehensive Empty Dataset Scenarios', () => {
    it('should handle null facilities array', () => {
      const validator = new DataValidator();
      const results = validator.validate(null, sampleAccreditations, sampleClaims);
      
      expect(results.valid).toBe(false);
      expect(results.errors.some(e => e.code === 'EMPTY_FACILITIES')).toBe(true);
    });

    it('should handle undefined claims array', () => {
      const validator = new DataValidator();
      const results = validator.validate(sampleFacilities, sampleAccreditations, undefined);
      
      expect(results.warnings.some(w => w.code === 'NO_CLAIMS')).toBe(true);
    });

    it('should handle all null arrays', () => {
      const validator = new DataValidator();
      const results = validator.validate(null, null, null);
      
      expect(results.valid).toBe(false);
      expect(results.errors.some(e => e.code === 'EMPTY_DATASET')).toBe(true);
      expect(results.summary.facilities.accreditationRate).toBe('N/A');
    });
  });
});
