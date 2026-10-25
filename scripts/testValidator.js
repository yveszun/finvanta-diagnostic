/**
 * Quick script to check what validation errors exist
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DataValidator } from '../src/validation/dataValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, '..', 'public', 'data', 'moderate_neutral');

const facilities = JSON.parse(fs.readFileSync(path.join(dataPath, 'facilities.json'), 'utf8'));
const accreditations = JSON.parse(fs.readFileSync(path.join(dataPath, 'accreditations.json'), 'utf8'));
const claims = JSON.parse(fs.readFileSync(path.join(dataPath, 'claims.json'), 'utf8'));

const validator = new DataValidator();
const results = validator.validate(facilities, accreditations, claims);

console.log('Valid:', results.valid);
console.log('Errors:', results.errors.length);

if (!results.valid) {
  results.errors.forEach((error, idx) => {
    console.log(`\n--- Error ${idx + 1} ---`);
    console.log('Code:', error.code);
    console.log('Message:', error.message);
    if (error.details && error.details.length > 0) {
      console.log('Details:', JSON.stringify(error.details.slice(0, 3), null, 2));
    }
  });
}
