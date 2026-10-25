#!/usr/bin/env node

/**
 * Generate Analytics Outputs for Phase 3
 * 
 * Runs analytical calculations on all three scenarios:
 * - Low Activity Scenario (baseline_low_activity)
 * - Moderate Activity Scenario (baseline_moderate_activity)
 * - High Activity Scenario (baseline_high_activity)
 * 
 * Outputs:
 * - Facility Participation Cascade
 * - Claims Processing Cascade
 * - Financial Metrics
 * - Service-Specific Analysis
 * - Regional Comparisons
 * - Validation Status Check
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DataValidator } from '../src/validation/dataValidator.js';
import { AnalyticsEngine } from '../src/analytics/analyticsEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Scenarios to process
const scenarios = [
  { name: 'Low Activity', directory: 'low_neutral' },
  { name: 'Moderate Activity', directory: 'moderate_neutral' },
  { name: 'High Activity', directory: 'high_neutral' }
];

// Output directory
const outputDir = path.join(__dirname, '../outputs/phase3_analytics');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Format numbers with thousands separator
 */
function formatNumber(num) {
  if (num === null || num === undefined) return 'N/A';
  if (typeof num === 'string') return num;
  return num.toLocaleString('en-PH');
}

/**
 * Format currency (PHP)
 */
