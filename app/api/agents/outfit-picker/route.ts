import { callOpenAI } from "@/lib/openai"
import { NextResponse } from "next/server"
import { supabaseAuth } from "@/lib/supabase-auth-client"

export async function POST(request: Request) {
  console.log(" Outfit Picker: Starting outfit generation")

  try {
    const { profile, products, styledProfile } = await request.json()

    console.log(" Outfit Picker: Profile received")
    console.log(" Outfit Picker: Styled Profile received:", !!styledProfile)

    // 🔥 FILTER OUT PRODUCTS WITHOUT VALID IMAGES
    const filterValidProducts = (items: any[], category: string) => {
      const validItems = items.filter((item: any) => {
        const hasValidImage = item.images && 
                             Array.isArray(item.images) && 
                             item.images.length > 0 && 
                             item.images[0] && 
                             item.images[0] !== "/placeholder.svg" &&
                             item.images[0].startsWith("http")
        
        if (!hasValidImage) {
          console.warn(` ⚠️ Filtered out ${category}: "${item.name}" - No valid image`)
        }
        return hasValidImage
      })
      
      console.log(` ✅ ${category}: ${validItems.length}/${items.length} have valid images`)
      return validItems
    }

    const validTops = filterValidProducts(products.tops, "TOPS")
    const validBottoms = filterValidProducts(products.bottoms, "BOTTOMS")
    const validShoes = filterValidProducts(products.shoes, "SHOES")

    console.log(
      " Outfit Picker: Valid products - Tops:",
      validTops.length,
      "Bottoms:",
      validBottoms.length,
      "Shoes:",
      validShoes.length,
    )

    if (validTops.length === 0 || validBottoms.length === 0 || validShoes.length === 0) {
      throw new Error("Not enough products with valid images to create outfits")
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

    // Minimize product data for token efficiency
    const minimizedProducts = {
      tops: validTops.slice(0, 15).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        brand: p.brand,
        color: p.color,
      })),
      bottoms: validBottoms.slice(0, 15).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        brand: p.brand,
        color: p.color,
      })),
      shoes: validShoes.slice(0, 15).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        brand: p.brand,
        color: p.color,
      })),
    }

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

    // 🔥 DETERMINE BUDGET TIER FOR SMART TARGETING
    const budgetMin = profile.priceRange?.min || 50
    const budgetMax = profile.priceRange?.max || 200
    const isUnlimited = profile.priceRange?.isUnlimited === true || budgetMax === 99999
    
    let budgetTier = 'budget'
    let targetPercentage = '55-65%'
    let strategyNote = 'Find best value'
    
    if (isUnlimited || budgetMin >= 500) {
      budgetTier = 'luxury'
      targetPercentage = '80-100%'
      strategyNote = 'Select premium, high-quality items - price is secondary to quality'
    } else if (budgetMin >= 300) {
      budgetTier = 'premium'
      targetPercentage = '75-85%'
      strategyNote = 'Choose high-quality items near upper range - users EXPECT premium products'
    } else if (budgetMin >= 150) {
      budgetTier = 'moderate'
      targetPercentage = '65-75%'
      strategyNote = 'Balance quality and price - aim for mid-to-upper range'
    }

    console.log(` Outfit Picker: Budget tier: ${budgetTier}`)
    console.log(` Outfit Picker: Target spending: ${targetPercentage} of max`)

    const prompt = `You are an expert personal stylist with deep knowledge of body proportions and color theory.

${profileSection}
${feedbackHistory}

CLIENT PROFILE:
- Body Shape: ${profile.bodyProfile?.shape || "hourglass"}
- Style: ${profile.styleKeywords?.aesthetic?.join(", ") || "casual"}
- Occasion: ${profile.occasionGuidelines?.occasion || "everyday"}
- Colors: ${profile.colorStrategy?.primary?.join(", ") || "black, white, navy"}
- Budget Tier: ${budgetTier.toUpperCase()}
- Budget Range: $${budgetMin}-${isUnlimited ? 'UNLIMITED' : '$' + budgetMax} per COMPLETE outfit

${styledProfile ? "IMPORTANT: Use the physical profile data above to recommend flattering cuts, proportions, and colors that complement the client's body type, face shape, and skin tone." : ""}

AVAILABLE PRODUCTS:

TOPS (${minimizedProducts.tops.length} options):
${JSON.stringify(minimizedProducts.tops, null, 2)}

BOTTOMS (${minimizedProducts.bottoms.length} options):
${JSON.stringify(minimizedProducts.bottoms, null, 2)}

SHOES (${minimizedProducts.shoes.length} options):
${JSON.stringify(minimizedProducts.shoes, null, 2)}

CREATE 9 COMPLETE OUTFITS for comparison.

🎯 CRITICAL BUDGET TARGETING STRATEGY:
Budget Tier: ${budgetTier.toUpperCase()}
Total Outfit Budget: $${budgetMin}-${isUnlimited ? 'UNLIMITED' : '$' + budgetMax}
Target Spending: ${targetPercentage} of maximum budget
Strategy: ${strategyNote}

${isUnlimited ? `
💎 LUXURY TIER RULES:
- No upper limit - QUALITY is priority #1
- Select premium items $${budgetMin}+ each
- Don't hesitate to use expensive items
- Aim for outfit totals $${Math.round(budgetMin * 2)}+
` : budgetTier === 'premium' ? `
💰 PREMIUM TIER RULES ($${budgetMin}-$${budgetMax}):
- Target outfit total: $${Math.round(budgetMax * 0.75)}-$${Math.round(budgetMax * 0.85)} (75-85% of max)
- Users EXPECT high-quality, premium items
- Don't be conservative - use the upper price range
- Example: If max is $500, aim for $375-$425 outfits
- Minimum acceptable: $${Math.round(budgetMin * 0.90)} (90% of min)
` : budgetTier === 'moderate' ? `
📊 MODERATE TIER RULES ($${budgetMin}-$${budgetMax}):
- Target outfit total: $${Math.round(budgetMax * 0.65)}-$${Math.round(budgetMax * 0.75)} (65-75% of max)
- Balance quality with value
- Aim for mid-to-upper range pricing
- Minimum acceptable: $${Math.round(budgetMin * 0.90)} (90% of min)
` : `
💵 BUDGET TIER RULES ($${budgetMin}-$${budgetMax}):
- Target outfit total: $${Math.round(budgetMax * 0.55)}-$${Math.round(budgetMax * 0.65)} (55-65% of max)
- Find best value for money
- Aim for mid-range pricing
- Minimum acceptable: $${Math.round(budgetMin * 0.85)} (85% of min)
`}

OUTFIT CREATION RULES:
1. Each outfit = 1 top + 1 bottom + 1 shoes
2. Use ONLY product IDs from the lists above
3. Colors must complement each other
4. NO product can appear in multiple outfits
5. totalPrice = top.price + bottom.price + shoes.price
6. Create diverse options (different styles, colors, price points)
7. **AIM HIGH within budget** - don't be conservative!
8. At LEAST 6 out of 9 outfits should hit the target range

Return ONLY valid JSON with 9 outfits:
{
  "outfits": [
    {
      "outfitNumber": 1,
      "name": "Creative outfit name",
      "top": {
        "id": "product_id_from_list"
      },
      "bottom": {
        "id": "product_id_from_list"
      },
      "shoes": {
        "id": "product_id_from_list"
      },
      "totalPrice": ${budgetTier === 'premium' ? Math.round(budgetMax * 0.80) : budgetTier === 'moderate' ? Math.round(budgetMax * 0.70) : Math.round(budgetMax * 0.60)},
      "withinBudget": true,
      "whyItWorks": "2-3 sentences explaining why this outfit is worth the price and flatters the client",
      "stylistNotes": [
        "Styling tip 1",
        "Styling tip 2"
      ],
      "confidenceScore": 90
    },
    ...repeat for outfits 2-9
  ]
}

REMEMBER: For ${budgetTier.toUpperCase()} tier, aim for ${targetPercentage} of max budget. ${strategyNote}!`

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

    // Enrich outfits with full product data
    console.log(" Outfit Picker: Enriching outfits with full product data...")
    const enrichedOutfits = outfitData.outfits
      .map((outfit: any, index: number) => {
        const topProduct = validTops.find((p: any) => p.id === outfit.top?.id)
        const bottomProduct = validBottoms.find((p: any) => p.id === outfit.bottom?.id)
        const shoesProduct = validShoes.find((p: any) => p.id === outfit.shoes?.id)

        // If any product not found, use fallback with VALID IMAGES
        if (!topProduct || !bottomProduct || !shoesProduct) {
          console.warn(` Outfit Picker: Missing product in outfit ${outfit.outfitNumber}, using fallbacks`)
          return {
            id: `outfit-${index + 1}`,
            name: outfit.name || `Curated Look ${index + 1}`,
            totalPrice:
              (validTops[index]?.price || 50) +
              (validBottoms[index]?.price || 50) +
              (validShoes[index]?.price || 50),
            withinBudget: false,
            qualityScore: outfit.confidenceScore || 85,
            items: [
              {
                id: validTops[index]?.id || `top-${index}`,
                name: validTops[index]?.name || "Stylish Top",
                brand: validTops[index]?.brand || "Zara",
                price: validTops[index]?.price || 50,
                images: validTops[index]?.images || ["/placeholder.svg"],
                image: validTops[index]?.image || "/placeholder.svg",
                url: validTops[index]?.url || "#",
                product_url: validTops[index]?.product_url || "#",
                category: "top",
              },
              {
                id: validBottoms[index]?.id || `bottom-${index}`,
                name: validBottoms[index]?.name || "Classic Bottom",
                brand: validBottoms[index]?.brand || "Zara",
                price: validBottoms[index]?.price || 50,
                images: validBottoms[index]?.images || ["/placeholder.svg"],
                image: validBottoms[index]?.image || "/placeholder.svg",
                url: validBottoms[index]?.url || "#",
                product_url: validBottoms[index]?.product_url || "#",
                category: "bottom",
              },
              {
                id: validShoes[index]?.id || `shoes-${index}`,
                name: validShoes[index]?.name || "Elegant Shoes",
                brand: validShoes[index]?.brand || "Zara",
                price: validShoes[index]?.price || 50,
                images: validShoes[index]?.images || ["/placeholder.svg"],
                image: validShoes[index]?.image || "/placeholder.svg",
                url: validShoes[index]?.url || "#",
                product_url: validShoes[index]?.product_url || "#",
                category: "shoes",
              },
            ],
            whyItWorks: outfit.whyItWorks || "A perfectly curated look for your style profile.",
            stylistNotes: outfit.stylistNotes || ["Style with confidence", "Perfect for your occasion"],
          }
        }

        const totalPrice = topProduct.price + bottomProduct.price + shoesProduct.price
        const withinBudget = totalPrice >= budgetMin && totalPrice <= budgetMax

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

        return enriched
      })
      .filter(Boolean)

    console.log(" Outfit Picker: Total enriched outfits:", enrichedOutfits.length)
    
    // Log budget performance
    const avgPrice = enrichedOutfits.reduce((sum: number, o: any) => sum + o.totalPrice, 0) / enrichedOutfits.length
    const withinBudgetCount = enrichedOutfits.filter((o: any) => o.withinBudget).length
    console.log(` 💰 Budget Performance:`)
    console.log(`    Target: $${budgetMin}-${budgetMax}`)
    console.log(`    Average outfit: $${Math.round(avgPrice)}`)
    console.log(`    Within budget: ${withinBudgetCount}/${enrichedOutfits.length}`)

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