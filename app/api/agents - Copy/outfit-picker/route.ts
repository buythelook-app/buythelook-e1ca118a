// ENHANCED OUTFIT PICKER - Fixes product matching issues
import { callOpenAI } from "@/lib/openai"
import { NextResponse } from "next/server"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import { BODY_TYPE_RULES, type BodyType } from "@/lib/fashion-rules/body-types"
import { COLOR_PALETTES, type SkinTone } from "@/lib/fashion-rules/color-theory"
import { STYLE_GUIDELINES, type StyleType } from "@/lib/fashion-rules/style-guidelines"

export async function POST(request: Request) {
  console.log(" Outfit Picker: Starting outfit generation")

  try {
    const { profile, products, styledProfile } = await request.json()

    console.log(" Outfit Picker: Profile received")
    console.log(" Outfit Picker: Styled Profile received:", !!styledProfile)

    const hasValidImage = (product: any) => {
      if (!product) return false
      if (product.image && product.image !== "/placeholder.svg" && product.image.trim() !== "") return true
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        return product.images.some((img: string) => img && img !== "/placeholder.svg" && img.trim() !== "")
      }
      return false
    }

    const originalCounts = {
      tops: products.tops?.length || 0,
      bottoms: products.bottoms?.length || 0,
      shoes: products.shoes?.length || 0,
    }

    // Filter products to only include those with valid images
    products.tops = products.tops?.filter(hasValidImage) || []
    products.bottoms = products.bottoms?.filter(hasValidImage) || []
    products.shoes = products.shoes?.filter(hasValidImage) || []

    const filteredCounts = {
      tops: products.tops.length,
      bottoms: products.bottoms.length,
      shoes: products.shoes.length,
    }

    console.log(" Outfit Picker: Image validation completed")
    console.log(
      ` Outfit Picker: Tops ${originalCounts.tops} → ${filteredCounts.tops} (${originalCounts.tops - filteredCounts.tops} removed)`,
    )
    console.log(
      ` Outfit Picker: Bottoms ${originalCounts.bottoms} → ${filteredCounts.bottoms} (${originalCounts.bottoms - filteredCounts.bottoms} removed)`,
    )
    console.log(
      ` Outfit Picker: Shoes ${originalCounts.shoes} → ${filteredCounts.shoes} (${originalCounts.shoes - filteredCounts.shoes} removed)`,
    )

    // Check if we have enough products after filtering
    if (products.tops.length < 9 || products.bottoms.length < 9 || products.shoes.length < 9) {
      console.warn(" Outfit Picker: WARNING - Not enough products with images after filtering. May use fallbacks.")
    }

    let feedbackHistory = ""
    if (styledProfile && styledProfile.user_id) {
      console.log(" Outfit Picker: Fetching feedback history for user:", styledProfile.user_id)
      const { data: feedbackData } = await supabaseAuth
        .from("generated_outfits")
        .select("name, is_liked, feedback_reason, feedback_text, why_it_works")
        .eq("user_id", styledProfile.user_id)
        .not("is_liked", "is", null)
        .order("created_at", { ascending: false })
        .limit(10)

      if (feedbackData && feedbackData.length > 0) {
        const likes = feedbackData
          .filter((f) => f.is_liked)
          .map((f) => `- Liked "${f.name}": ${f.feedback_reason || "General"} (${f.feedback_text || "No comment"})`)
          .join("\n")
        const dislikes = feedbackData
          .filter((f) => !f.is_liked)
          .map((f) => `- Disliked "${f.name}": ${f.feedback_reason || "General"} (${f.feedback_text || "No comment"})`)
          .join("\n")

        feedbackHistory = `
USER FEEDBACK HISTORY (Consider this to improve recommendations):
LIKED OUTFITS:
${likes || "None yet"}

DISLIKED OUTFITS (Avoid these patterns):
${dislikes || "None yet"}
`
        console.log(" Outfit Picker: Feedback history found and added")
      }
    }

    console.log(
      " Outfit Picker: Products count - Tops:",
      products.tops?.length,
      "Bottoms:",
      products.bottoms?.length,
      "Shoes:",
      products.shoes?.length,
    )

    // Log score ranges
    if (products.tops?.length > 0) {
      const topScores = products.tops.map(p => p.relevanceScore).sort((a, b) => b - a)
      console.log(` Outfit Picker: TOP scores range: ${topScores[0]} to ${topScores[topScores.length - 1]}`)
    }
    if (products.bottoms?.length > 0) {
      const bottomScores = products.bottoms.map(p => p.relevanceScore).sort((a, b) => b - a)
      console.log(` Outfit Picker: BOTTOM scores range: ${bottomScores[0]} to ${bottomScores[bottomScores.length - 1]}`)
    }
    if (products.shoes?.length > 0) {
      const shoeScores = products.shoes.map(p => p.relevanceScore).sort((a, b) => b - a)
      console.log(` Outfit Picker: SHOE scores range: ${shoeScores[0]} to ${shoeScores[shoeScores.length - 1]}`)
    }

    console.log(" Outfit Picker: === SAMPLE PRODUCTS ===")
    if (products.tops?.[0]) {
      console.log(" Outfit Picker: Sample TOP:", {
        id: products.tops[0].id,
        name: products.tops[0].name,
        price: products.tops[0].price,
        score: products.tops[0].relevanceScore
      })
    }
    if (products.bottoms?.[0]) {
      console.log(" Outfit Picker: Sample BOTTOM:", {
        id: products.bottoms[0].id,
        name: products.bottoms[0].name,
        price: products.bottoms[0].price,
        score: products.bottoms[0].relevanceScore
      })
    }
    if (products.shoes?.[0]) {
      console.log(" Outfit Picker: Sample SHOE:", {
        id: products.shoes[0].id,
        name: products.shoes[0].name,
        price: products.shoes[0].price,
        score: products.shoes[0].relevanceScore
      })
    }
    console.log(" Outfit Picker: ========================")

    // Take top products based on relevance scores - ensure we have enough for 9 unique outfits
    const productsNeeded = Math.min(products.tops.length, 15) // At least 9, ideally 15 for variety
    
    const topProducts = {
      tops: products.tops
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, productsNeeded)
        .map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          brand: p.brand,
          color: p.color,
          description: p.description?.substring(0, 100) || "", // Include partial description
          relevanceScore: p.relevanceScore
        })),
      bottoms: products.bottoms
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, productsNeeded)
        .map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          brand: p.brand,
          color: p.color,
          description: p.description?.substring(0, 100) || "",
          relevanceScore: p.relevanceScore
        })),
      shoes: products.shoes
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, productsNeeded)
        .map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          brand: p.brand,
          color: p.color,
          description: p.description?.substring(0, 100) || "",
          relevanceScore: p.relevanceScore
        })),
    }

    console.log(
      " Outfit Picker: Top products selected - Tops:",
      topProducts.tops.length,
      "Bottoms:",
      topProducts.bottoms.length,
      "Shoes:",
      topProducts.shoes.length,
    )

    const bodyType = (styledProfile?.body_type?.toLowerCase() ||
      profile.bodyProfile?.shape?.toLowerCase() ||
      "hourglass") as BodyType
    const skinTone = (styledProfile?.skin_tone?.toLowerCase() || "neutral") as SkinTone
    const stylePreference = (profile.styleKeywords?.aesthetic?.[0]?.toLowerCase() || "casual") as StyleType

    const bodyRules = BODY_TYPE_RULES[bodyType] || BODY_TYPE_RULES["hourglass"]
    const colorRules = COLOR_PALETTES[skinTone] || COLOR_PALETTES["neutral"]
    const styleRules = STYLE_GUIDELINES[stylePreference] || STYLE_GUIDELINES["casual"]

    console.log(
      " Outfit Picker: Applying fashion rules - Body:",
      bodyType,
      "Skin:",
      skinTone,
      "Style:",
      stylePreference,
    )

    const profileSection = styledProfile
      ? `
CLIENT PHYSICAL PROFILE:
- Height: ${styledProfile.height_cm}cm
- Weight: ${styledProfile.weight_kg}kg
- Body Type: ${styledProfile.body_type}
- Face Shape: ${styledProfile.face_shape}
- Skin Tone: ${styledProfile.skin_tone}

CLIENT STYLE PREFERENCES:
- Default Budget: ${styledProfile.default_budget}
- Preferred Occasion: ${styledProfile.default_occasion}
`
      : ""

    const userSelectedColors = profile.colorStrategy?.primary || []
    console.log(" Outfit Picker: User selected colors:", userSelectedColors.join(", "))

    const userColorSection =
      userSelectedColors.length > 0
        ? `
🎨 USER'S PREFERRED COLORS - **HIGHEST PRIORITY** 🎨
The user specifically selected these colors: ${userSelectedColors.join(", ").toUpperCase()}

MANDATORY RULES FOR COLOR SELECTION:
1. **PRIORITIZE user-selected colors above all else** - at least 2 out of 3 items in each outfit MUST be in these colors
2. If an item must be in a different color (for variety), choose from the color theory recommendations below
3. When selecting products, look for these specific colors first: ${userSelectedColors.map((c) => `"${c}"`).join(", ")}
4. The user chose these colors intentionally - respect their preference!

`
        : ""

    const fashionRulesSection = `
FASHION RULES - FOLLOW THESE STRICTLY:

BODY TYPE RULES (${bodyType.toUpperCase()}):
${bodyRules.description}
- EMPHASIZE: ${bodyRules.emphasis.join(", ")}
- AVOID: ${bodyRules.avoid.join(", ")}
- BEST SILHOUETTES: ${bodyRules.bestSilhouettes.join(", ")}
- BEST NECKLINES: ${bodyRules.bestNecklines.join(", ")}
- BEST FITS: ${bodyRules.bestFits.join(", ")}
- RECOMMENDED KEYWORDS: ${bodyRules.keywords.join(", ")}

COLOR THEORY RULES (${skinTone.toUpperCase()} SKIN TONE):
${colorRules.description}
${userSelectedColors.length > 0 ? `**NOTE**: While these color theory rules apply, the user has specifically chosen ${userSelectedColors.join(", ")} - PRIORITIZE the user's color choices!` : ""}
- BEST COLORS: ${colorRules.bestColors.join(", ")}
- AVOID COLORS: ${colorRules.avoidColors.join(", ")}
- SAFE NEUTRALS: ${colorRules.neutrals.join(", ")}
- METALLICS: ${colorRules.metallics.join(", ")}

