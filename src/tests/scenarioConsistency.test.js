/**
 * Scenario Consistency Tests
 * 
 * Ensures that dashboard, verification scripts, and tests use consistent
 * scenario sources and that neutral vs bottleneck_mix profiles are not
 * silently interchanged.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Scenario Consistency Tests', () => {
  describe('Authoritative Dataset Verification', () => {
    it('should confirm dashboard uses bottleneck_mix scenarios', () => {
      // Read App.jsx source
      const appPath = path.resolve(process.cwd(), 'src/App.jsx');
      const appSource = fs.readFileSync(appPath, 'utf-8');
      
      // Verify it loads bottleneck_mix analytics
      expect(appSource).toContain('bottleneck_mix_analytics.json');
      expect(appSource).not.toContain('neutral_analytics.json');
    });

    it('should confirm verification script uses bottleneck_mix scenarios', () => {
      // Read verifyReconciliation.js source
      const scriptPath = path.resolve(process.cwd(), 'scripts/verifyReconciliation.js');
      const scriptSource = fs.readFileSync(scriptPath, 'utf-8');
      
      // Verify it uses bottleneck_mix profile
      expect(scriptSource).toContain("profile = 'bottleneck_mix'");
    });

    it('should confirm test recommendation script uses bottleneck_mix scenarios', () => {
      // Read testRecommendations.js source
      const scriptPath = path.resolve(process.cwd(), 'scripts/testRecommendations.js');
      const scriptSource = fs.readFileSync(scriptPath, 'utf-8');
      
      // Verify it uses bottleneck_mix scenarios
      expect(scriptSource).toContain('bottleneck_mix');
      expect(scriptSource).not.toContain("scenarios = ['low_neutral'");
    });

    it('should confirm analytical integrity tests use bottleneck_mix scenarios', () => {
      // Read analyticalIntegrity.test.js source
      const testPath = path.resolve(process.cwd(), 'src/tests/analyticalIntegrity.test.js');
      const testSource = fs.readFileSync(testPath, 'utf-8');
      
      // Verify it uses bottleneck_mix scenarios
      expect(testSource).toContain('high_bottleneck_mix_analytics.json');
      expect(testSource).toContain('moderate_bottleneck_mix_analytics.json');
      expect(testSource).toContain('low_bottleneck_mix_analytics.json');
    });

    it('should confirm reimbursement tests use bottleneck_mix for real data tests', () => {
      // Read reimbursementRules.test.js source
      const testPath = path.resolve(process.cwd(), 'src/tests/reimbursementRules.test.js');
      const testSource = fs.readFileSync(testPath, 'utf-8');
      
      // Verify real Phase 3 analytics tests use bottleneck_mix
      expect(testSource).toContain('high_bottleneck_mix_analytics.json');
    });
  });

  describe('Bottleneck Mix vs Neutral Profile Distinction', () => {
    it('should have different disbursement rates between profiles', () => {
      // Load HIGH bottleneck_mix (should have poor disbursement)
      const bottleneckPath = path.resolve(process.cwd(), 'outputs/phase3_analytics/high_bottleneck_mix_analytics.json');
      const bottleneckData = JSON.parse(fs.readFileSync(bottleneckPath, 'utf-8'));
      const bottleneckDisbursement = parseFloat(bottleneckData.analytics.financialCalculations.approvalToDisbursementRatio.ratio);
      
      // Load HIGH neutral (should have better disbursement)
      const neutralPath = path.resolve(process.cwd(), 'outputs/phase3_analytics/high_neutral_analytics.json');
      const neutralData = JSON.parse(fs.readFileSync(neutralPath, 'utf-8'));
      const neutralDisbursement = parseFloat(neutralData.analytics.financialCalculations.approvalToDisbursementRatio.ratio);
      
      // Bottleneck should have lower disbursement than neutral
      expect(bottleneckDisbursement).toBeLessThan(neutralDisbursement);
      
      // Bottleneck should be below 60% (critical threshold)
      expect(bottleneckDisbursement).toBeLessThan(60);
      
      // Neutral should be above 80% (strong performance threshold)
      expect(neutralDisbursement).toBeGreaterThan(80);
    });

    it('should have different accreditation counts between profiles', () => {
      // Load HIGH bottleneck_mix
      const bottleneckPath = path.resolve(process.cwd(), 'outputs/phase3_analytics/high_bottleneck_mix_analytics.json');
      const bottleneckData = JSON.parse(fs.readFileSync(bottleneckPath, 'utf-8'));
      const bottleneckAccredited = bottleneckData.analytics.facilityParticipationCascade.stage2_accredited.count;
      
      // Load HIGH neutral
      const neutralPath = path.resolve(process.cwd(), 'outputs/phase3_analytics/high_neutral_analytics.json');
      const neutralData = JSON.parse(fs.readFileSync(neutralPath, 'utf-8'));
      const neutralAccredited = neutralData.analytics.facilityParticipationCascade.stage2_accredited.count;
      
      // Should have different accreditation counts
      expect(bottleneckAccredited).not.toBe(neutralAccredited);
    });

    it('should have HIGH bottleneck_mix with 514 accredited facilities', () => {
      // This confirms the authoritative HIGH bottleneck_mix data
      const analyticsPath = path.resolve(process.cwd(), 'outputs/phase3_analytics/high_bottleneck_mix_analytics.json');
      const analytics = JSON.parse(fs.readFileSync(analyticsPath, 'utf-8'));
      
      const accredited = analytics.analytics.facilityParticipationCascade.stage2_accredited.count;
      expect(accredited).toBe(514);
    });

    it('should have HIGH bottleneck_mix with 51.3% disbursement', () => {
      // This confirms the authoritative HIGH bottleneck_mix disbursement rate
      const analyticsPath = path.resolve(process.cwd(), 'outputs/phase3_analytics/high_bottleneck_mix_analytics.json');
      const analytics = JSON.parse(fs.readFileSync(analyticsPath, 'utf-8'));
      
      const disbursementRatio = analytics.analytics.financialCalculations.approvalToDisbursementRatio.ratio;
      expect(disbursementRatio).toBe('51.3%');
    });

    it('should have HIGH bottleneck_mix with ₱14,746,459 approved', () => {
      // This confirms the authoritative HIGH bottleneck_mix approved amount
      const analyticsPath = path.resolve(process.cwd(), 'outputs/phase3_analytics/high_bottleneck_mix_analytics.json');
      const analytics = JSON.parse(fs.readFileSync(analyticsPath, 'utf-8'));
      
      const approved = analytics.analytics.financialCalculations.totalApproved.amount;
      expect(approved).toBe(14746459);
    });

    it('should have HIGH bottleneck_mix with ₱7,187,365 outstanding', () => {
      // This confirms the authoritative HIGH bottleneck_mix outstanding amount
      const analyticsPath = path.resolve(process.cwd(), 'outputs/phase3_analytics/high_bottleneck_mix_analytics.json');
      const analytics = JSON.parse(fs.readFileSync(analyticsPath, 'utf-8'));
      
      const outstanding = analytics.analytics.financialCalculations.totalOutstanding.amount;
      expect(outstanding).toBe(7187365);
    });
  });

  describe('File Checksum Verification', () => {
    it('should confirm HIGH bottleneck_mix file exists and is distinct', () => {
      const bottleneckPath = path.resolve(process.cwd(), 'outputs/phase3_analytics/high_bottleneck_mix_analytics.json');
      const neutralPath = path.resolve(process.cwd(), 'outputs/phase3_analytics/high_neutral_analytics.json');
      
      // Both files should exist
      expect(fs.existsSync(bottleneckPath)).toBe(true);
      expect(fs.existsSync(neutralPath)).toBe(true);
      
      // Files should have different content
      const bottleneckContent = fs.readFileSync(bottleneckPath, 'utf-8');
      const neutralContent = fs.readFileSync(neutralPath, 'utf-8');
      expect(bottleneckContent).not.toBe(neutralContent);
    });
  });
});
