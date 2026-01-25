// supabase-prodcut.js >>>> for product searching
// COMPLETE UPDATED VERSION - January 2026 fix pack
// Features: name+description search, description-based scoring, penalties, broad fallback

import { supabase } from "./supabase"

// ──────────────────────────────────────────────────────────────────────────────
// 1. IMAGE EXTRACTION HELPERS (unchanged + hardened)
// ──────────────────────────────────────────────────────────────────────────────

function extractImageUrl(images, productName = "unknown") {
  console.log(`[IMG] Extracting primary image for: "${productName.substring(0, 40)}..."`)
  console.log(`[IMG] Raw images type: ${typeof images}`)

  if (!images) {
    console.log(`[IMG] No images → placeholder`)
    return "/placeholder.svg"
  }

  try {
    // Case 1: JSON string like "[{url:...}, ...]"
    if (typeof images === "string" && images.trim().startsWith("[")) {
      const parsed = JSON.parse(images)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const first = parsed[0]
        const url = first.url || first.imageUrl || first || "/placeholder.svg"
        console.log(`[IMG] Parsed array → using: ${url.substring(0, 60)}...`)
        return url
      }
    }

    // Case 2: Direct string URL
    if (typeof images === "string") {
      console.log(`[IMG] Direct string URL: ${images.substring(0, 60)}...`)
      return images
    }

    // Case 3: Already array
    if (Array.isArray(images) && images.length > 0) {
      const first = images[0]
      const url = first.url || first.imageUrl || first || "/placeholder.svg"
      console.log(`[IMG] Array → using: ${url.substring(0, 60)}...`)
      return url
    }

    console.log(`[IMG] Failed to extract → placeholder`)
    return "/placeholder.svg"
  } catch (e) {
    console.error(`[IMG] Parse error for ${productName}:`, e.message)
    return typeof images === "string" ? images : "/placeholder.svg"
  }
}

