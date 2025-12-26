import { supabase } from "./supabase"

// Helper to extract first image URL from images field
function extractImageUrl(images, productName = "unknown") {
  console.log(`[v0] Supabase Products: Extracting image for: "${productName.substring(0, 40)}"`)
  console.log(`[v0] Supabase Products: Raw images value type: ${typeof images}`)
  console.log(`[v0] Supabase Products: Raw images value: ${JSON.stringify(images)?.substring(0, 200)}...`)

  if (!images) {
    console.log(`[v0] Supabase Products: ❌ No images field, using placeholder`)
    return "/placeholder.svg"
  }

  try {
    // If it's a string, try to parse as JSON
    if (typeof images === "string") {
      console.log(`[v0] Supabase Products: Images is a string, attempting JSON parse...`)
      // Check if it looks like a JSON array
      if (images.trim().startsWith("[")) {
        const parsed = JSON.parse(images)
        console.log(`[v0] Supabase Products: Parsed array length: ${parsed.length}`)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const firstItem = parsed[0]
          console.log(`[v0] Supabase Products: First array item:`, JSON.stringify(firstItem))

          // Handle different structures: {url: "..."} or just "url"
          const imageUrl = firstItem.url || firstItem.imageUrl || firstItem
          console.log(`[v0] Supabase Products: ✅ Extracted URL: ${imageUrl}`)
          return imageUrl
        }
      }
      // If not JSON, assume it's a direct URL
      console.log(`[v0] Supabase Products: ✅ Using string as direct URL: ${images}`)
      return images
    }

    // If it's already an array
    if (Array.isArray(images) && images.length > 0) {
      console.log(`[v0] Supabase Products: Images is already an array, length: ${images.length}`)
      const firstItem = images[0]
      const imageUrl = firstItem.url || firstItem.imageUrl || firstItem
      console.log(`[v0] Supabase Products: ✅ Extracted URL from array: ${imageUrl}`)
      return imageUrl
    }

    console.log(`[v0] Supabase Products: ❌ Could not extract image, using placeholder`)
    return "/placeholder.svg"
  } catch (e) {
    console.error("[v0] Supabase Products: ❌ Error extracting image URL:", e.message)
    console.log(`[v0] Supabase Products: Fallback to string or placeholder`)
    return typeof images === "string" ? images : "/placeholder.svg"
  }
}

// Helper to extract ALL image URLs from images field
function extractAllImageUrls(images, productName = "unknown") {
  console.log(`[v0] Supabase Products: Extracting ALL images for: "${productName.substring(0, 40)}"`)

  if (!images) {
    console.log(`[v0] Supabase Products: ❌ No images field`)
    return ["/placeholder.svg"]
  }

  try {
    let imageArray = []

    // If it's a string, try to parse as JSON
    if (typeof images === "string") {
      if (images.trim().startsWith("[")) {
        const parsed = JSON.parse(images)
        if (Array.isArray(parsed)) {
          imageArray = parsed.map((item) => item.url || item.imageUrl || item).filter(Boolean)
        }
      } else {
        // Single URL string
        imageArray = [images]
      }
    } else if (Array.isArray(images)) {
      imageArray = images.map((item) => item.url || item.imageUrl || item).filter(Boolean)
    }

    console.log(`[v0] Supabase Products: ✅ Extracted ${imageArray.length} images`)
    return imageArray.length > 0 ? imageArray : ["/placeholder.svg"]
  } catch (e) {
    console.error("[v0] Supabase Products: ❌ Error extracting images:", e.message)
    return ["/placeholder.svg"]
  }
}

function calculateRelevanceScore(product, keywords, categoryType) {
  let score = 0
  const productName = product.product_name?.toLowerCase() || ""

  // Check each keyword
  for (const keyword of keywords) {
    if (productName.includes(keyword.toLowerCase())) {
      score += 10
    }
  }

  // Stock bonus
  if (product.availability !== false && product.stock_status !== "Out of Stock") {
    score += 5
  }

  // Price bonus (prefer mid-range)
  const price = Number.parseFloat(product.price) || 0
  if (price > 0) score += 5

  console.log(`[v0] Supabase Products:   "${productName.substring(0, 50)}..." = ${score} points`)
  return score
}

