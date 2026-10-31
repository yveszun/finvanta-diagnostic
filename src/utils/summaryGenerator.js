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
  const overallRate = cascade.stage4_receiving_payment / cascade.stage1_eligible;

  return {
    headline: generateHeadline(overallRate, cascade),
    overallHealth: getHealthStatus(overallRate),
    facilitiesActive: cascade.stage4_receiving_payment,
    facilitiesEligible: cascade.stage1_eligible,
    utilizationRate: overallRate
  };
}

function generateHeadline(rate, cascade) {
  if (!cascade) return 'Loading data...';
  
  const percent = Math.round(rate * 100);
  const active = cascade.stage4_receiving_payment?.toLocaleString() || '0';
  const eligible = cascade.stage1_eligible?.toLocaleString() || '0';

  if (rate >= 0.70) {
    return `Strong Performance: ${percent}% of facilities actively participating (${active} of ${eligible})`;
  } else if (rate >= 0.50) {
    return `Moderate Participation: ${percent}% facility utilization (${active} of ${eligible} facilities)`;
  } else if (rate >= 0.30) {
    return `Low Engagement: Only ${percent}% of eligible facilities participating (${active} of ${eligible})`;
  } else {
    return `Critical Constraint: ${percent}% participation rate requires immediate attention (${active} of ${eligible})`;
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

  // Calculate key conversion rates
  const accreditationRate = cascade.stage2_accredited / cascade.stage1_eligible;
  const claimsRate = cascade.stage3_claiming / cascade.stage2_accredited;
  const paymentRate = cascade.stage4_receiving_payment / cascade.stage3_claiming;

  return [
    {
      label: 'Accreditation Rate',
      value: `${Math.round(accreditationRate * 100)}%`,
      status: getIndicatorStatus(accreditationRate),
      description: 'Eligible facilities that completed accreditation'
    },
    {
      label: 'Claims Activity',
      value: `${Math.round(claimsRate * 100)}%`,
      status: getIndicatorStatus(claimsRate),
      description: 'Accredited facilities actively submitting claims'
    },
    {
      label: 'Payment Success',
      value: `${Math.round(paymentRate * 100)}%`,
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
