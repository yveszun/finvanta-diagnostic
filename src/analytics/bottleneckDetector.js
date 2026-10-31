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
  
  // Extract counts - handle both nested objects (Phase 4) and primitives (tests)
  const extractCount = (value) => {
    if (typeof value === 'number') return value;
    return value?.count || 0;
  };
  
  const eligible = extractCount(cascade.stage1_eligible);
  const accredited = extractCount(cascade.stage2_accredited);
  const claiming = extractCount(cascade.stage3_claiming);
  const receivingPayment = extractCount(cascade.stage4_receiving_payment);
  
  // Calculate conversion rates between stages
  const conversions = [
    {
      stage: 'Accreditation',
      from: 'stage1_eligible',
      to: 'stage2_accredited',
      rate: eligible > 0 ? accredited / eligible : 0,
      dropoff: eligible - accredited,
      description: 'facilities eligible but not accredited',
      stageName: cascade.stage2_accredited?.label || 'Accreditation'
    },
    {
      stage: 'Claims Submission',
      from: 'stage2_accredited',
      to: 'stage3_claiming',
      rate: accredited > 0 ? claiming / accredited : 0,
      dropoff: accredited - claiming,
      description: 'accredited facilities not submitting claims',
      stageName: cascade.stage3_claiming?.label || 'Claims Submission'
    },
    {
      stage: 'Payment Receipt',
      from: 'stage3_claiming',
      to: 'stage4_receiving_payment',
      rate: claiming > 0 ? receivingPayment / claiming : 0,
      dropoff: claiming - receivingPayment,
      description: 'claiming facilities not receiving payment',
      stageName: cascade.stage4_receiving_payment?.label || 'Payment Receipt'
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
  // Extract count if totalEligible is a nested object
  const eligible = totalEligible?.count || totalEligible || 0;
  
  if (eligible === 0) {
    return 'low'; // No eligible facilities means no impact
  }
  
  const percentLost = (facilitiesLost / eligible) * 100;
  if (percentLost > 30) return 'critical';
  if (percentLost > 15) return 'high';
  if (percentLost > 5) return 'moderate';
  return 'low';
}

export function getBottleneckInsight(bottleneck) {
  if (!bottleneck) return null;

  const insights = {
    'Accreditation': {
      finding: 'Largest proportional drop-off: Accreditation stage',
      investigation: 'Review accreditation requirements and support programs',
      metric: 'accreditation conversion rate'
    },
    'Claims Submission': {
      finding: 'Largest proportional drop-off: Claims submission stage',
      investigation: 'Examine claims submission processes and technical barriers',
      metric: 'claims submission rate'
    },
    'Payment Receipt': {
      finding: 'Largest proportional drop-off: Payment receipt stage',
      investigation: 'Analyze payment processing timelines and validation issues',
      metric: 'payment receipt rate'
    }
  };

  return insights[bottleneck.stage];
}
