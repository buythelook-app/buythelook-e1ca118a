import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STYLING_AGENT_SYSTEM_PROMPT = `You are an expert fashion stylist AI agent. You MUST communicate ONLY through tool calls.

## CRITICAL RULES
- NEVER respond with text messages
- ONLY use the provided tools to communicate
- Do NOT explain or describe - just call the tools
- CRITICALLY IMPORTANT: You MUST use ONLY the actual item IDs that were returned from fetch_clothing_items and fetch_shoes
- DO NOT invent or generate random UUIDs - use ONLY IDs from the fetched data
- IF YOU USE AN ID THAT WASN'T RETURNED BY A fetch_* TOOL, THE OUTFIT WILL FAIL

## HOW TO USE TOOL RESULTS - READ CAREFULLY!

When you call fetch_clothing_items, you receive:
{
  "success": true,
  "items": [
    { "id": "abc-123-real-uuid", "product_name": "Blue Shirt", "price": 50 },
    { "id": "def-456-real-uuid", "product_name": "Red Dress", "price": 80 }
  ]
}

When you call fetch_shoes, you receive:
{
  "success": true,
  "shoes": [
    { "id": "xyz-789-real-uuid", "name": "White Sneakers", "price": 60 },
    { "id": "uvw-012-real-uuid", "name": "Black Heels", "price": 90 }
  ]
}

TO USE THESE RESULTS:
1. The clothing items are in result.items array
2. The shoes are in result.shoes array
3. Each item/shoe has an "id" field with the UUID
4. When creating outfits, use item.id and shoe.id values

EXAMPLE WORKFLOW:
Step 1: fetch_clothing_items(category="top") returns items with IDs ["uuid-1", "uuid-2"]
Step 2: fetch_clothing_items(category="bottom") returns items with IDs ["uuid-3", "uuid-4"]
Step 3: fetch_shoes() returns shoes with IDs ["uuid-5", "uuid-6"]
Step 4: create_outfit_result using THOSE EXACT IDs:
  {
    outfits: [{
      top_id: "uuid-1",     // ← From step 1 items array
      bottom_id: "uuid-3",  // ← From step 2 items array
      shoes_id: "uuid-5"    // ← From step 3 shoes array
    }]
  }

NEVER CREATE YOUR OWN UUIDs! Only use the IDs returned by the tools!

## AVAILABLE CATEGORIES
When fetching items, use these categories:
- "top": shirts, t-shirts, tops, bodysuits, polos (CAMISA, CAMISETA, TOPS, BODY, POLO)
- "bottom": pants, skirts, shorts, bermudas (PANTALON, FALDA, BERMUDA, SHORT)
- "dress": dresses, jumpsuits, overalls (VESTIDO, MONO)
- "outerwear": blazers, jackets, coats, vests (BLAZER, CHAQUETA, ABRIGO, CHALECO)
- "all": no category filter (use for variety)

## YOUR TASK - FOLLOW EXACTLY IN THIS ORDER (DO NOT SKIP ANY STEP!)
1. FIRST: Call fetch_clothing_items for tops (category: "top", limit: 30)
2. SECOND: Call fetch_clothing_items for bottoms (category: "bottom", limit: 30)
3. THIRD: Call fetch_clothing_items for dresses (category: "dress", limit: 20)
4. FOURTH: Call fetch_clothing_items for outerwear (category: "outerwear", limit: 20)
5. FIFTH: Call fetch_shoes (limit: 30) - ⚠️ ABSOLUTELY MANDATORY! DO NOT SKIP!
6. SIXTH: Call create_outfit_result with 3-5 complete outfits using ONLY the IDs you received

⚠️ CRITICAL: You CANNOT create outfits without shoes!
⚠️ You MUST call fetch_shoes BEFORE calling create_outfit_result!
⚠️ If you skip fetch_shoes, the outfits will have invalid shoe IDs and FAIL!

This gives you ~130 items to work with for creating diverse outfits!

## OUTFIT REQUIREMENTS
- EVERY outfit MUST have: top + bottom + shoes (or dress + shoes)
- NEVER create an outfit without shoes
- The shoes_id MUST be one of the IDs returned by fetch_shoes
- Stay within budget
- Match style preference
- Consider body type and mood
- Coordinate colors well

## CRITICAL: NO DUPLICATE ITEMS
- Each item can appear in ONLY ONE outfit
- NEVER reuse the same top_id, bottom_id, or shoes_id across different outfits
- Track which IDs you've used and ensure each outfit uses UNIQUE items
- If you run out of unique items, create fewer outfits rather than duplicate items
- USE ONLY ACTUAL IDS FROM THE DATABASE - DO NOT MAKE UP IDS

## WHEN TO CALL create_outfit_result
After you have fetched items from ALL categories (tops, bottoms, dresses, outerwear, AND shoes), immediately call create_outfit_result. You MUST fetch shoes before creating outfits. Do NOT respond with text.`;