STYLE AESTHETIC RULES (${stylePreference.toUpperCase()}):
${styleRules.description}
- KEY PIECES: ${styleRules.keyPieces.join(", ")}
- SILHOUETTES: ${styleRules.silhouettes.join(", ")}
- FABRICS: ${styleRules.fabrics.join(", ")}
- PATTERNS: ${styleRules.patterns.join(", ")}
- AVOID: ${styleRules.avoid.join(", ")}
`

    const prompt = `You are an expert personal stylist creating outfits from a curated product selection.

${profileSection}
${userColorSection}
${fashionRulesSection}
${feedbackHistory}

CLIENT PROFILE:
- Body Shape: ${profile.bodyProfile?.shape || "hourglass"}
- Style: ${profile.styleKeywords?.aesthetic?.join(", ") || "casual"}
- Occasion: ${profile.occasionGuidelines?.occasion || "everyday"}
${userSelectedColors.length > 0 ? `- **USER'S CHOSEN COLORS (MUST USE)**: ${userSelectedColors.join(", ").toUpperCase()}` : `- Colors: ${profile.colorStrategy?.primary?.join(", ") || "black, white, navy"}`}
- Budget: ${profile.priceRange?.min || 50}-${profile.priceRange?.max || 200} per outfit (STRICT)

