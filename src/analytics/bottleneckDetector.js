/**
 * Bottleneck Detector
 * Analyzes facility participation cascade to identify primary constraints
 * Uses conversion rates between stages to determine most significant drop-off
 */

export function detectPrimaryBottleneck(data) {
  if (!data?.analytics?.facilityParticipationCascade) {
    return null;
  }

  const cascade = data.analytics.facilityParticipationCascade;
  
  // Calculate conversion rates between stages
  const conversions = [
    {
      stage: 'Accreditation',
      from: 'stage1_eligible',
      to: 'stage2_accredited',
      rate: cascade.stage2_accredited / cascade.stage1_eligible,
      dropoff: cascade.stage1_eligible - cascade.stage2_accredited,
      description: 'facilities eligible but not accredited'
    },
    {
      stage: 'Claims Submission',
      from: 'stage2_accredited',
      to: 'stage3_claiming',
      rate: cascade.stage3_claiming / cascade.stage2_accredited,
      dropoff: cascade.stage2_accredited - cascade.stage3_claiming,
      description: 'accredited facilities not submitting claims'
    },
    {
      stage: 'Payment Receipt',
      from: 'stage3_claiming',
      to: 'stage4_receiving_payment',
      rate: cascade.stage4_receiving_payment / cascade.stage3_claiming,
      dropoff: cascade.stage3_claiming - cascade.stage4_receiving_payment,
      description: 'claiming facilities not receiving payment'
    }
  ];

  // Find stage with lowest conversion rate (primary bottleneck)
  const bottleneck = conversions.reduce((min, current) => 
    current.rate < min.rate ? current : min
  );

  return {
    stage: bottleneck.stage,
    conversionRate: bottleneck.rate,
    facilitiesLost: bottleneck.dropoff,
    description: bottleneck.description,
    severity: getSeverity(bottleneck.rate),
    impact: getImpact(bottleneck.dropoff, cascade.stage1_eligible)
  };
}

function getSeverity(rate) {
  if (rate < 0.50) return 'critical';
  if (rate < 0.70) return 'high';
  if (rate < 0.85) return 'moderate';
  return 'low';
}

function getImpact(facilitiesLost, totalEligible) {
  const percentLost = (facilitiesLost / totalEligible) * 100;
  if (percentLost > 30) return 'critical';
  if (percentLost > 15) return 'high';
  if (percentLost > 5) return 'moderate';
  return 'low';
}

export function getBottleneckInsight(bottleneck) {
  if (!bottleneck) return null;

  const insights = {
    'Accreditation': {
      finding: 'Accreditation is the primary barrier to facility participation',
      investigation: 'Review accreditation requirements and support programs',
      metric: 'accreditation conversion rate'
    },
    'Claims Submission': {
      finding: 'Many accredited facilities are not actively submitting claims',
      investigation: 'Examine claims submission processes and technical barriers',
      metric: 'claims submission rate'
    },
    'Payment Receipt': {
      finding: 'Payment processing is constraining facility engagement',
      investigation: 'Analyze payment processing timelines and validation issues',
      metric: 'payment receipt rate'
    }
  };

  return insights[bottleneck.stage];
}
