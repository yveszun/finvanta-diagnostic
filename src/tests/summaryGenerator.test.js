import { describe, it, expect } from 'vitest';
import { generateExecutiveSummary, getPrimaryIndicators, generateInvestigationSuggestion } from '../utils/summaryGenerator';

describe('Summary Generator', () => {
  const mockData = {
    analytics: {
      facilityParticipationCascade: {
        stage1_eligible: 1000,
        stage2_accredited: 700,
        stage3_claiming: 600,
        stage4_receiving_payment: 550
      }
    }
  };

  describe('generateExecutiveSummary', () => {
    it('should generate headline with correct statistics', () => {
      const summary = generateExecutiveSummary(mockData);
      
      expect(summary.headline).toContain('55%');
      expect(summary.headline).toContain('550');
      expect(summary.headline).toContain('1,000');
      expect(summary.facilitiesActive).toBe(550);
      expect(summary.facilitiesEligible).toBe(1000);
      expect(summary.utilizationRate).toBe(0.55);
    });

    it('should classify health status as "healthy" for high utilization', () => {
      const healthyData = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: 1000,
            stage2_accredited: 900,
            stage3_claiming: 850,
            stage4_receiving_payment: 800
          }
        }
      };
      
      const summary = generateExecutiveSummary(healthyData);
      expect(summary.overallHealth).toBe('healthy');
      expect(summary.headline).toContain('Strong Performance');
    });

    it('should classify health status as "moderate" for medium utilization', () => {
      const summary = generateExecutiveSummary(mockData);
      expect(summary.overallHealth).toBe('moderate');
      expect(summary.headline).toContain('Moderate Participation');
    });

    it('should classify health status as "concerning" for low utilization', () => {
      const concerningData = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: 1000,
            stage2_accredited: 500,
            stage3_claiming: 400,
            stage4_receiving_payment: 350
          }
        }
      };
      
      const summary = generateExecutiveSummary(concerningData);
      expect(summary.overallHealth).toBe('concerning');
      expect(summary.headline).toContain('Low Engagement');
    });

    it('should classify health status as "critical" for very low utilization', () => {
      const criticalData = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: 1000,
            stage2_accredited: 300,
            stage3_claiming: 200,
            stage4_receiving_payment: 150
          }
        }
      };
      
      const summary = generateExecutiveSummary(criticalData);
      expect(summary.overallHealth).toBe('critical');
      expect(summary.headline).toContain('Critical Constraint');
    });

    it('should return null for invalid data', () => {
      expect(generateExecutiveSummary(null)).toBeNull();
      expect(generateExecutiveSummary({})).toBeNull();
    });
  });

  describe('getPrimaryIndicators', () => {
    it('should return exactly 3 indicators', () => {
      const indicators = getPrimaryIndicators(mockData);
      expect(indicators).toHaveLength(3);
    });

    it('should calculate accreditation rate correctly', () => {
      const indicators = getPrimaryIndicators(mockData);
      const accreditation = indicators.find(i => i.label === 'Accreditation Rate');
      
      expect(accreditation).toBeDefined();
      expect(accreditation.value).toBe('70%');
      expect(accreditation.description).toContain('accreditation');
    });

    it('should calculate claims activity correctly', () => {
      const indicators = getPrimaryIndicators(mockData);
      const claims = indicators.find(i => i.label === 'Claims Activity');
      
      expect(claims).toBeDefined();
      expect(claims.value).toBe('86%'); // 600/700
      expect(claims.description).toContain('claims');
    });

    it('should calculate payment success correctly', () => {
      const indicators = getPrimaryIndicators(mockData);
      const payment = indicators.find(i => i.label === 'Payment Success');
      
      expect(payment).toBeDefined();
      expect(payment.value).toBe('92%'); // 550/600
      expect(payment.description).toContain('payment');
    });

    it('should assign correct status based on rates', () => {
      const goodData = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: 1000,
            stage2_accredited: 900,  // 90% - good
            stage3_claiming: 850,    // 94% - good
            stage4_receiving_payment: 800  // 94% - good
          }
        }
      };
      
      const indicators = getPrimaryIndicators(goodData);
      indicators.forEach(indicator => {
        expect(indicator.status).toBe('good');
      });
    });

    it('should return empty array for invalid data', () => {
      expect(getPrimaryIndicators(null)).toEqual([]);
      expect(getPrimaryIndicators({})).toEqual([]);
    });
  });

  describe('generateInvestigationSuggestion', () => {
    it('should suggest accreditation investigation for accreditation bottleneck', () => {
      const bottleneck = {
        stage: 'Accreditation',
        facilitiesLost: 500
      };
      
      const suggestion = generateInvestigationSuggestion(bottleneck, mockData);
      
      expect(suggestion.action).toContain('accreditation');
      expect(suggestion.context).toContain('500');
      expect(suggestion.dataSource).toBeDefined();
    });

    it('should suggest claims investigation for claims bottleneck', () => {
      const bottleneck = {
        stage: 'Claims Submission',
        facilitiesLost: 300
      };
      
      const suggestion = generateInvestigationSuggestion(bottleneck, mockData);
      
      expect(suggestion.action).toContain('claims');
      expect(suggestion.context).toContain('300');
    });

    it('should suggest payment investigation for payment bottleneck', () => {
      const bottleneck = {
        stage: 'Payment Receipt',
        facilitiesLost: 200
      };
      
      const suggestion = generateInvestigationSuggestion(bottleneck, mockData);
      
      expect(suggestion.action).toContain('payment');
      expect(suggestion.context).toContain('200');
    });

    it('should provide default suggestion when no bottleneck', () => {
      const suggestion = generateInvestigationSuggestion(null, mockData);
      
      expect(suggestion.action).toContain('regional');
      expect(suggestion.context).toBeDefined();
    });
  });
});
