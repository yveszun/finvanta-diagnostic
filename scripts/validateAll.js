/**
 * Validation Script - Validate all scenarios and generate reports
 */

import { DataValidator } from '../src/validation/dataValidator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const scenarios = ['low_neutral', 'moderate_neutral', 'high_neutral'];

// Load benefit config for eligibility validation
const configPath = path.join(projectRoot, 'public/config/benefitConfig.json');
const benefitConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

console.log('═══════════════════════════════════════════════════════════');
console.log('FINVANTA HEALTH - DATA VALIDATION');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

scenarios.forEach(scenario => {
  console.log(`\n${'='.repeat(63)}`);
  console.log(`SCENARIO: ${scenario.toUpperCase()}`);
  console.log('='.repeat(63));
  
  // Load data
  const dataDir = path.join(projectRoot, 'public/data', scenario);
  const facilities = JSON.parse(fs.readFileSync(path.join(dataDir, 'facilities.json'), 'utf-8'));
  const accreditations = JSON.parse(fs.readFileSync(path.join(dataDir, 'accreditations.json'), 'utf-8'));
  const claims = JSON.parse(fs.readFileSync(path.join(dataDir, 'claims.json'), 'utf-8'));
  
  // Validate with eligibility config
  const validator = new DataValidator({ eligibility: benefitConfig.eligibility });
  const results = validator.validate(facilities, accreditations, claims);
  
  // Generate and display report
  const report = validator.formatReport(results);
  console.log(report);
  
  // Save report to file
  const reportPath = path.join(dataDir, 'validation_report.txt');
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`\n✓ Report saved to: ${reportPath}`);
});

console.log('\n\n' + '='.repeat(63));
console.log('VALIDATION COMPLETE');
console.log('='.repeat(63));
console.log('');
console.log('All validation reports saved to respective scenario directories.');
console.log('Check public/data/{scenario}/validation_report.txt for details.');
console.log('');