function formatCurrency(amount) {
  if (amount === null || amount === undefined) return 'N/A';
  if (typeof amount === 'string') return amount;
  return `PHP ${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format percentage
 */
function formatPercentage(rate) {
  if (rate === null || rate === undefined) return 'N/A';
  if (typeof rate === 'string') return rate;
  return `${(rate * 100).toFixed(1)}%`;
}

/**
 * Format days
 */
function formatDays(days) {
  if (days === null || days === undefined) return 'N/A';
  if (typeof days === 'string') return days;
  return `${days.toFixed(1)} days`;
}

/**
 * Generate markdown report for a scenario
 */
function generateReport(scenarioName, analytics, validationResults) {
  const lines = [];
  
  lines.push(`# Phase 3 Analytics Report: ${scenarioName}`);
  lines.push('');
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // Validation Status
  lines.push('## Validation Status');
  lines.push('');
  lines.push(`- **Valid:** ${validationResults.valid ? 'Yes' : 'No'}`);
  lines.push(`- **Has Blocking Errors:** ${validationResults.hasBlockingErrors ? 'Yes' : 'No'}`);
  lines.push(`- **Errors:** ${validationResults.errors.length}`);
  lines.push(`- **Warnings:** ${validationResults.warnings.length}`);
  lines.push('');
  
  if (analytics.error) {
    lines.push('## Analytics Calculation Error');
    lines.push('');
    lines.push(`**Error:** ${analytics.error}`);
    lines.push('');
    lines.push('Analytics calculations were blocked due to validation errors.');
    return lines.join('\n');
  }
  
  // Facility Participation Cascade
  lines.push('## Facility Participation Cascade');
  lines.push('');
  const cascade = analytics.facilityParticipationCascade;
  lines.push('This cascade shows distinct facilities at each stage:');
  lines.push('');
  lines.push('| Stage | Count | Rate |');
  lines.push('|-------|-------|------|');
  lines.push(`| Eligible Population | ${formatNumber(cascade.stage1_eligible.count)} | - |`);
  lines.push(`| Accredited | ${formatNumber(cascade.stage2_accredited.count)} | ${cascade.stage2_accredited.rate} |`);
  lines.push(`| Submitted Claims | ${formatNumber(cascade.stage3_claiming.count)} | ${cascade.stage3_claiming.rate} |`);
  lines.push(`| Receiving Payment | ${formatNumber(cascade.stage4_receiving_payment.count)} | ${cascade.stage4_receiving_payment.rate} |`);
  lines.push('');
  lines.push('**Note:** Each facility is counted only once, regardless of multiple claims or accreditations.');
  lines.push('');
  
  // Claims Processing Cascade
  lines.push('## Claims Processing Cascade');
  lines.push('');
  const claims = analytics.claimsProcessingCascade;
  lines.push('This cascade shows claim counts (not facility counts) at each stage:');
  lines.push('');
  lines.push('| Stage | Count | Rate |');
  lines.push('|-------|-------|------|');
  lines.push(`| Submitted | ${formatNumber(claims.stage1_submitted.count)} | - |`);
  lines.push(`| Accepted | ${formatNumber(claims.stage2_accepted.count)} | ${claims.stage2_accepted.rate} |`);
  lines.push(`| Adjudicated | ${formatNumber(claims.stage3_adjudicated.count)} | ${claims.stage3_adjudicated.rate} |`);
  lines.push(`| Approved | ${formatNumber(claims.stage4_approved.count)} | ${claims.stage4_approved.rate} |`);
  lines.push(`| Paid | ${formatNumber(claims.stage5_paid.count)} | ${claims.stage5_paid.rate} |`);
  lines.push('');
  
  lines.push('### Payment Breakdown');
  lines.push('');
  lines.push('| Category | Count | Percentage |');
  lines.push('|----------|-------|------------|');
  lines.push(`| Fully Paid | ${formatNumber(claims.breakdown.fullyPaid.count)} | ${claims.breakdown.fullyPaid.percentage} |`);
  lines.push(`| Partially Paid | ${formatNumber(claims.breakdown.partiallyPaid.count)} | ${claims.breakdown.partiallyPaid.percentage} |`);
  lines.push(`| Approved but Unpaid | ${formatNumber(claims.breakdown.approvedUnpaid.count)} | ${claims.breakdown.approvedUnpaid.percentage} |`);
  lines.push(`| Denied | ${formatNumber(claims.breakdown.denied.count)} | ${claims.breakdown.denied.percentage} |`);
  lines.push('');
  lines.push('**Note:** Approval ≠ Payment. Claims may be approved but remain unpaid.');
  lines.push('');
  
  // Financial Metrics
  lines.push('## Financial Metrics');
  lines.push('');
  const financial = analytics.financialCalculations;
  lines.push('| Metric | Amount |');
  lines.push('|--------|--------|');
  lines.push(`| Total Billed | ${financial.totalBilled.formatted} |`);
  lines.push(`| Total Approved | ${financial.totalApproved.formatted} (${financial.totalApproved.percentage} of billed) |`);
  lines.push(`| Total Disbursed | ${financial.totalDisbursed.formatted} (${financial.totalDisbursed.percentage} of approved) |`);
  lines.push(`| Outstanding (Approved - Disbursed) | ${financial.totalOutstanding.formatted} |`);
  lines.push('');
  
  lines.push('### Approval-to-Disbursement Ratio');
  lines.push('');
  lines.push(`**${financial.approvalToDisbursementRatio.ratio}** of approved amounts have been disbursed.`);
  lines.push('');
  
  lines.push('### Payment Processing Time');
  lines.push('');
  lines.push(`- **Average:** ${financial.paymentProcessingTime.average}`);
  lines.push(`- **Median:** ${financial.paymentProcessingTime.median}`);
  lines.push(`- **Sample Size:** ${formatNumber(financial.paymentProcessingTime.sampleSize)} claims`);
  lines.push(`- **Claims with Missing Dates:** ${formatNumber(financial.paymentProcessingTime.missingDates)}`);
  lines.push('');
  lines.push('**Note:** Claims with missing dates excluded from time calculations.');
  lines.push('');
  
  lines.push('### Reconciliation Check');
  lines.push('');
  lines.push(`**Status:** ${financial.reconciliation.reconciles ? '✓ Balanced' : '✗ Imbalanced'}`);
  lines.push('');
  if (!financial.reconciliation.reconciles) {
    lines.push(`**Discrepancy:** ${formatCurrency(financial.reconciliation.difference)}`);
    lines.push('');
  }
  
  // Service-Specific Analysis
  lines.push('## Service-Specific Analysis');
  lines.push('');
  const serviceSpecific = analytics.serviceSpecificAnalysis;
  
  lines.push('### General Mental Health Services');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| Accredited Facilities | ${formatNumber(serviceSpecific.general.accreditedFacilities)} |`);
  lines.push(`| Claims Submitted | ${formatNumber(serviceSpecific.general.claims)} |`);
  lines.push(`| Total Billed | ${serviceSpecific.general.financial.billed} |`);
  lines.push(`| Total Approved | ${serviceSpecific.general.financial.approved} |`);
  lines.push(`| Total Disbursed | ${serviceSpecific.general.financial.disbursed} |`);
  lines.push('');
  
  lines.push('### Specialty Mental Health Services');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| Accredited Facilities | ${formatNumber(serviceSpecific.specialty.accreditedFacilities)} |`);
  lines.push(`| Claims Submitted | ${formatNumber(serviceSpecific.specialty.claims)} |`);
  lines.push(`| Total Billed | ${serviceSpecific.specialty.financial.billed} |`);
  lines.push(`| Total Approved | ${serviceSpecific.specialty.financial.approved} |`);
  lines.push(`| Total Disbursed | ${serviceSpecific.specialty.financial.disbursed} |`);
  lines.push('');
  lines.push(`**Note:** ${serviceSpecific.overallAccreditation.note}`);
  lines.push('');
  
  // Regional Comparisons
  lines.push('## Regional Comparisons');
  lines.push('');
  lines.push('**⚠️ SIMULATED DATA:** Regional patterns are synthetically generated for illustrative purposes only. Do not interpret as real geographic disparities.');
  lines.push('');
  
  const regional = analytics.regionalComparisons;
  const regions = Object.keys(regional.byRegion).sort();
  
  lines.push('| Region | Facilities | Accredited | Claims | Total Billed | Total Approved |');
  lines.push('|--------|------------|------------|--------|--------------|----------------|');
  
  regions.forEach(region => {
    const data = regional.byRegion[region];
    lines.push(`| ${region} | ${formatNumber(data.facilities)} | ${formatNumber(data.accredited)} (${data.accreditationRate}) | ${formatNumber(data.claims)} | ${data.financial.billed} | ${data.financial.approved} |`);
  });
  
  lines.push('');
  lines.push('**Disclaimer:** Regional patterns are synthetically generated for illustrative purposes only.');
  lines.push('');
  
  // Metadata and Disclaimers
  lines.push('## Metadata');
  lines.push('');
  lines.push(`- **Analysis Timestamp:** ${analytics.metadata.timestamp}`);
  lines.push(`- **Validation Errors:** ${analytics.metadata.validation.errors}`);
  lines.push(`- **Validation Warnings:** ${analytics.metadata.validation.warnings}`);
  lines.push('');
  
  lines.push('## Disclaimers');
  lines.push('');
  lines.push(`1. ${analytics.metadata.disclaimer}`);
  lines.push('2. Regional patterns are simulated and do not reflect actual geographic disparities');
  lines.push('3. Payment processing times are synthetically generated for illustrative purposes');
  lines.push('');
  
  // Known Limitations
  lines.push('## Known Limitations');
  lines.push('');
  lines.push('1. **Synthetic Data:** All data is synthetically generated for diagnostic purposes');
  lines.push('2. **Simulated Regional Patterns:** Geographic patterns do not reflect real PhilHealth data');
  lines.push('3. **Illustrative Time Calculations:** Payment processing times are simulated');
  lines.push('4. **No Real-World Validation:** Results have not been compared against actual PhilHealth records');
  lines.push('5. **Configuration-Dependent:** Eligibility validation requires configuration (warning issued if missing)');
  lines.push('');
  
  lines.push('---');
  lines.push('');
  lines.push('*End of Report*');
  
  return lines.join('\n');
}

