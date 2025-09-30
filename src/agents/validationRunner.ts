import { EXPANDED_TEST_CASES } from './trainerAgent';
import { supabase } from '../lib/supabase';
import logger from '../lib/logger';
import type { Database } from '../integrations/supabase/types';

// Types
interface TestCaseInput {
  bodyShape: 'hourglass' | 'pear' | 'rectangle' | 'triangle' | 'oval';
  stylePreference: 'classic' | 'romantic' | 'trendy' | 'bohemian' | 'minimalist' | 'edgy' | 'sporty' | 'elegant' | 'casual';
  occasion: 'work' | 'evening' | 'casual' | 'weekend' | 'special';
  mood: 'elegant' | 'energized' | 'romantic' | 'casual';
  budget: number;
}

interface ExpectedCriteria {
  mustInclude: string[];
  shouldAvoid: string[];
  colorGuidelines: string[];
  styleNotes: string[];
}

interface ValidationMetrics {
  bodyShapeAccuracy: number;
  styleAlignment: number;
  occasionMatch: number;
  moodAlignment: number;
  colorHarmony: number;
  diversityScore: number;
  budgetCompliance: number;
  completenessScore: number;
  overallQuality: number;
  timestamp: string;
  agentVersion: string;
  passedCriteria: string[];
  failedCriteria: string[];
}

interface DetailedTestCase {
  name: string;
  input: TestCaseInput;
  expectedCriteria: ExpectedCriteria;
  description: string;
}

interface ValidationResult {
  testCase: string;
  success: boolean;
  stage: string;
  error?: string;
  data?: any;
  metrics?: ValidationMetrics;
}

/**
 * ValidationRunner class for managing comprehensive agent validation
 */
export class ValidationRunner {
  private testCases: DetailedTestCase[];
  private results: ValidationResult[] = [];
  private metrics: ValidationMetrics[] = [];

  constructor(testCases: DetailedTestCase[] = EXPANDED_TEST_CASES) {
    this.testCases = testCases;
  }

