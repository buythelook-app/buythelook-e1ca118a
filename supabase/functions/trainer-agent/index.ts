
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

// Main handler for the edge function
Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    console.log("🔍 [DEBUG] Trainer Agent Edge Function starting...");
    
    // Generate results using database items
    const agentResults = await generateAgentResults();
    
    if (agentResults.length === 0) {
      console.log("❌ [DEBUG] No agent results generated");
      return new Response(
        JSON.stringify({
          success: false,
          status: "no_results",
          results: [],
          message: "No items available in database or connection failed"
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
    
    // Return the response
    return new Response(
      JSON.stringify(response),
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
    
    return new Response(
      JSON.stringify({
        success: false,
        status: "error",
        results: [],
        message: error.message
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
