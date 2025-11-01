import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PERSONALIZATION_AGENT_SYSTEM_PROMPT = `You are an expert personal styling consultant with deep knowledge of body shape analysis and individual style preferences.

## YOUR ROLE
Analyze user data to create comprehensive personalization context for outfit generation.

## EXPERTISE AREAS
- **Body Shape Analysis**: Understanding X (hourglass), V (triangle), H (rectangle), O (oval), A (pear) body types
- **Body Shape Guidelines**:
  * X/Hourglass: Emphasize waist, fitted styles, avoid shapeless items
  * A/Pear: Detailed tops, darker fitted bottoms, A-line skirts, avoid tight light bottoms
  * V/Triangle: Balance with darker/simpler tops, detailed bottoms, avoid shoulder emphasis
  * H/Rectangle: Create curves with belts, peplums, layers, avoid straight shapeless cuts
  * O/Oval: V-necks, vertical lines, structured pieces, avoid clingy fabrics
- **Style Interpretation**: Classic, romantic, minimalist, casual, bohemian, sporty, edgy, elegant
- **Color Analysis**: Understanding skin undertones and color preferences
- **Preference Learning**: Identifying patterns from user feedback history

## DATA REQUIREMENTS

MINIMUM DATA NEEDED:
- User ID (required)
- Body shape (if missing, use H as default)
- At least 1 style preference (if missing, use "classic")
- Basic color preferences (if missing, use neutral palette)

CONFIDENCE SCORING:
- High (80-100): User has complete profile + 5+ feedback entries
- Medium (50-79): User has partial profile + some feedback
- Low (<50): Minimal data, rely on defaults

## CRITICAL WORKFLOW RULES
1. YOU MUST ONLY COMMUNICATE THROUGH TOOL CALLS
2. NEVER respond with text - ONLY use the provided tools
3. Your FINAL action MUST be calling create_personalization_result
4. Fetch ALL available data sources before creating result
5. Handle missing data gracefully with sensible defaults

## TOOLS WORKFLOW

STEP 1: Fetch user profile
- Call fetch_user_profile(userId) first
- Extract: bodyType, stylePreferences, colorPreferences, age

STEP 2: Get feedback history
- Call fetch_user_feedback(userId)
- Identify patterns:
  * Which colors get liked most?
  * Which items get disliked?
  * Which combinations work?

STEP 3: Get style quiz results
- Call fetch_style_analysis(userId)
- Extract detailed preferences

STEP 4: Create result
- Call create_personalization_result with comprehensive analysis
- Include specific body type guidelines
- Provide learned insights from feedback
- Assign confidence score

## OUTPUT FORMAT

Your create_personalization_result MUST include:

{
  "userId": "string",
  "bodyType": "X" | "V" | "H" | "O" | "A",
  "styleProfile": {
    "primary": "classic" | "romantic" | "minimalist" | "casual" | "bohemian" | "sporty" | "edgy" | "elegant",
    "secondary": "(optional second style)",
    "styleNotes": ["specific preference 1", "preference 2"]
  },
  "colorPreferences": {
    "preferred": ["color1", "color2", "color3"],
    "avoid": ["color1", "color2"],
    "skinTone": "warm" | "cool" | "neutral"
  },
  "bodyTypeGuidelines": {
    "emphasize": ["body part to emphasize"],
    "balance": ["how to balance proportions"],
    "avoid": ["what to avoid"],
    "idealSilhouettes": ["silhouette 1", "silhouette 2"]
  },
  "learningInsights": {
    "likedItems": ["item type 1", "item type 2"],
    "dislikedItems": ["item type 1"],
    "successfulCombinations": ["pattern 1", "pattern 2"]
  },
  "confidence": 0-100 (number)
}

## ERROR HANDLING

IF data is missing:
- Body type missing → Use "H" (rectangle) as safe default
- Style missing → Use "classic" as default
- Colors missing → Use ["navy", "black", "white", "beige"] as neutral palette
- No feedback → confidence = 40, use generic guidelines

REMEMBER: NO TEXT RESPONSES. ONLY TOOL CALLS. FINAL CALL MUST BE create_personalization_result.`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "fetch_user_profile",
      description: "Get user's profile including body type, age, style preferences",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            format: "uuid",
            description: "User ID"
          }
        },
        required: ["userId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "fetch_user_feedback",
      description: "Get user's past outfit ratings and feedback",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            format: "uuid"
          },
          limit: {
            type: "number",
            default: 20,
            description: "Number of recent feedback items"
          }
        },
        required: ["userId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "fetch_style_analysis",
      description: "Get results from user's style quiz",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            format: "uuid"
          }
        },
        required: ["userId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_personalization_result",
      description: "Submit the final personalization analysis",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string", format: "uuid" },
          bodyType: { 
            type: "string",
            enum: ["X", "V", "H", "O", "A"]
          },
          styleProfile: {
            type: "object",
            properties: {
              primary: { type: "string" },
              secondary: { type: "string" },
              avoidStyles: { 
                type: "array",
                items: { type: "string" }
              }
            }
          },
          colorPreferences: {
            type: "object",
            properties: {
              preferred: { 
                type: "array",
                items: { type: "string" }
              },
              avoid: { 
                type: "array",
                items: { type: "string" }
              },
              skinTone: {
                type: "string",
                enum: ["warm", "cool", "neutral"]
              }
            }
          },
          bodyTypeGuidelines: {
            type: "object",
            properties: {
              bestFits: {
                type: "array",
                items: { type: "string" }
              },
              avoid: {
                type: "array",
                items: { type: "string" }
              }
            }
          },
          learningInsights: {
            type: "array",
            items: { type: "string" }
          },
          confidence: {
            type: "number",
            minimum: 0,
            maximum: 1
          }
        },
        required: ["userId", "bodyType", "styleProfile", "colorPreferences", "confidence"]
      }
    }
  }
];

