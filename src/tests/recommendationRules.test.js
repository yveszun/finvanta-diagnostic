import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Recommendation Rules Configuration', () => {
  let recommendationRules;
  let metricsSchema;

  beforeAll(() => {
    // Load configuration files from filesystem
    const rulesPath = path.resolve(process.cwd(), 'public/config/recommendationRules.json');
    recommendationRules = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));
    
    const schemaPath = path.resolve(process.cwd(), 'public/config/metricsSchema.json');
    metricsSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  });

  it('should load recommendation rules successfully', () => {
    expect(recommendationRules).toBeDefined();
    expect(recommendationRules.rules).toBeInstanceOf(Array);
    expect(recommendationRules.rules.length).toBeGreaterThan(0);
  });

  it('should load metrics schema successfully', () => {
    expect(metricsSchema).toBeDefined();
    expect(metricsSchema.facilityCascadeMetrics).toBeDefined();
    expect(metricsSchema.claimsCascadeMetrics).toBeDefined();
  });

  it('every rule should have required fields', () => {
    recommendationRules.rules.forEach(rule => {
      expect(rule.id, `Rule missing id`).toBeDefined();
      expect(rule.condition, `Rule ${rule.id} missing condition`).toBeDefined();
      expect(rule.severity, `Rule ${rule.id} missing severity`).toBeDefined();
      expect(rule.category, `Rule ${rule.id} missing category`).toBeDefined();
      expect(rule.observedFinding, `Rule ${rule.id} missing observedFinding`).toBeDefined();
      expect(rule.supportingIndicator, `Rule ${rule.id} missing supportingIndicator`).toBeDefined();
    });
  });

  it('every rule should specify required metrics', () => {
    recommendationRules.rules.forEach(rule => {
      expect(rule.metricsRequired, `Rule ${rule.id} missing metricsRequired array`).toBeDefined();
      expect(rule.metricsRequired, `Rule ${rule.id} metricsRequired should be array`).toBeInstanceOf(Array);
      expect(rule.metricsRequired.length, `Rule ${rule.id} should require at least one metric`).toBeGreaterThan(0);
    });
  });

  it('all required metrics should exist in schema', () => {
    const allSchemaMetrics = new Set([
      ...Object.keys(metricsSchema.facilityCascadeMetrics),
      ...Object.keys(metricsSchema.claimsCascadeMetrics),
      ...Object.keys(metricsSchema.financialMetrics),
      ...Object.keys(metricsSchema.timelineMetrics),
      ...Object.keys(metricsSchema.regionalMetrics)
    ]);

    recommendationRules.rules.forEach(rule => {
      rule.metricsRequired.forEach(metric => {
        expect(
          allSchemaMetrics.has(metric),
          `Rule ${rule.id} references undefined metric: ${metric}`
        ).toBe(true);
      });
    });
  });

  it('observedFinding should use valid template variables', () => {
    const allSchemaMetrics = new Set([
      ...Object.keys(metricsSchema.facilityCascadeMetrics),
      ...Object.keys(metricsSchema.claimsCascadeMetrics),
      ...Object.keys(metricsSchema.financialMetrics),
      ...Object.keys(metricsSchema.timelineMetrics),
      ...Object.keys(metricsSchema.regionalMetrics)
    ]);

    recommendationRules.rules.forEach(rule => {
      // Extract template variables like {{metricName}}
      const templateVars = (rule.observedFinding.match(/\{\{(\w+)\}\}/g) || [])
        .map(v => v.replace(/\{\{|\}\}/g, ''));
      
      templateVars.forEach(varName => {
        expect(
          allSchemaMetrics.has(varName) || varName === 'bestRegion' || varName === 'worstRegion' || varName === 'maxRate' || varName === 'minRate',
          `Rule ${rule.id} observedFinding uses undefined variable: ${varName}`
        ).toBe(true);
      });
    });
  });

  it('supportingIndicator should use valid template variables', () => {
    const allSchemaMetrics = new Set([
      ...Object.keys(metricsSchema.facilityCascadeMetrics),
      ...Object.keys(metricsSchema.claimsCascadeMetrics),
      ...Object.keys(metricsSchema.financialMetrics),
      ...Object.keys(metricsSchema.timelineMetrics),
      ...Object.keys(metricsSchema.regionalMetrics)
    ]);

    recommendationRules.rules.forEach(rule => {
      // Extract template variables
      const templateVars = (rule.supportingIndicator.match(/\{\{(\w+)\}\}/g) || [])
        .map(v => v.replace(/\{\{|\}\}/g, ''));
      
      templateVars.forEach(varName => {
        expect(
          allSchemaMetrics.has(varName) || varName === 'bestRegion' || varName === 'worstRegion' || varName === 'maxRate' || varName === 'minRate',
          `Rule ${rule.id} supportingIndicator uses undefined variable: ${varName}`
        ).toBe(true);
      });
    });
  });

  it('template variables should match metricsRequired', () => {
    recommendationRules.rules.forEach(rule => {
      // Extract all template variables from text fields
      const textFields = [
        rule.observedFinding,
        rule.supportingIndicator
      ].join(' ');
      
      const templateVars = (textFields.match(/\{\{(\w+)\}\}/g) || [])
        .map(v => v.replace(/\{\{|\}\}/g, ''))
        .filter(v => !['bestRegion', 'worstRegion', 'maxRate', 'minRate'].includes(v)); // Exclude special regional vars
      
      // Remove duplicates
      const uniqueVars = [...new Set(templateVars)];
      
      // Every template variable should be in metricsRequired
      uniqueVars.forEach(varName => {
        expect(
          rule.metricsRequired.includes(varName),
          `Rule ${rule.id} uses template variable {{${varName}}} but doesn't list it in metricsRequired`
        ).toBe(true);
      });
    });
  });

  it('all rules should have ILLUSTRATIVE threshold labels', () => {
    recommendationRules.rules.forEach(rule => {
      if (rule.threshold) {
        if (Array.isArray(rule.threshold.values)) {
          // Multiple thresholds
          expect(rule.threshold.label, `Rule ${rule.id} threshold missing ILLUSTRATIVE label`).toContain('ILLUSTRATIVE');
        } else {
          // Single threshold
          expect(rule.threshold.label, `Rule ${rule.id} threshold missing ILLUSTRATIVE label`).toContain('ILLUSTRATIVE');
        }
      }
    });
  });

  it('conditions should use standardized metric names', () => {
    const validMetricNames = new Set([
      ...Object.keys(metricsSchema.facilityCascadeMetrics),
      ...Object.keys(metricsSchema.claimsCascadeMetrics),
      ...Object.keys(metricsSchema.financialMetrics),
      ...Object.keys(metricsSchema.timelineMetrics),
      ...Object.keys(metricsSchema.regionalMetrics)
    ]);

    recommendationRules.rules.forEach(rule => {
      // Extract metric names from condition (simple word extraction)
      const words = rule.condition.match(/[a-zA-Z_]\w+/g) || [];
      
      words.forEach(word => {
        // Skip operators and numbers
        if (['AND', 'OR', 'NOT'].includes(word)) return;
        
        // If it looks like a metric name (camelCase), validate it
        if (word.match(/^[a-z][a-zA-Z0-9_]*$/)) {
          expect(
            validMetricNames.has(word),
            `Rule ${rule.id} condition uses non-standardized metric name: ${word}`
          ).toBe(true);
        }
      });
    });
  });

  it('should have structured insight components', () => {
    recommendationRules.rules.forEach(rule => {
      expect(rule.observedFinding, `Rule ${rule.id} missing observedFinding`).toBeDefined();
      expect(rule.supportingIndicator, `Rule ${rule.id} missing supportingIndicator`).toBeDefined();
      expect(rule.potentialExplanation, `Rule ${rule.id} missing potentialExplanation`).toBeDefined();
      expect(rule.evidenceLimitations, `Rule ${rule.id} missing evidenceLimitations`).toBeDefined();
      expect(rule.suggestedInvestigation, `Rule ${rule.id} missing suggestedInvestigation`).toBeDefined();
      expect(rule.possibleInstitutionalDecisions, `Rule ${rule.id} missing possibleInstitutionalDecisions`).toBeDefined();
    });
  });

  it('potentialExplanation should use hypothesis language', () => {
    recommendationRules.rules.forEach(rule => {
      const lowerText = rule.potentialExplanation.toLowerCase();
      const hasHypothesisLanguage = 
        lowerText.includes('may indicate') ||
        lowerText.includes('could indicate') ||
        lowerText.includes('might indicate') ||
        lowerText.includes('suggests');
      
      expect(
        hasHypothesisLanguage,
        `Rule ${rule.id} potentialExplanation should use hypothesis language (may/could/might indicate)`
      ).toBe(true);
    });
  });

  it('evidenceLimitations should state what we do not know', () => {
    recommendationRules.rules.forEach(rule => {
      const lowerText = rule.evidenceLimitations.toLowerCase();
      const hasLimitationLanguage = 
        lowerText.includes('do not know') ||
        lowerText.includes('not available') ||
        lowerText.includes('unknown') ||
        lowerText.includes('not captured');
      
      expect(
        hasLimitationLanguage,
        `Rule ${rule.id} evidenceLimitations should explicitly state gaps (do not know, not available, unknown)`
      ).toBe(true);
    });
  });

  it('disclaimer should warn about illustrative thresholds', () => {
    expect(recommendationRules.disclaimer).toBeDefined();
    expect(recommendationRules.disclaimer.toUpperCase()).toContain('ILLUSTRATIVE');
    expect(recommendationRules.disclaimer.toLowerCase()).toContain('not established');
  });

  it('should have display guidelines for findings vs hypotheses', () => {
    expect(recommendationRules.displayGuidelines).toBeDefined();
    expect(recommendationRules.displayGuidelines.distinguishFindingsFromHypotheses).toBe(true);
    expect(recommendationRules.displayGuidelines.neverPresentAsEstablishedBenchmarks).toBe(true);
  });
});
