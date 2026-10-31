/**
 * Summary Generator
 * Creates executive-level summaries and insights from analytical data
 */

export function generateExecutiveSummary(data) {
  if (!data?.analytics) {
    return null;
  }

  const { analytics } = data;
  const cascade = analytics.facilityParticipationCascade;
  
  // Extract counts - handle both nested objects (Phase 4) and primitives (tests)
  const extractCount = (value) => {
    if (typeof value === 'number') return value;
    return value?.count || 0;
  };
  
  const eligible = extractCount(cascade.stage1_eligible);
  const receivingPayment = extractCount(cascade.stage4_receiving_payment);
  
  const overallRate = eligible > 0 ? receivingPayment / eligible : 0;

  return {
    headline: generateHeadline(overallRate, cascade, eligible, receivingPayment),
    overallHealth: getHealthStatus(overallRate),
    facilitiesActive: receivingPayment,
    facilitiesEligible: eligible,
    utilizationRate: overallRate
  };
}

function generateHeadline(rate, cascade, eligible, active) {
  if (!cascade || eligible === 0) return 'Data unavailable';
  
  const percent = Math.round(rate * 100);
  const activeStr = active.toLocaleString();
  const eligibleStr = eligible.toLocaleString();

  if (rate >= 0.70) {
    return `Strong Performance: ${percent}% of facilities actively participating (${activeStr} of ${eligibleStr})`;
  } else if (rate >= 0.50) {
    return `Moderate Participation: ${percent}% facility utilization (${activeStr} of ${eligibleStr} facilities)`;
  } else if (rate >= 0.30) {
    return `Low Engagement: Only ${percent}% of eligible facilities participating (${activeStr} of ${eligibleStr})`;
  } else {
    return `Critical Constraint: ${percent}% participation rate requires immediate attention (${activeStr} of ${eligibleStr})`;
  }
}

function getHealthStatus(rate) {
  if (rate >= 0.70) return 'healthy';
  if (rate >= 0.50) return 'moderate';
  if (rate >= 0.30) return 'concerning';
  return 'critical';
}

export function getPrimaryIndicators(data) {
  if (!data?.analytics) {
    return [];
  }

  const { analytics } = data;
  const cascade = analytics.facilityParticipationCascade;

  // Extract counts - handle both nested objects (Phase 4) and primitives (tests)
  const extractCount = (value) => {
    if (typeof value === 'number') return value;
    return value?.count || 0;
  };
  
  const eligible = extractCount(cascade.stage1_eligible);
  const accredited = extractCount(cascade.stage2_accredited);
  const claiming = extractCount(cascade.stage3_claiming);
  const receivingPayment = extractCount(cascade.stage4_receiving_payment);

  // Calculate key conversion rates with zero-denominator handling
  const accreditationRate = eligible > 0 ? accredited / eligible : 0;
  const claimsRate = accredited > 0 ? claiming / accredited : 0;
  const paymentRate = claiming > 0 ? receivingPayment / claiming : 0;

  return [
    {
      label: 'Accreditation Rate',
      value: eligible > 0 ? `${Math.round(accreditationRate * 100)}%` : 'N/A',
      status: getIndicatorStatus(accreditationRate),
      description: 'Eligible facilities that completed accreditation'
    },
    {
      label: 'Claims Activity',
      value: accredited > 0 ? `${Math.round(claimsRate * 100)}%` : 'N/A',
      status: getIndicatorStatus(claimsRate),
      description: 'Accredited facilities actively submitting claims'
    },
    {
      label: 'Payment Success',
      value: claiming > 0 ? `${Math.round(paymentRate * 100)}%` : 'N/A',
      status: getIndicatorStatus(paymentRate),
      description: 'Claims successfully receiving payment'
    }
  ];
}

function getIndicatorStatus(rate) {
  if (rate >= 0.85) return 'good';
  if (rate >= 0.70) return 'moderate';
  return 'poor';
}

export function generateInvestigationSuggestion(bottleneck, data) {
  if (!bottleneck) {
    return {
      action: 'Review regional performance variations',
      context: 'Identify best practices from high-performing regions'
    };
  }

  const suggestions = {
    'Accreditation': {
      action: 'Investigate accreditation barriers and support mechanisms',
      context: `${bottleneck.facilitiesLost.toLocaleString()} facilities are eligible but not accredited`,
      dataSource: 'Regional accreditation rates and facility characteristics'
    },
    'Claims Submission': {
      action: 'Examine technical and process barriers to claims submission',
      context: `${bottleneck.facilitiesLost.toLocaleString()} accredited facilities are not submitting claims`,
      dataSource: 'Claims submission patterns and facility feedback'
    },
    'Payment Receipt': {
      action: 'Analyze payment processing delays and validation requirements',
      context: `${bottleneck.facilitiesLost.toLocaleString()} claiming facilities face payment issues`,
      dataSource: 'Payment processing timelines and rejection reasons'
    }
  };

  return suggestions[bottleneck.stage] || suggestions['Accreditation'];
}
