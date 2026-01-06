import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ========== BODY SHAPE RULES ==========
const BODY_SHAPE_RULES = {
  X: {
    name: "Hourglass (X-shape)",
    description: "Balanced bust and hips with defined waist. Goal: Accentuate the waist and show curves.",
    goals: ["accentuate waist", "show curves", "balance proportions"],
    avoid: ["loose tops", "boxy silhouettes", "shapeless clothing", "oversized items"],
    tops: ["fitted", "wrap", "belted", "v-neck", "scoop neck", "peplum"],
    bottoms: ["pencil skirts", "high-waist pants", "A-line", "fitted jeans", "wrap skirts"],
    shoes: ["heels", "pointed flats", "ankle boots", "strappy sandals"],
    keywords: ["fitted", "wrap", "belted", "defined waist", "curves", "tailored"],
  },
  A: {
    name: "Pear (A-shape)",
    description: "Wider hips than bust, defined waist. Goal: Balance by emphasizing shoulders and upper body.",
    goals: ["emphasize shoulders", "balance proportions", "draw attention up"],
    avoid: ["tight bottoms", "skinny jeans", "hip pockets", "tapered pants", "clingy skirts"],
    tops: ["boat neck", "off-shoulder", "detailed", "structured", "bright colors", "patterns"],
    bottoms: ["A-line skirts", "wide-leg pants", "dark colors", "straight cut", "bootcut"],
    shoes: ["nude heels", "pointed flats", "boots", "simple styles"],
    keywords: ["structured tops", "A-line", "wide-leg", "balance", "emphasize top"],
  },
  H: {
    name: "Rectangle (H-shape)",
    description: "Balanced bust, waist, and hips with minimal curves. Goal: Create curves and define waist.",
    goals: ["create curves", "define waist", "add dimension"],
    avoid: ["straight cuts", "shapeless clothing", "boxy items", "tube dresses"],
    tops: ["peplum", "ruffles", "textured", "layered", "belted", "wrap"],
    bottoms: ["textured", "patterned", "flared", "pleated", "detailed"],
    shoes: ["statement shoes", "heels", "embellished flats", "ankle straps"],
    keywords: ["textured", "peplum", "ruffles", "belted", "layers", "define waist"],
  },
  V: {
    name: "Inverted Triangle (V-shape)",
    description: "Broader shoulders than hips. Goal: Balance by adding volume below and simplifying top.",
    goals: ["balance broad shoulders", "add volume below", "minimize shoulders"],
    avoid: ["shoulder pads", "tight tops", "boat necks", "cap sleeves", "bold patterns on top"],
    tops: ["V-neck", "scoop neck", "halter", "simple", "dark colors", "flowing"],
    bottoms: ["detailed", "patterned", "flared", "wide-leg", "bright colors", "A-line"],
    shoes: ["statement shoes", "embellished", "colorful", "detailed"],
    keywords: ["simple tops", "detailed bottoms", "V-neck", "flowing", "balance"],
  },
  O: {
    name: "Oval (O-shape)",
    description: "Fuller midsection, narrower hips. Goal: Create vertical lines and elongate silhouette.",
    goals: ["elongate silhouette", "draw eyes up", "create vertical lines"],
    avoid: ["tight waists", "horizontal stripes", "belts at waist", "clingy fabrics", "crop tops"],
    tops: ["V-neck", "empire waist", "A-line", "flowing", "vertical details", "tunics"],
    bottoms: ["straight leg", "bootcut", "dark colors", "high-waist", "simple"],
    shoes: ["heels", "pointed", "simple", "elongating styles"],
    keywords: ["V-neck", "empire waist", "vertical lines", "flowing", "elongate"],
  },
};

