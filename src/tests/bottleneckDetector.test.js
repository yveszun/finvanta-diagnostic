import { describe, it, expect } from 'vitest';
import { detectPrimaryBottleneck, getBottleneckInsight } from '../analytics/bottleneckDetector';

describe('Bottleneck Detector', () => {
  const mockData = {
    analytics: {
      facilityParticipationCascade: {
        stage1_eligible: 1000,
        stage2_accredited: 500,
        stage3_claiming: 400,
        stage4_receiving_payment: 350
      }
    }
  };

  describe('detectPrimaryBottleneck', () => {
    it('should identify accreditation as bottleneck when it has lowest rate', () => {
      const data = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: 1000,
            stage2_accredited: 300,  // 30% - lowest
            stage3_claiming: 250,    // 83% of accredited
            stage4_receiving_payment: 240  // 96% of claiming
          }
        }
      };
      
      const bottleneck = detectPrimaryBottleneck(data);
      
      expect(bottleneck.stage).toBe('Accreditation');
      expect(bottleneck.conversionRate).toBe(0.3);
      expect(bottleneck.facilitiesLost).toBe(700);
    });

    it('should identify claims submission as bottleneck when appropriate', () => {
      const data = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: 1000,
            stage2_accredited: 800,  // 80%
            stage3_claiming: 200,    // 25% - lowest
            stage4_receiving_payment: 180
          }
        }
      };
      
      const bottleneck = detectPrimaryBottleneck(data);
      
      expect(bottleneck.stage).toBe('Claims Submission');
      expect(bottleneck.facilitiesLost).toBe(600);
    });

    it('should identify payment receipt as bottleneck when appropriate', () => {
      const data = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: 1000,
            stage2_accredited: 900,  // 90%
            stage3_claiming: 800,    // 89%
            stage4_receiving_payment: 200  // 25% - lowest
          }
        }
      };
      
      const bottleneck = detectPrimaryBottleneck(data);
      
      expect(bottleneck.stage).toBe('Payment Receipt');
      expect(bottleneck.conversionRate).toBe(0.25);
    });

    it('should calculate severity correctly', () => {
      const criticalData = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: 1000,
            stage2_accredited: 300,
            stage3_claiming: 250,
            stage4_receiving_payment: 240
          }
        }
      };
      
      const bottleneck = detectPrimaryBottleneck(criticalData);
      expect(bottleneck.severity).toBe('critical'); // <50%
    });

    it('should return null for invalid data', () => {
      expect(detectPrimaryBottleneck(null)).toBeNull();
      expect(detectPrimaryBottleneck({})).toBeNull();
      expect(detectPrimaryBottleneck({ analytics: {} })).toBeNull();
    });
  });

  describe('getBottleneckInsight', () => {
    it('should provide insights for accreditation bottleneck', () => {
      const bottleneck = {
        stage: 'Accreditation',
        conversionRate: 0.3,
        facilitiesLost: 700,
        severity: 'critical'
      };
      
      const insight = getBottleneckInsight(bottleneck);
      
      expect(insight.finding).toContain('drop-off');
      expect(insight.finding).toContain('Accreditation');
      expect(insight.investigation).toContain('accreditation');
      expect(insight.metric).toBe('accreditation conversion rate');
    });

    it('should provide insights for claims submission bottleneck', () => {
      const bottleneck = {
        stage: 'Claims Submission',
        conversionRate: 0.25,
        facilitiesLost: 600
      };
      
      const insight = getBottleneckInsight(bottleneck);
      
      expect(insight.finding).toContain('drop-off');
      expect(insight.finding).toContain('Claims');
      expect(insight.investigation).toContain('claims submission');
    });

    it('should provide insights for payment receipt bottleneck', () => {
      const bottleneck = {
        stage: 'Payment Receipt',
        conversionRate: 0.25,
        facilitiesLost: 600
      };
      
      const insight = getBottleneckInsight(bottleneck);
      
      expect(insight.finding).toContain('drop-off');
      expect(insight.finding).toContain('Payment');
      expect(insight.investigation).toContain('payment processing');
    });

    it('should return null for missing bottleneck', () => {
      expect(getBottleneckInsight(null)).toBeNull();
    });
  });
});
