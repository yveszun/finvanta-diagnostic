/**
 * Finvanta Synthetic Data Generator V3
 * 
 * Generates three scenarios: low, moderate, high implementation
 * Ensures financial consistency, unique IDs, valid relationships
 * Separate approval and payment stages
 * Reproducible with fixed seeds
 * Configurable regional distributions
 * 
 * V3 Refinements (Independent Review):
 * - Facilities with claims but no payments (not 100% payment receipt)
 * - Pending acceptance and adjudication stages
 * - Differentiated regional profiles (bottleneck variations)
 * - Clear payment timing indicators
 * - Transparent eligibility warnings
 * 
 * Usage: node scripts/generateData.js [scenario] [regionalProfile]
 * Example: node scripts/generateData.js moderate bottleneck_mix
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load configurations
const configPath = path.resolve(__dirname, '../public/config/benefitConfig.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Philippine regions
const REGIONS = [
    "National Capital Region",
    "Region I (Ilocos Region)",
    "Region II (Cagayan Valley)",
    "Region III (Central Luzon)",
    "Region IV-A (CALABARZON)",
    "Region IV-B (MIMAROPA)",
    "Region V (Bicol Region)",
    "Region VI (Western Visayas)",
    "Region VII (Central Visayas)",
    "Region VIII (Eastern Visayas)",
    "Region IX (Zamboanga Peninsula)",
    "Region X (Northern Mindanao)",
    "Region XI (Davao Region)",
    "Region XII (SOCCSKSARGEN)",
    "Region XIII (Caraga)",
    "CAR (Cordillera Administrative Region)",
    "BARMM (Bangsamoro)"
];

/**
 * Seeded random number generator for reproducibility
 */
