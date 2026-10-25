/**
 * Audit script to verify cutoff enforcement across all datasets
 * Phase 3 V3.2 - Comprehensive cutoff validation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Analysis cutoff date (must match configuration)
const ANALYSIS_CUTOFF = new Date('2025-07-15T23:59:59Z');

function auditDataset(scenario) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`AUDITING: ${scenario.toUpperCase()}`);
  console.log('='.repeat(60));

  const dataPath = path.join(__dirname, '..', 'public', 'data', `${scenario}_bottleneck_mix`);
  
  // Load claims
  const claimsPath = path.join(dataPath, 'claims.json');
  if (!fs.existsSync(claimsPath)) {
    console.error(`❌ Claims file not found: ${claimsPath}`);
    return;
  }

  const claims = JSON.parse(fs.readFileSync(claimsPath, 'utf8'));
  console.log(`\nTotal claims: ${claims.length}`);

  // Issue tracking
  const issues = {
    submissionAfterCutoff: [],
    acceptanceAfterCutoff: [],
    adjudicationAfterCutoff: [],
    approvalAfterCutoff: [],
    paymentAfterCutoff: [],
    missingCutoffDate: [],
    inconsistentCutoffDate: [],
    invalidDaysPending: [],
    invalidDaysSinceApproval: [],
    chronologyViolations: []
  };

  // Status counts
  const statusCounts = {};
  
  // Track cutoff dates found
  const cutoffDates = new Set();

  claims.forEach((claim, idx) => {
    // Count statuses
    statusCounts[claim.status] = (statusCounts[claim.status] || 0) + 1;

    // Check analysis_cutoff_date
    if (!claim.analysis_cutoff_date) {
      issues.missingCutoffDate.push({
        claim_id: claim.claim_id,
        status: claim.status
      });
    } else {
      cutoffDates.add(claim.analysis_cutoff_date);
    }

    // Parse dates
    const submissionDate = claim.submission_date ? new Date(claim.submission_date) : null;
    const acceptanceDate = claim.acceptance_date ? new Date(claim.acceptance_date) : null;
    const adjudicationDate = claim.adjudication_date ? new Date(claim.adjudication_date) : null;
    const approvalDate = claim.approval_date ? new Date(claim.approval_date) : null;
    const paymentDate = claim.payment_date ? new Date(claim.payment_date) : null;

    // Check each stage against cutoff
    if (submissionDate && submissionDate > ANALYSIS_CUTOFF) {
      issues.submissionAfterCutoff.push({
        claim_id: claim.claim_id,
        submission_date: claim.submission_date,
        status: claim.status
      });
    }

    if (acceptanceDate && acceptanceDate > ANALYSIS_CUTOFF) {
      issues.acceptanceAfterCutoff.push({
        claim_id: claim.claim_id,
        acceptance_date: claim.acceptance_date,
        status: claim.status
      });
    }

    if (adjudicationDate && adjudicationDate > ANALYSIS_CUTOFF) {
      issues.adjudicationAfterCutoff.push({
        claim_id: claim.claim_id,
        adjudication_date: claim.adjudication_date,
        status: claim.status
      });
    }

    if (approvalDate && approvalDate > ANALYSIS_CUTOFF) {
      issues.approvalAfterCutoff.push({
        claim_id: claim.claim_id,
        approval_date: claim.approval_date,
        status: claim.status
      });
    }

    if (paymentDate && paymentDate > ANALYSIS_CUTOFF) {
      issues.paymentAfterCutoff.push({
        claim_id: claim.claim_id,
        payment_date: claim.payment_date,
        status: claim.status
      });
    }

    // Chronology checks
    if (acceptanceDate && submissionDate && acceptanceDate < submissionDate) {
      issues.chronologyViolations.push({
        claim_id: claim.claim_id,
        violation: 'acceptance before submission',
        submission_date: claim.submission_date,
        acceptance_date: claim.acceptance_date
      });
    }

    if (adjudicationDate && acceptanceDate && adjudicationDate < acceptanceDate) {
      issues.chronologyViolations.push({
        claim_id: claim.claim_id,
        violation: 'adjudication before acceptance',
        acceptance_date: claim.acceptance_date,
        adjudication_date: claim.adjudication_date
      });
    }

    if (approvalDate && adjudicationDate && approvalDate < adjudicationDate) {
      issues.chronologyViolations.push({
        claim_id: claim.claim_id,
        violation: 'approval before adjudication',
        adjudication_date: claim.adjudication_date,
        approval_date: claim.approval_date
      });
    }

    if (paymentDate && approvalDate && paymentDate < approvalDate) {
      issues.chronologyViolations.push({
        claim_id: claim.claim_id,
        violation: 'payment before approval',
        approval_date: claim.approval_date,
        payment_date: claim.payment_date
      });
    }

    // Validate days_pending
    if (claim.days_pending !== undefined && claim.days_pending !== null) {
      if (claim.status === 'pending_acceptance') {
        if (submissionDate) {
          const expectedDays = Math.floor((ANALYSIS_CUTOFF - submissionDate) / (1000 * 60 * 60 * 24));
          if (Math.abs(claim.days_pending - expectedDays) > 1) {
            issues.invalidDaysPending.push({
              claim_id: claim.claim_id,
              status: claim.status,
              days_pending: claim.days_pending,
              expected: expectedDays
            });
          }
        }
      } else if (claim.status === 'pending_adjudication') {
        if (acceptanceDate) {
          const expectedDays = Math.floor((ANALYSIS_CUTOFF - acceptanceDate) / (1000 * 60 * 60 * 24));
          if (Math.abs(claim.days_pending - expectedDays) > 1) {
            issues.invalidDaysPending.push({
              claim_id: claim.claim_id,
              status: claim.status,
              days_pending: claim.days_pending,
              expected: expectedDays
            });
          }
        }
      }
    }

    // Validate days_since_approval
    if (claim.days_since_approval !== undefined && claim.days_since_approval !== null) {
      if (claim.status === 'approved' && approvalDate) {
        const expectedDays = Math.floor((ANALYSIS_CUTOFF - approvalDate) / (1000 * 60 * 60 * 24));
        if (Math.abs(claim.days_since_approval - expectedDays) > 1) {
          issues.invalidDaysSinceApproval.push({
            claim_id: claim.claim_id,
            days_since_approval: claim.days_since_approval,
            expected: expectedDays
          });
        }
      }
    }
  });

  // Check for inconsistent cutoff dates
  if (cutoffDates.size > 1) {
    console.error(`\n❌ INCONSISTENT CUTOFF DATES: Found ${cutoffDates.size} different dates`);
    cutoffDates.forEach(date => console.error(`   - ${date}`));
  } else if (cutoffDates.size === 1) {
    const cutoffDate = Array.from(cutoffDates)[0];
    if (cutoffDate !== '2025-07-15T23:59:59.000Z') {
      console.error(`\n⚠️  WARNING: Cutoff date is ${cutoffDate}, expected 2025-07-15T23:59:59.000Z`);
    } else {
      console.log(`\n✅ Cutoff date consistent: ${cutoffDate}`);
    }
  }

  // Report status distribution
  console.log('\n--- Status Distribution ---');
  Object.keys(statusCounts).sort().forEach(status => {
    console.log(`${status}: ${statusCounts[status]}`);
  });

  // Report issues
  let totalIssues = 0;
  
  console.log('\n--- Cutoff Violations ---');
  
  if (issues.submissionAfterCutoff.length > 0) {
    console.error(`❌ Submissions after cutoff: ${issues.submissionAfterCutoff.length}`);
    issues.submissionAfterCutoff.forEach(issue => {
      console.error(`   ${issue.claim_id}: ${issue.submission_date} (${issue.status})`);
    });
    totalIssues += issues.submissionAfterCutoff.length;
  } else {
    console.log('✅ No submissions after cutoff');
  }

  if (issues.acceptanceAfterCutoff.length > 0) {
    console.error(`❌ Acceptances after cutoff: ${issues.acceptanceAfterCutoff.length}`);
    issues.acceptanceAfterCutoff.forEach(issue => {
      console.error(`   ${issue.claim_id}: ${issue.acceptance_date} (${issue.status})`);
    });
    totalIssues += issues.acceptanceAfterCutoff.length;
  } else {
    console.log('✅ No acceptances after cutoff');
  }

  if (issues.adjudicationAfterCutoff.length > 0) {
    console.error(`❌ Adjudications after cutoff: ${issues.adjudicationAfterCutoff.length}`);
    issues.adjudicationAfterCutoff.forEach(issue => {
      console.error(`   ${issue.claim_id}: ${issue.adjudication_date} (${issue.status})`);
    });
    totalIssues += issues.adjudicationAfterCutoff.length;
  } else {
    console.log('✅ No adjudications after cutoff');
  }

  if (issues.approvalAfterCutoff.length > 0) {
    console.error(`❌ Approvals after cutoff: ${issues.approvalAfterCutoff.length}`);
    issues.approvalAfterCutoff.forEach(issue => {
      console.error(`   ${issue.claim_id}: ${issue.approval_date} (${issue.status})`);
    });
    totalIssues += issues.approvalAfterCutoff.length;
  } else {
    console.log('✅ No approvals after cutoff');
  }

  if (issues.paymentAfterCutoff.length > 0) {
    console.error(`❌ Payments after cutoff: ${issues.paymentAfterCutoff.length}`);
    issues.paymentAfterCutoff.forEach(issue => {
      console.error(`   ${issue.claim_id}: ${issue.payment_date} (${issue.status})`);
    });
    totalIssues += issues.paymentAfterCutoff.length;
  } else {
    console.log('✅ No payments after cutoff');
  }

  console.log('\n--- Data Completeness ---');
  
  if (issues.missingCutoffDate.length > 0) {
    console.error(`❌ Missing cutoff date: ${issues.missingCutoffDate.length} claims`);
    issues.missingCutoffDate.slice(0, 5).forEach(issue => {
      console.error(`   ${issue.claim_id} (${issue.status})`);
    });
    if (issues.missingCutoffDate.length > 5) {
      console.error(`   ... and ${issues.missingCutoffDate.length - 5} more`);
    }
    totalIssues += issues.missingCutoffDate.length;
  } else {
    console.log('✅ All claims have cutoff date');
  }

  console.log('\n--- Temporal Field Validation ---');
  
  if (issues.invalidDaysPending.length > 0) {
    console.error(`❌ Invalid days_pending: ${issues.invalidDaysPending.length}`);
    issues.invalidDaysPending.slice(0, 3).forEach(issue => {
      console.error(`   ${issue.claim_id} (${issue.status}): ${issue.days_pending} (expected ${issue.expected})`);
    });
    totalIssues += issues.invalidDaysPending.length;
  } else {
    console.log('✅ All days_pending values valid');
  }

  if (issues.invalidDaysSinceApproval.length > 0) {
    console.error(`❌ Invalid days_since_approval: ${issues.invalidDaysSinceApproval.length}`);
    issues.invalidDaysSinceApproval.slice(0, 3).forEach(issue => {
      console.error(`   ${issue.claim_id}: ${issue.days_since_approval} (expected ${issue.expected})`);
    });
    totalIssues += issues.invalidDaysSinceApproval.length;
  } else {
    console.log('✅ All days_since_approval values valid');
  }

  console.log('\n--- Chronology Validation ---');
  
  if (issues.chronologyViolations.length > 0) {
    console.error(`❌ Chronology violations: ${issues.chronologyViolations.length}`);
    issues.chronologyViolations.slice(0, 3).forEach(issue => {
      console.error(`   ${issue.claim_id}: ${issue.violation}`);
    });
    totalIssues += issues.chronologyViolations.length;
  } else {
    console.log('✅ No chronology violations');
  }

  console.log(`\n${'='.repeat(60)}`);
  if (totalIssues === 0) {
    console.log(`✅ PASSED: ${scenario.toUpperCase()} - No issues found`);
  } else {
    console.error(`❌ FAILED: ${scenario.toUpperCase()} - ${totalIssues} total issues`);
  }
  console.log('='.repeat(60));

  return { scenario, totalIssues, issues, statusCounts };
}

// Main execution
console.log('\n' + '█'.repeat(60));
console.log('PHASE 3 V3.2 - CUTOFF ENFORCEMENT AUDIT');
console.log('█'.repeat(60));

const scenarios = ['low', 'moderate', 'high'];
const results = scenarios.map(scenario => auditDataset(scenario));

// Summary
console.log('\n\n' + '█'.repeat(60));
console.log('AUDIT SUMMARY');
console.log('█'.repeat(60));

let allPassed = true;
results.forEach(result => {
  if (result.totalIssues === 0) {
    console.log(`✅ ${result.scenario.toUpperCase()}: PASSED`);
  } else {
    console.error(`❌ ${result.scenario.toUpperCase()}: FAILED (${result.totalIssues} issues)`);
    allPassed = false;
  }
});

console.log('\n' + '█'.repeat(60));
if (allPassed) {
  console.log('✅ ALL DATASETS PASSED AUDIT');
  process.exit(0);
} else {
  console.error('❌ AUDIT FAILED - Issues must be corrected');
  process.exit(1);
}