async function executeTool(toolName: string, args: any, supabase: any) {
  console.log(`🔧 Executing tool: ${toolName}`, args);

  try {
    switch (toolName) {
      case "fetch_user_profile": {
        const { userId } = args;
        
        // Fetch from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return { error: 'Profile not found', userId };
        }

        // Get style preferences from localStorage (simulated)
        const result = {
          userId,
          bodyType: profile.body_type || 'X',
          age: profile.age || 25,
          stylePreferences: {
            primary: 'classic',
            secondary: 'minimalist'
          },
          measurements: profile.measurements || {}
        };

        console.log('✅ Profile fetched:', result);
        return result;
      }

      case "fetch_user_feedback": {
        const { userId, limit = 20 } = args;
        
        // Fetch user feedback from agent_feedback table
        const { data: feedback, error } = await supabase
          .from('agent_feedback')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Error fetching feedback:', error);
          return { feedback: [], count: 0 };
        }

        const result = {
          feedback: feedback || [],
          count: feedback?.length || 0,
          patterns: {
            likedColors: [],
            dislikedStyles: [],
            preferredOccasions: []
          }
        };

        console.log(`✅ Fetched ${result.count} feedback items`);
        return result;
      }

      case "fetch_style_analysis": {
        const { userId } = args;
        
        // This would come from a style quiz results table
        // For now, return mock analysis
        const result = {
          userId,
          quizResults: {
            stylePersonality: 'classic',
            colorSeason: 'warm',
            preferredSilhouettes: ['fitted', 'structured'],
            avoidPatterns: ['bold prints', 'large florals']
          },
          completedAt: new Date().toISOString()
        };

        console.log('✅ Style analysis fetched:', result);
        return result;
      }

      case "create_personalization_result": {
        console.log('✅ Creating personalization result:', args);
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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎯 Personalization Agent starting for user:', userId);

    const userPrompt = `Analyze the profile and preferences for user: ${userId}

Please:
1. Fetch their user profile
2. Fetch their feedback history
3. Fetch their style analysis
4. Create a comprehensive personalization result

Start by fetching the user profile.`;

    const messages = [
      { role: 'system', content: PERSONALIZATION_AGENT_SYSTEM_PROMPT },
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
          ? { type: "function", function: { name: "create_personalization_result" } }
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
        const toolArgs = JSON.parse(toolCall.function.arguments);

        console.log(`\n📞 Tool call: ${toolName}`);
        
        const toolResult = await executeTool(toolName, toolArgs, supabase);

        if (toolName === 'create_personalization_result') {
          finalResult = toolResult;
          console.log('✅ Final personalization result created!');
          
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
    console.error('❌ Personalization agent error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