/**
 * Main execution
 */
function main() {
  console.log('Phase 3 Analytics Generation');
  console.log('============================\n');
  
  const validator = new DataValidator();
  
  scenarios.forEach(scenario => {
    console.log(`Processing: ${scenario.name}`);
    
    // Load data from separate files
    const dataDir = path.join(__dirname, '../public/data', scenario.directory);
    if (!fs.existsSync(dataDir)) {
      console.log(`  ✗ Directory not found: ${scenario.directory}`);
      console.log('');
      return;
    }
    
    const facilitiesPath = path.join(dataDir, 'facilities.json');
    const accreditationsPath = path.join(dataDir, 'accreditations.json');
    const claimsPath = path.join(dataDir, 'claims.json');
    
    if (!fs.existsSync(facilitiesPath) || !fs.existsSync(accreditationsPath) || !fs.existsSync(claimsPath)) {
      console.log(`  ✗ Missing required data files in ${scenario.directory}`);
      console.log('');
      return;
    }
    
    const facilities = JSON.parse(fs.readFileSync(facilitiesPath, 'utf8'));
    const accreditations = JSON.parse(fs.readFileSync(accreditationsPath, 'utf8'));
    const claims = JSON.parse(fs.readFileSync(claimsPath, 'utf8'));
    
    const data = { facilities, accreditations, claims };
    console.log(`  ✓ Data loaded: ${facilities.length} facilities, ${claims.length} claims`);
    
    // Validate data
    const validationResults = validator.validate(
      data.facilities,
      data.accreditations,
      data.claims
    );
    console.log(`  ✓ Validation complete: ${validationResults.valid ? 'VALID' : 'INVALID'}`);
    
    // Run analytics
    const engine = new AnalyticsEngine(validationResults);
    const analytics = engine.analyze(data.facilities, data.accreditations, data.claims);
    
    if (analytics.error) {
      console.log(`  ✗ Analytics blocked: ${analytics.error}`);
    } else {
      console.log(`  ✓ Analytics complete`);
    }
    
    // Generate report
    const report = generateReport(scenario.name, analytics, validationResults);
    const reportFilename = `${scenario.directory}_analytics.md`;
    const reportPath = path.join(outputDir, reportFilename);
    fs.writeFileSync(reportPath, report);
    console.log(`  ✓ Report saved: ${reportFilename}`);
    
    // Save JSON output
    const jsonOutput = {
      scenario: scenario.name,
      timestamp: new Date().toISOString(),
      validationResults: {
        valid: validationResults.valid,
        hasBlockingErrors: validationResults.hasBlockingErrors,
        errorCount: validationResults.errors.length,
        warningCount: validationResults.warnings.length
      },
      analytics
    };
    
    const jsonFilename = `${scenario.directory}_analytics.json`;
    const jsonPath = path.join(outputDir, jsonFilename);
    fs.writeFileSync(jsonPath, JSON.stringify(jsonOutput, null, 2));
    console.log(`  ✓ JSON saved: ${jsonFilename}`);
    console.log('');
  });
  
  console.log('============================');
  console.log('Analytics generation complete!');
  console.log(`\nOutputs saved to: ${outputDir}`);
}

// Run
main();
