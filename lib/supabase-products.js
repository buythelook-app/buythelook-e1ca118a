// TRULY FIXED PRODUCT SEARCH - Occasion-specific filtering
// This version heavily prioritizes occasion matching over generic keywords

import { supabase } from "./supabase"

// ──────────────────────────────────────────────────────────────────────────────
// 1. STRICT CATEGORY + OCCASION VALIDATION
// ──────────────────────────────────────────────────────────────────────────────

function isValidProductForCategory(product, requestedCategory) {
  const name = (product.product_name || "").toLowerCase()
  const desc = (product.description || "").toLowerCase()
  const combined = `${name} ${desc}`
  
  if (requestedCategory === "tops") {
    const rejectKeywords = [
      "perfume", "fragrance", "eau de", "cologne", "scent",
      "shoe", "sneaker", "boot", "sandal", "trainer", "runner",
      "pant", "jean", "trouser", "legging", "short", "skirt", "jogger",
      "bag", "purse", "wallet", "belt", "watch", "jewelry",
      "hat", "cap", "beanie", "scarf", "glove"
    ]
    if (rejectKeywords.some(k => combined.includes(k))) return false
    
    const acceptKeywords = [
      "shirt", "blouse", "top", "tank", "tee", "t-shirt",
      "sweater", "cardigan", "hoodie", "sweatshirt", 
      "jacket", "blazer", "coat", "vest", "tunic", "polo"
    ]
    return acceptKeywords.some(k => combined.includes(k))
  }
  
  if (requestedCategory === "bottoms") {
    const rejectKeywords = [
      "perfume", "fragrance", "eau de", "cologne", "scent",
      "shoe", "sneaker", "boot", "sandal", "trainer", "runner",
      "shirt", "blouse", "top", "tank", "tee", "sweater", "jacket", "coat",
      "bag", "purse", "wallet", "belt", "watch", "jewelry",
      "hat", "cap", "beanie", "scarf", "glove"
    ]
    if (rejectKeywords.some(k => combined.includes(k))) return false
    
    const acceptKeywords = [
      "pant", "jean", "trouser", "legging", "short",
      "skirt", "jogger", "culotte", "cargo", "chino", "slack"
    ]
    return acceptKeywords.some(k => combined.includes(k))
  }
  
  if (requestedCategory === "shoes") {
    const rejectKeywords = [
      "perfume", "fragrance", "eau de", "cologne", "scent",
      "shirt", "blouse", "top", "tank", "tee", "sweater", "jacket",
      "pant", "jean", "trouser", "legging", "short", "skirt",
      "bag", "purse", "wallet", "belt", "watch", "jewelry",
      "hat", "cap", "beanie", "scarf", "glove"
    ]
    if (rejectKeywords.some(k => combined.includes(k))) return false
    
    const acceptKeywords = [
      "shoe", "sneaker", "boot", "sandal", "trainer",
      "runner", "loafer", "heel", "flat", "pump", "slipper"
    ]
    return acceptKeywords.some(k => combined.includes(k))
  }
  
  return false
}

