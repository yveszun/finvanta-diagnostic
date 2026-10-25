/**
 * Quick script to test valid claim structure
 */
import { DataValidator } from '../src/validation/dataValidator.js';

const validator = new DataValidator();

const facilities = [{ 
  facility_id: 'FAC001', 
  facility_name: 'Test Facility',
  facility_type: 'hospital',
  facility_level: 2,
  region: 'NCR',
  province: 'Metro Manila'
}];

const accreditations = [{
  accreditation_id: 'ACC001',
  facility_id: 'FAC001',
  accreditation_date: '2025-01-15',
  services_covered: ['PSYCH_CONSULT_GEN']
}];

const claims = [
  {
    claim_id: 'CLM001',
    facility_id: 'FAC001',
    patient_id: 'PAT001',
    status: 'paid',
    service_date: '2025-06-01',
    service_type: 'general',
    service_code: 'PSYCH_CONSULT_GEN',
    billed_amount: 10000,
    submission_date: '2025-06-01',
    acceptance_date: '2025-06-02',
    adjudication_date: '2025-06-10',
    approval_date: '2025-06-10',
    approved_amount: 8500,
    payment_date: '2025-06-20',
    disbursed_amount: 8500,
    outstanding_balance: 0,
    payment_status: 'paid_full',
    denial_reason: null,
    days_since_approval: null,
    analysis_cutoff_date: '2025-07-15T00:00:00.000Z'
  },
  {
    claim_id: 'CLM002',
    facility_id: 'FAC001',
    patient_id: 'PAT002',
    status: 'pending_acceptance',
    service_date: '2025-06-15',
    service_type: 'general',
    service_code: 'PSYCH_CONSULT_GEN',
    billed_amount: 10000,
    submission_date: '2025-06-15',
    acceptance_date: null,
    adjudication_date: null,
    approval_date: null,
    approved_amount: null,
    payment_date: null,
    disbursed_amount: null,
    outstanding_balance: null,
    payment_status: 'not_applicable',
    denial_reason: null,
    days_pending: 30,
    days_since_approval: null,
    analysis_cutoff_date: '2025-07-15T00:00:00.000Z'
  }
];

const results = validator.validate(facilities, accreditations, claims);

console.log('Valid:', results.valid);
console.log('Errors:', results.errors.length);

if (!results.valid) {
  results.errors.forEach((error, idx) => {
    console.log(`\n--- Error ${idx + 1} ---`);
    console.log('Code:', error.code);
    console.log('Message:', error.message);
    if (error.details && error.details.length > 0) {
      console.log('Details:', JSON.stringify(error.details.slice(0, 5), null, 2));
    }
  });
}
