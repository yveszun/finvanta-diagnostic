/**
 * Recommendation Engine
 * 
 * Evaluates analytics data against configured rules to generate diagnostic insights.
 * Does not generate AI recommendations or establish causal claims.
 */

export function evaluateRecommendations(analyticsData, recommendationRules) {
  if (!analyticsData || !recommendationRules || !recommendationRules.rules) {
    return [];
  }

  const recommendations = [];
  const { summary } = analyticsData;

  // Calculate metrics from summary
  const metrics = {
    accreditationRate: summary.accredited_facilities && summary.total_facilities
      ? (summary.accredited_facilities / summary.total_facilities) * 100
      : null,
    filingRate: summary.facilities_filing_claims && summary.accredited_facilities
      ? (summary.facilities_filing_claims / summary.accredited_facilities) * 100
      : null,
    paymentRate: summary.facilities_receiving_payment && summary.facilities_filing_claims
      ? (summary.facilities_receiving_payment / summary.facilities_filing_claims) * 100
      : null,
    approvalRate: summary.approved_claims && summary.total_claims
      ? (summary.approved_claims / summary.total_claims) * 100
      : null,
    stage1_eligibleFacilities: summary.total_facilities,
    stage2_accreditedFacilities: summary.accredited_facilities,
    stage3_filingFacilities: summary.facilities_filing_claims,
    stage3_adjudicatedClaims: summary.total_claims,
    stage4_approvedClaims: summary.approved_claims,
    stage5_paidClaims: summary.paid_claims,
    averageDaysToPayment: summary.avg_days_to_payment || null
  };

  // Evaluate each rule
  recommendationRules.rules.forEach(rule => {
    try {
      if (evaluateCondition(rule.condition, metrics)) {
        // Interpolate template variables
        const recommendation = {
          id: rule.id,
          severity: rule.severity,
          category: rule.category,
          priority: rule.priority,
          observedFinding: interpolate(rule.observedFinding, metrics),
          supportingIndicator: interpolate(rule.supportingIndicator, metrics),
          potentialExplanation: rule.potentialExplanation,
          evidenceLimitations: rule.evidenceLimitations,
          suggestedInvestigation: rule.suggestedInvestigation,
          possibleInstitutionalDecisions: rule.possibleInstitutionalDecisions,
          threshold: rule.threshold
        };
        recommendations.push(recommendation);
      }
    } catch (err) {
      console.error(`Error evaluating rule ${rule.id}:`, err);
    }
  });

  return recommendations;
}

/**
 * Evaluate a condition string against metrics
 */
function evaluateCondition(condition, metrics) {
  if (!condition) return false;

  try {
    // Replace metric names with actual values
    let evalStr = condition;
    Object.keys(metrics).forEach(key => {
      const value = metrics[key];
      if (value !== null && value !== undefined) {
        evalStr = evalStr.replace(new RegExp(key, 'g'), value);
      }
    });

    // Evaluate boolean expression
    // Convert AND/OR to JavaScript operators
    evalStr = evalStr.replace(/\bAND\b/g, '&&').replace(/\bOR\b/g, '||');
    
    // Safety: Only allow simple numeric comparisons
    if (!/^[\d\s<>=&|().]+$/.test(evalStr)) {
      console.warn('Invalid condition string:', condition);
      return false;
    }

    return eval(evalStr);
  } catch (err) {
    console.error('Error evaluating condition:', condition, err);
    return false;
  }
}

/**
 * Replace {{variable}} placeholders with actual values
 */
function interpolate(template, metrics) {
  if (!template) return '';
  
  let result = template;
  const matches = template.match(/\{\{([^}]+)\}\}/g);
  
  if (matches) {
    matches.forEach(match => {
      const key = match.replace(/\{\{|\}\}/g, '');
      const value = metrics[key];
      
      if (value !== null && value !== undefined) {
        // Format numbers appropriately
        const formatted = typeof value === 'number'
          ? (value % 1 === 0 ? value.toLocaleString() : value.toFixed(1))
          : value;
        result = result.replace(match, formatted);
      }
    });
  }
  
  return result;
}