AVAILABLE PRODUCTS (Pre-scored by relevance):

TOPS (${topProducts.tops.length} options - sorted by relevance):
${JSON.stringify(topProducts.tops, null, 2)}

BOTTOMS (${topProducts.bottoms.length} options - sorted by relevance):
${JSON.stringify(topProducts.bottoms, null, 2)}

SHOES (${topProducts.shoes.length} options - sorted by relevance):
${JSON.stringify(topProducts.shoes, null, 2)}

🚨 CRITICAL DIVERSITY REQUIREMENTS 🚨

**ZERO PRODUCT REUSE ALLOWED**
- Each product ID can ONLY be used ONCE across all 9 outfits
- If you use top ID 67767 in outfit 1, you CANNOT use it in outfits 2-9
- If you use shoes ID 68841 in outfit 1, you CANNOT use it in outfits 2-9
- Track which IDs you've used as you create each outfit

**ENFORCEMENT RULES:**
1. Before adding a product to an outfit, check if you've used that ID in any previous outfit
2. If yes, skip it and choose the next highest-scoring product
3. You have ${topProducts.tops.length} tops, ${topProducts.bottoms.length} bottoms, ${topProducts.shoes.length} shoes - use different ones for each outfit
4. Create MAXIMUM VARIETY - different tops, different bottoms, different shoes for each outfit

