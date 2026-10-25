import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Chronology Validation', () => {
  const scenarios = ['low_neutral', 'moderate_neutral', 'high_neutral'];
  const dataByScenario = {};

  beforeAll(() => {
    scenarios.forEach(scenario => {
      const dataDir = path.resolve(process.cwd(), `public/data/${scenario}`);
      dataByScenario[scenario] = {
        facilities: JSON.parse(fs.readFileSync(path.join(dataDir, 'facilities.json'), 'utf-8')),
        accreditations: JSON.parse(fs.readFileSync(path.join(dataDir, 'accreditations.json'), 'utf-8')),
        claims: JSON.parse(fs.readFileSync(path.join(dataDir, 'claims.json'), 'utf-8'))
      };
    });
  });

  describe('Service Date After Accreditation', () => {
    scenarios.forEach(scenario => {
      it(`${scenario}: all service dates should be on or after facility accreditation date`, () => {
        const { accreditations, claims } = dataByScenario[scenario];
        
        // Build accreditation date map
        const accredDateMap = {};
        accreditations.forEach(a => {
          accredDateMap[a.facility_id] = a.accreditation_date;
        });
        
        // Check each claim
        const violations = [];
        claims.forEach(claim => {
          const accredDate = accredDateMap[claim.facility_id];
          if (accredDate && claim.service_date < accredDate) {
            violations.push({
              claim_id: claim.claim_id,
              service_date: claim.service_date,
              accred_date: accredDate
            });
          }
        });
        
        expect(
          violations,
          `Found ${violations.length} claims with service date before accreditation:\n${violations.slice(0, 5).map(v => `  ${v.claim_id}: service ${v.service_date} < accred ${v.accred_date}`).join('\n')}`
        ).toHaveLength(0);
      });
    });
  });

  describe('Service-Specific Accreditation Compliance', () => {
    scenarios.forEach(scenario => {
      it(`${scenario}: claims should only be for services covered by facility accreditation`, () => {
        const { accreditations, claims } = dataByScenario[scenario];
        
        // Build services covered map
        const servicesCoveredMap = {};
        accreditations.forEach(a => {
          servicesCoveredMap[a.facility_id] = a.services_covered || [];
        });
        
        // Check each claim
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
        
        expect(
          violations,
          `Found ${violations.length} claims for services not covered by accreditation:\n${violations.slice(0, 5).map(v => `  ${v.claim_id}: ${v.service_code} not in [${v.services_covered.join(', ')}]`).join('\n')}`
        ).toHaveLength(0);
      });
    });
  });

  describe('Level 1 Facilities - General Only', () => {
    scenarios.forEach(scenario => {
      it(`${scenario}: Level 1 facilities should only have general consultation accreditation`, () => {
        const { facilities, accreditations } = dataByScenario[scenario];
        
        const level1Facilities = facilities.filter(f => f.facility_level === 1);
        const violations = [];
        
        level1Facilities.forEach(facility => {
          const accred = accreditations.find(a => a.facility_id === facility.facility_id);
          if (accred && accred.services_covered.includes('PSYCH_CONSULT_SPEC')) {
            violations.push({
              facility_id: facility.facility_id,
              level: facility.facility_level,
              services: accred.services_covered
            });
          }
        });
        
        expect(
          violations,
          `Found ${violations.length} Level 1 facilities with specialty accreditation (should be illustratively ineligible)`
        ).toHaveLength(0);
      });

      it(`${scenario}: Level 1 facilities should not have specialty claims`, () => {
        const { facilities, claims } = dataByScenario[scenario];
        
        const level1FacilityIds = new Set(
          facilities.filter(f => f.facility_level === 1).map(f => f.facility_id)
        );
        
        const violations = claims.filter(c => 
          level1FacilityIds.has(c.facility_id) && c.service_code === 'PSYCH_CONSULT_SPEC'
        );
        
        expect(
          violations,
          `Found ${violations.length} specialty claims at Level 1 facilities`
        ).toHaveLength(0);
      });
    });
  });

  describe('Approved-But-Unpaid Claims', () => {
    scenarios.forEach(scenario => {
      it(`${scenario}: should have claims with status="approved" and payment_date=null`, () => {
        const { claims } = dataByScenario[scenario];
        
        const approvedUnpaid = claims.filter(c => 
          c.status === 'approved' && 
          c.approval_date && 
          !c.payment_date
        );
        
        expect(approvedUnpaid.length).toBeGreaterThan(0);
        
        // Verify these claims have approved amounts
        approvedUnpaid.forEach(claim => {
          expect(claim.approved_amount).toBeGreaterThan(0);
          expect(claim.disbursed_amount).toBeNull();
          expect(claim.payment_status).toBe('pending');
        });
      });

      it(`${scenario}: approved-but-unpaid claims should have outstanding balance`, () => {
        const { claims } = dataByScenario[scenario];
        
        const approvedUnpaid = claims.filter(c => 
          c.status === 'approved' && !c.payment_date
        );
        
        approvedUnpaid.forEach(claim => {
          expect(claim.outstanding_balance).toBe(claim.approved_amount);
        });
      });
    });
  });

  describe('Partial Payment Claims', () => {
    scenarios.forEach(scenario => {
      it(`${scenario}: should have claims with partial_payment status`, () => {
        const { claims } = dataByScenario[scenario];
        
        const partialPayment = claims.filter(c => c.status === 'partial_payment');
        
        expect(partialPayment.length).toBeGreaterThan(0);
        
        // Verify partial payment characteristics
        partialPayment.forEach(claim => {
          expect(claim.approved_amount).toBeGreaterThan(0);
          expect(claim.disbursed_amount).toBeGreaterThan(0);
          expect(claim.disbursed_amount).toBeLessThan(claim.approved_amount);
          expect(claim.outstanding_balance).toBeGreaterThan(0);
          expect(claim.payment_date).toBeDefined();
          expect(claim.payment_status).toBe('partial');
        });
      });
    });
  });

  describe('Payment Consistency with Status', () => {
    scenarios.forEach(scenario => {
      it(`${scenario}: paid claims should have payment_date and disbursed_amount`, () => {
        const { claims } = dataByScenario[scenario];
        
        const paidClaims = claims.filter(c => c.status === 'paid');
        
        paidClaims.forEach(claim => {
          expect(
            claim.payment_date,
            `Paid claim ${claim.claim_id} missing payment_date`
          ).toBeDefined();
          expect(
            claim.disbursed_amount,
            `Paid claim ${claim.claim_id} missing disbursed_amount`
          ).toBeGreaterThan(0);
        });
      });

      it(`${scenario}: approved (unpaid) claims should NOT have payment_date`, () => {
        const { claims } = dataByScenario[scenario];
        
        const approvedClaims = claims.filter(c => c.status === 'approved');
        
        approvedClaims.forEach(claim => {
          expect(
            claim.payment_date,
            `Approved claim ${claim.claim_id} should not have payment_date`
          ).toBeNull();
        });
      });

      it(`${scenario}: denied claims should NOT have approval_date or payment_date`, () => {
        const { claims } = dataByScenario[scenario];
        
        const deniedClaims = claims.filter(c => c.status === 'denied');
        
        deniedClaims.forEach(claim => {
          expect(
            claim.approval_date,
            `Denied claim ${claim.claim_id} should not have approval_date`
          ).toBeNull();
          expect(
            claim.payment_date,
            `Denied claim ${claim.claim_id} should not have payment_date`
          ).toBeNull();
        });
      });
    });
  });

  describe('Outstanding Balance Calculation', () => {
    scenarios.forEach(scenario => {
      it(`${scenario}: outstanding_balance should equal approved - disbursed`, () => {
        const { claims } = dataByScenario[scenario];
        
        const claimsWithBalance = claims.filter(c => c.outstanding_balance !== null);
        
        claimsWithBalance.forEach(claim => {
          const expected = claim.approved_amount - (claim.disbursed_amount || 0);
          expect(
            claim.outstanding_balance,
            `Claim ${claim.claim_id}: outstanding_balance should be ${expected}`
          ).toBe(expected);
        });
      });
    });
  });
});