// ========== MOOD COLORS ==========
const MOOD_COLORS = {
  confident: {
    colors: ["black", "navy", "white", "charcoal", "burgundy"],
    description: "Bold, strong colors that project confidence and authority",
  },
  elegant: {
    colors: ["black", "navy", "white", "burgundy", "gold", "charcoal"],
    description: "Sophisticated, timeless colors for elegant occasions",
  },
  romantic: {
    colors: ["pink", "rose", "lavender", "soft blue", "cream", "peach"],
    description: "Soft, feminine colors that create a romantic mood",
  },
  energetic: {
    colors: ["red", "orange", "yellow", "bright blue", "coral"],
    description: "Vibrant, energizing colors that stand out",
  },
  calm: {
    colors: ["light blue", "mint", "sage", "soft gray", "powder blue"],
    description: "Soothing, peaceful colors for a relaxed vibe",
  },
  playful: {
    colors: ["pink", "yellow", "turquoise", "coral", "lime"],
    description: "Fun, cheerful colors that express personality",
  },
  powerful: {
    colors: ["black", "red", "royal blue", "emerald", "deep purple"],
    description: "Strong, commanding colors that make a statement",
  },
  casual: {
    colors: ["denim", "white", "gray", "khaki", "olive", "navy"],
    description: "Relaxed, everyday colors for casual settings",
  },
};

// ========== STYLE COLORS ==========
const STYLE_COLORS = {
  minimalist: {
    colors: ["white", "black", "gray", "beige", "cream", "navy"],
    description: "Clean, simple palette with neutral tones",
  },
  classic: {
    colors: ["navy", "white", "black", "gray", "brown", "camel"],
    description: "Timeless, traditional colors that never go out of style",
  },
  romantic: {
    colors: ["pink", "lavender", "cream", "rose", "peach", "soft blue"],
    description: "Soft, feminine colors with gentle tones",
  },
  bohemian: {
    colors: ["terracotta", "rust", "mustard", "olive", "cream", "earth tones"],
    description: "Earthy, natural colors with warm undertones",
  },
  boho: {
    colors: ["terracotta", "rust", "mustard", "olive", "cream"],
    description: "Free-spirited, earthy colors with bohemian flair",
  },
  sporty: {
    colors: ["blue", "red", "gray", "black", "neon", "white"],
    description: "Athletic, active colors with high energy",
  },
  edgy: {
    colors: ["black", "charcoal", "burgundy", "olive", "leather brown"],
    description: "Bold, dark colors with edge and attitude",
  },
  elegant: {
    colors: ["black", "navy", "white", "burgundy", "champagne", "gold"],
    description: "Refined, sophisticated colors for formal occasions",
  },
  casual: {
    colors: ["denim", "white", "gray", "khaki", "olive", "navy"],
    description: "Comfortable, everyday colors for relaxed style",
  },
  preppy: {
    colors: ["navy", "white", "pink", "green", "yellow", "striped"],
    description: "Clean, collegiate colors with classic appeal",
  },
  trendy: {
    colors: ["seasonal", "bold", "mixed", "statement", "fashion-forward"],
    description: "Current fashion colors that change with trends",
  },
};

