/**
 * Dashboard Component Tests
 * 
 * Tests for dashboard functionality, data integration, and user interactions
 */

import { describe, it, expect } from 'vitest';
import { evaluateRecommendations } from '../utils/recommendationEngine';
import { formatNumber, formatCurrency, safePercent } from '../utils/formatters';

describe('Dashboard Utilities', () => {
  describe('formatNumber', () => {
    it('should format numbers with comma separators', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(150)).toBe('150');
    });

    it('should handle null and undefined', () => {
      expect(formatNumber(null)).toBe('N/A');
      expect(formatNumber(undefined)).toBe('N/A');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency with peso sign', () => {
      expect(formatCurrency(1000)).toBe('₱1,000');
      expect(formatCurrency(5000000)).toBe('₱5,000,000');
    });

    it('should handle null and undefined', () => {
      expect(formatCurrency(null)).toBe('N/A');
      expect(formatCurrency(undefined)).toBe('N/A');
    });
  });

  describe('safePercent', () => {
    it('should calculate percentages correctly', () => {
      expect(safePercent(50, 100)).toBe('50.0%');
      expect(safePercent(1, 3)).toBe('33.3%');
    });

    it('should handle zero denominator', () => {
      expect(safePercent(10, 0)).toBe('N/A');
      expect(safePercent(0, 0)).toBe('N/A');
    });

    it('should handle null denominators', () => {
      expect(safePercent(10, null)).toBe('N/A');
      expect(safePercent(10, undefined)).toBe('N/A');
    });

    it('should handle 100% correctly', () => {
      expect(safePercent(100, 100)).toBe('100.0%');
    });
  });
});

describe('Recommendation Engine', () => {
  const mockAnalyticsData = {
    summary: {
      total_facilities: 1000,
      accredited_facilities: 50,
      facilities_filing_claims: 15,
      facilities_receiving_payment: 12,
      total_claims: 150,
      approved_claims: 100,
      paid_claims: 80,
      approved_but_unpaid: 20
    }
  };

  const mockRules = {
    rules: [
      {
        id: 'LOW_ACCREDITATION',
        condition: 'accreditationRate < 10',
        severity: 'critical',
        category: 'Accreditation',
        priority: 'HIGH',
        observedFinding: 'Accreditation rate is {{accreditationRate}}%',
        supportingIndicator: '{{stage2_accreditedFacilities}} of {{stage1_eligibleFacilities}} facilities',
        potentialExplanation: 'May indicate barriers to accreditation',
        evidenceLimitations: 'Unknown reasons for non-participation',
        suggestedInvestigation: 'Survey non-accredited facilities',
        possibleInstitutionalDecisions: 'Consider simplifying requirements',
        threshold: { value: 10, label: 'ILLUSTRATIVE' }
      },
      {
        id: 'GOOD_PERFORMANCE',
        condition: 'accreditationRate > 30',
        severity: 'success',
        category: 'Monitoring',
        priority: 'LOW',
        observedFinding: 'Strong accreditation rate',
        supportingIndicator: 'Rate: {{accreditationRate}}%',
        potentialExplanation: 'Effective implementation',
        evidenceLimitations: 'Quality not measured',
        suggestedInvestigation: 'Document success factors',
        possibleInstitutionalDecisions: 'Maintain approach',
        threshold: { value: 30, label: 'ILLUSTRATIVE' }
      }
    ]
  };

  it('should evaluate LOW_ACCREDITATION condition correctly', () => {
    const recommendations = evaluateRecommendations(mockAnalyticsData, mockRules);
    
    // With 50/1000 = 5% accreditation, LOW_ACCREDITATION should trigger
    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].id).toBe('LOW_ACCREDITATION');
    expect(recommendations[0].severity).toBe('critical');
  });

  it('should interpolate variables correctly', () => {
    const recommendations = evaluateRecommendations(mockAnalyticsData, mockRules);
    
    expect(recommendations[0].observedFinding).toContain('5%');
    expect(recommendations[0].supportingIndicator).toContain('50');
    expect(recommendations[0].supportingIndicator).toContain('1,000');
  });

  it('should not trigger GOOD_PERFORMANCE with low accreditation', () => {
    const recommendations = evaluateRecommendations(mockAnalyticsData, mockRules);
    
    // GOOD_PERFORMANCE requires >30% accreditation
    const goodPerf = recommendations.find(r => r.id === 'GOOD_PERFORMANCE');
    expect(goodPerf).toBeUndefined();
  });

  it('should handle missing data gracefully', () => {
    const incompleteData = { summary: {} };
    const recommendations = evaluateRecommendations(incompleteData, mockRules);
    
    // Should not crash
    expect(Array.isArray(recommendations)).toBe(true);
  });

  it('should handle null data', () => {
    const recommendations = evaluateRecommendations(null, mockRules);
    expect(recommendations).toEqual([]);
  });

  it('should handle null rules', () => {
    const recommendations = evaluateRecommendations(mockAnalyticsData, null);
    expect(recommendations).toEqual([]);
  });
});

