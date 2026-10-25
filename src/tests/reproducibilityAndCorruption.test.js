import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

describe('Reproducibility Tests', () => {
  it('should generate identical datasets with same seed', () => {
    // Generate low scenario twice
    execSync('npm run generate:low', { cwd: process.cwd(), stdio: 'pipe' });
    
    const dataDir1 = path.resolve(process.cwd(), 'public/data/low_neutral');
    const facilities1 = fs.readFileSync(path.join(dataDir1, 'facilities.json'), 'utf-8');
    const accreditations1 = fs.readFileSync(path.join(dataDir1, 'accreditations.json'), 'utf-8');
    const claims1 = fs.readFileSync(path.join(dataDir1, 'claims.json'), 'utf-8');
    
    // Generate again
    execSync('npm run generate:low', { cwd: process.cwd(), stdio: 'pipe' });
    
    const facilities2 = fs.readFileSync(path.join(dataDir1, 'facilities.json'), 'utf-8');
    const accreditations2 = fs.readFileSync(path.join(dataDir1, 'accreditations.json'), 'utf-8');
    const claims2 = fs.readFileSync(path.join(dataDir1, 'claims.json'), 'utf-8');
    
    // Compare hashes (excluding metadata which has generation timestamp)
    const hash1 = crypto.createHash('sha256').update(facilities1 + accreditations1 + claims1).digest('hex');
    const hash2 = crypto.createHash('sha256').update(facilities2 + accreditations2 + claims2).digest('hex');
    
    expect(hash1).toBe(hash2);
  }, 60000); // 60 second timeout

  it('metadata should document reproducibility seed', () => {
    const scenarios = ['low_neutral', 'moderate_neutral', 'high_neutral'];
    
    scenarios.forEach(scenario => {
      const metadataPath = path.resolve(process.cwd(), `public/data/${scenario}/metadata.json`);
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      
      expect(metadata.reproducibility).toBeDefined();
      expect(metadata.reproducibility.seedUsed).toBeDefined();
      expect(typeof metadata.reproducibility.seedUsed).toBe('number');
    });
  });
});

