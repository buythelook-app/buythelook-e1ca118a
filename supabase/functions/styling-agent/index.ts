import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STYLING_AGENT_SYSTEM_PROMPT = `You are an expert fashion stylist with 15+ years of experience in personal styling and outfit coordination.

## YOUR ROLE
- Analyze user preferences, body type, mood, and occasion
- Create cohesive, stylish outfits from available clothing items
- Consider color coordination, style compatibility, and appropriateness
- Explain your styling choices clearly

## YOUR EXPERTISE
- Body shape analysis and flattering fits (X, V, H, O, A shapes)
- Color theory and seasonal palettes
- Style aesthetics (classic, romantic, minimalist, casual, boho, sporty)
- Occasion-appropriate dressing (work, casual, evening, weekend)
- Budget-conscious styling

## INSTRUCTIONS
1. Use the provided tools to fetch available clothing items from the database
2. Filter items based on user preferences, mood, and budget
3. Create 3-5 complete outfit combinations
4. Each outfit MUST include: top, bottom (or dress), and shoes
5. Ensure color coordination and style consistency
6. Consider the user's body type for flattering fits
7. Stay within the specified budget

## TOOL CALLING
You have access to these tools:
- fetch_clothing_items: Get tops, bottoms, dresses from zara_cloth table
- fetch_shoes: Get shoes from shoes table
- create_outfit_result: Submit the final outfit recommendations

Call tools in this order:
1. fetch_clothing_items with filters for tops
2. fetch_clothing_items with filters for bottoms/dresses
3. fetch_shoes with mood/style filters
4. create_outfit_result with your final recommendations

## OUTPUT FORMAT
Return outfits as structured data using create_outfit_result tool:
{
  "outfits": [
    {
      "top_id": "uuid",
      "bottom_id": "uuid or null if dress",
      "shoes_id": "uuid",
      "total_price": number,
      "description": "Clear, concise outfit description",
      "occasion": "work|casual|evening|weekend",
      "color_story": "Brief color coordination explanation",
      "styling_tips": ["tip1", "tip2"]
    }
  ],
  "reasoning": "Overall styling strategy and why these outfits work"
}

## CONSTRAINTS
- Maximum budget as specified by user
- Only use available items from database
- Avoid duplicate items across outfits
- Ensure all items match the specified style preference
- Consider mood: elegant=sophisticated colors, energized=bold colors, relaxed=soft neutrals

## PERSONALITY
Be helpful, enthusiastic about fashion, and provide clear explanations. Focus on making the user feel confident and stylish.`;