function extractAllImageUrls(images, productName = "unknown") {
  console.log(`[IMG-ALL] Extracting all images for: "${productName.substring(0, 40)}..."`)

  if (!images) {
    console.log(`[IMG-ALL] No images field`)
    return ["/placeholder.svg"]
  }

  try {
    let imageArray = []

    if (typeof images === "string") {
      if (images.trim().startsWith("[")) {
        const parsed = JSON.parse(images)
        if (Array.isArray(parsed)) {
          imageArray = parsed
            .map(item => item.url || item.imageUrl || item)
            .filter(Boolean)
        }
      } else {
        imageArray = [images]
      }
    } else if (Array.isArray(images)) {
      imageArray = images
        .map(item => item.url || item.imageUrl || item)
        .filter(Boolean)
    }

    console.log(`[IMG-ALL] Extracted ${imageArray.length} valid URLs`)
    return imageArray.length > 0 ? imageArray : ["/placeholder.svg"]
  } catch (e) {
    console.error(`[IMG-ALL] Error parsing images for ${productName}:`, e.message)
    return ["/placeholder.svg"]
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. RELEVANCE SCORING – USES DESCRIPTION + OCCASION PENALTIES
// ──────────────────────────────────────────────────────────────────────────────

function calculateRelevanceScore(product, keywords, categoryType, occasion) {
  let score = 0

  const name = (product.product_name || "").toLowerCase()
  const desc = (product.description || "").toLowerCase()

  console.log(`[SCORE] Evaluating: "${name.substring(0, 55)}..."`)

  // 1. Keyword matches – name has higher weight
  for (const keyword of keywords) {
    const k = keyword.toLowerCase()
    if (name.includes(k)) {
      score += 12
      console.log(`   +12 | keyword "${k}" found in NAME`)
    }
    if (desc.includes(k)) {
      score += 8
      console.log(`   +8  | keyword "${k}" found in DESCRIPTION`)
    }
  }

  // 2. Occasion-specific bonus
  const occasionKeywords = getOccasionKeywords(occasion)
  for (const ok of occasionKeywords) {
    const o = ok.toLowerCase()
    if (name.includes(o)) {
      score += 18
      console.log(`   +18 | occasion match "${o}" in NAME`)
    } else if (desc.includes(o)) {
      score += 14
      console.log(`   +14 | occasion match "${o}" in DESCRIPTION`)
    }
  }

  // 3. Strong penalties for bad matches (critical for workout!)
  const avoidWords = getAvoidKeywordsForOccasion(occasion)
  for (const aw of avoidWords) {
    const a = aw.toLowerCase()
    if (name.includes(a) || desc.includes(a)) {
      score -= 15
      console.log(`   -15 | AVOID word "${a}" found → penalizing`)
    }
  }

  // 4. Basic quality bonuses
  if (product.availability !== false && product.stock_status !== "Out of Stock") {
    score += 5
    console.log(`   +5  | In stock`)
  }

  const priceVal = Number.parseFloat(product.price) || 0
  if (priceVal > 0) {
    score += 5
    console.log(`   +5  | Valid price $${priceVal}`)
  }

  console.log(`[SCORE] FINAL: ${score} points`)
  return Math.max(0, score)
}

function getOccasionKeywords(occasion) {
  const occ = (occasion || "everyday").toLowerCase()
  const map = {
    workout: [
      "workout", "gym", "athletic", "fitness", "sport", "activewear", "yoga",
      "running", "training", "moisture wicking", "breathable", "compression",
      "dri-fit", "sweat-wicking", "performance", "stretch", "quick dry",
      "supportive", "cushion", "cross-training"
    ],
    party: [
      "party", "evening", "cocktail", "formal", "dressy", "sequin", "glitter",
      "sparkle", "elegant", "gala", "velvet", "satin"
    ],
    work: [
      "office", "business", "professional", "blazer", "suit", "tailored",
      "formal", "structured", "corporate"
    ],
    date: [
      "romantic", "elegant", "chic", "flirty", "date", "dressy", "feminine"
    ],
    vacation: [
      "beach", "resort", "vacation", "travel", "lightweight", "summer",
      "tropical", "linen", "flowy"
    ]
  }
  return map[occ] || ["casual", "everyday", "comfortable", "relaxed"]
}

function getAvoidKeywordsForOccasion(occasion) {
  const occ = (occasion || "everyday").toLowerCase()
  if (occ === "workout") {
    return [
      "formal", "evening", "cocktail", "suit", "blazer", "heel", "heels", "dress",
      "leather", "suede", "shearling", "wool", "cashmere", "sequin", "party",
      "office", "business", "tailored", "structured", "corporate", "wedding"
    ]
  }
  return []
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. MAIN PRODUCT SEARCH FUNCTION
// ──────────────────────────────────────────────────────────────────────────────

export async function searchProductsFromDB(keywords, options = {}) {
  const {
    limit = 25,
    categoryType = "general",
    priceRange = null,
    occasion = "everyday"
  } = options

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(` SEARCH: ${categoryType.toUpperCase()} | Occasion: ${occasion}`)
  console.log(` Keywords (${keywords.length}): ${keywords.join(" | ")}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

  const isUnlimited = priceRange?.isUnlimited === true ||
                      priceRange?.max === null ||
                      priceRange?.max >= 99999

  const minPrice = priceRange?.min || 0
  const maxPrice = isUnlimited ? 99999 : (priceRange?.max || 99999)

  console.log(` Budget: $${minPrice} — ${isUnlimited ? '∞' : '$'+maxPrice}`)

  try {
    // Build search conditions for NAME + DESCRIPTION
    const nameConditions = keywords.map(k => `product_name.ilike.%${k}%`)
    const descConditions = keywords.map(k => `description.ilike.%${k}%`)
    const allConditions = [...nameConditions, ...descConditions].join(',')

    let query = supabase
      .from("zara_cloth_scraper")
      .select("*")
      .or(allConditions)
      .gte("price", minPrice)

    if (!isUnlimited) {
      query = query.lte("price", maxPrice)
    }

    console.log(`Executing strict query...`)
    let { data, error } = await query.limit(limit * 5)

    if (error) {
      console.error("Supabase strict query error:", error.message)
      throw error
    }

    let finalData = data || []
    console.log(`Strict found: ${finalData.length} products`)

    // Aggressive expansion if still low
    if (!isUnlimited && finalData.length < 12) {
      console.log(`Expanding search (${finalData.length} is too few)...`)

      const expansionRanges = [
        [minPrice * 0.6, maxPrice * 1.6],
        [minPrice * 0.3, maxPrice * 2.5],
        [0, maxPrice * 4],
        [0, 99999]
      ]

      for (const [expMin, expMax] of expansionRanges) {
        if (finalData.length >= 12) break

        const { data: expData, error: expErr } = await supabase
          .from("zara_cloth_scraper")
          .select("*")
          .or(allConditions)
          .gte("price", Math.max(0, expMin))
          .lte("price", expMax)
          .limit(limit * 5)

        if (expErr) {
          console.error("Expansion error:", expErr.message)
          continue
        }

        if (expData?.length) {
          console.log(`→ +${expData.length} from $${expMin}–$${expMax}`)
          finalData = [...finalData, ...expData]
        }
      }
    }

    // ULTIMATE FALLBACK: broad search if still zero
    if (finalData.length === 0) {
      console.warn("!!! ZERO RESULTS – EMERGENCY BROAD FALLBACK !!!")

      const broadKws = {
        tops: ["top", "shirt", "tank", "tee", "blouse", "jacket", "hoodie"],
        bottoms: ["pant", "jean", "legging", "short", "jogger", "skirt", "trouser"],
        shoes: ["shoe", "sneaker", "trainer", "boot", "flat", "sandals"]
      }[categoryType.toLowerCase()] || ["clothing", "fashion"]

      const broadConditions = broadKws
        .map(k => `product_name.ilike.%${k}%,description.ilike.%${k}%`)
        .join(',')

      const { data: fallbackData } = await supabase
        .from("zara_cloth_scraper")
        .select("*")
        .or(broadConditions)
        .gte("price", minPrice)
        .lte("price", maxPrice)
        .limit(limit * 8)

      if (fallbackData?.length) {
        console.log(`Fallback rescued ${fallbackData.length} items`)
        finalData = fallbackData
      } else {
        console.error("Even broad fallback returned ZERO items!")
      }
    }

    // ─── Scoring ───────────────────────────────────────────────────────────────
    console.log(`Scoring ${finalData.length} candidates...`)

    const scored = finalData.map(p => ({
      ...p,
      relevanceScore: calculateRelevanceScore(p, keywords, categoryType, occasion)
    }))

    scored.sort((a, b) => b.relevanceScore - a.relevanceScore)

    console.log(`Top 5 after scoring:`)
    scored.slice(0, 5).forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.relevanceScore.toFixed(0)} pts | ${p.product_name.substring(0, 55)}...`)
    })

    // ─── Format final output ──────────────────────────────────────────────────
    const finalProducts = scored
      .slice(0, limit * 4)
      .map(p => {
        const allImgs = extractAllImageUrls(p.images || p.image, p.product_name)
        const validImgs = allImgs.filter(img =>
          img && img !== "/placeholder.svg" && img.startsWith("http")
        )

        if (validImgs.length === 0) return null

        const url = p.product_url || p.url || p.link || p.href || "#"

        return {
          id: p.id || p.product_id?.toString() || `prod-${Date.now()}`,
          name: p.product_name || "Unnamed Product",
          price: Number.parseFloat(p.price) || 0,
          priceText: `${p.currency || "$"}${p.price || "0"}`,
          brand: p.brand || "Zara",
          images: validImgs,
          image: validImgs[0],
          url,
          product_url: url,
          color: p.colour || p.color || "N/A",
          category: p.category || p.scraped_category || categoryType,
          description: p.description || "",
          isInStock: p.availability !== false && p.stock_status !== "Out of Stock",
          relevanceScore: p.relevanceScore,
          isWithinBudget: isUnlimited
            ? p.price >= minPrice
            : (p.price >= minPrice && p.price <= maxPrice)
        }
      })
      .filter(Boolean)
      .slice(0, limit)

    console.log(`Final result: ${finalProducts.length} products returned`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

    return finalProducts

  } catch (err) {
    console.error(`[FATAL] Search failed for ${categoryType}:`, err)
    return []
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// BUDGET TIER CALCULATION (your original logic preserved)
// ──────────────────────────────────────────────────────────────────────────────

function calculateCategoryBudgets(totalPriceRange) {
  const isUnlimited = totalPriceRange?.isUnlimited === true ||
                      totalPriceRange?.max === null ||
                      totalPriceRange?.max === 99999

  const totalMin = totalPriceRange?.min || 50
  const totalMax = totalPriceRange?.max || 300

  console.log(`\n=== BUDGET ALLOCATION ===`)
  console.log(`Total: $${totalMin} – ${isUnlimited ? 'UNLIMITED' : '$'+totalMax}`)

  let tier = 'budget'
  if (isUnlimited || totalMin >= 500) tier = 'luxury'
  else if (totalMin >= 300) tier = 'premium'
  else if (totalMin >= 150) tier = 'moderate'

  console.log(`Tier: ${tier.toUpperCase()}`)

  let budgets

  if (tier === 'luxury') {
    budgets = {
      tops: { min: Math.round(totalMin * 0.30), max: null, isUnlimited: true },
      bottoms: { min: Math.round(totalMin * 0.35), max: null, isUnlimited: true },
      shoes: { min: Math.round(totalMin * 0.35), max: null, isUnlimited: true }
    }
  } else if (tier === 'premium') {
    budgets = {
      tops: { min: Math.round(totalMin * 0.30), max: Math.round(totalMax * 0.40), isUnlimited: false },
      bottoms: { min: Math.round(totalMin * 0.35), max: Math.round(totalMax * 0.45), isUnlimited: false },
      shoes: { min: Math.round(totalMin * 0.25), max: Math.round(totalMax * 0.40), isUnlimited: false }
    }
  } else if (tier === 'moderate') {
    budgets = {
      tops: { min: Math.round(totalMin * 0.25), max: Math.round(totalMax * 0.35), isUnlimited: false },
      bottoms: { min: Math.round(totalMin * 0.30), max: Math.round(totalMax * 0.40), isUnlimited: false },
      shoes: { min: Math.round(totalMin * 0.25), max: Math.round(totalMax * 0.35), isUnlimited: false }
    }
  } else {
    budgets = {
      tops: { min: Math.round(totalMin * 0.25), max: Math.round(totalMax * 0.33), isUnlimited: false },
      bottoms: { min: Math.round(totalMin * 0.30), max: Math.round(totalMax * 0.38), isUnlimited: false },
      shoes: { min: Math.round(totalMin * 0.25), max: Math.round(totalMax * 0.33), isUnlimited: false }
    }
  }

  console.log(`Tops:    $${budgets.tops.min} – ${budgets.tops.max || '∞'}`)
  console.log(`Bottoms: $${budgets.bottoms.min} – ${budgets.bottoms.max || '∞'}`)
  console.log(`Shoes:   $${budgets.shoes.min} – ${budgets.shoes.max || '∞'}`)
  console.log(`═══════════════════════════════════════════════\n`)

  return budgets
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN CATEGORY SEARCH ENTRY POINT
// ──────────────────────────────────────────────────────────────────────────────

export async function searchProductsByCategories(profile) {
  console.log("\n╔════════════════════════════════════════════════════════════╗")
  console.log("║           SMART CATEGORY SEARCH – FINAL VERSION            ║")
  console.log("╚════════════════════════════════════════════════════════════╝\n")

  const totalPriceRange = profile.priceRange || null
  const isUnlimited = totalPriceRange?.isUnlimited || totalPriceRange?.max >= 99999

  if (totalPriceRange) {
    console.log(`Total budget: $${totalPriceRange.min} – ${isUnlimited ? '∞' : '$'+totalPriceRange.max}`)
  }

  const categoryBudgets = calculateCategoryBudgets(totalPriceRange)

  const defaultKeywords = {
    tops: ["top", "shirt", "tank", "tee", "blouse", "jacket"],
    bottoms: ["pant", "jean", "legging", "short", "jogger", "skirt"],
    shoes: ["shoe", "sneaker", "trainer", "boot", "flat"]
  }

  const categoryKeywords = {
    tops: profile.searchQueries?.tops?.length > 0 ? profile.searchQueries.tops : defaultKeywords.tops,
    bottoms: profile.searchQueries?.bottoms?.length > 0 ? profile.searchQueries.bottoms : defaultKeywords.bottoms,
    shoes: profile.searchQueries?.shoes?.length > 0 ? profile.searchQueries.shoes : defaultKeywords.shoes
  }

  const occasion = profile.occasionGuidelines?.occasion || "everyday"

  console.log("Occasion:", occasion)
  console.log("Final search keywords:", categoryKeywords)

  try {
    const tops = await searchProductsFromDB(categoryKeywords.tops, {
      limit: 40,
      categoryType: "tops",
      priceRange: categoryBudgets.tops,
      occasion
    })

    const bottoms = await searchProductsFromDB(categoryKeywords.bottoms, {
      limit: 40,
      categoryType: "bottoms",
      priceRange: categoryBudgets.bottoms,
      occasion
    })

    const shoes = await searchProductsFromDB(categoryKeywords.shoes, {
      limit: 40,
      categoryType: "shoes",
      priceRange: categoryBudgets.shoes,
      occasion
    })

    // Final emergency check (should almost never trigger now)
    if (tops.length === 0 && bottoms.length === 0 && shoes.length === 0) {
      console.error("!!! CRITICAL: ALL CATEGORIES ZERO EVEN AFTER FALLBACKS !!!")
      console.error("Check: 1) Database empty? 2) Table name correct? 3) Supabase connected?")
    }

    // Summary (you can keep or expand your own)
    console.log("\nSUMMARY:")
    console.log(`Tops:    ${tops.length}`)
    console.log(`Bottoms: ${bottoms.length}`)
    console.log(`Shoes:   ${shoes.length}\n`)

    return { tops, bottoms, shoes }

  } catch (err) {
    console.error("Category search failed completely:", err)
    return { tops: [], bottoms: [], shoes: [] }
  }
}
