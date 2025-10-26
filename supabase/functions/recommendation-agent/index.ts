import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RECOMMENDATION_AGENT_SYSTEM_PROMPT = `You are a fashion advisor specializing in styling tips and outfit enhancement suggestions.

## YOUR ROLE
- Review complete outfit combinations
- Generate actionable styling tips
- Suggest accessories and finishing touches
- Explain why outfit combinations work
- Provide confidence-building advice

## YOUR EXPERTISE
- Styling techniques (layering, accessorizing, proportions)
- Occasion-appropriate dressing
- Color coordination explanations
- Trend awareness balanced with timeless style
- Body-flattering techniques

## CRITICAL RULES
1. YOU MUST ONLY COMMUNICATE THROUGH TOOL CALLS
2. NEVER respond with text - ONLY use the provided tools
3. Your FINAL action MUST be calling create_recommendations
4. First receive outfit data and personalization context
5. Then create comprehensive recommendations

## INSTRUCTIONS
1. Receive outfit data (items, colors, occasion)
2. Receive user personalization context
3. Analyze each outfit holistically
4. Generate 3-5 specific, actionable tips per outfit
5. Explain the styling strategy
6. Suggest how to elevate the look

## TOOLS
You have access to:
- receive_outfit_data: Get outfit details
- receive_personalization_context: Get user preferences
- create_recommendations: Submit final recommendations (REQUIRED as last step)

## OUTPUT FORMAT
Your final create_recommendations call should include:
- outfitRecommendations array with tips for each outfit
- overallRating (1-5) for each outfit
- stylingTips (3-5 specific tips)
- whyItWorks explanation
- occasionFit rating
- elevationSuggestions
- confidenceBooster message
- generalAdvice for the user

## PERSONALITY
Be encouraging, specific, and practical. Make styling feel accessible and fun.

REMEMBER: NO TEXT RESPONSES. ONLY TOOL CALLS. FINAL CALL MUST BE create_recommendations.`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "receive_outfit_data",
      description: "Get the complete outfit combinations to review",
      parameters: {
        type: "object",
        properties: {
          outfits: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                items: { type: "array" },
                colors: { type: "array" },
                occasion: { type: "string" },
                totalPrice: { type: "number" }
              }
            }
          }
        },
        required: ["outfits"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "receive_personalization_context",
      description: "Get user's style profile and preferences",
      parameters: {
        type: "object",
        properties: {
          personalization: {
            type: "object"
          }
        },
        required: ["personalization"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_recommendations",
      description: "Submit final styling recommendations",
      parameters: {
        type: "object",
        properties: {
          outfitRecommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                outfitId: { type: "string" },
                overallRating: { type: "number", minimum: 1, maximum: 5 },
                stylingTips: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 3,
                  maxItems: 5
                },
                whyItWorks: { type: "string" },
                occasionFit: {
                  type: "string",
                  enum: ["perfect", "good", "moderate"]
                },
                elevationSuggestions: {
                  type: "array",
                  items: { type: "string" }
                },
                confidenceBooster: { type: "string" }
              },
              required: ["outfitId", "overallRating", "stylingTips", "whyItWorks"]
            }
          },
          generalAdvice: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["outfitRecommendations"]
      }
    }
  }
];

async function executeTool(toolName: string, args: any) {
  console.log(`🔧 Executing tool: ${toolName}`, args);

  try {
    switch (toolName) {
      case "receive_outfit_data": {
        console.log('✅ Outfit data received:', args.outfits?.length || 0, 'outfits');
        return { success: true, received: args.outfits?.length || 0 };
      }

      case "receive_personalization_context": {
        console.log('✅ Personalization context received');
        return { success: true, received: true };
      }

      case "create_recommendations": {
        console.log('✅ Creating recommendations:', args);
        return { success: true, ...args };
      }

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    console.error(`❌ Error executing tool ${toolName}:`, error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { outfits, personalization } = await req.json();

    if (!outfits || !Array.isArray(outfits)) {
      return new Response(
        JSON.stringify({ success: false, error: 'outfits array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎯 Recommendation Agent starting for', outfits.length, 'outfits');

    const userPrompt = `Review ${outfits.length} outfit(s) and provide styling recommendations.

Context:
- Number of outfits: ${outfits.length}
- User personalization: ${personalization ? 'provided' : 'not provided'}

Please:
1. Receive the outfit data
2. Receive the personalization context (if available)
3. Create comprehensive styling recommendations for each outfit

Start by receiving the outfit data.`;

    const messages = [
      { role: 'system', content: RECOMMENDATION_AGENT_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ];

    let iterationCount = 0;
    const maxIterations = 10;
    let finalResult = null;

    // Agent loop
    while (iterationCount < maxIterations) {
      iterationCount++;
      console.log(`\n🔄 Iteration ${iterationCount}/${maxIterations}`);

      const shouldForceFinalTool = iterationCount >= 4;

      const requestBody: any = {
        model: 'google/gemini-2.5-flash',
        messages,
        tools: TOOLS,
        tool_choice: shouldForceFinalTool 
          ? { type: "function", function: { name: "create_recommendations" } }
          : 'required'
      };

      console.log('📤 Sending request to Lovable AI...');
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Lovable AI error:', response.status, errorText);
        throw new Error(`Lovable AI request failed: ${response.status}`);
      }

      const aiResponse = await response.json();
      const assistantMessage = aiResponse.choices[0].message;
      
      messages.push(assistantMessage);

      if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        console.error('❌ Agent did not use tools (this should not happen with tool_choice="required")');
        throw new Error('Agent did not produce structured output via tools');
      }

      console.log(`🔧 Agent wants to call ${assistantMessage.tool_calls.length} tool(s)`);

      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        let toolArgs = JSON.parse(toolCall.function.arguments);

        console.log(`\n📞 Tool call: ${toolName}`);

        // Inject actual data for receive tools
        if (toolName === 'receive_outfit_data') {
          toolArgs = { outfits };
        } else if (toolName === 'receive_personalization_context') {
          toolArgs = { personalization: personalization || {} };
        }
        
        const toolResult = await executeTool(toolName, toolArgs);

        if (toolName === 'create_recommendations') {
          finalResult = toolResult;
          console.log('✅ Final recommendations created!');
          
          return new Response(
            JSON.stringify({
              success: true,
              data: finalResult,
              iterations: iterationCount
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult)
        });
      }
    }

    console.warn('⚠️ Max iterations reached without final result');
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Max iterations reached',
        iterations: iterationCount
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Recommendation agent error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