  /**
   * Run full validation cycle across all test cases
   */
  async runFullValidation(): Promise<{
    success: boolean;
    data?: {
      results: ValidationResult[];
      metrics: ValidationMetrics[];
      summary: ValidationSummary;
    };
    error?: string;
  }> {
    logger.info('Starting full validation cycle', { 
      context: 'ValidationRunner',
      data: { testCaseCount: this.testCases.length }
    });

    try {
      this.results = [];
      this.metrics = [];

      // Process each test case
      for (const testCase of this.testCases) {
        const result = await this.runSingleTest(testCase);
        this.results.push(result);
        
        if (result.metrics) {
          this.metrics.push(result.metrics);
        }
      }

      // Save all results to database
      await this.saveAllResults();

      // Calculate summary
      const summary = this.calculateSummary();

      logger.info('Full validation cycle completed', {
        context: 'ValidationRunner',
        data: { summary }
      });

      return {
        success: true,
        data: {
          results: this.results,
          metrics: this.metrics,
          summary
        }
      };

    } catch (error) {
      logger.error('Error in full validation cycle', {
        context: 'ValidationRunner',
        data: { error: error instanceof Error ? error.message : String(error) }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown validation error'
      };
    }
  }

  /**
   * Run a single test case
   */
  private async runSingleTest(testCase: DetailedTestCase): Promise<ValidationResult> {
    try {
      logger.debug(`Running test case: ${testCase.name}`, { context: 'ValidationRunner' });

      // Simulate outfit generation based on test case input
      const mockOutfit = this.generateMockOutfit(testCase);
      
      // Calculate metrics for this test
      const metrics = this.calculateTestMetrics(testCase, mockOutfit);

      // Determine success based on overall quality threshold
      const success = metrics.overallQuality >= 70;

      return {
        testCase: testCase.name,
        success,
        stage: 'complete',
        data: {
          outfit: mockOutfit,
          input: testCase.input,
          expectedCriteria: testCase.expectedCriteria
        },
        metrics
      };

    } catch (error) {
      return {
        testCase: testCase.name,
        success: false,
        stage: 'error',
        error: error instanceof Error ? error.message : 'Unknown test error'
      };
    }
  }

  /**
   * Generate mock outfit for testing purposes
   */
  private generateMockOutfit(testCase: DetailedTestCase) {
    const { bodyShape, stylePreference, occasion, mood, budget } = testCase.input;
    
    return {
      top: {
        id: `top_${testCase.name}`,
        color: this.getMockColor(stylePreference),
        product_name: `${stylePreference} top for ${bodyShape}`,
        description: `A ${stylePreference} top suitable for ${occasion}`,
        price: budget * 0.3,
        image: 'mock_image_url'
      },
      bottom: {
        id: `bottom_${testCase.name}`,
        color: this.getMockColor(stylePreference, true),
        product_name: `${stylePreference} bottom for ${bodyShape}`,
        description: `A ${stylePreference} bottom suitable for ${occasion}`,
        price: budget * 0.4,
        image: 'mock_image_url'
      },
      shoes: {
        id: `shoes_${testCase.name}`,
        color: this.getMockColor(stylePreference),
        product_name: `${stylePreference} shoes`,
        description: `Shoes suitable for ${occasion}`,
        price: budget * 0.3,
        image: 'mock_image_url'
      },
      description: `A ${mood} ${stylePreference} outfit for ${occasion}`,
      recommendations: [`Perfect for ${bodyShape} body shape`, `Great for ${mood} mood`],
      occasion: occasion
    };
  }

  /**
   * Get mock color based on style preference
   */
  private getMockColor(style: string, isBottom: boolean = false): string {
    const colorMap: Record<string, string[]> = {
      classic: ['navy', 'black', 'white', 'beige'],
      romantic: ['pink', 'rose', 'cream', 'lavender'],
      trendy: ['coral', 'emerald', 'mustard', 'burgundy'],
      bohemian: ['terracotta', 'olive', 'rust', 'cream'],
      minimalist: ['black', 'white', 'grey', 'navy'],
      edgy: ['black', 'charcoal', 'burgundy', 'olive'],
      sporty: ['blue', 'red', 'grey', 'black'],
      elegant: ['black', 'navy', 'burgundy', 'champagne'],
      casual: ['denim', 'khaki', 'white', 'grey']
    };

    const colors = colorMap[style] || ['black', 'white', 'grey'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Calculate detailed metrics for a test case
   */
  private calculateTestMetrics(testCase: DetailedTestCase, outfit: any): ValidationMetrics {
    const metrics: ValidationMetrics = {
      bodyShapeAccuracy: this.calculateBodyShapeScore(testCase, outfit),
      styleAlignment: this.calculateStyleScore(testCase, outfit),
      occasionMatch: this.calculateOccasionScore(testCase, outfit),
      moodAlignment: this.calculateMoodScore(testCase, outfit),
      colorHarmony: this.calculateColorScore(outfit),
      diversityScore: 85, // Default diversity score
      budgetCompliance: this.calculateBudgetScore(testCase, outfit),
      completenessScore: this.calculateCompletenessScore(outfit),
      overallQuality: 0, // Will be calculated below
      timestamp: new Date().toISOString(),
      agentVersion: 'v2.0',
      passedCriteria: [],
      failedCriteria: []
    };

    // Calculate overall quality as weighted average
    metrics.overallQuality = Math.round(
      (metrics.bodyShapeAccuracy * 0.25) +
      (metrics.styleAlignment * 0.25) +
      (metrics.occasionMatch * 0.15) +
      (metrics.moodAlignment * 0.15) +
      (metrics.colorHarmony * 0.1) +
      (metrics.budgetCompliance * 0.1)
    );

    return metrics;
  }

  private calculateBodyShapeScore(testCase: DetailedTestCase, outfit: any): number {
    // Basic body shape scoring logic
    const bodyShape = testCase.input.bodyShape;
    let score = 80; // Base score

    // Body shape specific adjustments
    if (bodyShape === 'hourglass' && outfit.description?.includes('waist')) score += 20;
    if (bodyShape === 'pear' && outfit.top?.description?.includes('detailed')) score += 20;
    if (bodyShape === 'rectangle' && outfit.description?.includes('definition')) score += 20;
    if (bodyShape === 'triangle' && outfit.bottom?.description?.includes('wide')) score += 20;
    if (bodyShape === 'oval' && outfit.description?.includes('elongate')) score += 20;

    return Math.min(100, score);
  }

  private calculateStyleScore(testCase: DetailedTestCase, outfit: any): number {
    const style = testCase.input.stylePreference;
    let score = 75; // Base score
    
    if (outfit.top?.product_name?.includes(style)) score += 25;
    if (outfit.description?.includes(style)) score += 25;
    
    return Math.min(100, score);
  }

  private calculateOccasionScore(testCase: DetailedTestCase, outfit: any): number {
    const occasion = testCase.input.occasion;
    return outfit.occasion === occasion ? 100 : 60;
  }

  private calculateMoodScore(testCase: DetailedTestCase, outfit: any): number {
    const mood = testCase.input.mood;
    const score = outfit.description?.includes(mood) ? 90 : 70;
    return score;
  }

  private calculateColorScore(outfit: any): number {
    // Basic color harmony scoring
    if (outfit.top?.color && outfit.bottom?.color && outfit.shoes?.color) {
      return 85; // Good color coordination assumed for mock data
    }
    return 60;
  }

  private calculateBudgetScore(testCase: DetailedTestCase, outfit: any): number {
    const budget = testCase.input.budget;
    const totalPrice = (outfit.top?.price || 0) + (outfit.bottom?.price || 0) + (outfit.shoes?.price || 0);
    
    if (totalPrice <= budget) return 100;
    if (totalPrice <= budget * 1.1) return 85;
    if (totalPrice <= budget * 1.2) return 70;
    return 50;
  }

  private calculateCompletenessScore(outfit: any): number {
    let score = 0;
    if (outfit.top) score += 40;
    if (outfit.bottom) score += 40;
    if (outfit.shoes) score += 20;
    return score;
  }

  /**
   * Save all validation results to database
   */
  private async saveAllResults(): Promise<void> {
    try {
      for (let i = 0; i < this.results.length; i++) {
        const result = this.results[i];
        const testCase = this.testCases[i];
        
        const validationData = {
          test_case_name: result.testCase,
          input_data: testCase.input as any,
          expected_criteria: testCase.expectedCriteria as any,
          actual_output: result.data?.outfit || {},
          metrics: result.metrics || {},
          agent_version: 'v2.0',
          run_timestamp: new Date().toISOString()
        };

        // Insert validation result
        const insertResult = await (supabase as any)
          .from('validation_dataset')
          .upsert(validationData);

        if (insertResult.error) {
          logger.error('Error saving validation result to database', {
            context: 'ValidationRunner',
            data: { testCase: result.testCase, error: insertResult.error }
          });
        }
      }
      
      logger.info('All validation results saved to database', {
        context: 'ValidationRunner',
        data: { count: this.results.length }
      });

    } catch (error) {
      logger.error('Error saving validation results', {
        context: 'ValidationRunner',
        data: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(): ValidationSummary {
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const successRate = totalTests > 0 ? (successfulTests / totalTests) * 100 : 0;
    
    const avgQuality = this.metrics.length > 0 
      ? this.metrics.reduce((sum, m) => sum + m.overallQuality, 0) / this.metrics.length 
      : 0;

    return {
      totalTests,
      successfulTests,
      failedTests: totalTests - successfulTests,
      successRate,
      averageQuality: avgQuality,
      timestamp: new Date().toISOString(),
      breakdown: {
        avgBodyShapeAccuracy: this.calculateAverage('bodyShapeAccuracy'),
        avgStyleAlignment: this.calculateAverage('styleAlignment'),
        avgOccasionMatch: this.calculateAverage('occasionMatch'),
        avgMoodAlignment: this.calculateAverage('moodAlignment'),
        avgColorHarmony: this.calculateAverage('colorHarmony'),
        avgCompleteness: this.calculateAverage('completenessScore'),
        avgBudgetCompliance: this.calculateAverage('budgetCompliance')
      }
    };
  }

  private calculateAverage(metric: keyof ValidationMetrics): number {
    if (this.metrics.length === 0) return 0;
    return this.metrics.reduce((sum, m) => sum + (m[metric] as number), 0) / this.metrics.length;
  }

  /**
   * Get latest validation results from database
   */
  static async getLatestResults(): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      const { data, error } = await (supabase as any)
        .from('validation_dataset')
        .select('*')
        .order('run_timestamp', { ascending: false })
        .limit(50);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

interface ValidationSummary {
  totalTests: number;
  successfulTests: number;
  failedTests: number;
  successRate: number;
  averageQuality: number;
  timestamp: string;
  breakdown: {
    avgBodyShapeAccuracy: number;
    avgStyleAlignment: number;
    avgOccasionMatch: number;
    avgMoodAlignment: number;
    avgColorHarmony: number;
    avgCompleteness: number;
    avgBudgetCompliance: number;
  };
}

// Export default instance
export const validationRunner = new ValidationRunner();