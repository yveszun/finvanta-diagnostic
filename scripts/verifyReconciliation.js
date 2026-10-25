/**
 * Data Reconciliation Verification Script
 * 
 * Verifies that regional sums match national totals for all three scenarios
 * Part of Phase 4 Correction: Requirement 1 - Reconcile all synthetic analytics data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scenarios = ['low', 'moderate', 'high'];
const profile = 'bottleneck_mix';

console.log('='.repeat(80));
console.log('PHASE 4 CORRECTION: DATA RECONCILIATION VERIFICATION');
console.log('='.repeat(80));
console.log();

let allPass = true;
const results = [];

scenarios.forEach(scenario => {
  const filename = `${scenario}_${profile}_analytics.json`;
  const filepath = path.resolve(__dirname, '../outputs/phase3_analytics', filename);
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`SCENARIO: ${scenario.toUpperCase()}`);
  console.log(`${'='.repeat(80)}`);
  
  if (!fs.existsSync(filepath)) {
    console.error(`❌ FILE NOT FOUND: ${filename}`);
    allPass = false;
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  const analytics = data.analytics;
  
  // Extract national totals
  const nationalFacilities = analytics.facilityParticipationCascade.stage1_eligible.count;
  const nationalAccredited = analytics.facilityParticipationCascade.stage2_accredited.count;
  const nationalFiling = analytics.facilityParticipationCascade.stage3_claiming.count;
  const nationalPayment = analytics.facilityParticipationCascade.stage4_receiving_payment.count;
  const nationalClaims = analytics.claimsProcessingCascade.stage1_submitted.count;
  
  // Calculate regional sums
  const regions = analytics.regionalComparisons.byRegion;
  let regionalFacilities = 0;
  let regionalAccredited = 0;
  let regionalClaims = 0;
  
  Object.values(regions).forEach(region => {
    regionalFacilities += region.facilities;
    regionalAccredited += region.accredited;
    regionalClaims += region.claims;
  });
  
  // Check reconciliation
  const facilitiesMatch = regionalFacilities === nationalFacilities;
  const accreditedMatch = regionalAccredited === nationalAccredited;
  const claimsMatch = regionalClaims === nationalClaims;
  
  // Display results
  console.log(`\n1. TOTAL FACILITIES:`);
  console.log(`   National: ${nationalFacilities.toLocaleString()}`);
  console.log(`   Regional Sum: ${regionalFacilities.toLocaleString()}`);
  console.log(`   ${facilitiesMatch ? '✅ MATCH' : '❌ MISMATCH'}`);
  if (!facilitiesMatch) {
    console.log(`   Difference: ${regionalFacilities - nationalFacilities}`);
  }
  
  console.log(`\n2. ACCREDITED FACILITIES:`);
  console.log(`   National: ${nationalAccredited.toLocaleString()}`);
  console.log(`   Regional Sum: ${regionalAccredited.toLocaleString()}`);
  console.log(`   ${accreditedMatch ? '✅ MATCH' : '❌ MISMATCH'}`);
  if (!accreditedMatch) {
    console.log(`   Difference: ${regionalAccredited - nationalAccredited}`);
  }
  
  console.log(`\n3. FILING FACILITIES:`);
  console.log(`   National: ${nationalFiling.toLocaleString()}`);
  console.log(`   Regional: NOT AVAILABLE IN PHASE 3 REGIONAL DATA`);
  console.log(`   ℹ️  Phase 3 regional data only provides facilities and accredited counts`);
  
  console.log(`\n4. PAYMENT-RECEIVING FACILITIES:`);
  console.log(`   National: ${nationalPayment.toLocaleString()}`);
  console.log(`   Regional: NOT AVAILABLE IN PHASE 3 REGIONAL DATA`);
  console.log(`   ℹ️  Phase 3 regional data only provides facilities and accredited counts`);
  
  console.log(`\n5. SUBMITTED CLAIMS:`);
  console.log(`   National: ${nationalClaims.toLocaleString()}`);
  console.log(`   Regional Sum: ${regionalClaims.toLocaleString()}`);
  console.log(`   ${claimsMatch ? '✅ MATCH' : '❌ MISMATCH'}`);
  if (!claimsMatch) {
    console.log(`   Difference: ${regionalClaims - nationalClaims}`);
  }
  
  // Regional breakdown
  console.log(`\n6. REGIONAL BREAKDOWN (${Object.keys(regions).length} regions):`);
  Object.entries(regions).forEach(([name, metrics]) => {
    console.log(`   ${name}: ${metrics.facilities} facilities, ${metrics.accredited} accredited, ${metrics.claims} claims`);
  });
  
  const scenarioPass = facilitiesMatch && accreditedMatch && claimsMatch;
  if (!scenarioPass) {
    allPass = false;
  }
  
  results.push({
    scenario,
    facilities: { national: nationalFacilities, regional: regionalFacilities, match: facilitiesMatch },
    accredited: { national: nationalAccredited, regional: regionalAccredited, match: accreditedMatch },
    claims: { national: nationalClaims, regional: regionalClaims, match: claimsMatch },
    pass: scenarioPass
  });
  
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`SCENARIO RESULT: ${scenarioPass ? '✅ PASS' : '❌ FAIL'}`);
});

// Summary
console.log(`\n${'='.repeat(80)}`);
console.log('RECONCILIATION SUMMARY');
console.log(`${'='.repeat(80)}`);
console.log();

results.forEach(result => {
  console.log(`${result.scenario.toUpperCase().padEnd(10)} ${result.pass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Facilities: ${result.facilities.match ? '✅' : '❌'} (National: ${result.facilities.national}, Regional: ${result.facilities.regional})`);
  console.log(`  Accredited: ${result.accredited.match ? '✅' : '❌'} (National: ${result.accredited.national}, Regional: ${result.accredited.regional})`);
  console.log(`  Claims:     ${result.claims.match ? '✅' : '❌'} (National: ${result.claims.national}, Regional: ${result.claims.regional})`);
  console.log();
});

console.log(`${'='.repeat(80)}`);
console.log(`OVERALL RESULT: ${allPass ? '✅ ALL SCENARIOS PASS' : '❌ SOME SCENARIOS FAIL'}`);
console.log(`${'='.repeat(80)}`);

process.exit(allPass ? 0 : 1);