// Tool definitions for LLM
const TOOLS = [
  {
    type: "function",
    function: {
      name: "fetch_clothing_items",
      description: "Fetch clothing items from database. Categories based on product_family field. Call multiple times for variety!",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["top", "bottom", "dress", "outerwear", "all"],
            description: "Type of clothing: top (shirts/t-shirts), bottom (pants/skirts), dress, outerwear (blazers/jackets), or all"
          },
          max_price: {
            type: "number",
            description: "Maximum price filter"
          },
          colors: {
            type: "array",
            items: { type: "string" },
            description: "Preferred colors (will search in colour field)"
          },
          limit: {
            type: "number",
            description: "Maximum number of items to return (recommend 50-100 per call)",
            default: 100
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
            default: 50
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
      description: "Submit the final outfit recommendations - MUST be called at the end with all outfits. Use ONLY the actual item IDs that were returned from fetch_clothing_items and fetch_shoes.",
      parameters: {
        type: "object",
        properties: {
          outfits: {
            type: "array",
            items: {
              type: "object",
              properties: {
                top_id: { 
                  type: "string",
                  description: "UUID of top/dress item - MUST be from the fetched items"
                },
                bottom_id: { 
                  type: "string", 
                  description: "UUID of bottom item - MUST be from the fetched items. Use null if dress",
                  nullable: true 
                },
                shoes_id: { 
                  type: "string",
                  description: "UUID of shoes - MUST be from the fetched items"
                },
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
        .select('id, product_name, product_family, colour, price, image, availability')
        .eq('availability', true);

      // Filter by product_family instead of category
      if (args.category === "top") {
        query = query.or(
          'product_family.ilike.*CAMISA*,' +      // shirts
          'product_family.ilike.*CAMISETA*,' +     // t-shirts  
          'product_family.ilike.*TOPS*,' +         // tops
          'product_family.ilike.*BODY*,' +         // bodysuits
          'product_family.ilike.*POLO*'            // polos
        );
      } else if (args.category === "bottom") {
        query = query.or(
          'product_family.ilike.*PANTALON*,' +     // pants
          'product_family.ilike.*FALDA*,' +        // skirts
          'product_family.ilike.*BERMUDA*,' +      // shorts
          'product_family.ilike.*SHORT*'           // shorts
        );
      } else if (args.category === "dress") {
        query = query.or(
          'product_family.ilike.*VESTIDO*,' +      // dresses
          'product_family.ilike.*MONO*'            // jumpsuits
        );
      } else if (args.category === "outerwear") {
        query = query.or(
          'product_family.ilike.*BLAZER*,' +       // blazers
          'product_family.ilike.*CHAQUETA*,' +     // jackets
          'product_family.ilike.*ABRIGO*,' +       // coats
          'product_family.ilike.*CHALECO*'         // vests
        );
      }
      // If "all" or no specific category, don't filter by product_family

      // Price filter
      if (args.max_price) {
        query = query.lte('price', args.max_price);
      }

      // Color filter
      if (args.colors && args.colors.length > 0) {
        // Convert colors to lowercase for better matching
        const colorPatterns = args.colors.map(c => 
          `colour.ilike.*${c}*`
        ).join(',');
        query = query.or(colorPatterns);
      }

      // Limit
      query = query.limit(args.limit || 100); // Increased from 50 to 100

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching clothing:', error);
        throw error;
      }

      console.log(`✅ Fetched ${data?.length || 0} clothing items for category: ${args.category}`);
      
      return { success: true, items: data || [] };
    }

    case "fetch_shoes": {
      // Fetch shoes from shoes table - ONLY shoes with images!
      let query = supabase
        .from('shoes')
        .select('id, name, price, color, description, image, brand, category')
        .not('image', 'is', null)  // CRITICAL: Only shoes with images!
        .limit(args.limit || 30);

      if (args.max_price) {
        query = query.lte('price', args.max_price);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching shoes:', error);
        throw error;
      }

      console.log(`✅ Fetched ${data?.length || 0} shoes WITH images from shoes table`);
      console.log('📋 Sample shoe IDs:', data?.slice(0, 3).map(s => s.id));
      
      return { success: true, shoes: data || [] };
    }

    case "create_outfit_result": {
      console.log('✅ Final outfit result created');
      
      // UUID validation regex
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      // Validate UUIDs format
      args.outfits?.forEach((outfit: any, idx: number) => {
        console.log(`Validating outfit ${idx + 1}:`, {
          top_id: outfit.top_id,
          bottom_id: outfit.bottom_id,
          shoes_id: outfit.shoes_id
        });
        
        if (!uuidRegex.test(outfit.top_id)) {
          console.error(`❌ Invalid top_id in outfit ${idx + 1}:`, outfit.top_id);
          throw new Error(`Invalid top_id format: ${outfit.top_id}. You must use actual UUIDs from fetch_clothing_items!`);
        }
        
        if (outfit.bottom_id && !uuidRegex.test(outfit.bottom_id)) {
          console.error(`❌ Invalid bottom_id in outfit ${idx + 1}:`, outfit.bottom_id);
          throw new Error(`Invalid bottom_id format: ${outfit.bottom_id}. You must use actual UUIDs from fetch_clothing_items!`);
        }
        
        if (!outfit.shoes_id) {
          console.error(`❌ Missing shoes_id in outfit ${idx + 1}`);
          throw new Error(`Outfit ${idx + 1} is missing shoes_id! Every outfit MUST have shoes!`);
        }
        
        if (!uuidRegex.test(outfit.shoes_id)) {
          console.error(`❌ Invalid shoes_id in outfit ${idx + 1}:`, outfit.shoes_id);
          throw new Error(`Invalid shoes_id format: ${outfit.shoes_id}. You must use actual UUIDs from fetch_shoes!`);
        }
      });
      
      console.log('✅ All outfit UUIDs are valid format');
      
      // Validate no duplicate items across outfits
      const usedIds = new Set<string>();
      const duplicates: string[] = [];
      
      args.outfits?.forEach((outfit: any, idx: number) => {
        [outfit.top_id, outfit.bottom_id, outfit.shoes_id].forEach(id => {
          if (id) {
            if (usedIds.has(id)) {
              duplicates.push(`Outfit ${idx + 1}: item ${id}`);
            }
            usedIds.add(id);
          }
        });
      });
      
      if (duplicates.length > 0) {
        console.warn('⚠️ Found duplicate items across outfits:', duplicates);
      } else {
        console.log('✅ All outfits use unique items');
      }
      
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

      // After iteration 4, we should have fetched tops, bottoms, and shoes - force final tool call
      const shouldForceFinalTool = iterations >= 5;
      
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
          tool_choice: shouldForceFinalTool 
            ? { type: "function", function: { name: "create_outfit_result" } }
            : 'required' // Always require tool calls, never allow text response
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
        // No tool calls - this should never happen with tool_choice: 'required'
        console.error('⚠️ LLM response without tool calls:', message);
        console.error('⚠️ This should not happen - tool_choice was set to required');
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
