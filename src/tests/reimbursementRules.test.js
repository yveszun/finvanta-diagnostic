/**
 * Phase 4 Audit Correction: Reimbursement Rules Regression Tests
 * 
 * Tests for:
 * - Zero-disbursement handling
 * - Critical reimbursement bottleneck detection
 * - Moderate reimbursement delay detection
 * - Strong-performance suppression
 * - Partially paid claims detection
 * - Facilities without payment detection
 * - Missing or undefined financial metrics
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { evaluateRecommendations } from '../utils/recommendationEngine';
import fs from 'fs';
import path from 'path';

describe('Reimbursement Rules Regression Tests', () => {
  let recommendationRules;

  beforeAll(() => {
    const rulesPath = path.resolve(process.cwd(), 'public/config/recommendationRules.json');
    recommendationRules = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));
  });

  describe('Zero Disbursement Handling', () => {
    it('should handle approved > 0 and disbursed = 0 (0% ratio)', () => {
      const mockData = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: { count: 100 },
            stage2_accredited: { count: 50 },
            stage3_claiming: { count: 30 },
            stage4_receiving_payment: { count: 0 } // No payment
          },
          claimsProcessingCascade: {
            stage1_submitted: { count: 100 },
            stage3_adjudicated: { count: 100 },
            stage4_approved: { count: 90 },
            stage5_paid: { count: 0 }, // No paid claims
            breakdown: {
              approvedUnpaid: { count: 90 },
              partiallyPaid: { count: 0 }
            }
          },
          financialCalculations: {
            totalApproved: { amount: 1000000 },
            totalDisbursed: { amount: 0 }, // Zero disbursement
            totalOutstanding: { amount: 1000000, percentage: '100.0%' },
            approvalToDisbursementRatio: { ratio: '0.0%' }
          }
        }
      };

      const recommendations = evaluateRecommendations(mockData, recommendationRules);
      
      // Should trigger CRITICAL_REIMBURSEMENT_BOTTLENECK (0% < 60%)
      const bottleneck = recommendations.find(r => r.id === 'CRITICAL_REIMBURSEMENT_BOTTLENECK');
      expect(bottleneck, 'Should detect critical bottleneck with 0% disbursement').toBeDefined();
      expect(bottleneck.observedFinding).toContain('0');
      expect(bottleneck.observedFinding).toContain('%');
    });

    it('should handle approved = 0 (undefined ratio, no rule trigger)', () => {
      const mockData = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: { count: 100 },
            stage2_accredited: { count: 50 },
            stage3_claiming: { count: 0 }, // No claims
            stage4_receiving_payment: { count: 0 }
          },
          claimsProcessingCascade: {
            stage1_submitted: { count: 0 },
            stage3_adjudicated: { count: 0 },
            stage4_approved: { count: 0 }, // No approved claims
            stage5_paid: { count: 0 },
            breakdown: {
              approvedUnpaid: { count: 0 },
              partiallyPaid: { count: 0 }
            }
          },
          financialCalculations: {
            totalApproved: { amount: 0 },
            totalDisbursed: { amount: 0 },
            totalOutstanding: { amount: 0 }
            // No ratio when both are zero
          }
        }
      };

      const recommendations = evaluateRecommendations(mockData, recommendationRules);
      
      // Should NOT trigger reimbursement bottleneck (undefined ratio, condition fails)
      const bottleneck = recommendations.find(r => r.id === 'CRITICAL_REIMBURSEMENT_BOTTLENECK');
      expect(bottleneck, 'Should not trigger bottleneck when approved=0').toBeUndefined();
    });

    it('should handle missing financial values (not silently converted to zero)', () => {
      const mockData = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: { count: 100 },
            stage2_accredited: { count: 50 },
            stage3_claiming: { count: 30 },
            stage4_receiving_payment: { count: 20 }
          },
          claimsProcessingCascade: {
            stage1_submitted: { count: 100 },
            stage3_adjudicated: { count: 100 },
            stage4_approved: { count: 90 },
            stage5_paid: { count: 80 },
            breakdown: {
              approvedUnpaid: { count: 10 },
              partiallyPaid: { count: 5 }
            }
          }
          // Missing financialCalculations entirely
        }
      };

      const recommendations = evaluateRecommendations(mockData, recommendationRules);
      
      // Should not crash, should return recommendations based on available metrics
      expect(recommendations).toBeInstanceOf(Array);
    });
  });

  describe('Critical Reimbursement Bottleneck Detection', () => {
    it('should trigger when disbursement < 60%', () => {
      const mockData = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: { count: 100 },
            stage2_accredited: { count: 50 },
            stage3_claiming: { count: 40 },
            stage4_receiving_payment: { count: 35 }
          },
          claimsProcessingCascade: {
            stage1_submitted: { count: 200 },
            stage3_adjudicated: { count: 190 },
            stage4_approved: { count: 180 },
            stage5_paid: { count: 150 },
            breakdown: {
              approvedUnpaid: { count: 30 },
              partiallyPaid: { count: 20 }
            }
          },
          financialCalculations: {
            totalApproved: { amount: 10000000 },
            totalDisbursed: { amount: 5500000 }, // 55% < 60%
            totalOutstanding: { amount: 4500000, percentage: '45.0%' },
            approvalToDisbursementRatio: { ratio: '55.0%' }
          }
        }
      };

      const recommendations = evaluateRecommendations(mockData, recommendationRules);
      
      const bottleneck = recommendations.find(r => r.id === 'CRITICAL_REIMBURSEMENT_BOTTLENECK');
      expect(bottleneck, 'Should detect critical bottleneck at 55%').toBeDefined();
      expect(bottleneck.severity).toBe('critical');
      expect(bottleneck.observedFinding).toContain('55');
      expect(bottleneck.observedFinding).toContain('%');
    });

    it('should NOT trigger when disbursement >= 60%', () => {
      const mockData = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: { count: 100 },
            stage2_accredited: { count: 50 },
            stage3_claiming: { count: 40 },
            stage4_receiving_payment: { count: 38 }
          },
          claimsProcessingCascade: {
            stage1_submitted: { count: 200 },
            stage3_adjudicated: { count: 190 },
            stage4_approved: { count: 180 },
            stage5_paid: { count: 165 },
            breakdown: {
              approvedUnpaid: { count: 15 },
              partiallyPaid: { count: 10 }
            }
          },
          financialCalculations: {
            totalApproved: { amount: 10000000 },
            totalDisbursed: { amount: 6500000 }, // 65% >= 60%
            totalOutstanding: { amount: 3500000, percentage: '35.0%' },
            approvalToDisbursementRatio: { ratio: '65.0%' }
          }
        }
      };

      const recommendations = evaluateRecommendations(mockData, recommendationRules);
      
      const bottleneck = recommendations.find(r => r.id === 'CRITICAL_REIMBURSEMENT_BOTTLENECK');
      expect(bottleneck, 'Should not trigger critical bottleneck at 65%').toBeUndefined();
    });
  });

  describe('Moderate Reimbursement Delay Detection', () => {
    it('should trigger when 60% <= disbursement <= 80%', () => {
      const mockData = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: { count: 100 },
            stage2_accredited: { count: 50 },
            stage3_claiming: { count: 40 },
            stage4_receiving_payment: { count: 38 }
          },
          claimsProcessingCascade: {
            stage1_submitted: { count: 200 },
            stage3_adjudicated: { count: 190 },
            stage4_approved: { count: 180 },
            stage5_paid: { count: 165 },
            breakdown: {
              approvedUnpaid: { count: 15 },
              partiallyPaid: { count: 10 }
            }
          },
          financialCalculations: {
            totalApproved: { amount: 10000000 },
            totalDisbursed: { amount: 7000000 }, // 70%
            totalOutstanding: { amount: 3000000, percentage: '30.0%' },
            approvalToDisbursementRatio: { ratio: '70.0%' }
          }
        }
      };

      const recommendations = evaluateRecommendations(mockData, recommendationRules);
      
      const delay = recommendations.find(r => r.id === 'MODERATE_REIMBURSEMENT_DELAY');
      expect(delay, 'Should detect moderate delay at 70%').toBeDefined();
      expect(delay.severity).toBe('medium');
    });

    it('should NOT trigger when disbursement > 80%', () => {
      const mockData = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: { count: 100 },
            stage2_accredited: { count: 50 },
            stage3_claiming: { count: 40 },
            stage4_receiving_payment: { count: 39 }
          },
          claimsProcessingCascade: {
            stage1_submitted: { count: 200 },
            stage3_adjudicated: { count: 190 },
            stage4_approved: { count: 180 },
            stage5_paid: { count: 175 },
            breakdown: {
              approvedUnpaid: { count: 5 },
              partiallyPaid: { count: 3 }
            }
          },
          financialCalculations: {
            totalApproved: { amount: 10000000 },
            totalDisbursed: { amount: 8500000 }, // 85% > 80%
            totalOutstanding: { amount: 1500000, percentage: '15.0%' },
            approvalToDisbursementRatio: { ratio: '85.0%' }
          }
        }
      };

      const recommendations = evaluateRecommendations(mockData, recommendationRules);
      
      const delay = recommendations.find(r => r.id === 'MODERATE_REIMBURSEMENT_DELAY');
      expect(delay, 'Should not trigger moderate delay at 85%').toBeUndefined();
    });
  });

  describe('Strong Performance Suppression', () => {
    it('should NOT trigger strong performance when disbursement < 80%', () => {
      const mockData = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: { count: 100 },
            stage2_accredited: { count: 40 }, // >30%
            stage3_claiming: { count: 30 }, // 75% filing rate >60%
            stage4_receiving_payment: { count: 28 }
          },
          claimsProcessingCascade: {
            stage1_submitted: { count: 200 },
            stage3_adjudicated: { count: 190 },
            stage4_approved: { count: 180 }, // 94.7% approval rate >90%
            stage5_paid: { count: 165 },
            breakdown: {
              approvedUnpaid: { count: 15 },
              partiallyPaid: { count: 10 }
            }
          },
          financialCalculations: {
            totalApproved: { amount: 10000000 },
            totalDisbursed: { amount: 7000000 }, // 70% < 80% - SHOULD SUPPRESS
            totalOutstanding: { amount: 3000000, percentage: '30.0%' },
            approvalToDisbursementRatio: { ratio: '70.0%' }
          }
        }
      };

      const recommendations = evaluateRecommendations(mockData, recommendationRules);
      
      const strongPerf = recommendations.find(r => r.id === 'STRONG_PERFORMANCE');
      expect(strongPerf, 'Should NOT show strong performance with 70% disbursement').toBeUndefined();
    });

    it('should trigger strong performance when all conditions met including disbursement > 80%', () => {
      const mockData = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: { count: 100 },
            stage2_accredited: { count: 40 }, // 40% >30%
            stage3_claiming: { count: 30 }, // 75% filing rate >60%
            stage4_receiving_payment: { count: 29 }
          },
          claimsProcessingCascade: {
            stage1_submitted: { count: 200 },
            stage3_adjudicated: { count: 190 },
            stage4_approved: { count: 180 }, // 94.7% approval rate >90%
            stage5_paid: { count: 175 },
            breakdown: {
              approvedUnpaid: { count: 5 },
              partiallyPaid: { count: 3 }
            }
          },
          financialCalculations: {
            totalApproved: { amount: 10000000 },
            totalDisbursed: { amount: 8500000 }, // 85% > 80% - OK
            totalOutstanding: { amount: 1500000, percentage: '15.0%' },
            approvalToDisbursementRatio: { ratio: '85.0%' }
          }
        }
      };

      const recommendations = evaluateRecommendations(mockData, recommendationRules);
      
      const strongPerf = recommendations.find(r => r.id === 'STRONG_PERFORMANCE');
      expect(strongPerf, 'Should show strong performance when all conditions met').toBeDefined();
    });
  });

  describe('Partially Paid Claims Detection', () => {
    it('should trigger when partially paid claims > 30', () => {
      const mockData = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: { count: 100 },
            stage2_accredited: { count: 50 },
            stage3_claiming: { count: 40 },
            stage4_receiving_payment: { count: 38 }
          },
          claimsProcessingCascade: {
            stage1_submitted: { count: 200 },
            stage3_adjudicated: { count: 190 },
            stage4_approved: { count: 180 },
            stage5_paid: { count: 165 },
            breakdown: {
              approvedUnpaid: { count: 15 },
              partiallyPaid: { count: 35 } // > 30
            }
          },
          financialCalculations: {
            totalApproved: { amount: 10000000 },
            totalDisbursed: { amount: 8500000 },
            totalOutstanding: { amount: 1500000 },
            approvalToDisbursementRatio: { ratio: '85.0%' }
          }
        }
      };

      const recommendations = evaluateRecommendations(mockData, recommendationRules);
      
      const partialPaid = recommendations.find(r => r.id === 'HIGH_PARTIALLY_PAID_CLAIMS');
      expect(partialPaid, 'Should detect high partially paid claims').toBeDefined();
      expect(partialPaid.observedFinding).toContain('35');
    });

    it('should NOT trigger when partially paid claims <= 30', () => {
      const mockData = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: { count: 100 },
            stage2_accredited: { count: 50 },
            stage3_claiming: { count: 40 },
            stage4_receiving_payment: { count: 38 }
          },
          claimsProcessingCascade: {
            stage1_submitted: { count: 200 },
            stage3_adjudicated: { count: 190 },
            stage4_approved: { count: 180 },
            stage5_paid: { count: 165 },
            breakdown: {
              approvedUnpaid: { count: 15 },
              partiallyPaid: { count: 25 } // <= 30
            }
          },
          financialCalculations: {
            totalApproved: { amount: 10000000 },
            totalDisbursed: { amount: 8500000 },
            totalOutstanding: { amount: 1500000 },
            approvalToDisbursementRatio: { ratio: '85.0%' }
          }
        }
      };

      const recommendations = evaluateRecommendations(mockData, recommendationRules);
      
      const partialPaid = recommendations.find(r => r.id === 'HIGH_PARTIALLY_PAID_CLAIMS');
      expect(partialPaid, 'Should not trigger with 25 partially paid claims').toBeUndefined();
    });
  });

  describe('Facilities Without Payment Detection', () => {
    it('should trigger when facilities with claims but no payment > 50', () => {
      const mockData = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: { count: 500 },
            stage2_accredited: { count: 200 },
            stage3_claiming: { count: 120 },
            stage4_receiving_payment: { count: 65 } // 120-65 = 55 > 50
          },
          claimsProcessingCascade: {
            stage1_submitted: { count: 600 },
            stage3_adjudicated: { count: 580 },
            stage4_approved: { count: 550 },
            stage5_paid: { count: 500 },
            breakdown: {
              approvedUnpaid: { count: 50 },
              partiallyPaid: { count: 20 }
            }
          },
          financialCalculations: {
            totalApproved: { amount: 20000000 },
            totalDisbursed: { amount: 18000000 },
            totalOutstanding: { amount: 2000000 },
            approvalToDisbursementRatio: { ratio: '90.0%' }
          }
        }
      };

      const recommendations = evaluateRecommendations(mockData, recommendationRules);
      
      const noPayment = recommendations.find(r => r.id === 'FACILITIES_NOT_RECEIVING_PAYMENT');
      expect(noPayment, 'Should detect facilities not receiving payment').toBeDefined();
      expect(noPayment.observedFinding).toContain('55');
    });

    it('should NOT trigger when facilities with claims but no payment <= 50', () => {
      const mockData = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: { count: 500 },
            stage2_accredited: { count: 200 },
            stage3_claiming: { count: 100 },
            stage4_receiving_payment: { count: 55 } // 100-55 = 45 <= 50
          },
          claimsProcessingCascade: {
            stage1_submitted: { count: 600 },
            stage3_adjudicated: { count: 580 },
            stage4_approved: { count: 550 },
            stage5_paid: { count: 520 },
            breakdown: {
              approvedUnpaid: { count: 30 },
              partiallyPaid: { count: 15 }
            }
          },
          financialCalculations: {
            totalApproved: { amount: 20000000 },
            totalDisbursed: { amount: 18500000 },
            totalOutstanding: { amount: 1500000 },
            approvalToDisbursementRatio: { ratio: '92.5%' }
          }
        }
      };

      const recommendations = evaluateRecommendations(mockData, recommendationRules);
      
      const noPayment = recommendations.find(r => r.id === 'FACILITIES_NOT_RECEIVING_PAYMENT');
      expect(noPayment, 'Should not trigger with 45 facilities').toBeUndefined();
    });
  });

  describe('Missing or Undefined Metrics', () => {
    it('should handle missing financialCalculations gracefully', () => {
      const mockData = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: { count: 100 },
            stage2_accredited: { count: 50 },
            stage3_claiming: { count: 40 },
            stage4_receiving_payment: { count: 35 }
          },
          claimsProcessingCascade: {
            stage1_submitted: { count: 200 },
            stage3_adjudicated: { count: 190 },
            stage4_approved: { count: 180 },
            stage5_paid: { count: 165 },
            breakdown: {
              approvedUnpaid: { count: 15 },
              partiallyPaid: { count: 10 }
            }
          }
          // Missing financialCalculations
        }
      };

      const recommendations = evaluateRecommendations(mockData, recommendationRules);
      
      // Should not crash
      expect(recommendations).toBeInstanceOf(Array);
      
      // Should not trigger financial rules when data is missing
      const bottleneck = recommendations.find(r => r.id === 'CRITICAL_REIMBURSEMENT_BOTTLENECK');
      expect(bottleneck, 'Should not trigger when financial data missing').toBeUndefined();
    });

    it('should handle null values in financial amounts', () => {
      const mockData = {
        analytics: {
          facilityParticipationCascade: {
            stage1_eligible: { count: 100 },
            stage2_accredited: { count: 50 },
            stage3_claiming: { count: 40 },
            stage4_receiving_payment: { count: 35 }
          },
          claimsProcessingCascade: {
            stage1_submitted: { count: 200 },
            stage3_adjudicated: { count: 190 },
            stage4_approved: { count: 180 },
            stage5_paid: { count: 165 },
            breakdown: {
              approvedUnpaid: { count: 15 },
              partiallyPaid: { count: 10 }
            }
          },
          financialCalculations: {
            totalApproved: { amount: null },
            totalDisbursed: { amount: null },
            totalOutstanding: { amount: null }
          }
        }
      };

      const recommendations = evaluateRecommendations(mockData, recommendationRules);
      
      // Should not crash
      expect(recommendations).toBeInstanceOf(Array);
    });
  });

  describe('Real Phase 3 Analytics Integration', () => {
    it('should work with actual HIGH scenario analytics', async () => {
      // Load actual Phase 3 analytics
      const analyticsPath = path.resolve(process.cwd(), 'outputs/phase3_analytics/high_neutral_analytics.json');
      const analytics = JSON.parse(fs.readFileSync(analyticsPath, 'utf-8'));

      const recommendations = evaluateRecommendations(analytics, recommendationRules);
      
      // Should generate recommendations
      expect(recommendations).toBeInstanceOf(Array);
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Should have valid recommendation structure
      recommendations.forEach(rec => {
        expect(rec.id).toBeDefined();
        expect(rec.severity).toBeDefined();
        expect(rec.observedFinding).toBeDefined();
        expect(rec.supportingIndicator).toBeDefined();
      });
    });
  });
});