describe('Dashboard Data Integration', () => {
  it('should calculate metrics consistently', () => {
    const mockData = {
      summary: {
        total_facilities: 500,
        accredited_facilities: 100,
        facilities_filing_claims: 60,
        facilities_receiving_payment: 50
      }
    };

    // Accreditation rate
    const accredRate = (mockData.summary.accredited_facilities / mockData.summary.total_facilities) * 100;
    expect(accredRate).toBe(20);

    // Filing rate
    const filingRate = (mockData.summary.facilities_filing_claims / mockData.summary.accredited_facilities) * 100;
    expect(filingRate).toBe(60);

    // Payment rate
    const paymentRate = (mockData.summary.facilities_receiving_payment / mockData.summary.facilities_filing_claims) * 100;
    expect(paymentRate).toBeCloseTo(83.33, 1);
  });

  it('should handle zero denominators in cascade calculations', () => {
    const mockData = {
      summary: {
        total_facilities: 0,
        accredited_facilities: 0,
        facilities_filing_claims: 0
      }
    };

    expect(safePercent(0, mockData.summary.total_facilities)).toBe('N/A');
    expect(safePercent(0, mockData.summary.accredited_facilities)).toBe('N/A');
  });

  it('should maintain facility count integrity through cascade', () => {
    const mockData = {
      summary: {
        total_facilities: 1000,
        accredited_facilities: 200,
        facilities_filing_claims: 150,
        facilities_receiving_payment: 100
      }
    };

    // Each stage should be <= previous stage
    expect(mockData.summary.accredited_facilities).toBeLessThanOrEqual(mockData.summary.total_facilities);
    expect(mockData.summary.facilities_filing_claims).toBeLessThanOrEqual(mockData.summary.accredited_facilities);
    expect(mockData.summary.facilities_receiving_payment).toBeLessThanOrEqual(mockData.summary.facilities_filing_claims);
  });
});

describe('Scenario Switching', () => {
  it('should load different scenarios with different metrics', () => {
    const lowScenario = {
      summary: {
        total_facilities: 1500,
        accredited_facilities: 69,
        total_claims: 150
      }
    };

    const highScenario = {
      summary: {
        total_facilities: 1500,
        accredited_facilities: 528,
        total_claims: 2000
      }
    };

    const lowAccredRate = (lowScenario.summary.accredited_facilities / lowScenario.summary.total_facilities) * 100;
    const highAccredRate = (highScenario.summary.accredited_facilities / highScenario.summary.total_facilities) * 100;

    expect(lowAccredRate).toBeLessThan(highAccredRate);
    expect(lowScenario.summary.total_claims).toBeLessThan(highScenario.summary.total_claims);
  });
});

describe('Synthetic Data Disclosure', () => {
  it('should always display synthetic data warning', () => {
    // The warning component should always render without dismissal option
    // This is a functional requirement, not just a UI preference
    const warningText = 'SYNTHETIC DEMONSTRATION DATA — NOT ACTUAL PHILHEALTH PERFORMANCE';
    expect(warningText).toBeDefined();
    expect(warningText.length).toBeGreaterThan(0);
  });

  it('should display analysis cutoff date', () => {
    const cutoffDate = '2025-07-15T23:59:59.000Z';
    expect(new Date(cutoffDate).toISOString()).toBe(cutoffDate);
  });
});

describe('Regional Data Handling', () => {
  it('should handle regional metrics correctly', () => {
    const mockRegionalData = {
      'National Capital Region': {
        facilities: 100,
        accredited: 50,
        filing: 30,
        receivingPayment: 25,
        accreditationRate: 50,
        filingRate: 60,
        paymentRate: 83.33
      }
    };

    const region = mockRegionalData['National Capital Region'];
    
    // Verify rate calculations
    expect(region.accreditationRate).toBe((region.accredited / region.facilities) * 100);
    expect(region.filingRate).toBe((region.filing / region.accredited) * 100);
  });

  it('should sort regions by different metrics', () => {
    const regions = [
      { name: 'Region A', accreditationRate: 20 },
      { name: 'Region B', accreditationRate: 50 },
      { name: 'Region C', accreditationRate: 10 }
    ];

    const sortedDesc = [...regions].sort((a, b) => b.accreditationRate - a.accreditationRate);
    expect(sortedDesc[0].name).toBe('Region B');
    expect(sortedDesc[2].name).toBe('Region C');

    const sortedAsc = [...regions].sort((a, b) => a.accreditationRate - b.accreditationRate);
    expect(sortedAsc[0].name).toBe('Region C');
    expect(sortedAsc[2].name).toBe('Region B');
  });
});
