import { callOpenAI } from "@/lib/openai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  console.log(" Quality Checker: Starting quality validation")

  try {
    const { outfits, profile } = await request.json()

    console.log(" Quality Checker: Outfits to validate:", outfits?.length)
    console.log(" Quality Checker: Profile received")

    const batchSize = 3
    const batches = []

    for (let i = 0; i < outfits.length; i += batchSize) {
      batches.push(outfits.slice(i, i + batchSize))
    }

    console.log(` Quality Checker: Split into ${batches.length} batches for parallel processing`)

    // Process batches in parallel
    const batchResults = await Promise.all(
      batches.map(async (batchOutfits, batchIndex) => {
        const prompt = `You are a fashion quality inspector evaluating ${batchOutfits.length} outfits.

OUTFITS TO VALIDATE:
${JSON.stringify(
  batchOutfits.map((o: any) => ({
    originalIndex: outfits.indexOf(o),
    name: o.name,
    items: o.items.map((i: any) => ({
      name: i.name,
      brand: i.brand,
      color: i.color,
      price: i.price,
    })),
    totalPrice: o.totalPrice,
  })),
  null,
  2,
)}

PROFILE:
- Body Shape: ${profile?.bodyProfile?.shape || "hourglass"}
- Style Preferences: ${profile?.styleKeywords?.aesthetic?.join(", ") || "casual"}
- Occasion: ${profile?.occasionGuidelines?.occasion || "everyday"}
- Color Preferences: ${profile?.colorStrategy?.primary?.join(", ") || "neutral tones"}

EVALUATION CRITERIA (0-25 points each):
1. Color Harmony (25 pts): Do the colors complement each other and match the profile?
2. Body Shape Suitability (25 pts): Does it flatter the client's body shape?
3. Style Consistency (25 pts): Is the style cohesive and matches preferences?
4. Occasion Appropriateness (25 pts): Is it suitable for the intended occasion?

INSTRUCTIONS:
1. Evaluate these ${batchOutfits.length} outfits thoroughly
2. Score each outfit on the 4 criteria above (total 100 points possible)
3. Provide detailed reasoning for EVERY outfit
4. Return the outfits with their scores

Return ONLY valid JSON:
{
  "validatedOutfits": [
    {
      "originalIndex": 0, // MUST MATCH INPUT
      "overallScore": 95,
      "colorHarmony": 24,
      "bodyShapeSuit": 25,
      "styleConsistency": 23,
      "occasionFit": 23,
      "enhancedWhyItWorks": "Detailed explanation...",
      "enhancedStylistNotes": ["Tip 1", "Tip 2", "Tip 3"],
      "accessorySuggestions": {
        "jewelry": "Specific recommendation",
        "bag": "Specific recommendation",
        "extras": "Additional accessories"
      }
    }
  ]
}`

        console.log(` Quality Checker: Calling OpenAI for batch ${batchIndex + 1}...`)
        const response = await callOpenAI({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          responseFormat: "json_object",
          temperature: 0.3,
        })

        const result = JSON.parse(response)
        return result.validatedOutfits || []
      }),
    )

    // Combine results from all batches
    const allValidatedOutfits = batchResults.flat()
    console.log(` Quality Checker: Collected ${allValidatedOutfits.length} validated results`)

    const scoredOutfits = outfits.map((outfit: any, index: number) => {
      const validationData = allValidatedOutfits.find((v: any) => v.originalIndex === index)

      if (validationData) {
        console.log(" Quality Checker: Outfit", index, "scored:", validationData.overallScore)
        return {
          ...outfit,
          qualityScore: validationData.overallScore,
          whyItWorks: validationData.enhancedWhyItWorks || outfit.whyItWorks,
          stylistNotes: validationData.enhancedStylistNotes || outfit.stylistNotes,
          accessories: validationData.accessorySuggestions,
          scoreBreakdown: {
            colorHarmony: validationData.colorHarmony,
            bodyShapeSuit: validationData.bodyShapeSuit,
            styleConsistency: validationData.styleConsistency,
            occasionFit: validationData.occasionFit,
          },
        }
      }
      return outfit
    })

    // Calculate summary stats
    const totalScore = scoredOutfits.reduce((sum: number, o: any) => sum + (o.qualityScore || 0), 0)
    const averageScore = Math.round(totalScore / scoredOutfits.length)

    console.log(" Quality Checker: All 9 outfits scored and returned")

    return NextResponse.json({
      success: true,
      outfits: scoredOutfits,
      summary: {
        totalOutfits: outfits.length,
        averageScore,
        evaluationNote: "Parallel batch processing complete",
      },
    })
  } catch (error: any) {
    console.error(" Quality Checker: Error occurred:", error)
    console.error(" Quality Checker: Error stack:", error.stack)
    return NextResponse.json({ error: "Quality check failed", details: error.message }, { status: 500 })
  }
}