class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }
    
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
    
    nextInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
    
    choice(array) {
        return array[Math.floor(this.next() * array.length)];
    }
    
    shuffle(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(this.next() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
}

/**
 * Generate facilities with regional distribution
 */
function generateFacilities(scenarioConfig, regionalProfile, seed) {
    const rng = new SeededRandom(seed);
    const facilities = [];
    const totalFacilities = scenarioConfig.facilitiesTotal;
    const facilitiesPerRegion = Math.floor(totalFacilities / REGIONS.length);
    
    console.log(`\nGenerating ${totalFacilities} facilities...`);
    
    let facilityIndex = 0;
    REGIONS.forEach((region, regionIndex) => {
        const numInRegion = regionIndex === REGIONS.length - 1 
            ? totalFacilities - facilityIndex  // Last region gets remainder
            : facilitiesPerRegion;
        
        for (let i = 0; i < numInRegion; i++) {
            // Facility level distribution (realistic: more Level 1 than Level 3)
            const levelRoll = rng.next();
            let facilityLevel;
            if (levelRoll < 0.50) facilityLevel = 1;       // 50% Level 1
            else if (levelRoll < 0.85) facilityLevel = 2;  // 35% Level 2
            else facilityLevel = 3;                         // 15% Level 3
            
            // Facility type based on level
            let facilityType;
            if (facilityLevel === 1) {
                facilityType = rng.next() < 0.6 ? "Rural Health Unit" : "City Health Office";
            } else {
                facilityType = "Hospital";
            }
            
            // Generate unique ID
            const regionCode = region.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
            const facilityId = `FAC_${regionCode}_${String(facilityIndex).padStart(4, '0')}`;
            
            // All facilities eligible pending official criteria (no Level 2+ assumption)
            const eligible = true;
            
            // Generate coordinates (Philippines roughly 5-20°N, 116-126°E)
            const latitude = 5 + (rng.next() * 15);
            const longitude = 116 + (rng.next() * 10);
            
            facilities.push({
                facility_id: facilityId,
                facility_name: `${region.split(' ')[0]} ${facilityType} ${(facilityIndex % 100) + 1}`,
                facility_type: facilityType,
                facility_level: facilityLevel,
                region: region,
                province: region.split('(')[0].trim(),
                municipality: `Municipality ${(facilityIndex % 50) + 1}`,
                eligible: eligible,
                coordinates: {
                    latitude: Math.round(latitude * 10000) / 10000,
                    longitude: Math.round(longitude * 10000) / 10000
                }
            });
            
            facilityIndex++;
        }
    });
    
    console.log(`✓ Generated ${facilities.length} facilities`);
    console.log(`  - Level 1: ${facilities.filter(f => f.facility_level === 1).length}`);
    console.log(`  - Level 2: ${facilities.filter(f => f.facility_level === 2).length}`);
    console.log(`  - Level 3: ${facilities.filter(f => f.facility_level === 3).length}`);
    console.log(`  - All eligible: ${facilities.filter(f => f.eligible).length} (pending official criteria verification)`);
    
    return facilities;
}

/**
 * Generate accreditations with regional variation
 * V3.1: Apply bottleneck_mix multipliers correctly
 */
function generateAccreditations(facilities, scenarioConfig, regionalProfile, seed) {
    const rng = new SeededRandom(seed + 1000);
    const accreditations = [];
    const eligibleFacilities = facilities.filter(f => f.eligible);
    const baseRate = scenarioConfig.accreditationRate;
    
    // V3.1: Load regional profile configuration
    const profileConfig = config.regionalDistribution.profiles[regionalProfile] || config.regionalDistribution.profiles.neutral;
    const bottleneckPatterns = profileConfig.patterns || {};
    
    console.log(`\nGenerating accreditations (base rate: ${(baseRate * 100).toFixed(1)}%)...`);
    
    // Group facilities by region
    const facilityByRegion = {};
    REGIONS.forEach(region => {
        facilityByRegion[region] = eligibleFacilities.filter(f => f.region === region);
    });
    
    // V3.1: Track regional rates for verification
    const regionalRates = {};
    
    // Apply regional variation based on profile
    REGIONS.forEach((region, index) => {
        const regionalFacilities = facilityByRegion[region];
        if (regionalFacilities.length === 0) return;
        
        let regionalRate = baseRate;
        
        // V3.1: Apply bottleneck_mix multipliers
        if (regionalProfile === 'bottleneck_mix' && bottleneckPatterns) {
            // Check each pattern to see if this region is affected
            Object.entries(bottleneckPatterns).forEach(([patternName, pattern]) => {
                if (pattern.regions && pattern.regions.includes(region)) {
                    // Apply accreditation multiplier if defined
                    if (pattern.accreditationMultiplier !== undefined) {
                        regionalRate = baseRate * pattern.accreditationMultiplier;
                    }
                }
            });
        } else if (regionalProfile === 'differentiated') {
            // NCR gets higher rate, rural regions lower
            if (region === "National Capital Region") {
                regionalRate = baseRate * profileConfig.urbanMultiplier;
            } else if (region.includes("BARMM") || region.includes("MIMAROPA")) {
                regionalRate = baseRate * profileConfig.ruralMultiplier;
            } else {
                // Other regions vary around base
                const variation = (rng.next() - 0.5) * profileConfig.variationCoefficient;
                regionalRate = baseRate * (1 + variation);
            }
        }
        
        // Ensure rate stays in reasonable bounds
        regionalRate = Math.max(0.01, Math.min(0.95, regionalRate));
        regionalRates[region] = regionalRate;
        
        const targetCount = Math.round(regionalFacilities.length * regionalRate);
        const shuffled = rng.shuffle(regionalFacilities);
        const toAccredit = shuffled.slice(0, targetCount);
        
        toAccredit.forEach(facility => {
            // Accreditation date in past 6 months (Jan-Jun 2025)
            const monthsAgo = rng.nextInt(0, 5);
            const day = rng.nextInt(1, 28);
            const accreditationDate = new Date(2025, monthsAgo, day);
            const validUntil = new Date(2026, monthsAgo, day); // 1 year validity
            
            // Determine which services this facility is accredited for
            // Based on facility type and level
            const servicesCovered = [];
            
            // General consultations: All facilities eligible (illustrative assumption)
            if (config.eligibility.serviceDistinction.general.eligibleFacilityTypes.includes(facility.facility_type) &&
                config.eligibility.serviceDistinction.general.eligibleLevels.includes(facility.facility_level)) {
                servicesCovered.push("PSYCH_CONSULT_GEN");
            }
            
            // Specialty services: Only Level 2+ hospitals (illustrative assumption)
            if (facility.facility_type === "Hospital" &&
                facility.facility_level >= 2 &&
                config.eligibility.serviceDistinction.specialty.eligibleFacilityTypes.includes(facility.facility_type) &&
                config.eligibility.serviceDistinction.specialty.eligibleLevels.includes(facility.facility_level)) {
                servicesCovered.push("PSYCH_CONSULT_SPEC");
            }
            
            // Only create accreditation if facility qualifies for at least one service
            if (servicesCovered.length === 0) return;
            
            accreditations.push({
                accreditation_id: `ACC_${facility.facility_id}_${accreditationDate.toISOString().split('T')[0]}`,
                facility_id: facility.facility_id,
                accreditation_date: accreditationDate.toISOString().split('T')[0],
                valid_until: validUntil.toISOString().split('T')[0],
                status: "approved",
                accreditation_type: "Outpatient Mental Health Services",
                services_covered: servicesCovered,
                illustrative_note: "Service-specific accreditation based on illustrative eligibility assumptions pending official policy verification"
            });
        });
    });
    
    console.log(`✓ Generated ${accreditations.length} accreditations`);
    console.log(`  - Overall rate: ${(accreditations.length / eligibleFacilities.length * 100).toFixed(1)}%`);
    
    // V3.1: Report bottleneck-affected regions
    if (regionalProfile === 'bottleneck_mix' && bottleneckPatterns) {
        Object.entries(bottleneckPatterns).forEach(([patternName, pattern]) => {
            if (pattern.accreditationMultiplier !== undefined && pattern.regions) {
                pattern.regions.forEach(region => {
                    const regionalFacilities = facilityByRegion[region];
                    const regionalAccreds = accreditations.filter(a => {
                        const facility = facilities.find(f => f.facility_id === a.facility_id);
                        return facility && facility.region === region;
                    });
                    if (regionalFacilities && regionalFacilities.length > 0) {
                        const actualRate = (regionalAccreds.length / regionalFacilities.length * 100).toFixed(1);
                        const expectedRate = (baseRate * pattern.accreditationMultiplier * 100).toFixed(1);
                        console.log(`  - ${region}: ${actualRate}% (${patternName}, expected ~${expectedRate}%)`);
                    }
                });
            }
        });
    } else if (regionalProfile === 'differentiated') {
        const ncrAccreds = accreditations.filter(a => {
            const facility = facilities.find(f => f.facility_id === a.facility_id);
            return facility && facility.region === "National Capital Region";
        });
        const ncrFacilities = facilityByRegion["National Capital Region"];
        console.log(`  - NCR rate: ${(ncrAccreds.length / ncrFacilities.length * 100).toFixed(1)}% (urban)`);
    }
    
    return accreditations;
}

/**
 * Generate claims with separate approval and payment stages
 * V3: Added pending stages, facilities without payment, regional bottlenecks
 */
function generateClaims(accreditations, facilities, scenarioConfig, regionalProfile, seed) {
    const rng = new SeededRandom(seed + 2000);
    const claims = [];
    const filingRate = scenarioConfig.claimsFilingRate;
    const approvalRate = scenarioConfig.approvalRate;
    const targetClaimsCount = scenarioConfig.targetClaimsCount;
    
    // V3: Load regional bottleneck configuration
    const regionalConfig = config.regionalDistribution.profiles[regionalProfile] || config.regionalDistribution.profiles.neutral;
    const bottleneckPatterns = regionalConfig.patterns || {};
    
    // V3: Load pending stage rates
    const pendingRates = config.claimsProcessing.pendingRates;
    
    console.log(`\nGenerating claims (target: ${targetClaimsCount} claims)...`);
    
    // V3.1: Select filing facilities with regional bottleneck multipliers applied
    const accreditedIds = new Set(accreditations.map(a => a.facility_id));
    const accreditedFacilities = facilities.filter(f => accreditedIds.has(f.facility_id));
    
    // Group accredited facilities by region
    const accreditedByRegion = {};
    REGIONS.forEach(region => {
        accreditedByRegion[region] = accreditedFacilities.filter(f => f.region === region);
    });
    
    // V3.1: Apply regional filing multipliers
    const filingFacilities = [];
    REGIONS.forEach(region => {
        const regionalAccredited = accreditedByRegion[region];
        if (regionalAccredited.length === 0) return;
        
        let regionalFilingRate = filingRate;
        
        // V3.1: Apply claims-filing bottleneck multipliers
        if (regionalProfile === 'bottleneck_mix' && bottleneckPatterns) {
            Object.values(bottleneckPatterns).forEach(pattern => {
                if (pattern.regions && pattern.regions.includes(region) && pattern.claimsMultiplier !== undefined) {
                    regionalFilingRate = filingRate * pattern.claimsMultiplier;
                }
            });
        }
        
        // Ensure rate stays in reasonable bounds
        regionalFilingRate = Math.max(0.05, Math.min(0.95, regionalFilingRate));
        
        const numRegionalFiling = Math.round(regionalAccredited.length * regionalFilingRate);
        const shuffled = rng.shuffle(regionalAccredited);
        filingFacilities.push(...shuffled.slice(0, numRegionalFiling));
    });
    
    console.log(`  - Accredited facilities: ${accreditedFacilities.length}`);
    console.log(`  - Filing facilities: ${filingFacilities.length} (${((filingFacilities.length / accreditedFacilities.length) * 100).toFixed(1)}%)`);
    
    // V3.1: Report claims-filing bottleneck regions
    if (regionalProfile === 'bottleneck_mix' && bottleneckPatterns) {
        Object.entries(bottleneckPatterns).forEach(([patternName, pattern]) => {
            if (pattern.claimsMultiplier !== undefined && pattern.regions) {
                pattern.regions.forEach(region => {
                    const regionalAccredited = accreditedByRegion[region];
                    const regionalFiling = filingFacilities.filter(f => f.region === region);
                    if (regionalAccredited && regionalAccredited.length > 0) {
                        const actualRate = (regionalFiling.length / regionalAccredited.length * 100).toFixed(1);
                        const expectedRate = (filingRate * pattern.claimsMultiplier * 100).toFixed(1);
                        console.log(`  - ${region}: ${actualRate}% filing (${patternName}, expected ~${expectedRate}%)`);
                    }
                });
            }
        });
    }
    
    // V3: Select facilities that will receive NO payments (10% of filing facilities)
    const facilityPaymentRate = config.claimsProcessing.paymentProcessing.facilitiesWithoutPayment.rate;
    const numFacilitiesWithoutPayment = Math.round(filingFacilities.length * facilityPaymentRate);
    const facilitiesWithoutPayment = new Set(
        rng.shuffle([...filingFacilities]).slice(0, numFacilitiesWithoutPayment).map(f => f.facility_id)
    );
    
    console.log(`  - Facilities with claims but no payments: ${facilitiesWithoutPayment.size} (${(facilityPaymentRate * 100).toFixed(1)}%)`);
    
    // Distribute claims across filing facilities
    const claimsPerFacility = Math.floor(targetClaimsCount / filingFacilities.length);
    const extraClaims = targetClaimsCount % filingFacilities.length;
    
    let claimCounter = 1;
    const serviceDistribution = scenarioConfig.serviceTypeDistribution;
    
    // V3: Analysis cutoff date for time-since-approval calculations
    // V3.1: Use this as genuine snapshot boundary
    const analysisCutoffDate = new Date(2025, 6, 15); // July 15, 2025
    
    filingFacilities.forEach((facility, facilityIndex) => {
        const numClaims = claimsPerFacility + (facilityIndex < extraClaims ? 1 : 0);
        
        // V3: Get regional bottleneck multipliers for this facility's region
        let regionalPendingAcceptanceMult = 1.0;
        let regionalPendingAdjudicationMult = 1.0;
        let regionalApprovedUnpaidMult = 1.0;
        
        if (bottleneckPatterns) {
            Object.values(bottleneckPatterns).forEach(pattern => {
                if (pattern.regions && pattern.regions.includes(facility.region)) {
                    regionalPendingAcceptanceMult = pattern.pendingAcceptanceMultiplier || 1.0;
                    regionalPendingAdjudicationMult = pattern.pendingAdjudicationMultiplier || 1.0;
                    regionalApprovedUnpaidMult = pattern.approvedButUnpaidMultiplier || 1.0;
                }
            });
        }
        
        // Get accreditation date for this facility
        const facilityAccreditation = accreditations.find(a => a.facility_id === facility.facility_id);
        const accreditationDate = facilityAccreditation ? new Date(facilityAccreditation.accreditation_date) : new Date(2025, 0, 1);
        
        // V3: Check if this facility will have ALL claims not reach payment
        const facilityNoPayments = facilitiesWithoutPayment.has(facility.facility_id);
        
        for (let i = 0; i < numClaims; i++) {
            // Service date must be on or after accreditation date, within H1 2025 (Jan-Jun)
            const h1EndDate = new Date(2025, 5, 30); // June 30, 2025
            
            // Calculate days between accreditation and end of H1 2025
            const daysAvailable = Math.floor((h1EndDate - accreditationDate) / (1000 * 60 * 60 * 24));
            
            if (daysAvailable <= 0) {
                // Accreditation too late in period, skip this claim
                continue;
            }
            
            // Random day offset from accreditation date
            const dayOffset = rng.nextInt(0, Math.min(daysAvailable, 180));
            const serviceDate = new Date(accreditationDate);
            serviceDate.setDate(serviceDate.getDate() + dayOffset);
            
            // Determine service type based on facility's accreditation
            const servicesCovered = facilityAccreditation ? facilityAccreditation.services_covered : [];
            
            let serviceType;
            if (servicesCovered.includes("PSYCH_CONSULT_GEN") && servicesCovered.includes("PSYCH_CONSULT_SPEC")) {
                // Facility accredited for both - choose based on distribution
                if (facility.facility_level === 2) {
                    serviceType = rng.next() < serviceDistribution.general ? 'general' : 'specialty';
                } else {
                    // Level 3: more specialty
                    serviceType = rng.next() < 0.40 ? 'general' : 'specialty';
                }
            } else if (servicesCovered.includes("PSYCH_CONSULT_SPEC")) {
                // Only specialty
                serviceType = 'specialty';
            } else {
                // Only general (or no coverage - shouldn't happen)
                serviceType = 'general';
            }
            
            // Verify service is actually covered by accreditation
            const serviceConfig = config.services[serviceType];
            if (!servicesCovered.includes(serviceConfig.code)) {
                // Facility not accredited for this service, skip
                continue;
            }
            
            const billedAmount = serviceConfig.packageCeiling;
            
            // Generate unique claim ID
            const claimId = `CLM_2025_${String(claimCounter).padStart(6, '0')}`;
            
            // Generate unique patient ID (synthetic, no PII)
            const patientId = `PAT_${String(rng.nextInt(100000, 999999))}`;
            
            // Stage 1: Submission (1-5 days after service)
            const submissionDate = new Date(serviceDate);
            submissionDate.setDate(submissionDate.getDate() + rng.nextInt(1, 5));
            
            // V3: Determine if claim is pending at acceptance stage
            const basePendingAcceptanceRate = pendingRates.pendingAcceptanceRate * regionalPendingAcceptanceMult;
            const isPendingAcceptance = rng.next() < basePendingAcceptanceRate;
            
            if (isPendingAcceptance) {
                // Claim stuck at pending acceptance
                claims.push({
                    claim_id: claimId,
                    facility_id: facility.facility_id,
                    patient_id: patientId,
                    service_date: serviceDate.toISOString().split('T')[0],
                    service_type: serviceType,
                    service_code: serviceConfig.code,
                    billed_amount: billedAmount,
                    submission_date: submissionDate.toISOString().split('T')[0],
                    acceptance_date: null,  // Not yet accepted
                    adjudication_date: null,
                    approval_date: null,
                    approved_amount: null,
                    payment_date: null,
                    disbursed_amount: null,
                    outstanding_balance: null,
                    status: "pending_acceptance",
                    payment_status: "not_applicable",
                    denial_reason: null,
                    days_pending: Math.floor((analysisCutoffDate - submissionDate) / (1000 * 60 * 60 * 24)),
                    analysis_cutoff_date: analysisCutoffDate.toISOString()  // V3.2: Mandatory for all claims
                });
                claimCounter++;
                continue;
            }
            
            // Stage 2: Acceptance (1-3 days after submission)
            const acceptanceDate = new Date(submissionDate);
            acceptanceDate.setDate(acceptanceDate.getDate() + rng.nextInt(1, 3));
            
            // V3: Determine if claim is pending at adjudication stage
            const basePendingAdjudicationRate = pendingRates.pendingAdjudicationRate * regionalPendingAdjudicationMult;
            const isPendingAdjudication = rng.next() < basePendingAdjudicationRate;
            
            // V3.2: Check if acceptance would occur after cutoff
            if (acceptanceDate > analysisCutoffDate) {
                // Acceptance would be after cutoff - claim stays pending_acceptance
                claims.push({
                    claim_id: claimId,
                    facility_id: facility.facility_id,
                    patient_id: patientId,
                    service_date: serviceDate.toISOString().split('T')[0],
                    service_type: serviceType,
                    service_code: serviceConfig.code,
                    billed_amount: billedAmount,
                    submission_date: submissionDate.toISOString().split('T')[0],
                    acceptance_date: null,  // Not yet accepted by cutoff
                    adjudication_date: null,
                    approval_date: null,
                    approved_amount: null,
                    payment_date: null,
                    disbursed_amount: null,
                    outstanding_balance: null,
                    status: "pending_acceptance",
                    payment_status: "not_applicable",
                    denial_reason: null,
                    days_pending: Math.floor((analysisCutoffDate - submissionDate) / (1000 * 60 * 60 * 24)),
                    analysis_cutoff_date: analysisCutoffDate.toISOString()  // V3.2: Mandatory for all claims
                });
                claimCounter++;
                continue;
            }
            
            if (isPendingAdjudication) {
                // Claim stuck at pending adjudication
                claims.push({
                    claim_id: claimId,
                    facility_id: facility.facility_id,
                    patient_id: patientId,
                    service_date: serviceDate.toISOString().split('T')[0],
                    service_type: serviceType,
                    service_code: serviceConfig.code,
                    billed_amount: billedAmount,
                    submission_date: submissionDate.toISOString().split('T')[0],
                    acceptance_date: acceptanceDate.toISOString().split('T')[0],
                    adjudication_date: null,  // Not yet adjudicated
                    approval_date: null,
                    approved_amount: null,
                    payment_date: null,
                    disbursed_amount: null,
                    outstanding_balance: null,
                    status: "pending_adjudication",
                    payment_status: "not_applicable",
                    denial_reason: null,
                    days_pending: Math.floor((analysisCutoffDate - acceptanceDate) / (1000 * 60 * 60 * 24)),
                    analysis_cutoff_date: analysisCutoffDate.toISOString()  // V3.2: Mandatory for all claims
                });
                claimCounter++;
                continue;
            }
            
            // Stage 3: Adjudication (3-10 days after acceptance)
            const adjudicationDate = new Date(acceptanceDate);
            adjudicationDate.setDate(adjudicationDate.getDate() + rng.nextInt(3, 10));
            
            // V3.2: Check if adjudication would occur after cutoff
            if (adjudicationDate > analysisCutoffDate) {
                // Adjudication would be after cutoff - claim stays pending_adjudication
                claims.push({
                    claim_id: claimId,
                    facility_id: facility.facility_id,
                    patient_id: patientId,
                    service_date: serviceDate.toISOString().split('T')[0],
                    service_type: serviceType,
                    service_code: serviceConfig.code,
                    billed_amount: billedAmount,
                    submission_date: submissionDate.toISOString().split('T')[0],
                    acceptance_date: acceptanceDate.toISOString().split('T')[0],
                    adjudication_date: null,  // Not yet adjudicated by cutoff
                    approval_date: null,
                    approved_amount: null,
                    payment_date: null,
                    disbursed_amount: null,
                    outstanding_balance: null,
                    status: "pending_adjudication",
                    payment_status: "not_applicable",
                    denial_reason: null,
                    days_pending: Math.floor((analysisCutoffDate - acceptanceDate) / (1000 * 60 * 60 * 24)),
                    analysis_cutoff_date: analysisCutoffDate.toISOString()  // V3.2: Mandatory for all claims
                });
                claimCounter++;
                continue;
            }
            
            // Determine if claim is approved or denied
            const isApproved = rng.next() < approvalRate;
            
            let status, approvalDate, paymentDate, denialReason;
            let approvedAmount = null;
            let disbursedAmount = null;
            let paymentStatus = null;
            let daysSinceApproval = null;
            
            if (isApproved) {
                // Stage 4: Approval (same day as adjudication completes)
                approvalDate = adjudicationDate.toISOString().split('T')[0];
                
                // Calculate approved amount (average 85% of package ceiling per financial assumptions)
                const reimbursementRatio = config.financialAssumptions.averageReimbursementToPackageRatio;
                const variation = 0.9 + (rng.next() * 0.2); // 90-110% of average
                approvedAmount = Math.round(billedAmount * reimbursementRatio * variation);
                
                // V3: Calculate days since approval (for approved-but-unpaid reporting)
                // V3.1: Only calculate if approved before cutoff
                const approvalBeforeCutoff = adjudicationDate <= analysisCutoffDate;
                daysSinceApproval = approvalBeforeCutoff ? Math.floor((analysisCutoffDate - adjudicationDate) / (1000 * 60 * 60 * 24)) : null;
                
                // V3: Force no payment if facility is in no-payment group
                if (facilityNoPayments) {
                    // All claims from this facility remain approved but unpaid
                    status = "approved";
                    paymentDate = null;
                    disbursedAmount = null;
                    paymentStatus = "pending";
                    
                } else {
                    // Determine payment status: paid, pending, or partial
                    const paymentRoll = rng.next();
                    const paymentProcessing = config.claimsProcessing.paymentProcessing;
                    
                    // V3: Apply regional multiplier to approved-but-unpaid rate
                    const adjustedApprovedButUnpaidRate = Math.min(
                        paymentProcessing.approvedButUnpaidRate * regionalApprovedUnpaidMult,
                        0.40  // Cap at 40%
                    );
                    
                    if (paymentRoll < adjustedApprovedButUnpaidRate) {
                        // Approved but payment pending
                        status = "approved";
                        paymentDate = null;
                        disbursedAmount = null;
                        paymentStatus = "pending";
                        
                    } else if (paymentRoll < adjustedApprovedButUnpaidRate + paymentProcessing.partialPaymentRate) {
                        // Partial payment
                        const paymentDelay = rng.nextInt(
                            paymentProcessing.paymentDelayDays.minimum,
                            paymentProcessing.paymentDelayDays.maximum
                        );
                        const paymentDateObj = new Date(adjudicationDate);
                        paymentDateObj.setDate(paymentDateObj.getDate() + paymentDelay);
                        
                        // V3.1: Enforce cutoff - payment must be before analysis date
                        if (paymentDateObj <= analysisCutoffDate) {
                            status = "partial_payment";
                            paymentDate = paymentDateObj.toISOString().split('T')[0];
                            // Partial payment (70% of approved amount)
                            disbursedAmount = Math.round(approvedAmount * paymentProcessing.illustrativePartialPaymentRatio);
                            paymentStatus = "partial";
                            daysSinceApproval = null;  // Has payment, so not "awaiting" payment
                        } else {
                            // Payment would occur after cutoff - treat as pending
                            status = "approved";
                            paymentDate = null;
                            disbursedAmount = null;
                            paymentStatus = "pending";
                            // Keep daysSinceApproval from above
                        }
                        
                    } else {
                        // Full payment - 100% of approved amount
                        const paymentDelay = rng.nextInt(
                            paymentProcessing.paymentDelayDays.minimum,
                            paymentProcessing.paymentDelayDays.maximum
                        );
                        const paymentDateObj = new Date(adjudicationDate);
                        paymentDateObj.setDate(paymentDateObj.getDate() + paymentDelay);
                        
                        // V3.1: Enforce cutoff - payment must be before analysis date
                        if (paymentDateObj <= analysisCutoffDate) {
                            status = "paid";
                            paymentDate = paymentDateObj.toISOString().split('T')[0];
                            // Fully paid claims receive 100% of approved amount
                            disbursedAmount = approvedAmount;
                            paymentStatus = "paid_full";
                            daysSinceApproval = null;  // Has payment, so not "awaiting" payment
                        } else {
                            // Payment would occur after cutoff - treat as pending
                            status = "approved";
                            paymentDate = null;
                            disbursedAmount = null;
                            paymentStatus = "pending";
                            // Keep daysSinceApproval from above
                        }
                    }
                }
                
            } else {
                // Claim denied at adjudication
                status = "denied";
                approvalDate = null;
                paymentDate = null;
                paymentStatus = "denied";
                daysSinceApproval = null;
                
                // Denial reasons
                const denialReasons = [
                    "Incomplete documentation",
                    "Service not covered under benefit package",
                    "Patient eligibility could not be verified",
                    "Exceeded package ceiling",
                    "Duplicate claim",
                    "Service date outside coverage period",
                    "Facility not accredited for this service type"
                ];
                denialReason = rng.choice(denialReasons);
            }
            
            claims.push({
                claim_id: claimId,
                facility_id: facility.facility_id,
                patient_id: patientId,
                service_date: serviceDate.toISOString().split('T')[0],
                service_type: serviceType,
                service_code: serviceConfig.code,
                billed_amount: billedAmount,
                submission_date: submissionDate.toISOString().split('T')[0],
                acceptance_date: acceptanceDate.toISOString().split('T')[0],
                adjudication_date: adjudicationDate.toISOString().split('T')[0],
                approval_date: approvalDate,
                approved_amount: approvedAmount,
                payment_date: paymentDate,
                disbursed_amount: disbursedAmount,
                outstanding_balance: approvedAmount ? (disbursedAmount !== null ? approvedAmount - disbursedAmount : approvedAmount) : null,
                status: status,
                payment_status: paymentStatus,
                denial_reason: denialReason,
                days_since_approval: daysSinceApproval,  // V3: For approved-but-unpaid reporting
                analysis_cutoff_date: analysisCutoffDate.toISOString()  // V3.2: Mandatory for all claims
            });
            
            claimCounter++;
        }
    });
    
    // Summary statistics
    const summary = {
        totalClaims: claims.length,
        submitted: claims.length,
        pendingAcceptance: claims.filter(c => c.status === 'pending_acceptance').length,
        accepted: claims.filter(c => c.acceptance_date !== null).length,
        pendingAdjudication: claims.filter(c => c.status === 'pending_adjudication').length,
        adjudicated: claims.filter(c => c.adjudication_date !== null).length,
        approved: claims.filter(c => c.status === 'paid' || c.status === 'partial_payment' || c.status === 'approved').length,
        paid: claims.filter(c => c.status === 'paid' || c.status === 'partial_payment').length,
        fullyPaid: claims.filter(c => c.status === 'paid').length,
        partiallyPaid: claims.filter(c => c.status === 'partial_payment').length,
        approvedButUnpaid: claims.filter(c => c.status === 'approved').length,
        denied: claims.filter(c => c.status === 'denied').length,
        totalBilled: claims.reduce((sum, c) => sum + c.billed_amount, 0),
        totalApproved: claims.filter(c => c.approved_amount).reduce((sum, c) => sum + c.approved_amount, 0),
        totalDisbursed: claims.filter(c => c.disbursed_amount).reduce((sum, c) => sum + c.disbursed_amount, 0),
        totalOutstanding: claims.filter(c => c.outstanding_balance).reduce((sum, c) => sum + c.outstanding_balance, 0)
    };
    
    // V3: Facilities receiving payment count
    const facilitiesWithPayment = new Set(claims.filter(c => c.payment_date !== null).map(c => c.facility_id));
    
    console.log(`✓ Generated ${summary.totalClaims} claims`);
    console.log(`  - From ${filingFacilities.length} facilities`);
    console.log(`  - Pending acceptance: ${summary.pendingAcceptance} (${((summary.pendingAcceptance/summary.totalClaims)*100).toFixed(1)}%)`);
    console.log(`  - Pending adjudication: ${summary.pendingAdjudication} (${((summary.pendingAdjudication/summary.totalClaims)*100).toFixed(1)}%)`);
    console.log(`  - Approved: ${summary.approved} (${((summary.approved/summary.totalClaims)*100).toFixed(1)}%)`);
    console.log(`  - Paid (full): ${summary.fullyPaid}`);
    console.log(`  - Partial payment: ${summary.partiallyPaid}`);
    console.log(`  - Approved but unpaid: ${summary.approvedButUnpaid}`);
    console.log(`  - Denied: ${summary.denied} (${((summary.denied/summary.totalClaims)*100).toFixed(1)}%)`);
    console.log(`  - Facilities receiving payment: ${facilitiesWithPayment.size} of ${filingFacilities.length} (${((facilitiesWithPayment.size/filingFacilities.length)*100).toFixed(1)}%)`);
    console.log(`  - Total billed: ₱${summary.totalBilled.toLocaleString()}`);
    console.log(`  - Total approved: ₱${summary.totalApproved.toLocaleString()}`);
    console.log(`  - Total disbursed: ₱${summary.totalDisbursed.toLocaleString()}`);
    console.log(`  - Total outstanding: ₱${summary.totalOutstanding.toLocaleString()}`);
    console.log(`  - Avg billed: ₱${Math.round(summary.totalBilled / summary.totalClaims).toLocaleString()}`);
    console.log(`  - Avg approved: ₱${Math.round(summary.totalApproved / (summary.approved || 1)).toLocaleString()}`);
    console.log(`  - Avg disbursed: ₱${Math.round(summary.totalDisbursed / (summary.paid || 1)).toLocaleString()}`);
    
    return claims;
}

/**
 * Generate edge cases for testing
 */
function generateEdgeCases(seed) {
    const rng = new SeededRandom(seed + 3000);
    const edgeCases = {
        description: "Edge case scenarios for testing validation and error handling",
        cases: []
    };
    
    // Case 1: Zero eligible facilities
    edgeCases.cases.push({
        name: "zero_eligible_facilities",
        facilities: [],
        accreditations: [],
        claims: [],
        expectedBehavior: "Should display N/A for all rates, show warning message"
    });
    
    // Case 2: No accreditations despite eligible facilities
    const noAccredFacilities = [{
        facility_id: "FAC_TEST_0001",
        facility_name: "Test Hospital",
        facility_type: "Hospital",
        facility_level: 2,
        region: "National Capital Region",
        eligible: true
    }];
    edgeCases.cases.push({
        name: "no_accreditations",
        facilities: noAccredFacilities,
        accreditations: [],
        claims: [],
        expectedBehavior: "Accreditation rate = 0%, filing rate = N/A"
    });
    
    // Case 3: Accredited but no claims filed
    edgeCases.cases.push({
        name: "no_claims_filed",
        facilities: noAccredFacilities,
        accreditations: [{
            accreditation_id: "ACC_TEST_001",
            facility_id: "FAC_TEST_0001",
            accreditation_date: "2025-01-15",
            status: "approved"
        }],
        claims: [],
        expectedBehavior: "Filing rate = 0%, all claims metrics = 0"
    });
    
    // Case 4: All claims denied
    const deniedClaim = {
        claim_id: "CLM_TEST_001",
        facility_id: "FAC_TEST_0001",
        service_date: "2025-02-01",
        billed_amount: 9000,
        submission_date: "2025-02-02",
        acceptance_date: "2025-02-03",
        adjudication_date: "2025-02-10",
        approval_date: null,
        approved_amount: null,
        payment_date: null,
        disbursed_amount: null,
        status: "denied",
        denial_reason: "Incomplete documentation"
    };
    edgeCases.cases.push({
        name: "all_claims_denied",
        facilities: noAccredFacilities,
        accreditations: [{
            accreditation_id: "ACC_TEST_001",
            facility_id: "FAC_TEST_0001",
            accreditation_date: "2025-01-15",
            status: "approved"
        }],
        claims: [deniedClaim],
        expectedBehavior: "Approval rate = 0%, total disbursed = ₱0"
    });
    
    // Case 5: Approved but payment pending
    const approvedPendingClaim = {
        claim_id: "CLM_TEST_002",
        facility_id: "FAC_TEST_0001",
        service_date: "2025-02-01",
        billed_amount: 9000,
        submission_date: "2025-02-02",
        acceptance_date: "2025-02-03",
        adjudication_date: "2025-02-10",
        approval_date: "2025-02-10",
        approved_amount: 7650,
        payment_date: null,  // Approved but not yet paid
        disbursed_amount: null,
        status: "approved",  // Different from "paid"
        denial_reason: null
    };
    edgeCases.cases.push({
        name: "approved_payment_pending",
        facilities: noAccredFacilities,
        accreditations: [{
            accreditation_id: "ACC_TEST_001",
            facility_id: "FAC_TEST_0001",
            accreditation_date: "2025-01-15",
            status: "approved"
        }],
        claims: [approvedPendingClaim],
        expectedBehavior: "Payment rate < 100%, shows processing delay"
    });
    
    return edgeCases;
}

/**
 * Generate metadata
 */
function generateMetadata(scenarioName, regionalProfile, facilities, accreditations, claims) {
    return {
        version: "2.0",
        generatedDate: new Date().toISOString(),
        generatedBy: "Finvanta Data Generator V2",
        scenario: scenarioName,
        regionalProfile: regionalProfile,
        dataType: "SYNTHETIC",
        purpose: "Demonstration and testing only",
        disclaimer: "This data is entirely synthetic and illustrative. It does not represent actual PhilHealth facilities, claims, or performance. All assumptions are labeled as illustrative rather than actual PhilHealth reimbursement parameters.",
        
        recordCounts: {
            facilities: facilities.length,
            accreditations: accreditations.length,
            claims: claims.length,
            eligibleFacilities: facilities.filter(f => f.eligible).length,
            filingFacilities: new Set(claims.map(c => c.facility_id)).size,
            approvedClaims: claims.filter(c => c.status === 'paid').length,
            deniedClaims: claims.filter(c => c.status === 'denied').length
        },
        
        financials: {
            totalBilled: claims.reduce((sum, c) => sum + c.billed_amount, 0),
            totalApproved: claims.filter(c => c.approved_amount).reduce((sum, c) => sum + c.approved_amount, 0),
            totalDisbursed: claims.filter(c => c.disbursed_amount).reduce((sum, c) => sum + c.disbursed_amount, 0),
            currency: "PHP",
            note: "Billed = package ceiling; Approved = adjudicated amount; Disbursed = actual payment"
        },
        
        configUsed: {
            "facilityLevelAssumption": "None - all facilities eligible pending official verification",
            accreditationRate: config.scenarios[scenarioName].accreditationRate,
            filingRate: config.scenarios[scenarioName].claimsFilingRate,
            approvalRate: config.scenarios[scenarioName].approvalRate,
            financialAssumptions: config.financialAssumptions,
            regionalProfile: regionalProfile
        },
        
        validationStatus: {
            uniqueFacilityIds: true,
            uniqueClaimIds: true,
            validFacilityReferences: true,
            approvalPaymentSeparation: true,
            dateConsistency: true,
            statusConsistency: true
        },
        
        reproducibility: {
            seedUsed: scenarioName === 'low' ? 12345 : scenarioName === 'moderate' ? 23456 : 34567,
            note: "Using fixed seeds ensures reproducible datasets"
        }
    };
}

/**
 * Main generation function
 */
function generateScenario(scenarioName, regionalProfile = 'neutral') {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`GENERATING SCENARIO: ${scenarioName.toUpperCase()} (${regionalProfile})`);
    console.log(`${'='.repeat(60)}`);
    
    const scenarioConfig = config.scenarios[scenarioName];
    if (!scenarioConfig) {
        throw new Error(`Unknown scenario: ${scenarioName}. Valid: low, moderate, high`);
    }
    
    // Fixed seeds for reproducibility
    const seeds = {
        low: 12345,
        moderate: 23456,
        high: 34567
    };
    const seed = seeds[scenarioName];
    
    // Generate data
    const facilities = generateFacilities(scenarioConfig, regionalProfile, seed);
    const accreditations = generateAccreditations(facilities, scenarioConfig, regionalProfile, seed);
    const claims = generateClaims(accreditations, facilities, scenarioConfig, regionalProfile, seed);
    const metadata = generateMetadata(scenarioName, regionalProfile, facilities, accreditations, claims);
    
    // Output directory
    const outputDir = path.resolve(__dirname, `../public/data/${scenarioName}_${regionalProfile}`);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write files
    fs.writeFileSync(path.join(outputDir, 'facilities.json'), JSON.stringify(facilities, null, 2));
    fs.writeFileSync(path.join(outputDir, 'accreditations.json'), JSON.stringify(accreditations, null, 2));
    fs.writeFileSync(path.join(outputDir, 'claims.json'), JSON.stringify(claims, null, 2));
    fs.writeFileSync(path.join(outputDir, 'metadata.json'), JSON.stringify(metadata, null, 2));
    
    console.log(`\n✓ All files written to: ${outputDir}`);
    
    return { facilities, accreditations, claims, metadata };
}

// Parse command line arguments
const args = process.argv.slice(2);
const scenario = args[0] || config.scenarios.defaultScenario;
const regionalProfile = args[1] || config.regionalDistribution.defaultProfile;

// Generate requested scenario
try {
    generateScenario(scenario, regionalProfile);
    
    // Also generate edge cases
    console.log(`\n${'='.repeat(60)}`);
    console.log(`GENERATING EDGE CASES`);
    console.log(`${'='.repeat(60)}`);
    const edgeCases = generateEdgeCases(99999);
    const edgeCasesPath = path.resolve(__dirname, '../public/data/edge_cases.json');
    fs.writeFileSync(edgeCasesPath, JSON.stringify(edgeCases, null, 2));
    console.log(`\n✓ Edge cases written to: ${edgeCasesPath}`);
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ DATA GENERATION COMPLETE`);
    console.log(`${'='.repeat(60)}\n`);
    
} catch (error) {
    console.error('\n❌ Error generating data:', error.message);
    process.exit(1);
}