**OTHER REQUIREMENTS:**
1. Use EXACT product IDs (numbers) from the lists above
2. Prioritize higher relevanceScores but ensure NO DUPLICATES
3. Each outfit total price MUST be within ${profile.priceRange?.min || 50}-${profile.priceRange?.max || 200}
4. Create 9 COMPLETELY DIFFERENT outfits

Return ONLY valid JSON with 9 outfits:
{
  "outfits": [
    {
      "outfitNumber": 1,
      "name": "Creative outfit name",
      "top": {
        "id": 67780
      },
      "bottom": {
        "id": 65808
      },
      "shoes": {
        "id": 68798
      },
      "totalPrice": 165,
      "withinBudget": true,
      "whyItWorks": "Explain how this follows the fashion rules (body type, color theory, style)",
      "stylistNotes": [
        "Styling tip related to body type rules",
        "Color combination explanation based on skin tone"
      ],
      "confidenceScore": 90
    }
  ]
}

IMPORTANT: Use the numeric IDs exactly as they appear in the product lists above!`

    console.log(" Outfit Picker: Calling OpenAI for 9 outfit generation...")
    const response = await callOpenAI({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      responseFormat: "json_object",
      temperature: 0.8,
    })

    console.log(" Outfit Picker: OpenAI response received")
    const outfitData = JSON.parse(response)
    console.log(" Outfit Picker: Outfits generated:", outfitData.outfits?.length)

    // AGGRESSIVE DUPLICATE REMOVAL - Check and fix ALL duplicates
    const usedIds = {
      tops: new Set(),
      bottoms: new Set(),
      shoes: new Set()
    }
    
    let totalDuplicates = 0
    
    // First pass: detect ALL duplicates
    outfitData.outfits.forEach((outfit, index) => {
      const checks = [
        { type: 'TOP', id: outfit.top?.id, set: usedIds.tops },
        { type: 'BOTTOM', id: outfit.bottom?.id, set: usedIds.bottoms },
        { type: 'SHOES', id: outfit.shoes?.id, set: usedIds.shoes }
      ]
      
      checks.forEach(check => {
        if (check.id && check.set.has(check.id)) {
          console.warn(` Outfit Picker: DUPLICATE ${check.type} ${check.id} in outfit ${index + 1}`)
          totalDuplicates++
        } else if (check.id) {
          check.set.add(check.id)
        }
      })
    })
    
    // Second pass: fix ALL duplicates
    if (totalDuplicates > 0) {
      console.warn(` Outfit Picker: Found ${totalDuplicates} duplicate products - fixing...`)
      
      usedIds.tops.clear()
      usedIds.bottoms.clear()
      usedIds.shoes.clear()
      
      outfitData.outfits.forEach((outfit, index) => {
        // Fix duplicate tops
        if (outfit.top?.id && usedIds.tops.has(outfit.top.id)) {
          const unusedTop = topProducts.tops.find(t => !usedIds.tops.has(t.id))
          if (unusedTop) {
            console.log(`   ✓ Replacing duplicate top ${outfit.top.id} → ${unusedTop.id} in outfit ${index + 1}`)
            outfit.top.id = unusedTop.id
          } else {
            console.warn(`   ✗ No unused tops available for outfit ${index + 1}`)
          }
        }
        if (outfit.top?.id) usedIds.tops.add(outfit.top.id)
        
        // Fix duplicate bottoms
        if (outfit.bottom?.id && usedIds.bottoms.has(outfit.bottom.id)) {
          const unusedBottom = topProducts.bottoms.find(b => !usedIds.bottoms.has(b.id))
          if (unusedBottom) {
            console.log(`   ✓ Replacing duplicate bottom ${outfit.bottom.id} → ${unusedBottom.id} in outfit ${index + 1}`)
            outfit.bottom.id = unusedBottom.id
          } else {
            console.warn(`   ✗ No unused bottoms available for outfit ${index + 1}`)
          }
        }
        if (outfit.bottom?.id) usedIds.bottoms.add(outfit.bottom.id)
        
        // Fix duplicate shoes
        if (outfit.shoes?.id && usedIds.shoes.has(outfit.shoes.id)) {
          const unusedShoe = topProducts.shoes.find(s => !usedIds.shoes.has(s.id))
          if (unusedShoe) {
            console.log(`   ✓ Replacing duplicate shoe ${outfit.shoes.id} → ${unusedShoe.id} in outfit ${index + 1}`)
            outfit.shoes.id = unusedShoe.id
          } else {
            console.warn(`   ✗ No unused shoes available for outfit ${index + 1}`)
          }
        }
        if (outfit.shoes?.id) usedIds.shoes.add(outfit.shoes.id)
      })
      
      console.log(` Outfit Picker: ✓ All duplicates fixed - ${usedIds.tops.size} unique tops, ${usedIds.bottoms.size} unique bottoms, ${usedIds.shoes.size} unique shoes`)
    } else {
      console.log(" Outfit Picker: ✓ No duplicates found - all products are unique")
    }

    // Create lookup maps for faster product matching
    const topMap = new Map(products.tops.map(p => [p.id, p]))
    const bottomMap = new Map(products.bottoms.map(p => [p.id, p]))
    const shoeMap = new Map(products.shoes.map(p => [p.id, p]))

    console.log(" Outfit Picker: Product maps created - Tops:", topMap.size, "Bottoms:", bottomMap.size, "Shoes:", shoeMap.size)

    // Enrich outfits with full product data
    console.log(" Outfit Picker: Enriching outfits with full product data...")
    const enrichedOutfits = outfitData.outfits
      .map((outfit: any, index: number) => {
        console.log(` Outfit Picker: Processing outfit ${index + 1}`)
        console.log(`   Looking for IDs - Top: ${outfit.top?.id}, Bottom: ${outfit.bottom?.id}, Shoes: ${outfit.shoes?.id}`)

        const topProduct = topMap.get(outfit.top?.id)
        const bottomProduct = bottomMap.get(outfit.bottom?.id)
        const shoesProduct = shoeMap.get(outfit.shoes?.id)

        console.log(`   Found - Top: ${!!topProduct}, Bottom: ${!!bottomProduct}, Shoes: ${!!shoesProduct}`)

        // If any product not found, use fallback
        if (!topProduct || !bottomProduct || !shoesProduct) {
          console.warn(` Outfit Picker: Missing product in outfit ${outfit.outfitNumber}, using fallbacks`)
          return {
            id: `outfit-${index + 1}`,
            name: outfit.name || `Curated Look ${index + 1}`,
            totalPrice:
              (products.tops[index]?.price || 50) +
              (products.bottoms[index]?.price || 50) +
              (products.shoes[index]?.price || 50),
            withinBudget: false,
            qualityScore: outfit.confidenceScore || 85,
            items: [
              {
                id: products.tops[index]?.id || `top-${index}`,
                name: products.tops[index]?.name || "Stylish Top",
                brand: products.tops[index]?.brand || "ASOS",
                price: products.tops[index]?.price || 50,
                image: products.tops[index]?.image || "/placeholder.svg",
                url: products.tops[index]?.url || "#",
                category: "top",
              },
              {
                id: products.bottoms[index]?.id || `bottom-${index}`,
                name: products.bottoms[index]?.name || "Classic Bottom",
                brand: products.bottoms[index]?.brand || "ASOS",
                price: products.bottoms[index]?.price || 50,
                image: products.bottoms[index]?.image || "/placeholder.svg",
                url: products.bottoms[index]?.url || "#",
                category: "bottom",
              },
              {
                id: products.shoes[index]?.id || `shoes-${index}`,
                name: products.shoes[index]?.name || "Elegant Shoes",
                brand: products.shoes[index]?.brand || "ASOS",
                price: products.shoes[index]?.price || 50,
                image: products.shoes[index]?.image || "/placeholder.svg",
                url: products.shoes[index]?.url || "#",
                category: "shoes",
              },
            ],
            whyItWorks: outfit.whyItWorks || "A perfectly curated look for your style profile.",
            stylistNotes: outfit.stylistNotes || ["Style with confidence", "Perfect for your occasion"],
          }
        }

        const totalPrice = topProduct.price + bottomProduct.price + shoesProduct.price
        const withinBudget =
          totalPrice >= (profile.priceRange?.min || 50) && totalPrice <= (profile.priceRange?.max || 200)

        const enriched = {
          id: `outfit-${index + 1}`,
          name: outfit.name,
          totalPrice: totalPrice,
          withinBudget: withinBudget,
          qualityScore: outfit.confidenceScore || 90,
          items: [
            {
              id: topProduct.id,
              name: topProduct.name,
              brand: topProduct.brand,
              price: topProduct.price,
              images: topProduct.images || [topProduct.image],
              image: topProduct.image,
              url: topProduct.url,
              product_url: topProduct.product_url || topProduct.url,
              color: topProduct.color,
              description: topProduct.description,
              category: "top",
            },
            {
              id: bottomProduct.id,
              name: bottomProduct.name,
              brand: bottomProduct.brand,
              price: bottomProduct.price,
              images: bottomProduct.images || [bottomProduct.image],
              image: bottomProduct.image,
              url: bottomProduct.url,
              product_url: bottomProduct.product_url || bottomProduct.url,
              color: bottomProduct.color,
              description: bottomProduct.description,
              category: "bottom",
            },
            {
              id: shoesProduct.id,
              name: shoesProduct.name,
              brand: shoesProduct.brand,
              price: shoesProduct.price,
              images: shoesProduct.images || [shoesProduct.image],
              image: shoesProduct.image,
              url: shoesProduct.url,
              product_url: shoesProduct.product_url || shoesProduct.url,
              color: shoesProduct.color,
              description: shoesProduct.description,
              category: "shoes",
            },
          ],
          whyItWorks: outfit.whyItWorks,
          stylistNotes: outfit.stylistNotes,
        }

        console.log(`   Outfit ${index + 1} enriched successfully - Total: $${totalPrice}`)
        return enriched
      })
      .filter(Boolean)

    console.log(" Outfit Picker: Total enriched outfits:", enrichedOutfits.length)
    console.log(` Outfit Picker: Successfully matched: ${enrichedOutfits.filter(o => o.items[0].id !== `top-0`).length} outfits`)

    // Final diversity check - log unique product counts
    const finalUniqueProducts = {
      tops: new Set(enrichedOutfits.map(o => o.items[0].id)),
      bottoms: new Set(enrichedOutfits.map(o => o.items[1].id)),
      shoes: new Set(enrichedOutfits.map(o => o.items[2].id))
    }
    
    console.log(` Outfit Picker: FINAL DIVERSITY CHECK:`)
    console.log(`   - Unique tops: ${finalUniqueProducts.tops.size}/9`)
    console.log(`   - Unique bottoms: ${finalUniqueProducts.bottoms.size}/9`)
    console.log(`   - Unique shoes: ${finalUniqueProducts.shoes.size}/9`)
    
    if (finalUniqueProducts.tops.size < 9 || finalUniqueProducts.bottoms.size < 9 || finalUniqueProducts.shoes.size < 9) {
      console.warn(` Outfit Picker: ⚠️ WARNING - Not enough diversity in final outfits!`)
    } else {
      console.log(` Outfit Picker: ✓ Perfect diversity - all products are unique!`)
    }

    return NextResponse.json({
      success: true,
      outfits: enrichedOutfits,
    })
  } catch (error: any) {
    console.error(" Outfit Picker: Error occurred:", error)
    console.error(" Outfit Picker: Error stack:", error.stack)
    return NextResponse.json({ error: "Outfit generation failed", details: error.message }, { status: 500 })
  }
}