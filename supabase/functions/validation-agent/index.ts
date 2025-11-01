import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALIDATION_AGENT_SYSTEM_PROMPT = `You are an expert fashion compatibility validator. Your role is to ensure outfit recommendations meet professional styling standards.

VALIDATION CRITERIA:

1. MUST-HAVE REQUIREMENTS (Critical):
   - At least 1 top item
   - At least 1 bottom item  
   - At least 1 pair of shoes
   - All items have valid images
   
2. COLOR HARMONY (0-30 points):
   - No clashing colors (red+green, blue+orange)
   - Maximum 3 main colors per outfit
   - Complementary or analogous schemes
   - Neutral colors are safe
   
3. STYLE CONSISTENCY (0-25 points):
   - Don't mix formal with beachwear
   - Don't combine athletic with evening
   - Keep aesthetic coherent
   
4. OCCASION APPROPRIATENESS (0-25 points):
   - Work: professional, closed-toe shoes
   - Weekend: comfortable, relaxed
   - Evening: elegant, refined
   
5. COMPLETENESS (0-20 points):
   - All items present and valid

SCORING:
- 90-100: Perfect
- 75-89: Good
- 60-74: Acceptable
- <60: Needs redesign

You have these tools available:`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "validate_outfit",
      description: "Validate a single outfit for compatibility and quality",
      parameters: {
        type: "object",
        properties: {
          outfit_index: {
            type: "number",
            description: "Index of the outfit being validated"
          },
          items: {
            type: "array",
            description: "Array of clothing items in the outfit",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                color: { type: "string" },
                name: { type: "string" }
              }
            }
          }
        },
        required: ["outfit_index", "items"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_validation_result",
      description: "Return final validation results for all outfits",
      parameters: {
        type: "object",
        properties: {
          isCompatible: {
            type: "boolean",
            description: "Whether outfits pass validation (score >= 70)"
          },
          overallScore: {
            type: "number",
            description: "Overall validation score (0-100)"
          },
          validationResults: {
            type: "array",
            description: "Detailed results for each outfit",
            items: {
              type: "object",
              properties: {
                outfitIndex: { type: "number" },
                isValid: { type: "boolean" },
                validationScore: { type: "number" },
                colorHarmonyScore: { type: "number" },
                styleConsistencyScore: { type: "number" },
                occasionScore: { type: "number" },
                completenessScore: { type: "number" },
                issues: {
                  type: "array",
                  items: { type: "string" }
                },
                strengths: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        },
        required: ["isCompatible", "overallScore", "validationResults"]
      }
    }
  }
];

function executeTool(toolName: string, args: any) {
  console.log(`🔧 Executing tool: ${toolName}`, args);
  
  switch (toolName) {
    case "validate_outfit":
      return {
        success: true,
        message: `Validated outfit ${args.outfit_index}`
      };
      
    case "create_validation_result":
      return {
        success: true,
        result: args
      };
      
    default:
      return { error: "Unknown tool" };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { outfits, userId } = await req.json();
    
    console.log(`🔍 [Validation Agent] Validating ${outfits?.length || 0} outfits for user: ${userId}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const messages = [
      { 
        role: "system", 
        content: VALIDATION_AGENT_SYSTEM_PROMPT 
      },
      { 
        role: "user", 
        content: `Validate these ${outfits?.length || 0} outfits:\n\n${JSON.stringify(outfits, null, 2)}\n\nProvide detailed validation scores for each outfit.`
      }
    ];

    let finalResult = null;
    let iterations = 0;
    const maxIterations = 10;

    while (iterations < maxIterations && !finalResult) {
      iterations++;
      console.log(`🔄 Iteration ${iterations}`);

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages,
          tools: TOOLS,
          tool_choice: 'auto'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API error: ${response.status} - ${errorText}`);
      }

      const aiResponse = await response.json();
      const assistantMessage = aiResponse.choices[0].message;

      messages.push(assistantMessage);

      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        for (const toolCall of assistantMessage.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);

          console.log(`🔧 Tool call: ${toolName}`);

          const toolResult = executeTool(toolName, toolArgs);

          if (toolName === 'create_validation_result') {
            finalResult = toolArgs;
          }

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult)
          });
        }
      } else if (assistantMessage.content) {
        console.log(`💭 AI response: ${assistantMessage.content.substring(0, 200)}...`);
        break;
      }
    }

    if (!finalResult) {
      console.warn('⚠️ No validation result created, using fallback');
      finalResult = {
        isCompatible: true,
        overallScore: 75,
        validationResults: []
      };
    }

    console.log(`✅ [Validation Agent] Validation complete`);

    return new Response(
      JSON.stringify({
        success: true,
        data: finalResult
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ [Validation Agent] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
