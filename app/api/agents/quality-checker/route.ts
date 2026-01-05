import { callOpenAI } from "@/lib/openai"
import { NextResponse } from "next/server"
import { BODY_TYPE_RULES, validateOutfitForBodyType, type BodyType } from "@/lib/fashion-rules/body-types"
import { COLOR_PALETTES, validateColorForSkinTone, type SkinTone } from "@/lib/fashion-rules/color-theory"
import { STYLE_GUIDELINES, validateOutfitForStyle, type StyleType } from "@/lib/fashion-rules/style-guidelines"

export async function POST(request: Request) {
  console.log(" Quality Checker: Starting quality validation")

  try {
    const { outfits, profile } = await request.json()

    console.log(" Quality Checker: Outfits to validate:", outfits?.length)
    console.log(" Quality Checker: Profile received")

    const bodyType = (profile?.bodyProfile?.shape?.toLowerCase() || "hourglass") as BodyType
    const skinTone = (profile?.skinTone?.toLowerCase() || "neutral") as SkinTone
    const stylePreference = (profile?.styleKeywords?.aesthetic?.[0]?.toLowerCase() || "casual") as StyleType

    const bodyRules = BODY_TYPE_RULES[bodyType] || BODY_TYPE_RULES["hourglass"]
    const colorRules = COLOR_PALETTES[skinTone] || COLOR_PALETTES["neutral"]
    const styleRules = STYLE_GUIDELINES[stylePreference] || STYLE_GUIDELINES["casual"]

    console.log(" Quality Checker: Using fashion rules - Body:", bodyType, "Skin:", skinTone, "Style:", stylePreference)

    const fashionRulesSection = `
VALIDATION RULES - SCORE AGAINST THESE CRITERIA:

BODY TYPE RULES (${bodyType.toUpperCase()}):
${bodyRules.description}
- Should EMPHASIZE: ${bodyRules.emphasis.join(", ")}
- Should AVOID: ${bodyRules.avoid.join(", ")}
- Best Silhouettes: ${bodyRules.bestSilhouettes.join(", ")}
- Best Necklines: ${bodyRules.bestNecklines.join(", ")}
- Best Fits: ${bodyRules.bestFits.join(", ")}

COLOR THEORY RULES (${skinTone.toUpperCase()} SKIN TONE):
${colorRules.description}
- Best Colors: ${colorRules.bestColors.join(", ")}
- Should Avoid: ${colorRules.avoidColors.join(", ")}
- Safe Neutrals: ${colorRules.neutrals.join(", ")}

STYLE AESTHETIC RULES (${stylePreference.toUpperCase()}):
${styleRules.description}
- Key Pieces: ${styleRules.keyPieces.join(", ")}
- Appropriate Fabrics: ${styleRules.fabrics.join(", ")}
- Should Avoid: ${styleRules.avoid.join(", ")}
`

    const batchSize = 3
    const batches = []

    for (let i = 0; i < outfits.length; i += batchSize) {
      batches.push(outfits.slice(i, i + batchSize))
    }

    console.log(` Quality Checker: Split into ${batches.length} batches for parallel processing`)

    // Process batches in parallel
    const batchResults = await Promise.all(
      batches.map(async (batchOutfits, batchIndex) => {
        const prompt = `You are a fashion quality inspector evaluating ${batchOutfits.length} outfits against EXPLICIT FASHION RULES.

${fashionRulesSection}

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
1. Color Harmony (25 pts): Do colors match the BEST COLORS list? Deduct points for AVOID colors. Check if colors complement each other.
2. Body Shape Suitability (25 pts): Does it include BEST SILHOUETTES and BEST FITS? Deduct heavily for items in AVOID list. Does it EMPHASIZE the right areas?
3. Style Consistency (25 pts): Does it include KEY PIECES from style aesthetic? Are fabrics appropriate? Avoid items on AVOID list?
4. Occasion Appropriateness (25 pts): Is it suitable for the intended occasion while following all above rules?

SCORING GUIDELINES:
- Award HIGH scores (23-25) when outfit explicitly follows the rules above
- Award MEDIUM scores (18-22) when outfit partially follows rules
- Award LOW scores (0-17) when outfit violates multiple rules (wrong colors for skin tone, wrong silhouettes for body type, etc.)
- Be STRICT - the rules above are based on fashion theory and must be followed

INSTRUCTIONS:
1. Evaluate these ${batchOutfits.length} outfits thoroughly AGAINST THE EXPLICIT RULES ABOVE
2. Score each outfit on the 4 criteria (total 100 points possible)
3. In your reasoning, EXPLICITLY mention which rules the outfit follows or violates
4. Provide detailed reasoning for EVERY outfit

Return ONLY valid JSON:
{
  "validatedOutfits": [
    {
      "originalIndex": 0,
      "overallScore": 95,
      "colorHarmony": 24,
      "bodyShapeSuit": 25,
      "styleConsistency": 23,
      "occasionFit": 23,
      "enhancedWhyItWorks": "This outfit scores high because: [explain which fashion rules it follows - colors, silhouettes, style]",
      "enhancedStylistNotes": ["References body type rule", "References color theory", "References style aesthetic"],
      "accessorySuggestions": {
        "jewelry": "Specific recommendation based on style rules",
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

      const itemNames = outfit.items.map((i: any) => i.name?.toLowerCase() || "")
      const itemColors = outfit.items.map((i: any) => i.color?.toLowerCase() || "")

      const bodyValidation = validateOutfitForBodyType(bodyType, itemNames)
      const colorValidation = validateColorForSkinTone(skinTone, itemColors)
      const styleValidation = validateOutfitForStyle(stylePreference, itemNames)

      console.log(
        ` Quality Checker: Outfit ${index} programmatic scores - Body: ${bodyValidation.score}, Color: ${colorValidation.score}, Style: ${styleValidation.score}`,
      )

      if (validationData) {
        console.log(" Quality Checker: Outfit", index, "AI scored:", validationData.overallScore)

        // Combine AI score with programmatic validation
        const avgProgrammaticScore = (bodyValidation.score + colorValidation.score + styleValidation.score) / 3
        const finalScore = Math.round(validationData.overallScore * 0.7 + avgProgrammaticScore * 0.3)

        return {
          ...outfit,
          qualityScore: finalScore,
          whyItWorks: validationData.enhancedWhyItWorks || outfit.whyItWorks,
          stylistNotes: validationData.enhancedStylistNotes || outfit.stylistNotes,
          accessories: validationData.accessorySuggestions,
          scoreBreakdown: {
            colorHarmony: validationData.colorHarmony,
            bodyShapeSuit: validationData.bodyShapeSuit,
            styleConsistency: validationData.styleConsistency,
            occasionFit: validationData.occasionFit,
          },
          programmaticValidation: {
            bodyScore: bodyValidation.score,
            colorScore: colorValidation.score,
            styleScore: styleValidation.score,
            recommendations: [
              ...bodyValidation.recommendations,
              ...colorValidation.recommendations,
              ...styleValidation.recommendations,
            ],
          },
        }
      }
      return outfit
    })

    // Calculate summary stats
    const totalScore = scoredOutfits.reduce((sum: number, o: any) => sum + (o.qualityScore || 0), 0)
    const averageScore = Math.round(totalScore / scoredOutfits.length)

    console.log(" Quality Checker: All 9 outfits scored and returned with fashion rules validation")

    return NextResponse.json({
      success: true,
      outfits: scoredOutfits,
      summary: {
        totalOutfits: outfits.length,
        averageScore,
        evaluationNote: "Validated against explicit fashion rules for body type, color theory, and style aesthetic",
      },
    })
  } catch (error: any) {
    console.error(" Quality Checker: Error occurred:", error)
    console.error(" Quality Checker: Error stack:", error.stack)
    return NextResponse.json({ error: "Quality check failed", details: error.message }, { status: 500 })
  }
}