// ========== STYLE GUIDELINES ==========
const STYLE_GUIDELINES = {
  classic: {
    description: "Timeless, tailored, sophisticated",
    keyPieces: ["blazer", "trench coat", "pencil skirt", "white shirt", "black dress", "tailored pants"],
    silhouettes: ["tailored", "structured", "straight", "fitted"],
    avoid: ["overly trendy", "loud patterns", "distressed items"],
  },
  romantic: {
    description: "Soft, feminine, delicate details",
    keyPieces: ["lace blouse", "floral dress", "soft cardigan", "ruffled top", "feminine skirt"],
    silhouettes: ["flowing", "soft", "draped", "fit-and-flare"],
    avoid: ["harsh lines", "boxy shapes", "heavy fabrics"],
  },
  minimalist: {
    description: "Clean lines, simple, refined",
    keyPieces: ["simple tee", "straight-leg pants", "minimal dress", "structured coat"],
    silhouettes: ["clean", "straight", "simple", "refined"],
    avoid: ["excessive details", "loud patterns", "over-accessorizing"],
  },
  bohemian: {
    description: "Free-spirited, relaxed, eclectic",
    keyPieces: ["maxi dress", "embroidered top", "fringe jacket", "peasant blouse", "wide-leg pants"],
    silhouettes: ["flowing", "relaxed", "layered", "loose"],
    avoid: ["overly structured", "corporate", "minimalist"],
  },
  edgy: {
    description: "Rock-inspired, bold, unconventional",
    keyPieces: ["leather jacket", "ripped jeans", "band tee", "combat boots", "studded items"],
    silhouettes: ["fitted", "asymmetric", "layered", "deconstructed"],
    avoid: ["overly feminine", "pastel colors", "delicate fabrics"],
  },
  sporty: {
    description: "Athletic, comfortable, active",
    keyPieces: ["joggers", "sneakers", "athletic jacket", "tank top", "leggings"],
    silhouettes: ["relaxed", "fitted", "functional", "comfortable"],
    avoid: ["overly formal", "restrictive clothing", "delicate fabrics"],
  },
  elegant: {
    description: "Refined, sophisticated, luxurious",
    keyPieces: ["silk blouse", "tailored dress", "elegant coat", "high-quality basics"],
    silhouettes: ["refined", "tailored", "graceful", "polished"],
    avoid: ["overly casual", "cheap-looking fabrics", "loud patterns"],
  },
  casual: {
    description: "Comfortable, everyday, relaxed",
    keyPieces: ["jeans", "t-shirt", "sweater", "casual dress", "sneakers"],
    silhouettes: ["relaxed", "comfortable", "easy", "versatile"],
    avoid: ["overly formal", "restrictive clothing", "excessive accessories"],
  },
};

// ========== COLOR HARMONY RULES ==========
const COLOR_HARMONY_RULES = {
  complementary: {
    description: "Colors opposite on color wheel (high contrast, vibrant)",
    examples: ["navy + orange", "purple + yellow", "green + red"],
    use: "Statement outfits, when you want to stand out",
  },
  analogous: {
    description: "Colors next to each other on wheel (harmonious, cohesive)",
    examples: ["blue + teal + green", "red + orange + yellow", "purple + pink + red"],
    use: "Cohesive, sophisticated looks",
  },
  triadic: {
    description: "Three colors equally spaced on wheel (balanced, vibrant)",
    examples: ["red + yellow + blue", "orange + green + purple"],
    use: "Creative, bold outfits",
  },
  monochromatic: {
    description: "Different shades/tones of same color",
    examples: ["light blue + navy + royal blue", "cream + camel + brown"],
    use: "Elegant, streamlined, elongating effect",
  },
  neutral: {
    description: "Black, white, gray, beige, navy - always work together",
    examples: ["black + white", "navy + beige", "gray + camel"],
    use: "Classic, timeless, always appropriate",
  },
};

// Helper to get rules for body type
function getBodyShapeRules(bodyType: string) {
  const normalized = bodyType?.toUpperCase()?.charAt(0);
  return BODY_SHAPE_RULES[normalized as keyof typeof BODY_SHAPE_RULES] || BODY_SHAPE_RULES.H;
}

// Helper to get mood colors
function getMoodColors(mood: string) {
  return MOOD_COLORS[mood?.toLowerCase() as keyof typeof MOOD_COLORS] || MOOD_COLORS.casual;
}

// Helper to get style colors
function getStyleColors(style: string) {
  return STYLE_COLORS[style?.toLowerCase() as keyof typeof STYLE_COLORS] || STYLE_COLORS.casual;
}

// Helper to get style guidelines
function getStyleGuide(style: string) {
  return STYLE_GUIDELINES[style?.toLowerCase() as keyof typeof STYLE_GUIDELINES] || STYLE_GUIDELINES.casual;
}

