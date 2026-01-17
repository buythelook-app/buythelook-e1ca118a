import { callOpenAI } from "@/lib/openai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  console.log("🏗️ Profile Builder: Starting profile building with SEMANTIC QUERY GENERATION")

  try {
    const quizData = await request.json()
    console.log("📋 Profile Builder: Quiz data received:", JSON.stringify(quizData, null, 2))

    const normalizeBudget = (budget: string): { min: number; max: number | null } => {
      if (!budget) {
        console.log("💰 Profile Builder: No budget provided, using default $50-$150")
        return { min: 50, max: 150 }
      }

      const budgetLower = budget.toLowerCase().trim()
      console.log("💰 Profile Builder: Normalizing budget:", budget, "->", budgetLower)

      if (budgetLower === "budget") return { min: 50, max: 150 }
      if (budgetLower === "moderate") return { min: 150, max: 300 }
      if (budgetLower === "premium") return { min: 300, max: 500 }
      if (budgetLower === "luxury") return { min: 500, max: null }

      if (budgetLower.includes("under")) {
        const match = budget.match(/\$?(\d+)/i)
        if (match) {
          const max = Number.parseInt(match[1])
          return { min: 0, max: max }
        }
      }

      if (budgetLower.includes("+") || budgetLower.includes("above") || budgetLower.includes("over")) {
        const match = budget.match(/\$?(\d+)/i)
        if (match) {
          const min = Number.parseInt(match[1])
          return { min: min, max: null }
        }
      }

      const rangeMatch = budget.match(/\$?(\d+)\s*[-–—to]\s*\$?(\d+)/i)
      if (rangeMatch) {
        const min = Number.parseInt(rangeMatch[1])
        const max = Number.parseInt(rangeMatch[2])
        return { min, max }
      }

      const singleMatch = budget.match(/\$?(\d+)/i)
      if (singleMatch) {
        const value = Number.parseInt(singleMatch[1])
        return { min: 0, max: value }
      }

      return { min: 50, max: 150 }
    }

    const priceRange = normalizeBudget(quizData.budget || quizData.override_budget || quizData.default_budget)

    console.log("💰 Profile Builder: ========================================")
    console.log("💰 Profile Builder: BUDGET PARSING RESULT")
    console.log("💰 Profile Builder: ========================================")
    console.log("💰 Profile Builder: Input budget string:", quizData.budget)
    console.log("💰 Profile Builder: Final price range: $" + priceRange.min + " - " + (priceRange.max === null ? "UNLIMITED" : "$" + priceRange.max))
    console.log("💰 Profile Builder: ========================================")

    const displayMax = priceRange.max === null ? "unlimited" : `$${priceRange.max}`
    const occasion = (quizData.occasion || quizData.default_occasion || "everyday").toLowerCase()

    // Occasion-specific instructions
    const occasionInstructions = {
      workout: `
⚠️ WORKOUT OCCASION - ATHLETIC WEAR ONLY ⚠️
The user wants clothes for GYM and FITNESS activities.

REQUIRED FEATURES:
- Moisture-wicking, breathable, stretchy fabrics
- Athletic fit, performance materials
- Suitable for physical activity

MUST INCLUDE KEYWORDS: athletic, gym, training, performance, sports, activewear, workout, fitness

TOPS MUST BE: Athletic tanks, performance tees, sports bras, training tops, gym hoodies
BOTTOMS MUST BE: Leggings, joggers, athletic shorts, track pants, workout pants
SHOES MUST BE: Training sneakers, running shoes, athletic footwear, gym shoes

❌ DO NOT INCLUDE: Jeans, dress pants, bomber jackets, wool coats, blazers, high heels, dress shoes, formal wear
`,
      work: `
⚠️ WORK/OFFICE OCCASION - PROFESSIONAL WEAR ⚠️
The user wants clothes for OFFICE and BUSINESS settings.

MUST INCLUDE KEYWORDS: professional, office, business, tailored, formal, corporate

TOPS MUST BE: Blazers, button-ups, structured shirts, professional blouses
BOTTOMS MUST BE: Dress pants, pencil skirts, tailored trousers
SHOES MUST BE: Loafers, professional heels, dress shoes

❌ DO NOT INCLUDE: Athletic wear, gym clothes, casual t-shirts, hoodies, sneakers
`,
      formal: `
⚠️ FORMAL OCCASION - ELEGANT WEAR ⚠️
The user wants clothes for FORMAL EVENTS and DRESSY occasions.

MUST INCLUDE KEYWORDS: formal, elegant, dressy, evening, cocktail, sophisticated

❌ DO NOT INCLUDE: Athletic wear, casual clothes, gym wear
`,
      party: `
⚠️ PARTY OCCASION - FUN & STYLISH ⚠️
The user wants clothes for PARTIES and SOCIAL EVENTS.

MUST INCLUDE KEYWORDS: party, festive, stylish, trendy, fun, social

Can include: Dressy tops, stylish pants, fashionable shoes
`,
      casual: `
CASUAL/EVERYDAY OCCASION
The user wants comfortable, versatile everyday clothes.

MUST INCLUDE KEYWORDS: casual, comfortable, everyday, versatile, relaxed
`,
      date: `
DATE OCCASION - ROMANTIC & STYLISH
The user wants clothes for DATES and ROMANTIC outings.

MUST INCLUDE KEYWORDS: romantic, elegant, stylish, chic, date-night
`,
      vacation: `
VACATION OCCASION - COMFORTABLE TRAVEL WEAR
The user wants clothes for TRAVEL and VACATION.

MUST INCLUDE KEYWORDS: vacation, travel, comfortable, resort, relaxed
`,
    }

    const selectedOccasionInst = occasionInstructions[occasion] || occasionInstructions.casual

    const prompt = `You are an expert fashion consultant creating a personalized shopping profile for SEMANTIC VECTOR SEARCH.

USER DATA:
- Gender: ${quizData.gender || "female"}
- Body Shape: ${quizData.bodyShape || quizData.body_type || "hourglass"}
- Height: ${quizData.height || "average"}
- Style Aesthetic: ${quizData.style || "casual"} (this influences colors/aesthetic, NOT the type of clothing)
- PRIMARY OCCASION: ${occasion.toUpperCase()} ⚠️ THIS DETERMINES THE TYPE OF CLOTHING
- Preferred Colors: ${(quizData.colors || quizData.preferred_colors || ["black", "white", "navy"]).join ? (quizData.colors || ["black", "white", "navy"]).join(", ") : quizData.preferred_colors || "black, white, navy"}
- Budget: $${priceRange.min} - ${displayMax}
- Additional Notes: ${quizData.additionalDetails || quizData.additional_notes || "None"}

${selectedOccasionInst}

🎯 CRITICAL RULES:
1. **OCCASION is KING** - The occasion determines WHAT type of clothing (athletic vs formal vs casual)
2. **STYLE is the aesthetic** - The style (Nordic, Bohemian, etc.) determines colors, patterns, minimalism
3. Example: "Nordic + Workout" = Athletic wear in minimalist colors (black, white, grey, neutral)
4. Example: "Bohemian + Work" = Professional attire with earth tones and flowing fabrics

GUIDELINES FOR SEARCH QUERIES:
1. Write 20-40 word descriptive sentences
2. **START with occasion-specific keywords** (see above for each occasion)
3. Then add style aesthetic influences (colors, patterns)
4. Include body type considerations
5. Mention fabric types and features
6. Be VERY specific about the type of item needed

EXAMPLE QUERIES FOR WORKOUT OCCASION:
{
  "tops": "High-performance athletic training tops with moisture-wicking breathable fabric and mesh panels, designed for gym workouts and fitness activities, in minimalist neutral colors like black, white, and grey, suitable for apple body shape with comfortable fit",
  
  "bottoms": "Athletic leggings and joggers with stretchy compression fabric and high-waisted design, perfect for gym training and workout sessions, in sleek neutral colors, flattering for apple body shape with supportive fit",
  
  "shoes": "Performance training sneakers with cushioned soles and arch support, ideal for gym workouts and athletic activities, offering stability and comfort in versatile neutral tones"
}

EXAMPLE QUERIES FOR WORK OCCASION:
{
  "tops": "Professional tailored blazers and structured button-up shirts in neutral sophisticated colors, appropriate for office meetings and corporate environments, designed to flatter apple body shape with structured fit",
  
  "bottoms": "Tailored dress pants and pencil skirts in professional neutral tones, suitable for business settings and office wear, flattering for apple body shape with comfortable structured fit",
  
  "shoes": "Professional leather loafers and comfortable low-heeled shoes in classic neutral colors, appropriate for office environments and business meetings"
}

Return ONLY valid JSON (use the user's ACTUAL occasion and style):
{
  "bodyProfile": {
    "shape": "${quizData.bodyShape || quizData.body_type || "hourglass"}",
    "fitGuidelines": [
      "Fit recommendation for tops that flatters ${quizData.bodyShape || 'this body type'}",
      "Fit recommendation for bottoms that flatters ${quizData.bodyShape || 'this body type'}",
      "Overall silhouette recommendation"
    ],
    "avoid": ["Thing to avoid 1", "Thing to avoid 2"]
  },
  "colorStrategy": {
    "primary": ${JSON.stringify(quizData.colors || quizData.preferred_colors || ["black", "white", "navy"])},
    "accent": ["accent1", "accent2"],
    "avoid": ["color to avoid"]
  },
  "styleKeywords": {
    "aesthetic": ["${quizData.style || 'casual'}"],
    "formality": "${occasion === 'work' || occasion === 'formal' ? 'formal' : occasion === 'date' || occasion === 'party' ? 'smart-casual' : 'casual'}"
  },
  "searchQueries": {
    "tops": "20-40 word semantic description starting with occasion-specific keywords, then style aesthetic",
    "bottoms": "20-40 word semantic description starting with occasion-specific keywords, then style aesthetic",
    "shoes": "20-40 word semantic description starting with occasion-specific keywords, then style aesthetic"
  },
  "priceRange": {
    "min": ${priceRange.min},
    "max": ${priceRange.max === null ? 99999 : priceRange.max},
    "isUnlimited": ${priceRange.max === null}
  },
  "occasionGuidelines": {
    "occasion": "${occasion}",
    "formality": "${occasion === 'work' || occasion === 'formal' ? 'formal' : occasion === 'date' || occasion === 'party' ? 'smart-casual' : 'casual'}",
    "mustHave": ["essential 1", "essential 2"],
    "avoid": ["avoid 1", "avoid 2"]
  }
}`

    console.log("🤖 Profile Builder: Calling OpenAI with OCCASION-FOCUSED prompt...")
    const response = await callOpenAI({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      responseFormat: "json_object",
      temperature: 0.7,
    })

    console.log("✅ Profile Builder: OpenAI response received")
    const profile = JSON.parse(response)

    profile.priceRange = {
      min: priceRange.min,
      max: priceRange.max === null ? 99999 : priceRange.max,
      isUnlimited: priceRange.max === null,
    }

    console.log("✅ Profile Builder: ========================================")
    console.log("✅ Profile Builder: FINAL PROFILE WITH SEMANTIC QUERIES")
    console.log("✅ Profile Builder: Occasion:", occasion.toUpperCase())
    console.log("✅ Profile Builder: Min: $" + profile.priceRange.min)
    console.log("✅ Profile Builder: Max: $" + (profile.priceRange.isUnlimited ? "UNLIMITED" : profile.priceRange.max))
    console.log("✅ Profile Builder: Tops Query:", profile.searchQueries.tops)
    console.log("✅ Profile Builder: Bottoms Query:", profile.searchQueries.bottoms)
    console.log("✅ Profile Builder: Shoes Query:", profile.searchQueries.shoes)
    console.log("✅ Profile Builder: ========================================")

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error: any) {
    console.error("❌ Profile Builder: Error occurred:", error)
    console.error("❌ Profile Builder: Error stack:", error.stack)
    return NextResponse.json({ error: "Profile building failed", details: error.message }, { status: 500 })
  }
}