import { callOpenAI } from "@/lib/openai"
import { NextResponse } from "next/server"
import { supabaseAuth } from "@/lib/supabase-auth-client"

export async function POST(request: Request) {
  console.log(" Outfit Picker: Starting outfit generation")

  try {
    const { profile, products, styledProfile } = await request.json()

    console.log(" Outfit Picker: Profile received")
    console.log(" Outfit Picker: Styled Profile received:", !!styledProfile)

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

    console.log(" Outfit Picker: === SAMPLE PRODUCTS ===")
    if (products.tops?.[0]) {
      console.log(" Outfit Picker: Sample TOP:", JSON.stringify(products.tops[0], null, 2))
    }
    if (products.bottoms?.[0]) {
      console.log(" Outfit Picker: Sample BOTTOM:", JSON.stringify(products.bottoms[0], null, 2))
    }
    if (products.shoes?.[0]) {
      console.log(" Outfit Picker: Sample SHOE:", JSON.stringify(products.shoes[0], null, 2))
    }
    console.log(" Outfit Picker: ========================")

    // Minimize product data for token efficiency
    const minimizedProducts = {
      tops: products.tops.slice(0, 15).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        brand: p.brand,
        color: p.color,
      })),
      bottoms: products.bottoms.slice(0, 15).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        brand: p.brand,
        color: p.color,
      })),
      shoes: products.shoes.slice(0, 15).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        brand: p.brand,
        color: p.color,
      })),
    }

    console.log(
      " Outfit Picker: Minimized products - Tops:",
      minimizedProducts.tops.length,
      "Bottoms:",
      minimizedProducts.bottoms.length,
      "Shoes:",
      minimizedProducts.shoes.length,
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

    const prompt = `You are an expert personal stylist with deep knowledge of body proportions and color theory.

${profileSection}
${feedbackHistory}

CLIENT PROFILE:
- Body Shape: ${profile.bodyProfile?.shape || "hourglass"}
- Style: ${profile.styleKeywords?.aesthetic?.join(", ") || "casual"}
- Occasion: ${profile.occasionGuidelines?.occasion || "everyday"}
- Colors: ${profile.colorStrategy?.primary?.join(", ") || "black, white, navy"}
- Budget: $${profile.priceRange?.min || 50}-$${profile.priceRange?.max || 200} per outfit (STRICT)

${styledProfile ? "IMPORTANT: Use the physical profile data above to recommend flattering cuts, proportions, and colors that complement the client's body type, face shape, and skin tone." : ""}

AVAILABLE PRODUCTS:

TOPS (${minimizedProducts.tops.length} options):
${JSON.stringify(minimizedProducts.tops, null, 2)}

BOTTOMS (${minimizedProducts.bottoms.length} options):
${JSON.stringify(minimizedProducts.bottoms, null, 2)}

SHOES (${minimizedProducts.shoes.length} options):
${JSON.stringify(minimizedProducts.shoes, null, 2)}

CREATE 9 COMPLETE OUTFITS for comparison.

RULES:
1. Each outfit needs: 1 top + 1 bottom + 1 pair of shoes
2. Use ONLY product IDs from the lists above
3. Colors must complement each other
4. NO product can appear in multiple outfits
5. Calculate accurate total price
6. Create diverse options (different styles, colors, price points)
7. **CRITICAL BUDGET RULE**: Each outfit's TOTAL PRICE must be within or as close as possible to $${profile.priceRange?.min || 50}-$${profile.priceRange?.max || 200}
   - FIRST PRIORITY: Find outfits within the exact budget range
   - SECOND PRIORITY: If not possible, choose items closest to the budget (prefer slightly under budget over over budget)
   - Each outfit should have totalPrice calculated as: top.price + bottom.price + shoes.price
   - Aim for AT LEAST 6 out of 9 outfits to be within the budget range

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
      "totalPrice": 165,
      "withinBudget": true,
      "whyItWorks": "2-3 sentences explaining the outfit",
      "stylistNotes": [
        "Styling tip 1",
        "Styling tip 2"
      ],
      "confidenceScore": 90
    },
    ...repeat for outfits 2-9
  ]
}

CRITICAL: Create exactly 9 diverse outfits using different products! Prioritize staying within the budget of $${profile.priceRange?.min || 50}-$${profile.priceRange?.max || 200} per outfit.`

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
        console.log(" Outfit Picker: Processing outfit", index + 1)
        console.log(" Outfit Picker: Looking for top ID:", outfit.top?.id)
        console.log(" Outfit Picker: Looking for bottom ID:", outfit.bottom?.id)
        console.log(" Outfit Picker: Looking for shoes ID:", outfit.shoes?.id)

        const topProduct = products.tops.find((p: any) => p.id === outfit.top?.id)
        const bottomProduct = products.bottoms.find((p: any) => p.id === outfit.bottom?.id)
        const shoesProduct = products.shoes.find((p: any) => p.id === outfit.shoes?.id)

        console.log(" Outfit Picker: Top found:", !!topProduct)
        console.log(" Outfit Picker: Bottom found:", !!bottomProduct)
        console.log(" Outfit Picker: Shoes found:", !!shoesProduct)

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

        console.log(
          " Outfit Picker: Outfit enriched with",
          enriched.items.reduce((sum, item) => sum + (item.images?.length || 0), 0),
          "total images",
        )
        return enriched
      })
      .filter(Boolean)

    console.log(" Outfit Picker: Total enriched outfits:", enrichedOutfits.length)

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