const STYLING_AGENT_SYSTEM_PROMPT = `You are an expert fashion stylist AI agent with deep knowledge of body shapes, color theory, and style coordination. You MUST communicate ONLY through tool calls.

## MANDATORY WORKFLOW

STEP 1: Fetch clothing items
- Call fetch_clothing_items(category="top", limit=30) to get tops
- Call fetch_clothing_items(category="bottom", limit=30) to get bottoms
- Call fetch_clothing_items(category="dress", limit=20) if creating dress outfits
- Call fetch_clothing_items(category="outerwear", limit=20) for jackets/blazers

STEP 2: Fetch shoes (REQUIRED!)
- Call fetch_shoes(limit=50) to get available shoes
- This is NOT optional - you MUST fetch shoes!

STEP 3: Create outfits using the body shape rules, mood colors, and style guidelines provided in the user prompt.

## BODY SHAPE STYLING RULES (CRITICAL!)

For HOURGLASS (X) body:
- EMPHASIZE: waist, curves
- USE: fitted, wrap, belted, v-neck, scoop neck, peplum tops
- USE: pencil skirts, high-waist pants, A-line, fitted jeans
- AVOID: loose tops, boxy silhouettes, shapeless clothing, oversized items

For PEAR (A) body:
- EMPHASIZE: shoulders, upper body
- USE: boat neck, off-shoulder, detailed, structured tops
- USE: A-line skirts, wide-leg pants, dark colored bottoms
- AVOID: tight bottoms, skinny jeans, hip pockets, clingy skirts

For RECTANGLE (H) body:
- EMPHASIZE: create curves, define waist
- USE: peplum, ruffles, textured, layered, belted tops
- USE: textured, patterned, flared, pleated bottoms
- AVOID: straight cuts, shapeless clothing, boxy items

For INVERTED TRIANGLE (V) body:
- EMPHASIZE: lower body, add volume below
- USE: V-neck, scoop neck, halter, simple dark tops
- USE: detailed, patterned, flared, wide-leg, bright bottoms
- AVOID: shoulder pads, boat necks, cap sleeves, bold patterns on top

For OVAL (O) body:
- EMPHASIZE: elongate silhouette, vertical lines
- USE: V-neck, empire waist, A-line, flowing, vertical details
- USE: straight leg, bootcut, dark colors, high-waist bottoms
- AVOID: tight waists, horizontal stripes, clingy fabrics, crop tops

## COLOR HARMONY RULES (ALWAYS APPLY!)

When selecting colors, ALWAYS use one of these harmony patterns:
1. MONOCHROMATIC: Different shades of same color (elegant, elongating)
2. ANALOGOUS: Adjacent colors on wheel (harmonious, cohesive)
3. COMPLEMENTARY: Opposite colors (high contrast, statement)
4. NEUTRAL: Black, white, gray, beige, navy (classic, timeless)

COLOR COMBINATIONS TO USE:
- Navy + white + camel (classic)
- Black + white + red (bold)
- Cream + beige + brown (monochromatic warm)
- Gray + white + black (monochromatic neutral)
- Blue + teal + green (analogous cool)
- Burgundy + cream + navy (rich, elegant)

## SILHOUETTE BALANCE (CRITICAL!)

✓ LOOSE TOP → Pair with FITTED BOTTOM
✓ FITTED TOP → Can pair with ANY bottom
✓ WIDE-LEG BOTTOM → Pair with FITTED/TUCKED TOP
✓ FITTED BOTTOM → Can pair with ANY top
✓ Fitted dress → can add structured blazer
✓ Loose/flowing dress → skip jacket OR loose cardigan only

❌ NEVER: Loose top + fitted jacket
❌ NEVER: Oversized top + wide-leg pants (too much volume)

## CRITICAL RULES
- NEVER respond with text messages - ONLY use tools
- Use ONLY actual item IDs returned from fetch_clothing_items and fetch_shoes
- DO NOT invent or generate random UUIDs
- Each item can appear in ONLY ONE outfit - no duplicates
- Every outfit MUST include shoes_id

## AVAILABLE CATEGORIES
- "top": shirts, t-shirts, tops, bodysuits, polos
- "bottom": pants, skirts, shorts
- "dress": dresses, jumpsuits
- "outerwear": blazers, jackets, coats

🚨 REMEMBER: Apply body shape rules + color harmony + silhouette balance to EVERY outfit! 🚨

Do NOT respond with text. Only call tools.`;


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
      description: "Fetch shoes from database. Returns array of shoes with: id (UUID), name, price, color (array), image (JSONB). Only returns shoes that have images available.",
      parameters: {
        type: "object",
        properties: {
          max_price: {
            type: "number",
            description: "Maximum price filter"
          },
          limit: {
            type: "number",
            description: "Max number of shoes to return",
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
      let query = supabase
        .from('shoes')
        .select('id, name, price, color, you_might_also_like')
        .not('you_might_also_like', 'is', null)  // Only shoes with images
        .limit(args.limit || 50);   // Increased limit

      if (args.max_price) {
        query = query.lte('price', args.max_price);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching shoes:', error);
        throw error;
      }
      
      console.log(`✅ Fetched ${data?.length || 0} shoes with images`);
      
      // Return just the array (simpler for LLM)
      return data || [];
    }

    case "create_outfit_result": {
      console.log('✅ Final outfit result created');
      
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

    // Get personalized rules based on user preferences
    const bodyRules = getBodyShapeRules(bodyType);
    const moodColorPalette = getMoodColors(mood);
    const styleColorPalette = getStyleColors(style);
    const styleGuide = getStyleGuide(style);

    // Build rich user context prompt
    const userPrompt = `Create outfit recommendations for this user:

## USER PROFILE
- Body Type: ${bodyType || 'H'} (${bodyRules.name})
- Mood: ${mood || 'versatile'}
- Style: ${style || 'classic'}
- Maximum Budget per outfit: $${budget || 200}
- User ID: ${userId}

## BODY SHAPE STYLING RULES FOR ${bodyRules.name.toUpperCase()}
Description: ${bodyRules.description}
Goals: ${bodyRules.goals.join(', ')}
Recommended Tops: ${bodyRules.tops.join(', ')}
Recommended Bottoms: ${bodyRules.bottoms.join(', ')}
Recommended Shoes: ${bodyRules.shoes.join(', ')}
⚠️ AVOID: ${bodyRules.avoid.join(', ')}
Keywords to search: ${bodyRules.keywords.join(', ')}

## MOOD COLOR PALETTE: ${mood?.toUpperCase() || 'CASUAL'}
${moodColorPalette.description}
Preferred Colors: ${moodColorPalette.colors.join(', ')}

## STYLE COLOR PALETTE: ${style?.toUpperCase() || 'CLASSIC'}
${styleColorPalette.description}
Style Colors: ${styleColorPalette.colors.join(', ')}

## STYLE GUIDELINES: ${styleGuide.description}
Key Pieces: ${styleGuide.keyPieces.join(', ')}
Silhouettes: ${styleGuide.silhouettes.join(', ')}
⚠️ AVOID: ${styleGuide.avoid.join(', ')}

## YOUR TASK
1. Fetch tops that match the recommended styles: ${bodyRules.tops.slice(0, 3).join(', ')}
2. Fetch bottoms that match: ${bodyRules.bottoms.slice(0, 3).join(', ')}
3. Fetch shoes that match: ${bodyRules.shoes.slice(0, 3).join(', ')}
4. Create 3-5 complete outfits using COLOR HARMONY (monochromatic, analogous, or complementary)
5. Ensure each outfit follows the body shape rules and avoids the prohibited items
6. Match the mood (${mood || 'casual'}) and style (${style || 'classic'}) preferences

Start by fetching tops, then bottoms, then shoes. Apply all the rules above!`;

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