// Tool definitions for LLM
const TOOLS = [
  {
    type: "function",
    function: {
      name: "fetch_clothing_items",
      description: "Fetch clothing items (tops, bottoms, dresses) from the database with filters",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "Type of clothing to fetch - use 'top' for shirts/blouses/dresses, 'bottom' for pants/skirts"
          },
          max_price: {
            type: "number",
            description: "Maximum price filter"
          },
          colors: {
            type: "array",
            items: { type: "string" },
            description: "Preferred colors to filter by"
          },
          limit: {
            type: "number",
            description: "Maximum number of items to return",
            default: 50
          }
        },
        required: ["category"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "fetch_shoes",
      description: "Fetch shoes from the database",
      parameters: {
        type: "object",
        properties: {
          max_price: {
            type: "number",
            description: "Maximum price"
          },
          limit: {
            type: "number",
            default: 30
          }
        },
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_outfit_result",
      description: "Submit the final outfit recommendations - MUST be called at the end with all outfits",
      parameters: {
        type: "object",
        properties: {
          outfits: {
            type: "array",
            items: {
              type: "object",
              properties: {
                top_id: { type: "string", description: "UUID of the top/dress item" },
                bottom_id: { type: "string", description: "UUID of bottom item, null if using dress", nullable: true },
                shoes_id: { type: "string", description: "UUID of shoes" },
                total_price: { type: "number" },
                description: { type: "string" },
                occasion: { 
                  type: "string",
                  enum: ["work", "casual", "evening", "weekend"]
                },
                color_story: { type: "string" },
                styling_tips: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["top_id", "shoes_id", "description", "occasion"]
            }
          },
          reasoning: { type: "string", description: "Overall styling strategy" }
        },
        required: ["outfits", "reasoning"],
        additionalProperties: false
      }
    }
  }
];

// Tool execution functions
async function executeTool(toolName: string, args: any, supabase: any) {
  console.log(`🔧 Executing tool: ${toolName}`, JSON.stringify(args, null, 2));

  switch (toolName) {
    case "fetch_clothing_items": {
      let query = supabase
        .from('zara_cloth')
        .select('id, product_name, price, colour, description, category, image, images')
        .eq('availability', true)
        .limit(args.limit || 50);

      // Filter by category if specified
      if (args.category) {
        if (args.category === 'top') {
          // Include tops, shirts, blouses, dresses
          query = query.or('category.ilike.%top%,category.ilike.%shirt%,category.ilike.%blouse%,category.ilike.%dress%');
        } else if (args.category === 'bottom') {
          // Include pants, skirts, trousers
          query = query.or('category.ilike.%pant%,category.ilike.%skirt%,category.ilike.%trouser%');
        }
      }

      if (args.max_price) {
        query = query.lte('price', args.max_price);
      }

      if (args.colors && args.colors.length > 0) {
        const colorFilters = args.colors.map((c: string) => `colour.ilike.%${c}%`).join(',');
        query = query.or(colorFilters);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching clothing:', error);
        throw error;
      }

      console.log(`✅ Fetched ${data?.length || 0} clothing items (category: ${args.category})`);
      return { success: true, items: data || [] };
    }

    case "fetch_shoes": {
      let query = supabase
        .from('shoes')
        .select('id, name, price, color, description, brand, image')
        .limit(args.limit || 30);

      if (args.max_price) {
        query = query.lte('price', args.max_price);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching shoes:', error);
        throw error;
      }

      console.log(`✅ Fetched ${data?.length || 0} shoes`);
      return { success: true, shoes: data || [] };
    }

    case "create_outfit_result": {
      console.log('✅ Final outfit result created');
      return { success: true, result: args };
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🚀 Styling Agent started');

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { bodyType, mood, style, budget, userId } = await req.json();
    console.log('📝 Request params:', { bodyType, mood, style, budget, userId });

    // Build user context prompt
    const userPrompt = `Create outfit recommendations for:
- Body Type: ${bodyType || 'not specified'}
- Mood: ${mood || 'versatile'}
- Style: ${style || 'classic'}
- Maximum Budget per outfit: $${budget || 200}
- User ID: ${userId}

Please use the tools to fetch appropriate items and create 3-5 complete outfits. Start by fetching tops, then bottoms, then shoes.`;

    // Initial LLM call
    let messages = [
      { role: "system", content: STYLING_AGENT_SYSTEM_PROMPT },
      { role: "user", content: userPrompt }
    ];

    let finalResult = null;
    let iterations = 0;
    const MAX_ITERATIONS = 15;

    console.log('🤖 Starting agent loop...');

    // Agent loop - keep calling until we get final result
    while (!finalResult && iterations < MAX_ITERATIONS) {
      iterations++;
      console.log(`🔄 Iteration ${iterations}/${MAX_ITERATIONS}`);

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
        console.error('❌ Lovable AI error:', response.status, errorText);
        
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (response.status === 402) {
          throw new Error('AI credits exhausted. Please add credits to your workspace.');
        }
        
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const message = data.choices[0].message;

      console.log('💬 AI response:', message.content ? message.content.substring(0, 100) + '...' : 'tool calls');

      // Add assistant's response to conversation
      messages.push(message);

      // Check if LLM wants to call tools
      if (message.tool_calls && message.tool_calls.length > 0) {
        console.log(`🔨 Processing ${message.tool_calls.length} tool calls`);
        
        // Execute all tool calls
        for (const toolCall of message.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);

          // Execute the tool
          const toolResult = await executeTool(toolName, toolArgs, supabase);

          // Check if this is the final result
          if (toolName === 'create_outfit_result') {
            finalResult = toolResult.result;
            console.log('✨ Final result received!');
            break;
          }

          // Add tool result to conversation
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult)
          });
        }

        if (finalResult) break;
      } else {
        // No tool calls - LLM is done but didn't use final tool
        console.error('⚠️ LLM finished without calling create_outfit_result');
        throw new Error('Agent did not produce structured output');
      }
    }

    if (!finalResult) {
      throw new Error('Agent exceeded maximum iterations without producing result');
    }

    console.log('✅ Styling agent completed successfully');
    console.log(`📊 Results: ${finalResult.outfits?.length || 0} outfits created in ${iterations} iterations`);

    return new Response(
      JSON.stringify({
        success: true,
        data: finalResult,
        metadata: {
          iterations,
          timestamp: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Error in styling-agent:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