// Search products from your Supabase database
export async function searchProductsFromDB(keywords, options = {}) {
  const { limit = 25, categoryType = "general", priceRange = null } = options

  console.log(`[v0] ========================================`)
  console.log(`[v0] BUDGET FILTER DEBUG - ${categoryType.toUpperCase()}`)
  console.log(`[v0] ========================================`)
  console.log(`[v0] Keywords: [${keywords.join(", ")}]`)

  // Determine budget type
  const isUnlimited = priceRange?.isUnlimited === true || priceRange?.max === null || priceRange?.max === 99999
  const budgetMin = priceRange?.min || 0
  const budgetMax = priceRange?.max || 99999

  console.log(`[v0] Budget Type: ${isUnlimited ? "LUXURY (UNLIMITED)" : "FIXED RANGE"}`)
  console.log(`[v0] Budget Min: $${budgetMin}`)
  console.log(`[v0] Budget Max: ${isUnlimited ? "NO LIMIT" : "$" + budgetMax}`)

  try {
    const conditions = keywords.map((k) => `product_name.ilike.%${k}%`).join(",")

    // STEP 1: First query - STRICT budget range only
    let query = supabase.from("zara_cloth_test").select("*").or(conditions).gte("price", budgetMin)

    // Only apply max filter if NOT luxury/unlimited
    if (!isUnlimited) {
      query = query.lte("price", budgetMax)
      console.log(`[v0] STRICT QUERY: $${budgetMin} <= price <= $${budgetMax}`)
    } else {
      console.log(`[v0] LUXURY QUERY: price >= $${budgetMin} (NO UPPER LIMIT)`)
    }

    const { data, error } = await query.limit(limit * 3)

    if (error) {
      console.error("[v0] Search error:", error.message)
      throw error
    }

    console.log(`[v0] STRICT SEARCH RESULTS: ${data?.length || 0} products found`)

    // STEP 2: If luxury - we're done, no expansion needed
    if (isUnlimited) {
      console.log(`[v0] LUXURY MODE: Using all ${data?.length || 0} products (no expansion needed)`)
    }

    // STEP 3: If fixed budget and too few results - EXPAND CAREFULLY
    let finalData = data || []

    if (!isUnlimited && finalData.length < 5) {
      console.log(`[v0] ⚠️ Only ${finalData.length} products in strict budget - EXPANDING...`)

      // Expansion levels: 50% -> 100% -> 200% -> 300%
      const expansions = [
        { below: 0.5, above: 1.5, label: "±50%" },
        { below: 0.25, above: 2.0, label: "±100%" },
        { below: 0.1, above: 3.0, label: "±200%" },
        { below: 0, above: 5.0, label: "±400%" },
      ]

      for (const exp of expansions) {
        if (finalData.length >= 5) break

        const expandedMin = Math.max(0, budgetMin * exp.below)
        const expandedMax = budgetMax * exp.above

        console.log(`[v0] EXPANSION ${exp.label}: $${expandedMin.toFixed(0)} - $${expandedMax.toFixed(0)}`)

        const { data: expandedData } = await supabase
          .from("zara_cloth_test")
          .select("*")
          .or(conditions)
          .gte("price", expandedMin)
          .lte("price", expandedMax)
          .limit(limit * 3)

        if (expandedData && expandedData.length > finalData.length) {
          console.log(`[v0] ✅ Expansion found ${expandedData.length} products`)
          finalData = expandedData
        }
      }
    }

    if (finalData.length === 0) {
      console.warn("[v0] ❌ No products found even after expansion!")
      return []
    }

    // STEP 4: Score products - HEAVILY favor within-budget items
    console.log(`[v0] SCORING ${finalData.length} products...`)

    const scored = finalData.map((p) => {
      let score = 0
      const price = Number.parseFloat(p.price) || 0
      const productName = p.product_name?.toLowerCase() || ""

      // Keyword matching score
      for (const keyword of keywords) {
        if (productName.includes(keyword.toLowerCase())) {
          score += 10
        }
      }

      // BUDGET SCORING - This is the key part
      if (isUnlimited) {
        // LUXURY: All products above min are good, prefer higher-end
        if (price >= budgetMin) {
          score += 50 // Big bonus for meeting minimum
          score += Math.min(20, price / 50) // Small bonus for luxury items
          console.log(
            `[v0]   ✓ "${productName.substring(0, 30)}..." $${price} = LUXURY OK (+${50 + Math.min(20, price / 50)} pts)`,
          )
        }
      } else {
        // FIXED BUDGET: Strict scoring
        if (price >= budgetMin && price <= budgetMax) {
          // WITHIN BUDGET - Highest priority
          score += 100 // HUGE bonus for being in budget
          console.log(`[v0]   ✓ "${productName.substring(0, 30)}..." $${price} = IN BUDGET (+100 pts)`)
        } else if (price < budgetMin) {
          // BELOW BUDGET - Small penalty but still usable
          const distance = budgetMin - price
          const penalty = Math.min(50, distance / 2)
          score += 50 - penalty
          console.log(
            `[v0]   ~ "${productName.substring(0, 30)}..." $${price} = BELOW BUDGET (+${(50 - penalty).toFixed(0)} pts)`,
          )
        } else {
          // ABOVE BUDGET - Bigger penalty
          const distance = price - budgetMax
          const penalty = Math.min(40, distance / 3)
          score += 20 - penalty
          console.log(
            `[v0]   ✗ "${productName.substring(0, 30)}..." $${price} = OVER BUDGET (+${Math.max(0, 20 - penalty).toFixed(0)} pts)`,
          )
        }
      }

      return { ...p, relevanceScore: Math.max(0, score) }
    })

    // Sort by score
    scored.sort((a, b) => b.relevanceScore - a.relevanceScore)

    // Log top results
    console.log(`[v0] TOP 5 SCORED PRODUCTS:`)
    scored.slice(0, 5).forEach((p, i) => {
      console.log(`[v0]   ${i + 1}. "${p.product_name.substring(0, 40)}..." - $${p.price} - ${p.relevanceScore} pts`)
    })

    // Count within-budget items
    const withinBudget = scored.filter((p) => {
      const price = Number.parseFloat(p.price) || 0
      return isUnlimited ? price >= budgetMin : price >= budgetMin && price <= budgetMax
    }).length

    console.log(`[v0] WITHIN BUDGET: ${withinBudget}/${scored.length} products`)
    console.log(`[v0] ========================================`)

    // Format results
    const products = scored
      .slice(0, limit * 2)
      .map((p) => {
        const allImages = extractAllImageUrls(p.images || p.image, p.product_name)
        const validImages = allImages.filter((img) => img && img !== "/placeholder.svg" && img.startsWith("http"))

        if (validImages.length === 0) return null

        const productUrl = p.product_url || p.url || p.link || p.href
        if (!productUrl) {
          console.warn(`[v0] ⚠️ NO URL FOUND for: "${p.product_name.substring(0, 50)}" (ID: ${p.product_id})`)
          console.warn(
            `[v0]    Fields checked: product_url="${p.product_url}" | url="${p.url}" | link="${p.link}" | href="${p.href}"`,
          )
        } else {
          console.log(
            `[v0] ✅ URL found for: "${p.product_name.substring(0, 50)}" -> ${productUrl.substring(0, 60)}...`,
          )
        }

        return {
          id: p.id || p.product_id?.toString(),
          name: p.product_name,
          price: Number.parseFloat(p.price) || 0,
          priceText: `${p.currency || "$"}${p.price}`,
          brand: p.brand || "Zara",
          images: validImages,
          image: validImages[0],
          url: productUrl || "#",
          product_url: productUrl || "#",
          color: p.color || p.colour || "N/A",
          category: p.category || p.scraped_category || categoryType,
          description: p.description,
          isInStock: p.availability !== false && p.stock_status !== "Out of Stock",
          relevanceScore: p.relevanceScore,
          isWithinBudget: isUnlimited ? true : p.price >= budgetMin && p.price <= budgetMax,
        }
      })
      .filter(Boolean)
      .slice(0, limit)

    return products
  } catch (error) {
    console.error("[v0] Fatal error:", error)
    return []
  }
}

