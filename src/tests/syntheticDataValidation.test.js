import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Synthetic Data Validation', () => {
  const scenarios = ['low_neutral', 'moderate_neutral', 'high_neutral'];
  const dataByScenario = {};

  beforeAll(() => {
    scenarios.forEach(scenario => {
      const dataDir = path.resolve(process.cwd(), `public/data/${scenario}`);
      dataByScenario[scenario] = {
        facilities: JSON.parse(fs.readFileSync(path.join(dataDir, 'facilities.json'), 'utf-8')),
        accreditations: JSON.parse(fs.readFileSync(path.join(dataDir, 'accreditations.json'), 'utf-8')),
        claims: JSON.parse(fs.readFileSync(path.join(dataDir, 'claims.json'), 'utf-8')),
        metadata: JSON.parse(fs.readFileSync(path.join(dataDir, 'metadata.json'), 'utf-8'))
      };
    });
  });

  describe('Data Quality Requirements', () => {
    scenarios.forEach(scenario => {
      describe(`${scenario} scenario`, () => {
        
        it('all facility IDs should be unique', () => {
          const facilities = dataByScenario[scenario].facilities;
          const ids = facilities.map(f => f.facility_id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);
        });

        it('all claim IDs should be unique', () => {
          const claims = dataByScenario[scenario].claims;
          const ids = claims.map(c => c.claim_id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);
        });

        it('all accreditation IDs should be unique', () => {
          const accreditations = dataByScenario[scenario].accreditations;
          const ids = accreditations.map(a => a.accreditation_id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);
        });

        it('all claims should reference valid facilities', () => {
          const facilities = dataByScenario[scenario].facilities;
          const claims = dataByScenario[scenario].claims;
          const validFacilityIds = new Set(facilities.map(f => f.facility_id));
          
          claims.forEach(claim => {
            expect(
              validFacilityIds.has(claim.facility_id),
              `Claim ${claim.claim_id} references invalid facility: ${claim.facility_id}`
            ).toBe(true);
          });
        });

        it('all accreditations should reference valid facilities', () => {
          const facilities = dataByScenario[scenario].facilities;
          const accreditations = dataByScenario[scenario].accreditations;
          const validFacilityIds = new Set(facilities.map(f => f.facility_id));
          
          accreditations.forEach(accred => {
            expect(
              validFacilityIds.has(accred.facility_id),
              `Accreditation ${accred.accreditation_id} references invalid facility: ${accred.facility_id}`
            ).toBe(true);
          });
        });

        it('paid claims should have payment dates', () => {
          const claims = dataByScenario[scenario].claims;
          const paidClaims = claims.filter(c => c.status === 'paid');
          
          paidClaims.forEach(claim => {
            expect(
              claim.payment_date,
              `Paid claim ${claim.claim_id} missing payment_date`
            ).toBeDefined();
            expect(claim.payment_date).not.toBeNull();
          });
        });

        it('denied claims should NOT have payment dates', () => {
          const claims = dataByScenario[scenario].claims;
          const deniedClaims = claims.filter(c => c.status === 'denied');
          
          deniedClaims.forEach(claim => {
            expect(
              claim.payment_date,
              `Denied claim ${claim.claim_id} should not have payment_date`
            ).toBeNull();
          });
        });

        it('denied claims should NOT have approved amounts', () => {
          const claims = dataByScenario[scenario].claims;
          const deniedClaims = claims.filter(c => c.status === 'denied');
          
          deniedClaims.forEach(claim => {
            expect(
              claim.approved_amount,
              `Denied claim ${claim.claim_id} should not have approved_amount`
            ).toBeNull();
          });
        });

        it('all claims should have valid statuses', () => {
          const claims = dataByScenario[scenario].claims;
          const validStatuses = ['submitted', 'accepted', 'adjudicated', 'approved', 'paid', 'denied', 'partial_payment'];
          
          claims.forEach(claim => {
            expect(
              validStatuses.includes(claim.status),
              `Claim ${claim.claim_id} has invalid status: ${claim.status}`
            ).toBe(true);
          });
        });

        it('all claims should have required fields', () => {
          const claims = dataByScenario[scenario].claims;
          const requiredFields = [
            'claim_id', 'facility_id', 'service_date', 'billed_amount',
            'submission_date', 'acceptance_date', 'adjudication_date', 'status'
          ];
          
          claims.forEach(claim => {
            requiredFields.forEach(field => {
              expect(
                claim[field],
                `Claim ${claim.claim_id} missing required field: ${field}`
              ).toBeDefined();
            });
          });
        });

        it('service dates should be before payment dates', () => {
          const claims = dataByScenario[scenario].claims;
          const paidClaims = claims.filter(c => c.payment_date);
          
          paidClaims.forEach(claim => {
            const serviceDate = new Date(claim.service_date);
            const paymentDate = new Date(claim.payment_date);
            expect(
              serviceDate < paymentDate,
              `Claim ${claim.claim_id}: service date (${claim.service_date}) should be before payment date (${claim.payment_date})`
            ).toBe(true);
          });
        });

        it('submission dates should be after service dates', () => {
          const claims = dataByScenario[scenario].claims;
          
          claims.forEach(claim => {
            const serviceDate = new Date(claim.service_date);
            const submissionDate = new Date(claim.submission_date);
            expect(
              submissionDate >= serviceDate,
              `Claim ${claim.claim_id}: submission date should be after service date`
            ).toBe(true);
          });
        });

        it('date progression should be valid: submission → acceptance → adjudication → approval → payment', () => {
          const claims = dataByScenario[scenario].claims;
          
          claims.forEach(claim => {
            const submission = new Date(claim.submission_date);
            const acceptance = new Date(claim.acceptance_date);
            const adjudication = new Date(claim.adjudication_date);
            
            expect(acceptance >= submission, `Claim ${claim.claim_id}: acceptance before submission`).toBe(true);
            expect(adjudication >= acceptance, `Claim ${claim.claim_id}: adjudication before acceptance`).toBe(true);
            
            if (claim.approval_date) {
              const approval = new Date(claim.approval_date);
              expect(approval >= adjudication, `Claim ${claim.claim_id}: approval before adjudication`).toBe(true);
              
              if (claim.payment_date) {
                const payment = new Date(claim.payment_date);
                expect(payment >= approval, `Claim ${claim.claim_id}: payment before approval`).toBe(true);
              }
            }
          });
        });
      });
    });
  });

  describe('Financial Consistency', () => {
    scenarios.forEach(scenario => {
      describe(`${scenario} scenario`, () => {
        
        it('disbursed amount should be less than or equal to approved amount', () => {
          const claims = dataByScenario[scenario].claims;
          const paidClaims = claims.filter(c => c.disbursed_amount && c.approved_amount);
          
          paidClaims.forEach(claim => {
            expect(
              claim.disbursed_amount,
              `Claim ${claim.claim_id}: disbursed (${claim.disbursed_amount}) should be <= approved (${claim.approved_amount})`
            ).toBeLessThanOrEqual(claim.approved_amount);
          });
        });

        it('approved amount should be less than or equal to billed amount', () => {
          const claims = dataByScenario[scenario].claims;
          const approvedClaims = claims.filter(c => c.approved_amount);
          
          approvedClaims.forEach(claim => {
            expect(
              claim.approved_amount,
              `Claim ${claim.claim_id}: approved (${claim.approved_amount}) should be <= billed (${claim.billed_amount})`
            ).toBeLessThanOrEqual(claim.billed_amount);
          });
        });

        it('total disbursed should match metadata', () => {
          const claims = dataByScenario[scenario].claims;
          const metadata = dataByScenario[scenario].metadata;
          const totalDisbursed = claims
            .filter(c => c.disbursed_amount)
            .reduce((sum, c) => sum + c.disbursed_amount, 0);
          
          expect(totalDisbursed).toBe(metadata.financials.totalDisbursed);
        });

        it('total approved should match metadata', () => {
          const claims = dataByScenario[scenario].claims;
          const metadata = dataByScenario[scenario].metadata;
          const totalApproved = claims
            .filter(c => c.approved_amount)
            .reduce((sum, c) => sum + c.approved_amount, 0);
          
          expect(totalApproved).toBe(metadata.financials.totalApproved);
        });

        it('total billed should match metadata', () => {
          const claims = dataByScenario[scenario].claims;
          const metadata = dataByScenario[scenario].metadata;
          const totalBilled = claims.reduce((sum, c) => sum + c.billed_amount, 0);
          
          expect(totalBilled).toBe(metadata.financials.totalBilled);
        });
      });
    });
  });

  describe('Approval vs Payment Separation', () => {
    scenarios.forEach(scenario => {
      describe(`${scenario} scenario`, () => {
        
        it('should have separate approval_date and payment_date fields', () => {
          const claims = dataByScenario[scenario].claims;
          const paidClaims = claims.filter(c => c.status === 'paid');
          
          expect(paidClaims.length).toBeGreaterThan(0);
          paidClaims.forEach(claim => {
            expect(claim).toHaveProperty('approval_date');
            expect(claim).toHaveProperty('payment_date');
          });
        });

        it('approved claims should have approval_date', () => {
          const claims = dataByScenario[scenario].claims;
          const paidClaims = claims.filter(c => c.status === 'paid');
          
          paidClaims.forEach(claim => {
            expect(claim.approval_date).toBeDefined();
            expect(claim.approval_date).not.toBeNull();
          });
        });

        it('payment dates should be after approval dates', () => {
          const claims = dataByScenario[scenario].claims;
          const paidClaims = claims.filter(c => c.approval_date && c.payment_date);
          
          paidClaims.forEach(claim => {
            const approvalDate = new Date(claim.approval_date);
            const paymentDate = new Date(claim.payment_date);
            expect(
              paymentDate >= approvalDate,
              `Claim ${claim.claim_id}: payment date should be >= approval date`
            ).toBe(true);
          });
        });

        it('should have both approved_amount and disbursed_amount for paid claims', () => {
          const claims = dataByScenario[scenario].claims;
          const paidClaims = claims.filter(c => c.status === 'paid');
          
          paidClaims.forEach(claim => {
            expect(claim.approved_amount).toBeDefined();
            expect(claim.approved_amount).toBeGreaterThan(0);
            expect(claim.disbursed_amount).toBeDefined();
            expect(claim.disbursed_amount).toBeGreaterThan(0);
          });
        });
      });
    });
  });

  describe('Scenario Progression', () => {
    it('low scenario should have lower accreditation rate than moderate', () => {
      const lowMeta = dataByScenario['low_neutral'].metadata;
      const moderateMeta = dataByScenario['moderate_neutral'].metadata;
      
      const lowRate = lowMeta.recordCounts.accreditations / lowMeta.recordCounts.eligibleFacilities;
      const moderateRate = moderateMeta.recordCounts.accreditations / moderateMeta.recordCounts.eligibleFacilities;
      
      expect(lowRate).toBeLessThan(moderateRate);
    });

    it('moderate scenario should have lower accreditation rate than high', () => {
      const moderateMeta = dataByScenario['moderate_neutral'].metadata;
      const highMeta = dataByScenario['high_neutral'].metadata;
      
      const moderateRate = moderateMeta.recordCounts.accreditations / moderateMeta.recordCounts.eligibleFacilities;
      const highRate = highMeta.recordCounts.accreditations / highMeta.recordCounts.eligibleFacilities;
      
      expect(moderateRate).toBeLessThan(highRate);
    });

    it('claims counts should follow scenario progression', () => {
      const lowClaims = dataByScenario['low_neutral'].claims.length;
      const moderateClaims = dataByScenario['moderate_neutral'].claims.length;
      const highClaims = dataByScenario['high_neutral'].claims.length;
      
      expect(lowClaims).toBeLessThan(moderateClaims);
      expect(moderateClaims).toBeLessThan(highClaims);
    });

    it('total disbursed should follow scenario progression', () => {
      const lowDisbursed = dataByScenario['low_neutral'].metadata.financials.totalDisbursed;
      const moderateDisbursed = dataByScenario['moderate_neutral'].metadata.financials.totalDisbursed;
      const highDisbursed = dataByScenario['high_neutral'].metadata.financials.totalDisbursed;
      
      expect(lowDisbursed).toBeLessThan(moderateDisbursed);
      expect(moderateDisbursed).toBeLessThan(highDisbursed);
    });
  });

  describe('Reproducibility', () => {
    it('all scenarios should have seed information in metadata', () => {
      scenarios.forEach(scenario => {
        const metadata = dataByScenario[scenario].metadata;
        expect(metadata.reproducibility).toBeDefined();
        expect(metadata.reproducibility.seedUsed).toBeDefined();
      });
    });

    it('metadata should indicate validation passed', () => {
      scenarios.forEach(scenario => {
        const metadata = dataByScenario[scenario].metadata;
        expect(metadata.validationStatus).toBeDefined();
        expect(metadata.validationStatus.uniqueFacilityIds).toBe(true);
        expect(metadata.validationStatus.uniqueClaimIds).toBe(true);
        expect(metadata.validationStatus.validFacilityReferences).toBe(true);
        expect(metadata.validationStatus.approvalPaymentSeparation).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    let edgeCases;

    beforeAll(() => {
      const edgeCasesPath = path.resolve(process.cwd(), 'public/data/edge_cases.json');
      edgeCases = JSON.parse(fs.readFileSync(edgeCasesPath, 'utf-8'));
    });

    it('should have edge case definitions', () => {
      expect(edgeCases).toBeDefined();
      expect(edgeCases.cases).toBeInstanceOf(Array);
      expect(edgeCases.cases.length).toBeGreaterThan(0);
    });

    it('should include zero eligible facilities case', () => {
      const zeroCase = edgeCases.cases.find(c => c.name === 'zero_eligible_facilities');
      expect(zeroCase).toBeDefined();
      expect(zeroCase.facilities).toHaveLength(0);
    });

    it('should include no accreditations case', () => {
      const noAccredCase = edgeCases.cases.find(c => c.name === 'no_accreditations');
      expect(noAccredCase).toBeDefined();
      expect(noAccredCase.accreditations).toHaveLength(0);
    });

    it('should include all claims denied case', () => {
      const allDeniedCase = edgeCases.cases.find(c => c.name === 'all_claims_denied');
      expect(allDeniedCase).toBeDefined();
      expect(allDeniedCase.claims.every(c => c.status === 'denied')).toBe(true);
    });

    it('should include approved but payment pending case', () => {
      const pendingCase = edgeCases.cases.find(c => c.name === 'approved_payment_pending');
      expect(pendingCase).toBeDefined();
      const claim = pendingCase.claims[0];
      expect(claim.approval_date).toBeDefined();
      expect(claim.payment_date).toBeNull();
    });
  });
});
