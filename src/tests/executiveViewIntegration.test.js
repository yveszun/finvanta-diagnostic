import { describe, it, expect } from 'vitest';
import { detectPrimaryBottleneck, getBottleneckInsight } from '../analytics/bottleneckDetector';
import { generateExecutiveSummary, getPrimaryIndicators, generateInvestigationSuggestion } from '../utils/summaryGenerator';
import fs from 'fs';
import path from 'path';

/**
 * Executive View Integration Tests
 * Tests using ACTUAL deployed synthetic datasets (not mocks)
 * Verifies NaN, Infinity, undefined, and [object Object] never appear
 */

// Load all 6 actual synthetic scenarios at module level
const scenarioFiles = [
  'low_bottleneck_mix_analytics.json',
  'moderate_bottleneck_mix_analytics.json',
  'high_bottleneck_mix_analytics.json',
  'low_neutral_analytics.json',
  'moderate_neutral_analytics.json',
  'high_neutral_analytics.json'
];

const scenarios = {};
scenarioFiles.forEach(filename => {
  const filepath = path.join(process.cwd(), 'public/outputs/phase3_analytics', filename);
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  const scenarioName = filename.replace('_analytics.json', '');
  scenarios[scenarioName] = data;
});

describe('Executive View Integration with Real Datasets', () => {
  // All Scenarios - No NaN, Infinity, or Invalid Values
  // Test each scenario independently
  Object.entries(scenarios).forEach(([name, data]) => {
    it(`${name}: should generate valid executive summary`, () => {
          const summary = generateExecutiveSummary(data);
          
          expect(summary).toBeDefined();
          expect(summary.headline).toBeDefined();
          expect(summary.headline).not.toContain('NaN');
          expect(summary.headline).not.toContain('undefined');
          expect(summary.headline).not.toContain('[object Object]');
          
          expect(Number.isFinite(summary.facilitiesActive)).toBe(true);
          expect(Number.isFinite(summary.facilitiesEligible)).toBe(true);
          expect(Number.isFinite(summary.utilizationRate)).toBe(true);
          expect(summary.utilizationRate).toBeGreaterThanOrEqual(0);
          expect(summary.utilizationRate).toBeLessThanOrEqual(1);
      });

      it(`${name}: should detect valid primary bottleneck`, () => {
          const bottleneck = detectPrimaryBottleneck(data);
          
          expect(bottleneck).toBeDefined();
          expect(bottleneck.stage).toBeDefined();
          expect(typeof bottleneck.stage).toBe('string');
          expect(bottleneck.stage).not.toContain('[object');
          
          expect(Number.isFinite(bottleneck.conversionRate)).toBe(true);
          expect(bottleneck.conversionRate).toBeGreaterThanOrEqual(0);
          expect(bottleneck.conversionRate).toBeLessThanOrEqual(1);
          
          expect(Number.isFinite(bottleneck.facilitiesLost)).toBe(true);
          expect(bottleneck.facilitiesLost).toBeGreaterThanOrEqual(0);
          
          expect(['critical', 'high', 'moderate', 'low']).toContain(bottleneck.severity);
      });

      it(`${name}: should generate valid primary indicators`, () => {
          const indicators = getPrimaryIndicators(data);
          
          expect(indicators).toHaveLength(3);
          
          indicators.forEach((indicator, idx) => {
            expect(indicator.label).toBeDefined();
            expect(typeof indicator.label).toBe('string');
            
            expect(indicator.value).toBeDefined();
            expect(indicator.value).not.toContain('NaN');
            expect(indicator.value).not.toContain('undefined');
            expect(indicator.value).not.toContain('[object');
            
            expect(['good', 'moderate', 'poor']).toContain(indicator.status);
            
            expect(indicator.description).toBeDefined();
            expect(typeof indicator.description).toBe('string');
          });
      });

      it(`${name}: should generate valid bottleneck insight`, () => {
        const bottleneck = detectPrimaryBottleneck(data);
        const insight = getBottleneckInsight(bottleneck);
        
        expect(insight).toBeDefined();
        expect(insight.finding).toBeDefined();
        expect(typeof insight.finding).toBe('string');
        expect(insight.finding).not.toContain('[object');
        
        expect(insight.investigation).toBeDefined();
        expect(typeof insight.investigation).toBe('string');
        
        expect(insight.metric).toBeDefined();
        expect(insight.metric).toBeTypeOf('string');
      });

      it(`${name}: should generate valid investigation suggestion`, () => {
        const bottleneck = detectPrimaryBottleneck(data);
        const suggestion = generateInvestigationSuggestion(bottleneck, data);
        
        expect(suggestion).toBeDefined();
        expect(suggestion.action).toBeDefined();
        expect(typeof suggestion.action).toBe('string');
        
        expect(suggestion.context).toBeDefined();
        expect(typeof suggestion.context).toBe('string');
        expect(suggestion.context).not.toContain('NaN');
        expect(suggestion.context).not.toContain('[object');
    });
  });

  describe('Bottleneck Detection Logic Validation', () => {
    it('should identify lowest conversion rate stage', () => {
      const data = scenarios['moderate_bottleneck_mix'];
      const cascade = data.analytics.facilityParticipationCascade;
      
      // Calculate actual conversion rates
      const eligible = cascade.stage1_eligible.count;
      const accredited = cascade.stage2_accredited.count;
      const claiming = cascade.stage3_claiming.count;
      const receivingPayment = cascade.stage4_receiving_payment.count;
      
      const rates = {
        accreditation: accredited / eligible,
        claims: claiming / accredited,
        payment: receivingPayment / claiming
      };
      
      // Find actual minimum
      const minRate = Math.min(rates.accreditation, rates.claims, rates.payment);
      
      // Get detected bottleneck
      const bottleneck = detectPrimaryBottleneck(data);
      
      // Verify it matches the lowest rate
      expect(bottleneck.conversionRate).toBe(minRate);
    });

    it('should distinguish conversion rate from absolute drop', () => {
      const data = scenarios['moderate_bottleneck_mix'];
      const bottleneck = detectPrimaryBottleneck(data);
      
      // Bottleneck should be based on rate, not absolute count
      expect(bottleneck.conversionRate).toBeDefined();
      expect(bottleneck.facilitiesLost).toBeDefined();
      
      // These may not be correlated (lowest rate ≠ largest drop)
      expect(typeof bottleneck.conversionRate).toBe('number');
      expect(typeof bottleneck.facilitiesLost).toBe('number');
    });
  });

  describe('Severity Classification Consistency', () => {
    it('should classify severity based on conversion rate thresholds', () => {
      Object.values(scenarios).forEach(data => {
        const bottleneck = detectPrimaryBottleneck(data);
        
        // Verify severity matches rate thresholds
        if (bottleneck.conversionRate < 0.50) {
          expect(bottleneck.severity).toBe('critical');
        } else if (bottleneck.conversionRate < 0.70) {
          expect(bottleneck.severity).toBe('high');
        } else if (bottleneck.conversionRate < 0.85) {
          expect(bottleneck.severity).toBe('moderate');
        } else {
          expect(bottleneck.severity).toBe('low');
        }
      });
    });

    it('should match health status with overall utilization', () => {
      Object.values(scenarios).forEach(data => {
        const summary = generateExecutiveSummary(data);
        const rate = summary.utilizationRate;
        
        // Verify health classification matches thresholds
        if (rate >= 0.70) {
          expect(summary.overallHealth).toBe('healthy');
        } else if (rate >= 0.50) {
          expect(summary.overallHealth).toBe('moderate');
        } else if (rate >= 0.30) {
          expect(summary.overallHealth).toBe('concerning');
        } else {
          expect(summary.overallHealth).toBe('critical');
        }
      });
    });
  });

  describe('Zero Denominator Handling', () => {
    it('should handle zero eligible facilities', () => {
      const mockData = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: { count: 0 },
            stage2_accredited: { count: 0 },
            stage3_claiming: { count: 0 },
            stage4_receiving_payment: { count: 0 }
          }
        }
      };
      
      const summary = generateExecutiveSummary(mockData);
      expect(summary.headline).toBe('Data unavailable');
      expect(summary.utilizationRate).toBe(0);
      
      const indicators = getPrimaryIndicators(mockData);
      indicators.forEach(indicator => {
        expect(indicator.value).toBe('N/A');
      });
    });

    it('should handle zero accredited facilities', () => {
      const mockData = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: { count: 100 },
            stage2_accredited: { count: 0 },
            stage3_claiming: { count: 0 },
            stage4_receiving_payment: { count: 0 }
          }
        }
      };
      
      const indicators = getPrimaryIndicators(mockData);
      const claimsIndicator = indicators.find(i => i.label === 'Claims Activity');
      expect(claimsIndicator.value).toBe('N/A');
    });
  });

  describe('Language Accuracy', () => {
    it('should use evidence-appropriate language (not causal)', () => {
      Object.values(scenarios).forEach(data => {
        const bottleneck = detectPrimaryBottleneck(data);
        const insight = getBottleneckInsight(bottleneck);
        
        // Should say "drop-off" or "stage", not "is the barrier" or "is constraining"
        expect(insight.finding).toContain('drop-off');
        expect(insight.finding).not.toContain('is the barrier');
        expect(insight.finding).not.toContain('is constraining');
      });
    });
  });

  describe('Data Structure Compatibility', () => {
    it('should correctly access nested count properties', () => {
      const data = scenarios['moderate_bottleneck_mix'];
      const cascade = data.analytics.facilityParticipationCascade;
      
      // Verify data structure has nested objects with .count
      expect(cascade.stage1_eligible).toBeTypeOf('object');
      expect(cascade.stage1_eligible.count).toBeTypeOf('number');
      
      // Verify our extractors work
      const summary = generateExecutiveSummary(data);
      expect(summary.facilitiesEligible).toBe(cascade.stage1_eligible.count);
      expect(summary.facilitiesActive).toBe(cascade.stage4_receiving_payment.count);
    });
  });
});
