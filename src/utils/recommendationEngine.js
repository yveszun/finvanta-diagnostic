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
  
  // Support both Phase 3 analytics structure and legacy test structure
  const cascade = analyticsData.analytics?.facilityParticipationCascade;
  const claimsCascade = analyticsData.analytics?.claimsProcessingCascade;
  const legacySummary = analyticsData.summary;

  // Calculate metrics from analytics data
  // Use safe division that handles zero denominators correctly
  const safeDivide = (numerator, denominator) => {
    if (denominator === null || denominator === undefined || denominator === 0) {
      return null;
    }
    if (numerator === null || numerator === undefined) {
      return null;
    }
    return (numerator / denominator) * 100;
  };

  const metrics = cascade ? {
    // Phase 3 analytics structure
    // Facility-level metrics
    accreditationRate: safeDivide(
      cascade.stage2_accredited?.count,
      cascade.stage1_eligible?.count
    ),
    filingRate: safeDivide(
      cascade.stage3_claiming?.count,
      cascade.stage2_accredited?.count
    ),
    paymentRate: safeDivide(
      cascade.stage4_receiving_payment?.count,
      cascade.stage3_claiming?.count
    ),
    
    // Claim-level metrics - CORRECTED
    approvalRate: safeDivide(
      claimsCascade?.stage4_approved?.count,
      claimsCascade?.stage3_adjudicated?.count
    ),
    
    // Facility counts
    stage1_eligibleFacilities: cascade.stage1_eligible?.count || 0,
    stage2_accreditedFacilities: cascade.stage2_accredited?.count || 0,
    stage3_filingFacilities: cascade.stage3_claiming?.count || 0,
    stage4_receivingPaymentFacilities: cascade.stage4_receiving_payment?.count || 0,
    
    // Claim counts - CORRECTED
    stage1_submittedClaims: claimsCascade?.stage1_submitted?.count || 0,
    stage3_adjudicatedClaims: claimsCascade?.stage3_adjudicated?.count || 0,
    stage4_approvedClaims: claimsCascade?.stage4_approved?.count || 0,
    stage5_paidClaims: claimsCascade?.stage5_paid?.count || 0,
    
    // Processing time
    averageDaysToPayment: analyticsData.analytics?.financialCalculations?.paymentProcessingTime?.average
      ? parseFloat(analyticsData.analytics.financialCalculations.paymentProcessingTime.average)
      : null
  } : {
    // Legacy structure for backward compatibility (tests)
    accreditationRate: safeDivide(
      legacySummary?.accredited_facilities,
      legacySummary?.total_facilities
    ),
    filingRate: safeDivide(
      legacySummary?.facilities_filing_claims,
      legacySummary?.accredited_facilities
    ),
    paymentRate: safeDivide(
      legacySummary?.facilities_receiving_payment,
      legacySummary?.facilities_filing_claims
    ),
    approvalRate: safeDivide(
      legacySummary?.approved_claims,
      legacySummary?.total_claims
    ),
    stage1_eligibleFacilities: legacySummary?.total_facilities || 0,
    stage2_accreditedFacilities: legacySummary?.accredited_facilities || 0,
    stage3_filingFacilities: legacySummary?.facilities_filing_claims || 0,
    stage4_receivingPaymentFacilities: legacySummary?.facilities_receiving_payment || 0,
    stage1_submittedClaims: legacySummary?.total_claims || 0,
    stage3_adjudicatedClaims: legacySummary?.total_claims || 0, // Legacy: total_claims used as proxy
    stage4_approvedClaims: legacySummary?.approved_claims || 0,
    stage5_paidClaims: legacySummary?.paid_claims || 0,
    averageDaysToPayment: legacySummary?.avg_days_to_payment || null
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
 * Evaluate a condition string against metrics using a safe expression parser
 * Supports: <, <=, >, >=, ==, !=, AND, OR, parentheses
 * Does NOT use eval() or Function constructor
 */
function evaluateCondition(condition, metrics) {
  if (!condition) return false;

  try {
    // Replace metric names with actual values
    let expression = condition;
    
    // Sort keys by length (longest first) to avoid partial replacements
    const sortedKeys = Object.keys(metrics).sort((a, b) => b.length - a.length);
    
    sortedKeys.forEach(key => {
      const value = metrics[key];
      if (value !== null && value !== undefined) {
        // Replace whole word only to avoid partial matches
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        expression = expression.replace(regex, String(value));
      } else {
        // If metric is missing, replace with a value that will fail comparisons safely
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        expression = expression.replace(regex, 'null');
      }
    });

    // Convert AND/OR to JavaScript equivalents for parsing
    expression = expression.replace(/\bAND\b/g, '&&').replace(/\bOR\b/g, '||');
    
    // Check if all metrics were replaced (no remaining letters except for null)
    if (/[a-zA-Z]/.test(expression.replace(/null/g, ''))) {
      console.warn('Unresolved metrics in condition:', expression, 'original:', condition);
      return false;
    }
    
    // Parse and evaluate the safe expression
    return evaluateSafeExpression(expression);
  } catch (err) {
    console.error('Error evaluating condition:', condition, err);
    return false;
  }
}

/**
 * Safe expression evaluator - NO eval() or Function constructor
 * Tokenizes and evaluates comparison and boolean expressions
 */
function evaluateSafeExpression(expr) {
  // Remove whitespace for easier parsing
  expr = expr.trim();
  
  // Check for null values in expression
  if (expr.includes('null')) {
    // Any comparison involving null returns false
    return false;
  }
  
  // Handle OR (lowest precedence)
  if (expr.includes('||')) {
    const parts = splitByOperator(expr, '||');
    return parts.some(part => evaluateSafeExpression(part));
  }
  
  // Handle AND (higher precedence than OR)
  if (expr.includes('&&')) {
    const parts = splitByOperator(expr, '&&');
    return parts.every(part => evaluateSafeExpression(part));
  }
  
  // Handle parentheses
  if (expr.startsWith('(') && expr.endsWith(')')) {
    return evaluateSafeExpression(expr.slice(1, -1));
  }
  
  // Handle comparison operators
  return evaluateComparison(expr);
}

/**
 * Split expression by operator while respecting parentheses
 */
function splitByOperator(expr, operator) {
  const parts = [];
  let current = '';
  let depth = 0;
  let i = 0;
  
  while (i < expr.length) {
    const char = expr[i];
    const next = expr[i + 1];
    
    if (char === '(') {
      depth++;
      current += char;
      i++;
    } else if (char === ')') {
      depth--;
      current += char;
      i++;
    } else if (depth === 0 && char === operator[0] && next === operator[1]) {
      parts.push(current.trim());
      current = '';
      i += 2;
    } else {
      current += char;
      i++;
    }
  }
  
  if (current.trim()) {
    parts.push(current.trim());
  }
  
  return parts;
}

/**
 * Evaluate a single comparison expression (e.g., "10 < 20")
 */
function evaluateComparison(expr) {
  // Extract comparison operator and operands
  // Updated to handle negative numbers and decimals better
  const comparisonRegex = /^(-?[\d.]+)\s*([<>]=?|[!=]=)\s*(-?[\d.]+)$/;
  const match = expr.match(comparisonRegex);
  
  if (!match) {
    console.warn('Invalid comparison expression:', expr);
    return false;
  }
  
  const left = parseFloat(match[1]);
  const operator = match[2];
  const right = parseFloat(match[3]);
  
  if (isNaN(left) || isNaN(right)) {
    console.warn('Non-numeric values in comparison:', expr);
    return false;
  }
  
  switch (operator) {
    case '<': return left < right;
    case '<=': return left <= right;
    case '>': return left > right;
    case '>=': return left >= right;
    case '==': return left === right;
    case '!=': return left !== right;
    default:
      console.warn('Unsupported operator:', operator);
      return false;
  }
}

/**
 * Replace {{variable}} placeholders with actual values
 * Correctly handles zero values (0 is valid, not null/undefined)
 */
function interpolate(template, metrics) {
  if (!template) return '';
  
  let result = template;
  const matches = template.match(/\{\{([^}]+)\}\}/g);
  
  if (matches) {
    matches.forEach(match => {
      const key = match.replace(/\{\{|\}\}/g, '');
      const value = metrics[key];
      
      // Explicit check: null and undefined are invalid, but 0 is valid
      if (value !== null && value !== undefined) {
        // Format numbers appropriately
        const formatted = typeof value === 'number'
          ? (value % 1 === 0 ? value.toLocaleString() : value.toFixed(1))
          : value;
        result = result.replace(match, formatted);
      } else {
        // Replace with N/A for missing values
        result = result.replace(match, 'N/A');
      }
    });
  }
  
  return result;
}
