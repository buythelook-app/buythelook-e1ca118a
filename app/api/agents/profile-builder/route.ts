import { callOpenAI } from "@/lib/openai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  console.log(" Profile Builder: Starting profile building")

  try {
    const quizData = await request.json()
    console.log(" Profile Builder: Quiz data received:", JSON.stringify(quizData, null, 2))

    // Convert budget to price range
    const budgetMap: Record<string, { min: number; max: number }> = {
      budget: { min: 20, max: 100 },
      moderate: { min: 50, max: 200 },
      premium: { min: 100, max: 350 },
      luxury: { min: 200, max: 500 },
    }
    const priceRange = budgetMap[quizData.budget] || { min: 50, max: 200 }

    console.log(" Profile Builder: Price range:", priceRange)

    const prompt = `You are an expert fashion consultant creating a personalized shopping profile.

USER DATA:
- Gender: ${quizData.gender || "female"}
- Body Shape: ${quizData.bodyShape || "hourglass"}
- Height: ${quizData.height || "average"}
- Style: ${quizData.style || "casual"}
- Occasion: ${quizData.occasion || "everyday"}
- Colors: ${(quizData.colors || ["black", "white", "navy"]).join(", ")}
- Budget: $${priceRange.min} - $${priceRange.max}
- Additional: ${quizData.additionalDetails || "None"}

YOUR TASK:
Create a structured profile for ASOS product search.

Generate SPECIFIC search keywords that will find real products on ASOS.

GOOD keywords: "fitted blazer black", "high waisted jeans blue", "ankle boots leather"
BAD keywords: "nice clothes", "professional outfit", "hourglass style"

Return ONLY valid JSON:
{
  "bodyProfile": {
    "shape": "${quizData.bodyShape || "hourglass"}",
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
    "max": ${priceRange.max}
  },
  "occasionGuidelines": {
    "occasion": "${quizData.occasion || "everyday"}",
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
    console.log(" Profile Builder: Profile created:", JSON.stringify(profile, null, 2))

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