// Search by category type (tops, bottoms, shoes)
export async function searchProductsByCategories(profile) {
  console.log("[v0] ========================================")
  console.log("[v0] CATEGORY SEARCH STARTING")
  console.log("[v0] ========================================")

  const priceRange = profile.priceRange || null
  const isUnlimited = priceRange?.isUnlimited === true || priceRange?.max === null || priceRange?.max === 99999

  if (priceRange) {
    console.log(`[v0] BUDGET: $${priceRange.min} - ${isUnlimited ? "UNLIMITED (LUXURY)" : "$" + priceRange.max}`)
  }

  const categoryKeywords = {
    tops: ["shirt", "blouse", "top", "sweater", "jacket", "blazer", "tshirt", "tee", "cardigan"],
    bottoms: ["trouser", "pant", "jean", "skirt", "short", "legging"],
    shoes: ["shoe", "boot", "sneaker", "sandal", "heel", "flat", "ankle", "trainer"],
  }

  try {
    const tops = await searchProductsFromDB(categoryKeywords.tops, {
      limit: 30,
      categoryType: "tops",
      priceRange: priceRange,
    })

    const bottoms = await searchProductsFromDB(categoryKeywords.bottoms, {
      limit: 30,
      categoryType: "bottoms",
      priceRange: priceRange,
    })

    const shoes = await searchProductsFromDB(categoryKeywords.shoes, {
      limit: 30,
      categoryType: "shoes",
      priceRange: priceRange,
    })

    console.log(`[v0] ========================================`)
    console.log(`[v0] FINAL RESULTS:`)
    console.log(`[v0] 👕 Tops: ${tops.length} (${tops.filter((t) => t.isWithinBudget).length} within budget)`)
    console.log(`[v0] 👖 Bottoms: ${bottoms.length} (${bottoms.filter((b) => b.isWithinBudget).length} within budget)`)
    console.log(`[v0] 👞 Shoes: ${shoes.length} (${shoes.filter((s) => s.isWithinBudget).length} within budget)`)
    console.log(`[v0] ========================================`)

    return { tops, bottoms, shoes }
  } catch (error) {
    console.error("[v0] Category search failed:", error)
    return { tops: [], bottoms: [], shoes: [] }
  }
}
