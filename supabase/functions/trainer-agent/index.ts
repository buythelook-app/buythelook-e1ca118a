
import { corsHeaders } from '../_shared/cors.ts'
import { TrainerAgentResponse } from './types.ts'
import { DatabaseService } from './databaseService.ts'
import { AgentResultsGenerator } from './agentResultsGenerator.ts'

// Generate outfit results using database items
async function generateAgentResults(): Promise<any[]> {
  try {
    console.log("🔍 [DEBUG] Trainer Agent: Starting to generate agent results...");
    
    const databaseService = new DatabaseService();
    const resultsGenerator = new AgentResultsGenerator();
    
    // Check if table exists
    const tableCheck = await databaseService.checkTableExists();
    if (!tableCheck.success) {
      console.error("❌ [DEBUG] Table check failed:", tableCheck.error);
      return [];
    }
    
    // Get valid items
    const itemsResult = await databaseService.getValidItems();
    if (!itemsResult.success || !itemsResult.items) {
      console.error("❌ [DEBUG] Failed to get valid items:", itemsResult.error);
      return [];
    }
    
    // Generate results
    const results = resultsGenerator.generateResults(itemsResult.items);
    
    return results;
    
  } catch (error) {
    console.error("❌ [DEBUG] Error in generateAgentResults:", error);
    return [];
  }
}

// Log cron execution
async function logCronExecution(status: 'started' | 'completed' | 'failed', details?: any) {
  try {
    console.log(`🕒 [CRON] Trainer Agent cron job ${status}`, details ? { details } : {});
    
    // Create a simple log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      status,
      type: 'cron_execution',
      details: details || {}
    };
    
    console.log(`📝 [CRON] Log entry:`, logEntry);
  } catch (error) {
    console.error("❌ [CRON] Failed to log cron execution:", error);
  }
}

// Main handler for the edge function
Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    console.log("🔍 [DEBUG] Trainer Agent Edge Function starting...");
    
    // Check if this is a cron call
    const userAgent = req.headers.get('user-agent') || '';
    const isCronCall = userAgent.includes('Supabase-Cron') || req.headers.get('x-supabase-cron') === 'true';
    
    if (isCronCall) {
      await logCronExecution('started');
      console.log("🕒 [CRON] Trainer Agent called by cron scheduler");
    }
    
    // Generate results using database items
    const agentResults = await generateAgentResults();
    
    if (agentResults.length === 0) {
      console.log("❌ [DEBUG] No agent results generated");
      
      if (isCronCall) {
        await logCronExecution('failed', { reason: 'No results generated' });
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          status: "no_results",
          results: [],
          message: "No items available in database or connection failed",
          isCronCall
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200
        }
      );
    }
    
    // Create response
    const response: TrainerAgentResponse = {
      success: true,
      status: "completed",
      results: agentResults
    };
    
    console.log(`✅ [DEBUG] Returning ${agentResults.length} agent results`);
    
    if (isCronCall) {
      await logCronExecution('completed', { 
        resultsCount: agentResults.length,
        executionTime: new Date().toISOString()
      });
    }
    
    // Return the response
    return new Response(
      JSON.stringify({
        ...response,
        isCronCall,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
    
  } catch (error) {
    // Handle errors
    console.error("❌ [DEBUG] Error in trainer-agent:", error);
    
    // Check if this was a cron call for error logging
    const userAgent = req.headers.get('user-agent') || '';
    const isCronCall = userAgent.includes('Supabase-Cron') || req.headers.get('x-supabase-cron') === 'true';
    
    if (isCronCall) {
      await logCronExecution('failed', { 
        error: error.message,
        stack: error.stack 
      });
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        status: "error",
        results: [],
        message: error.message,
        isCronCall,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});