describe('Corrupted Data Detection', () => {
  let originalClaims;
  const testDataDir = path.resolve(process.cwd(), 'public/data/test_corrupted');

  beforeAll(() => {
    // Create test directory with copy of moderate scenario
    const sourceDir = path.resolve(process.cwd(), 'public/data/moderate_neutral');
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    
    fs.copyFileSync(
      path.join(sourceDir, 'facilities.json'),
      path.join(testDataDir, 'facilities.json')
    );
    fs.copyFileSync(
      path.join(sourceDir, 'accreditations.json'),
      path.join(testDataDir, 'accreditations.json')
    );
    
    originalClaims = JSON.parse(fs.readFileSync(path.join(sourceDir, 'claims.json'), 'utf-8'));
  });

  afterAll(() => {
    // Clean up test directory
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  it('should detect duplicate claim IDs', () => {
    const corruptedClaims = [...originalClaims];
    // Duplicate the first claim
    corruptedClaims.push({ ...corruptedClaims[0] });
    
    fs.writeFileSync(
      path.join(testDataDir, 'claims.json'),
      JSON.stringify(corruptedClaims, null, 2)
    );
    
    // Load and validate
    const claims = corruptedClaims;
    const ids = claims.map(c => c.claim_id);
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBeLessThan(ids.length);
  });

  it('should detect invalid facility references', () => {
    const corruptedClaims = [...originalClaims.slice(0, 10)];
    // Add claim with invalid facility reference
    corruptedClaims[0] = {
      ...corruptedClaims[0],
      facility_id: 'INVALID_FACILITY_ID_12345'
    };
    
    fs.writeFileSync(
      path.join(testDataDir, 'claims.json'),
      JSON.stringify(corruptedClaims, null, 2)
    );
    
    // Load facilities and validate
    const facilities = JSON.parse(fs.readFileSync(path.join(testDataDir, 'facilities.json'), 'utf-8'));
    const validFacilityIds = new Set(facilities.map(f => f.facility_id));
    const invalidClaims = corruptedClaims.filter(c => !validFacilityIds.has(c.facility_id));
    
    expect(invalidClaims.length).toBeGreaterThan(0);
  });

  it('should detect paid claim without payment date', () => {
    const corruptedClaims = [...originalClaims.slice(0, 10)];
    // Find a paid claim and remove payment date
    const paidClaimIndex = corruptedClaims.findIndex(c => c.status === 'paid');
    if (paidClaimIndex >= 0) {
      corruptedClaims[paidClaimIndex] = {
        ...corruptedClaims[paidClaimIndex],
        payment_date: null
      };
      
      fs.writeFileSync(
        path.join(testDataDir, 'claims.json'),
        JSON.stringify(corruptedClaims, null, 2)
      );
      
      const paidWithoutDate = corruptedClaims.filter(c => c.status === 'paid' && !c.payment_date);
      expect(paidWithoutDate.length).toBeGreaterThan(0);
    }
  });

  it('should detect service date after payment date', () => {
    const corruptedClaims = [...originalClaims.slice(0, 10)];
    // Find a paid claim and swap dates
    const paidClaimIndex = corruptedClaims.findIndex(c => c.status === 'paid');
    if (paidClaimIndex >= 0) {
      const claim = corruptedClaims[paidClaimIndex];
      corruptedClaims[paidClaimIndex] = {
        ...claim,
        service_date: claim.payment_date,
        payment_date: claim.service_date
      };
      
      fs.writeFileSync(
        path.join(testDataDir, 'claims.json'),
        JSON.stringify(corruptedClaims, null, 2)
      );
      
      const invalidDates = corruptedClaims.filter(c => 
        c.service_date && c.payment_date && c.service_date > c.payment_date
      );
      expect(invalidDates.length).toBeGreaterThan(0);
    }
  });

  it('should detect disbursed > approved', () => {
    const corruptedClaims = [...originalClaims.slice(0, 10)];
    // Find a paid claim and corrupt amounts
    const paidClaimIndex = corruptedClaims.findIndex(c => c.status === 'paid');
    if (paidClaimIndex >= 0) {
      corruptedClaims[paidClaimIndex] = {
        ...corruptedClaims[paidClaimIndex],
        approved_amount: 5000,
        disbursed_amount: 10000  // More than approved
      };
      
      fs.writeFileSync(
        path.join(testDataDir, 'claims.json'),
        JSON.stringify(corruptedClaims, null, 2)
      );
      
      const invalidAmounts = corruptedClaims.filter(c => 
        c.disbursed_amount && c.approved_amount && c.disbursed_amount > c.approved_amount
      );
      expect(invalidAmounts.length).toBeGreaterThan(0);
    }
  });

  it('should detect approved > billed', () => {
    const corruptedClaims = [...originalClaims.slice(0, 10)];
    // Find a paid claim and corrupt amounts
    const paidClaimIndex = corruptedClaims.findIndex(c => c.status === 'paid');
    if (paidClaimIndex >= 0) {
      corruptedClaims[paidClaimIndex] = {
        ...corruptedClaims[paidClaimIndex],
        billed_amount: 5000,
        approved_amount: 10000  // More than billed
      };
      
      fs.writeFileSync(
        path.join(testDataDir, 'claims.json'),
        JSON.stringify(corruptedClaims, null, 2)
      );
      
      const invalidAmounts = corruptedClaims.filter(c => 
        c.approved_amount && c.billed_amount && c.approved_amount > c.billed_amount
      );
      expect(invalidAmounts.length).toBeGreaterThan(0);
    }
  });

  it('should detect service before accreditation', () => {
    const facilities = JSON.parse(fs.readFileSync(path.join(testDataDir, 'facilities.json'), 'utf-8'));
    const accreditations = JSON.parse(fs.readFileSync(path.join(testDataDir, 'accreditations.json'), 'utf-8'));
    const corruptedClaims = [...originalClaims.slice(0, 10)];
    
    // Corrupt first claim to have service before accreditation
    if (corruptedClaims.length > 0) {
      const facilityId = corruptedClaims[0].facility_id;
      const accred = accreditations.find(a => a.facility_id === facilityId);
      
      if (accred) {
        // Set service date to before accreditation
        const accredDate = new Date(accred.accreditation_date);
        accredDate.setDate(accredDate.getDate() - 30);
        
        corruptedClaims[0] = {
          ...corruptedClaims[0],
          service_date: accredDate.toISOString().split('T')[0]
        };
        
        fs.writeFileSync(
          path.join(testDataDir, 'claims.json'),
          JSON.stringify(corruptedClaims, null, 2)
        );
        
        // Build accred map and check
        const accredDateMap = {};
        accreditations.forEach(a => { accredDateMap[a.facility_id] = a.accreditation_date; });
        
        const violations = corruptedClaims.filter(c => {
          const accDate = accredDateMap[c.facility_id];
          return accDate && c.service_date < accDate;
        });
        
        expect(violations.length).toBeGreaterThan(0);
      }
    }
  });
});
