import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { outfit, comment, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('🧠 Analyzing feedback for user:', userId);
    console.log('💬 User comment:', comment);
    console.log('👗 Outfit details:', outfit);

    // Call Lovable AI to analyze the feedback
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `אתה מומחה אופנה שמנתח פידבק של משתמשים על תלבושות.
התפקיד שלך: לנתח הערה חופשית של משתמש ולזהות במדויק מה לא מתאים בתלבושת.

חזור תמיד בפורמט JSON עם המבנה הבא:
{
  "issues": {
    "colors": boolean,           // האם יש בעיה עם התאמת צבעים
    "fit": boolean,              // האם יש בעיה עם הגזרה/התאמה למבנה גוף
    "style": boolean,            // האם יש בעיה עם הסגנון
    "price": boolean,            // האם יקר מדי
    "occasion": boolean,         // האם לא מתאים לאירוע
    "materials": boolean         // האם יש בעיה עם החומרים/הבדים
  },
  "specificProblems": string[],  // רשימה של בעיות ספציפיות שזוהו
  "recommendations": string[],   // המלצות לשיפור
  "severity": "low" | "medium" | "high"  // חומרת הבעיה
}`
          },
          {
            role: "user",
            content: `נתח את הפידבק הבא על תלבושת:

הערת המשתמש: "${comment}"

פרטי התלבושת:
- תיאור: ${outfit.description || 'לא זמין'}
- אירוע: ${outfit.occasion || 'לא זמין'}
- מחיר כולל: $${outfit.total_price || 'לא זמין'}
- סיפור צבעים: ${outfit.color_story || 'לא זמין'}
- טיפים לעיצוב: ${outfit.styling_tips?.join(', ') || 'לא זמין'}

החזר ניתוח מפורט בפורמט JSON.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_outfit_feedback",
              description: "Analyze user feedback about an outfit and identify specific issues",
              parameters: {
                type: "object",
                properties: {
                  issues: {
                    type: "object",
                    properties: {
                      colors: { type: "boolean" },
                      fit: { type: "boolean" },
                      style: { type: "boolean" },
                      price: { type: "boolean" },
                      occasion: { type: "boolean" },
                      materials: { type: "boolean" }
                    },
                    required: ["colors", "fit", "style", "price", "occasion", "materials"]
                  },
                  specificProblems: {
                    type: "array",
                    items: { type: "string" }
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" }
                  },
                  severity: {
                    type: "string",
                    enum: ["low", "medium", "high"]
                  }
                },
                required: ["issues", "specificProblems", "recommendations", "severity"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_outfit_feedback" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('✅ AI response received');

    // Extract tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const insights = JSON.parse(toolCall.function.arguments);
    console.log('💡 Feedback insights:', insights);

    return new Response(
      JSON.stringify({
        success: true,
        insights,
        rawComment: comment
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error('❌ Error in analyze-feedback:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
