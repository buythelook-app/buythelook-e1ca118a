import { callOpenAI } from "@/lib/openai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  console.log(" Profile Builder: Starting profile building")

  try {
    const quizData = await request.json()
    console.log(" Profile Builder: Quiz data received:", JSON.stringify(quizData, null, 2))

    // From quiz-flow.jsx: budget, moderate, premium, luxury
    // From styled_profiles table: Under $100, $100-$200, $200-$500, $500+, etc.
    // From homepage: budget, moderate, premium, luxury
    const normalizeBudget = (budget: string): { min: number; max: number | null } => {
      if (!budget) {
        console.log(" Profile Builder: No budget provided, using default $50-$150")
        return { min: 50, max: 150 }
      }

      const budgetLower = budget.toLowerCase().trim()
      console.log(" Profile Builder: Normalizing budget:", budget, "->", budgetLower)

      // Handle quiz-flow.jsx values
      if (budgetLower === "budget") return { min: 50, max: 150 }
      if (budgetLower === "moderate") return { min: 150, max: 300 }
      if (budgetLower === "premium") return { min: 300, max: 500 }
      if (budgetLower === "luxury") return { min: 500, max: null }

      // Handle "Under $X" format
      if (budgetLower.includes("under")) {
        const match = budget.match(/\$?(\d+)/i)
        if (match) {
          const max = Number.parseInt(match[1])
          console.log(" Profile Builder: Parsed 'Under' format, max:", max)
          return { min: 0, max: max }
        }
      }

      // Handle "$X+" or "$X and above" format (luxury/unlimited)
      if (budgetLower.includes("+") || budgetLower.includes("above") || budgetLower.includes("over")) {
        const match = budget.match(/\$?(\d+)/i)
        if (match) {
          const min = Number.parseInt(match[1])
          console.log(" Profile Builder: Parsed 'X+' format, min:", min, "max: unlimited")
          return { min: min, max: null }
        }
      }

      // Handle "$X-$Y" or "$X - $Y" range format
      const rangeMatch = budget.match(/\$?(\d+)\s*[-–—to]\s*\$?(\d+)/i)
      if (rangeMatch) {
        const min = Number.parseInt(rangeMatch[1])
        const max = Number.parseInt(rangeMatch[2])
        console.log(" Profile Builder: Parsed range format, min:", min, "max:", max)
        return { min, max }
      }

      // Handle single number (treat as max)
      const singleMatch = budget.match(/\$?(\d+)/i)
      if (singleMatch) {
        const value = Number.parseInt(singleMatch[1])
        console.log(" Profile Builder: Parsed single number, treating as max:", value)
        return { min: 0, max: value }
      }

      // Default fallback
      console.log(" Profile Builder: Could not parse budget, using default $50-$150")
      return { min: 50, max: 150 }
    }

    const priceRange = normalizeBudget(quizData.budget || quizData.override_budget || quizData.default_budget)

    console.log(" Profile Builder: ========================================")
    console.log(" Profile Builder: BUDGET PARSING RESULT")
    console.log(" Profile Builder: ========================================")
    console.log(" Profile Builder: Input budget string:", quizData.budget)
    console.log(" Profile Builder: Override budget:", quizData.override_budget)
    console.log(" Profile Builder: Default budget:", quizData.default_budget)
    console.log(
      " Profile Builder: Final price range: $" +
        priceRange.min +
        " - " +
        (priceRange.max === null ? "UNLIMITED" : "$" + priceRange.max),
    )
    console.log(" Profile Builder: Is luxury (no upper limit):", priceRange.max === null)
    console.log(" Profile Builder: ========================================")

    // For display in prompt, use a reasonable max for luxury tier
    const displayMax = priceRange.max === null ? "unlimited" : `$${priceRange.max}`

    const prompt = `You are an expert fashion consultant creating a personalized shopping profile.

USER DATA:
- Gender: ${quizData.gender || "female"}
- Body Shape: ${quizData.bodyShape || quizData.body_type || "hourglass"}
- Height: ${quizData.height || "average"}
- Style: ${quizData.style || "casual"}
- Occasion: ${quizData.occasion || quizData.default_occasion || "everyday"}
- Colors: ${(quizData.colors || quizData.preferred_colors || ["black", "white", "navy"]).join ? (quizData.colors || ["black", "white", "navy"]).join(", ") : quizData.preferred_colors || "black, white, navy"}
- Budget: $${priceRange.min} - ${displayMax}
- Additional: ${quizData.additionalDetails || quizData.additional_notes || "None"}

YOUR TASK:
Create a structured profile for product search.

CRITICAL: The budget is STRICTLY $${priceRange.min} - ${displayMax}. All search queries and recommendations MUST target products within this price range.

Generate SPECIFIC search keywords that will find real products.

GOOD keywords: "fitted blazer black", "high waisted jeans blue", "ankle boots leather"
BAD keywords: "nice clothes", "professional outfit", "hourglass style"

Return ONLY valid JSON:
{
  "bodyProfile": {
    "shape": "${quizData.bodyShape || quizData.body_type || "hourglass"}",
    "fitGuidelines": [
      "Specific fit recommendation 1",
      "Specific fit recommendation 2",
      "Specific fit recommendation 3"
    ],
    "avoid": ["Thing to avoid 1", "Thing to avoid 2"]
  },
  "colorStrategy": {
    "primary": ["color1", "color2", "color3"],
    "accent": ["accent1", "accent2"],
    "avoid": ["color to avoid"]
  },
  "styleKeywords": {
    "aesthetic": ["keyword1", "keyword2"],
    "formality": "casual"
  },
  "searchQueries": {
    "tops": [
      "specific top search 1",
      "specific top search 2",
      "specific top search 3"
    ],
    "bottoms": [
      "specific bottom search 1",
      "specific bottom search 2",
      "specific bottom search 3"
    ],
    "shoes": [
      "specific shoe search 1",
      "specific shoe search 2",
      "specific shoe search 3"
    ]
  },
  "priceRange": {
    "min": ${priceRange.min},
    "max": ${priceRange.max === null ? 99999 : priceRange.max},
    "isUnlimited": ${priceRange.max === null}
  },
  "occasionGuidelines": {
    "occasion": "${quizData.occasion || quizData.default_occasion || "everyday"}",
    "formality": "casual|smart-casual|business-casual|formal",
    "mustHave": ["essential 1", "essential 2"],
    "avoid": ["avoid 1", "avoid 2"]
  }
}`

    console.log(" Profile Builder: Calling OpenAI...")
    const response = await callOpenAI({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      responseFormat: "json_object",
      temperature: 0.7,
    })

    console.log(" Profile Builder: OpenAI response received")
    const profile = JSON.parse(response)

    profile.priceRange = {
      min: priceRange.min,
      max: priceRange.max === null ? 99999 : priceRange.max,
      isUnlimited: priceRange.max === null,
    }

    console.log(" Profile Builder: ========================================")
    console.log(" Profile Builder: FINAL PROFILE PRICE RANGE")
    console.log(" Profile Builder: Min: $" + profile.priceRange.min)
    console.log(
      " Profile Builder: Max: $" + (profile.priceRange.isUnlimited ? "UNLIMITED" : profile.priceRange.max),
    )
    console.log(" Profile Builder: ========================================")

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error: any) {
    console.error(" Profile Builder: Error occurred:", error)
    console.error(" Profile Builder: Error stack:", error.stack)
    return NextResponse.json({ error: "Profile building failed", details: error.message }, { status: 500 })
  }
}
