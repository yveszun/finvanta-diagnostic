import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Configuration File Consistency', () => {
  let benefitConfig;
  let metricsSchema;

  beforeAll(() => {
    const benefitPath = path.resolve(process.cwd(), 'public/config/benefitConfig.json');
    benefitConfig = JSON.parse(fs.readFileSync(benefitPath, 'utf-8'));
    
    const schemaPath = path.resolve(process.cwd(), 'public/config/metricsSchema.json');
    metricsSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  });

  describe('Financial Consistency', () => {
    it('should have package ceilings, not fixed amounts', () => {
      expect(benefitConfig.services.general.packageCeiling).toBeDefined();
      expect(benefitConfig.services.specialty.packageCeiling).toBeDefined();
      expect(benefitConfig.services.general.amount).toBeUndefined();
      expect(benefitConfig.services.specialty.amount).toBeUndefined();
    });

    it('should have financial assumptions defined', () => {
      expect(benefitConfig.financialAssumptions).toBeDefined();
      expect(benefitConfig.financialAssumptions.billedToApprovedRatio).toBeGreaterThan(0);
      expect(benefitConfig.financialAssumptions.approvedToDisbursedRatio).toBeGreaterThan(0);
      expect(benefitConfig.financialAssumptions.averageReimbursementToPackageRatio).toBeGreaterThan(0);
    });

    it('all scenarios should have billed, approved, and disbursed amounts', () => {
      ['low', 'moderate', 'high'].forEach(scenarioKey => {
        const scenario = benefitConfig.scenarios[scenarioKey];
        expect(scenario.financials.totalBilled, `${scenarioKey} missing totalBilled`).toBeDefined();
        expect(scenario.financials.totalApproved, `${scenarioKey} missing totalApproved`).toBeDefined();
        expect(scenario.financials.totalDisbursed, `${scenarioKey} missing totalDisbursed`).toBeDefined();
      });
    });

    it('disbursed should be less than approved in all scenarios', () => {
      ['low', 'moderate', 'high'].forEach(scenarioKey => {
        const scenario = benefitConfig.scenarios[scenarioKey];
        expect(
          scenario.financials.totalDisbursed,
          `${scenarioKey}: disbursed should be <= approved`
        ).toBeLessThanOrEqual(scenario.financials.totalApproved);
      });
    });

    it('approved should be less than billed in all scenarios', () => {
      ['low', 'moderate', 'high'].forEach(scenarioKey => {
        const scenario = benefitConfig.scenarios[scenarioKey];
        expect(
          scenario.financials.totalApproved,
          `${scenarioKey}: approved should be <= billed`
        ).toBeLessThanOrEqual(scenario.financials.totalBilled);
      });
    });

    it('financial calculations should be internally consistent', () => {
      ['low', 'moderate', 'high'].forEach(scenarioKey => {
        const scenario = benefitConfig.scenarios[scenarioKey];
        const { general, specialty } = benefitConfig.services;
        
        // Calculate expected billed amount
        const expectedBilled = 
          (scenario.targetClaimsCount * scenario.serviceTypeDistribution.general * general.packageCeiling) +
          (scenario.targetClaimsCount * scenario.serviceTypeDistribution.specialty * specialty.packageCeiling);
        
        expect(
          scenario.financials.totalBilled,
          `${scenarioKey}: totalBilled should match calculated amount (${expectedBilled})`
        ).toBeCloseTo(expectedBilled, 0);
        
        // Average billed per claim should match
        const expectedAvgBilled = scenario.financials.totalBilled / scenario.targetClaimsCount;
        expect(
          scenario.financials.averageBilledPerClaim,
          `${scenarioKey}: averageBilledPerClaim should match totalBilled / targetClaimsCount`
        ).toBeCloseTo(expectedAvgBilled, 0);
      });
    });
  });

  describe('Claims Processing Stages', () => {
    it('should distinguish approval from payment', () => {
      const stages = benefitConfig.claimsProcessing.stages;
      expect(stages['4_approval']).toBeDefined();
      expect(stages['5_payment']).toBeDefined();
      expect(stages['4_approval']).not.toBe(stages['5_payment']);
    });

    it('should require both approval and payment dates', () => {
      expect(benefitConfig.claimsProcessing.requireBothApprovalAndPaymentDates).toBe(true);
    });

    it('claims processing note should clarify approval vs payment', () => {
      expect(benefitConfig.claimsProcessing.note).toBeDefined();
      expect(benefitConfig.claimsProcessing.note.toLowerCase()).toContain('approval');
      expect(benefitConfig.claimsProcessing.note.toLowerCase()).toContain('payment');
    });
  });

  describe('Metrics Schema Alignment', () => {
    it('facility cascade should never include claim counts', () => {
      const facilityMetrics = Object.keys(metricsSchema.facilityCascadeMetrics);
      facilityMetrics.forEach(metric => {
        const metricDef = metricsSchema.facilityCascadeMetrics[metric];
        if (metricDef.unit) {
          expect(
            metricDef.unit,
            `Facility metric ${metric} should not use 'claims' as unit`
          ).not.toBe('claims');
        }
      });
    });

    it('claims cascade should never include facility counts', () => {
      const claimsMetrics = Object.keys(metricsSchema.claimsCascadeMetrics);
      claimsMetrics.forEach(metric => {
        const metricDef = metricsSchema.claimsCascadeMetrics[metric];
        if (metricDef.unit) {
          expect(
            metricDef.unit,
            `Claims metric ${metric} should not use 'facilities' as unit`
          ).not.toBe('facilities');
        }
      });
    });

    it('all metrics should have type and description', () => {
      const allMetrics = {
        ...metricsSchema.facilityCascadeMetrics,
        ...metricsSchema.claimsCascadeMetrics,
        ...metricsSchema.financialMetrics,
        ...metricsSchema.timelineMetrics
      };

      Object.keys(allMetrics).forEach(metricName => {
        const metric = allMetrics[metricName];
        expect(metric.type, `Metric ${metricName} missing type`).toBeDefined();
        expect(metric.description, `Metric ${metricName} missing description`).toBeDefined();
      });
    });

    it('percentage metrics should have formula defined', () => {
      const allMetrics = {
        ...metricsSchema.facilityCascadeMetrics,
        ...metricsSchema.claimsCascadeMetrics
      };

      Object.keys(allMetrics).forEach(metricName => {
        const metric = allMetrics[metricName];
        if (metric.type === 'percentage') {
          expect(
            metric.formula,
            `Percentage metric ${metricName} should have formula defined`
          ).toBeDefined();
        }
      });
    });

    it('validation rules should enforce unit consistency', () => {
      expect(metricsSchema.validationRules.facilitiesNeverMixedWithClaims).toBe(true);
      expect(metricsSchema.validationRules.conversionRatesSameUnitOnly).toBe(true);
      expect(metricsSchema.validationRules.zeroDenominatorReturnsNA).toBe(true);
    });
  });

  describe('Synthetic Data Labels', () => {
    it('should have prominent synthetic data banner', () => {
      expect(benefitConfig.displayLabels.syntheticDataBanner).toBeDefined();
      expect(benefitConfig.displayLabels.syntheticDataBanner).toContain('SYNTHETIC');
      expect(benefitConfig.displayLabels.syntheticDataBanner).toContain('Demonstration Only');
    });

    it('all scenarios should have synthetic disclaimer', () => {
      expect(benefitConfig.scenarios.disclaimer).toBeDefined();
      expect(benefitConfig.scenarios.disclaimer.toLowerCase()).toContain('synthetic');
      expect(benefitConfig.scenarios.disclaimer.toLowerCase()).toContain('do not represent actual');
    });

    it('metadata should flag as not for production', () => {
      expect(benefitConfig.metadata.notForProduction).toBe(true);
      expect(benefitConfig.metadata.notForPolicyDecisions).toBe(true);
    });
  });

  describe('Eligibility Configuration', () => {
    it('should not hard-code Level 2+ assumption', () => {
      const config = benefitConfig.eligibility.currentConfiguration;
      expect(config.includeLevelOne).toBe(true);
      expect(config.note).toBeDefined();
    });

    it('should require official verification', () => {
      expect(benefitConfig.eligibility.requiresOfficialVerification).toBe(true);
      expect(benefitConfig.eligibility.verificationStatus).toBe('PENDING');
    });

    it('should distinguish general vs specialty service eligibility', () => {
      const general = benefitConfig.eligibility.serviceDistinction.general;
      const specialty = benefitConfig.eligibility.serviceDistinction.specialty;
      
      expect(general.requiresVerification).toBe(true);
      expect(specialty.requiresVerification).toBe(true);
      expect(specialty.note).toBeDefined();
    });
  });

  describe('Regional Distribution', () => {
    it('should have configurable regional profiles', () => {
      expect(benefitConfig.regionalDistribution.mode).toBe('configurable');
      expect(benefitConfig.regionalDistribution.profiles.neutral).toBeDefined();
      expect(benefitConfig.regionalDistribution.profiles.differentiated).toBeDefined();
    });

    it('regional disclaimer should warn about simulated patterns', () => {
      expect(benefitConfig.regionalDistribution.disclaimer).toBeDefined();
      expect(benefitConfig.regionalDistribution.disclaimer.toLowerCase()).toContain('simulated');
      expect(benefitConfig.regionalDistribution.disclaimer.toLowerCase()).toContain('do not represent actual');
    });
  });
});
