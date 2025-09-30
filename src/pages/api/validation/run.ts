import { ValidationRunner } from '../../../agents/validationRunner';
import { supabase } from '../../../integrations/supabase/client';

// Simulated API endpoint for validation (since we're in a React app, not Next.js)
// This can be called from the frontend directly

interface ValidationApiResponse {
  success: boolean;
  data?: {
    results: any[];
    metrics: any[];
    summary: any;
  };
  error?: string;
}

/**
 * Run full validation cycle - simulated API endpoint
 * In a real API, this would be a server endpoint
 */
export async function runValidationApi(): Promise<ValidationApiResponse> {
  try {
    console.log('[ValidationAPI] Starting validation run...');
    
    const runner = new ValidationRunner();
    const result = await runner.runFullValidation();
    
    if (result.success) {
      console.log('[ValidationAPI] Validation completed successfully');
      return {
        success: true,
        data: result.data
      };
    } else {
      console.error('[ValidationAPI] Validation failed:', result.error);
      return {
        success: false,
        error: result.error || 'Validation failed'
      };
    }
  } catch (error) {
    console.error('[ValidationAPI] Error in validation API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown API error'
    };
  }
}

/**
 * Get latest validation results from database
 */
export async function getValidationResultsApi(): Promise<ValidationApiResponse> {
  try {
    console.log('[ValidationAPI] Fetching latest results...');
    
    const result = await ValidationRunner.getLatestResults();
    
    if (result.success) {
      return {
        success: true,
        data: {
          results: result.data || [],
          metrics: [],
          summary: null
        }
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to fetch results'
      };
    }
  } catch (error) {
    console.error('[ValidationAPI] Error fetching results:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown fetch error'
    };
  }
}

/**
 * Clear all validation results from database
 */
export async function clearValidationResultsApi(): Promise<ValidationApiResponse> {
  try {
    console.log('[ValidationAPI] Clearing validation results...');
    
    const { error } = await (supabase as any)
      .from('validation_dataset')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except a non-existent id
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    console.log('[ValidationAPI] Validation results cleared successfully');
    return {
      success: true,
      data: {
        results: [],
        metrics: [],
        summary: null
      }
    };
  } catch (error) {
    console.error('[ValidationAPI] Error clearing results:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown clear error'
    };
  }
}

/**
 * Get validation statistics
 */
export async function getValidationStatsApi(): Promise<ValidationApiResponse> {
  try {
    console.log('[ValidationAPI] Fetching validation statistics...');
    
    const { data, error } = await (supabase as any)
      .from('validation_dataset')
      .select('*')
      .order('run_timestamp', { ascending: false });
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    // Calculate statistics
    const results = data || [];
    const totalTests = results.length;
    
    if (totalTests === 0) {
      return {
        success: true,
        data: {
          results: [],
          metrics: [],
          summary: {
            totalTests: 0,
            successfulTests: 0,
            failedTests: 0,
            successRate: 0,
            averageQuality: 0,
            lastRun: null
          }
        }
      };
    }
    
    const latestRun = results[0]?.run_timestamp;
    const latestResults = results.filter(r => r.run_timestamp === latestRun);
    
    const successfulTests = latestResults.filter(r => {
      const metrics = r.metrics;
      return metrics && typeof metrics === 'object' && metrics.overallQuality >= 70;
    }).length;
    
    const failedTests = latestResults.length - successfulTests;
    const successRate = latestResults.length > 0 ? (successfulTests / latestResults.length) * 100 : 0;
    
    const avgQuality = latestResults.reduce((sum, r) => {
      const metrics = r.metrics;
      if (metrics && typeof metrics === 'object' && metrics.overallQuality) {
        return sum + metrics.overallQuality;
      }
      return sum;
    }, 0) / (latestResults.length || 1);
    
    return {
      success: true,
      data: {
        results: latestResults,
        metrics: latestResults.map(r => r.metrics).filter(Boolean),
        summary: {
          totalTests: latestResults.length,
          successfulTests,
          failedTests,
          successRate,
          averageQuality: avgQuality,
          lastRun: latestRun,
          timestamp: latestRun
        }
      }
    };
  } catch (error) {
    console.error('[ValidationAPI] Error fetching stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown stats error'
    };
  }
}

// Export the API functions
export default {
  runValidation: runValidationApi,
  getResults: getValidationResultsApi,
  clearResults: clearValidationResultsApi,
  getStats: getValidationStatsApi
};