// NEW: Check if product matches occasion
function isValidProductForOccasion(product, occasion) {
  const name = (product.product_name || "").toLowerCase()
  const desc = (product.description || "").toLowerCase()
  const combined = `${name} ${desc}`
  
  const occ = (occasion || "everyday").toLowerCase()
  
  if (occ === "workout") {
    // HARD REJECT obvious non-workout items
    const hardReject = [
      "beaded", "sequin", "rhinestone", "crystal embellished",
      "tuxedo", "formal dress", "gala", "cocktail dress",
      "evening gown", "party dress", "prom", "wedding dress",
      "faux fur coat", "fur jacket", "velvet gown", "satin dress",
      "strapless dress", "off shoulder gown", "ballgown",
      "pencil skirt formal", "blazer suit", "dress shirt formal"
    ]
    
    // Only reject if item clearly matches formal/party
    const rejectCount = hardReject.filter(k => combined.includes(k)).length
    if (rejectCount >= 2) { // Need 2+ matches to reject
      return false
    }
    
    // ACCEPT if has ANY workout indicators OR basic athletic-friendly features
    const workoutAccept = [
      "athletic", "sport", "gym", "fitness", "training", "workout",
      "activewear", "performance", "running", "yoga", "jogging",
      "moisture", "breathable", "stretch", "compression", "dri-fit",
      "sneaker", "trainer", "running shoe", "athletic shoe",
      "legging", "jogger", "sweatshirt", "hoodie", "tank top",
      "sports bra", "bike short", "track pant"
    ]
    
    // Also accept items that DON'T have reject words (neutral items)
    const hasWorkoutKeyword = workoutAccept.some(k => combined.includes(k))
    const hasRejectKeyword = rejectCount > 0
    
    // Accept if: has workout keyword OR (no reject keywords)
    return hasWorkoutKeyword || !hasRejectKeyword
  }
  
  if (occ === "party" || occ === "formal") {
    // Reject casual/athletic
    const rejectCasual = ["sweatpant", "jogger athletic", "gym shorts", "yoga pant"]
    if (rejectCasual.some(k => combined.includes(k))) return false
  }
  
  // For other occasions, allow everything that passes category check
  return true
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. MASSIVELY IMPROVED SCORING - Occasion is KING
// ──────────────────────────────────────────────────────────────────────────────

function calculateAdvancedRelevanceScore(product, keywords, categoryType, occasion, priceRange) {
  let score = 0
  
  const name = (product.product_name || "").toLowerCase()
  const desc = (product.description || "").toLowerCase()
  const color = (product.colour || product.color || "").toLowerCase()
  
  // === OCCASION MATCHING (80 points max) - HIGH PRIORITY ===
  const occasionKeywords = getOccasionKeywords(occasion)
  let occasionScore = 0
  
  occasionKeywords.forEach(ok => {
    const okLower = ok.toLowerCase()
    if (name.includes(okLower)) occasionScore += 15
    if (desc.includes(okLower)) occasionScore += 10
  })
  
  score += Math.min(occasionScore, 80)
  
  // === PENALTY FOR CLEARLY WRONG OCCASION (-100 points max) ===
  const avoidWords = getAvoidKeywordsForOccasion(occasion)
  let penaltyScore = 0
  
  avoidWords.forEach(aw => {
    const awLower = aw.toLowerCase()
    if (name.includes(awLower)) penaltyScore += 30
    if (desc.includes(awLower)) penaltyScore += 20
  })
  
  score -= Math.min(penaltyScore, 100)
  
  // === KEYWORD MATCHING (40 points max) - SECONDARY ===
  keywords.forEach(keyword => {
    const k = keyword.toLowerCase()
    const words = k.split(" ")
    
    if (name.includes(k)) {
      score += 10
    } else {
      words.forEach(word => {
        if (word.length > 2 && name.includes(word)) score += 3
      })
    }
    
    if (desc.includes(k)) {
      score += 7
    } else {
      words.forEach(word => {
        if (word.length > 2 && desc.includes(word)) score += 2
      })
    }
  })
  
  // === QUALITY INDICATORS (20 points max) ===
  if (product.availability !== false && product.stock_status !== "Out of Stock") {
    score += 10
  }
  
  const priceVal = parseFloat(product.price) || 0
  if (priceVal > 0) score += 5
  
  if (desc.length > 50) score += 5
  
  // === PRICE OPTIMIZATION (30 points max) ===
  const isUnlimited = priceRange?.isUnlimited === true || 
                      priceRange?.max === null || 
                      priceRange?.max >= 99999
  
  const minPrice = priceRange?.min || 0
  const maxPrice = isUnlimited ? 99999 : (priceRange?.max || 99999)
  
  if (priceVal >= minPrice && priceVal <= maxPrice) {
    score += 30
    
    const midPoint = (minPrice + maxPrice) / 2
    const distance = Math.abs(priceVal - midPoint)
    const range = maxPrice - minPrice
    const proximityScore = Math.max(0, 10 - (distance / range) * 10)
    score += proximityScore
  } else if (priceVal < minPrice) {
    score += 10
  } else {
    score -= 15
  }
  
  // === COLOR MATCHING (10 points max) ===
  if (color && keywords.some(k => k.toLowerCase().includes(color))) {
    score += 10
  }
  
  return Math.max(0, score)
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. EXPANDED OCCASION KEYWORDS
// ──────────────────────────────────────────────────────────────────────────────

function getOccasionKeywords(occasion) {
  const occ = (occasion || "everyday").toLowerCase()
  
  const occasionMap = {
    workout: [
      // Core workout terms
      "athletic", "sport", "gym", "fitness", "training", "workout",
      "activewear", "sportswear", "athleisure", "performance",
      
      // Technical features
      "moisture wicking", "sweat wicking", "breathable", "quick dry",
      "dri-fit", "compression", "stretch", "flexible", "mesh panel",
      "ventilated", "cooling", "anti-odor", "reflective",
      
      // Activities
      "running", "yoga", "crossfit", "tennis", "basketball",
      "cycling", "jogging", "exercise", "pilates", "barre",
      
      // Styles
      "fitted athletic", "slim fit sport", "ergonomic", "supportive",
      "high waist athletic", "racerback", "sports bra", "legging",
      "jogger athletic", "track pant", "warm up"
    ],
    
    party: [
      "party", "evening", "cocktail", "formal", "gala", "celebration",
      "sequin", "sparkle", "glitter", "shimmer", "metallic",
      "satin", "velvet", "silk", "chiffon", "lace",
      "elegant", "glamorous", "dressy", "luxe", "festive"
    ],
    
    work: [
      "office", "business", "professional", "corporate", "work",
      "blazer", "suit", "tailored", "structured", "formal",
      "smart", "polished", "classic", "executive", "career"
    ],
    
    date: [
      "date", "romantic", "elegant", "chic", "sophisticated",
      "feminine", "flirty", "dressy", "stylish", "trendy"
    ],
    
    vacation: [
      "vacation", "resort", "beach", "summer", "tropical",
      "travel", "holiday", "linen", "lightweight", "breezy",
      "flowy", "casual", "relaxed", "comfortable"
    ],
    
    everyday: [
      "casual", "everyday", "comfortable", "relaxed", "versatile",
      "basic", "essential", "classic", "simple", "easy"
    ]
  }
  
  return occasionMap[occ] || occasionMap.everyday
}

function getAvoidKeywordsForOccasion(occasion) {
  const occ = (occasion || "everyday").toLowerCase()
  
  const avoidMap = {
    workout: [
      // Formal/dressy
      "formal", "evening wear", "cocktail dress", "party dress", "gala",
      "tuxedo", "suit jacket", "blazer formal", "dress shirt",
      
      // Decorative/fancy
      "beaded", "sequin", "sparkle", "glitter", "rhinestone",
      "faux fur", "velvet", "satin dress", "silk gown", "lace dress",
      "mesh beaded", "embroidered formal",
      
      // Wrong cuts
      "strapless", "off shoulder dress", "halter formal", "ballgown",
      "pencil skirt", "midi dress formal", "maxi gown",
      
      // Wrong shoes
      "heel", "pump", "stiletto", "dress shoe formal", "oxford dress",
      
      // Wrong materials
      "leather jacket formal", "suede coat", "cashmere sweater dress",
      "wool suit", "denim jacket formal"
    ],
    
    work: [
      "athletic", "gym", "workout", "sport sweat",
      "distressed", "ripped", "torn", "crop top casual"
    ],
    
    party: [
      "athletic", "gym", "workout", "sport", "sweatpant",
      "basic tee", "plain tank"
    ]
  }
  
  return avoidMap[occ] || []
}

// ──────────────────────────────────────────────────────────────────────────────
// 4. IMAGE EXTRACTION
// ──────────────────────────────────────────────────────────────────────────────

function extractAllImageUrls(images, productName = "unknown") {
  if (!images) return ["/placeholder.svg"]
  
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
    
    return imageArray.length > 0 ? imageArray : ["/placeholder.svg"]
  } catch {
    return ["/placeholder.svg"]
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// 5. MAIN SEARCH WITH DUAL FILTERING
// ──────────────────────────────────────────────────────────────────────────────

export async function searchProductsFromDB(keywords, options = {}) {
  const {
    limit = 40,
    categoryType = "general",
    priceRange = null,
    occasion = "everyday"
  } = options
  
  console.log(`SEARCH START: ${categoryType.toUpperCase()} | Occasion: ${occasion} | Keywords: ${keywords.join(", ")}`)
  
  const isUnlimited = priceRange?.isUnlimited === true ||
                      priceRange?.max === null ||
                      priceRange?.max >= 99999
  
  const minPrice = priceRange?.min || 0
  const maxPrice = isUnlimited ? 99999 : (priceRange?.max || 99999)
  
  try {
    // ===== PHASE 1: Build search conditions =====
    const nameConditions = keywords.map(k => `product_name.ilike.%${k}%`)
    const descConditions = keywords.map(k => `description.ilike.%${k}%`)
    
    const occasionKeywords = getOccasionKeywords(occasion)
    const occasionConditions = occasionKeywords.slice(0, 20).map(ok => 
      `product_name.ilike.%${ok}%,description.ilike.%${ok}%`
    )
    
    const categoryTerms = {
      tops: ["shirt", "top", "blouse", "jacket", "sweater", "tank", "tee"],
      bottoms: ["pant", "jean", "legging", "short", "skirt", "trouser"],
      shoes: ["shoe", "sneaker", "boot", "trainer", "sandal"]
    }[categoryType] || []
    
    const categoryConditions = categoryTerms.map(ct =>
      `product_name.ilike.%${ct}%,description.ilike.%${ct}%`
    )
    
    const allConditions = [
      ...nameConditions,
      ...descConditions,
      ...occasionConditions,
      ...categoryConditions
    ].join(',')
    
    // ===== PHASE 2: Execute search =====
    let query = supabase
      .from("zara_cloth")
      .select("*")
      .or(allConditions)
      .gte("price", minPrice * 0.8)
    
    if (!isUnlimited) {
      query = query.lte("price", maxPrice * 1.2)
    }
    
    let { data, error } = await query.limit(300)
    
    if (error) throw error
    
    let allResults = data || []
    
    console.log(`  Raw results before filtering: ${allResults.length} products`)
    
    // ===== PHASE 3: DUAL FILTERING - Category AND Occasion =====
    const categoryFiltered = allResults.filter(p => 
      isValidProductForCategory(p, categoryType)
    )
    
    console.log(`  After category filter: ${categoryFiltered.length} products`)
    
    const occasionFiltered = categoryFiltered.filter(p =>
      isValidProductForOccasion(p, occasion)
    )
    
    console.log(`  After occasion filter: ${occasionFiltered.length} products (removed ${categoryFiltered.length - occasionFiltered.length} wrong occasion items)`)
    
    // ===== PHASE 4: If still not enough, targeted search =====
    if (occasionFiltered.length < 30) {
      console.log(`  Need more ${categoryType} for ${occasion}, doing targeted search...`)
      
      const targetedTerms = [
        ...categoryTerms.map(ct => `product_name.ilike.%${ct}%`),
        ...occasionKeywords.slice(0, 10).map(ok => `description.ilike.%${ok}%`)
      ].join(',')
      
      const { data: targetedData } = await supabase
        .from("zara_cloth")
        .select("*")
        .or(targetedTerms)
        .gte("price", 0)
        .lte("price", 99999)
        .limit(300)
      
      if (targetedData?.length) {
        const targetedFiltered = targetedData
          .filter(p => isValidProductForCategory(p, categoryType))
          .filter(p => isValidProductForOccasion(p, occasion))
        
        const existingIds = new Set(occasionFiltered.map(p => p.id))
        const newProducts = targetedFiltered.filter(p => !existingIds.has(p.id))
        
        occasionFiltered.push(...newProducts)
        console.log(`  After targeted search: ${occasionFiltered.length} products`)
      }
    }
    
    // ===== PHASE 5: Scoring =====
    const scored = occasionFiltered.map(p => ({
      ...p,
      relevanceScore: calculateAdvancedRelevanceScore(
        p, 
        keywords, 
        categoryType, 
        occasion, 
        priceRange
      )
    }))
    
    scored.sort((a, b) => b.relevanceScore - a.relevanceScore)
    
    if (scored.length > 0) {
      const topScore = scored[0].relevanceScore
      const avgScore = scored.reduce((sum, p) => sum + p.relevanceScore, 0) / scored.length
      const bottomScore = scored[scored.length - 1].relevanceScore
      console.log(`  Score range: ${topScore.toFixed(1)} (top) to ${bottomScore.toFixed(1)} (bottom), avg: ${avgScore.toFixed(1)}`)
    }
    
    // ===== PHASE 6: Format output =====
    const finalProducts = scored
      .slice(0, limit * 2)
      .map(p => {
        const allImgs = extractAllImageUrls(p.images || p.image, p.product_name)
        const validImgs = allImgs.filter(img =>
          img && img !== "/placeholder.svg" && img.startsWith("http")
        )
        
        if (validImgs.length === 0) return null
        
        const url = p.product_url || p.url || p.link || p.href || "#"
        const productPrice = parseFloat(p.price) || 0
        
        return {
          id: p.id || p.product_id?.toString() || `prod-${Date.now()}-${Math.random()}`,
          name: p.product_name || "Unnamed Product",
          price: productPrice,
          priceText: `${p.currency || "USD"}${productPrice}`,
          brand: p.brand || "Zara",
          images: validImgs,
          image: validImgs[0],
          url,
          product_url: url,
          color: p.colour || p.color || "N/A",
          category: categoryType,
          description: p.description || "",
          isInStock: p.availability !== false && p.stock_status !== "Out of Stock",
          relevanceScore: p.relevanceScore,
          isWithinBudget: isUnlimited
            ? productPrice >= minPrice
            : (productPrice >= minPrice && productPrice <= maxPrice)
        }
      })
      .filter(Boolean)
      .slice(0, limit)
    
    console.log(`SEARCH RESULT: ${finalProducts.length} products returned for ${categoryType}`)
    if (finalProducts.length > 0) {
      console.log(`  Top 3: ${finalProducts.slice(0, 3).map(p => `${p.name.substring(0, 40)}... (${p.relevanceScore.toFixed(1)})`).join(" | ")}`)
    }
    console.log()
    
    return finalProducts
    
  } catch (err) {
    console.error(`Search failed for ${categoryType}:`, err)
    return []
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// 6. CATEGORY BUDGETS
// ──────────────────────────────────────────────────────────────────────────────

function calculateCategoryBudgets(totalPriceRange) {
  const isUnlimited = totalPriceRange?.isUnlimited === true ||
                      totalPriceRange?.max === null ||
                      totalPriceRange?.max >= 99999
  
  const totalMin = totalPriceRange?.min || 50
  const totalMax = totalPriceRange?.max || 300
  
  let tier = 'budget'
  if (isUnlimited || totalMin >= 500) tier = 'luxury'
  else if (totalMin >= 300) tier = 'premium'
  else if (totalMin >= 150) tier = 'moderate'
  
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
  
  return budgets
}

// ──────────────────────────────────────────────────────────────────────────────
// 7. MAIN ENTRY POINT
// ──────────────────────────────────────────────────────────────────────────────

export async function searchProductsByCategories(profile) {
  const totalPriceRange = profile.priceRange || null
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
  
  console.log("\n=== STARTING CATEGORY SEARCH ===")
  console.log("Budget tier:", totalPriceRange?.min >= 500 ? "LUXURY" : totalPriceRange?.min >= 300 ? "PREMIUM" : totalPriceRange?.min >= 150 ? "MODERATE" : "BUDGET")
  console.log("Occasion:", occasion)
  console.log("================================\n")
  
  try {
    const [tops, bottoms, shoes] = await Promise.all([
      searchProductsFromDB(categoryKeywords.tops, {
        limit: 40,
        categoryType: "tops",
        priceRange: categoryBudgets.tops,
        occasion
      }),
      searchProductsFromDB(categoryKeywords.bottoms, {
        limit: 40,
        categoryType: "bottoms",
        priceRange: categoryBudgets.bottoms,
        occasion
      }),
      searchProductsFromDB(categoryKeywords.shoes, {
        limit: 40,
        categoryType: "shoes",
        priceRange: categoryBudgets.shoes,
        occasion
      })
    ])
    
    console.log("\n=== SEARCH COMPLETE ===")
    console.log(`Tops: ${tops.length} products`)
    console.log(`Bottoms: ${bottoms.length} products`)
    console.log(`Shoes: ${shoes.length} products`)
    console.log("=======================\n")
    
    return { tops, bottoms, shoes }
    
  } catch (err) {
    console.error("Category search failed:", err)
    return { tops: [], bottoms: [], shoes: [] }
  }
}
