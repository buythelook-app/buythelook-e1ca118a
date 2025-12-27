import { supabase } from "./supabase"

// Helper to extract first image URL from images field
function extractImageUrl(images, productName = "unknown") {
  console.log(` Supabase Products: Extracting image for: "${productName.substring(0, 40)}"`)
  console.log(` Supabase Products: Raw images value type: ${typeof images}`)
  console.log(` Supabase Products: Raw images value: ${JSON.stringify(images)?.substring(0, 200)}...`)

  if (!images) {
    console.log(` Supabase Products: ❌ No images field, using placeholder`)
    return "/placeholder.svg"
  }

  try {
    if (typeof images === "string") {
      console.log(` Supabase Products: Images is a string, attempting JSON parse...`)
      if (images.trim().startsWith("[")) {
        const parsed = JSON.parse(images)
        console.log(` Supabase Products: Parsed array length: ${parsed.length}`)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const firstItem = parsed[0]
          console.log(` Supabase Products: First array item:`, JSON.stringify(firstItem))
          const imageUrl = firstItem.url || firstItem.imageUrl || firstItem
          console.log(` Supabase Products: ✅ Extracted URL: ${imageUrl}`)
          return imageUrl
        }
      }
      console.log(` Supabase Products: ✅ Using string as direct URL: ${images}`)
      return images
    }

    if (Array.isArray(images) && images.length > 0) {
      console.log(` Supabase Products: Images is already an array, length: ${images.length}`)
      const firstItem = images[0]
      const imageUrl = firstItem.url || firstItem.imageUrl || firstItem
      console.log(` Supabase Products: ✅ Extracted URL from array: ${imageUrl}`)
      return imageUrl
    }

    console.log(` Supabase Products: ❌ Could not extract image, using placeholder`)
    return "/placeholder.svg"
  } catch (e) {
    console.error(" Supabase Products: ❌ Error extracting image URL:", e.message)
    console.log(` Supabase Products: Fallback to string or placeholder`)
    return typeof images === "string" ? images : "/placeholder.svg"
  }
}

// Helper to extract ALL image URLs from images field
function extractAllImageUrls(images, productName = "unknown") {
  console.log(` Supabase Products: Extracting ALL images for: "${productName.substring(0, 40)}"`)

  if (!images) {
    console.log(` Supabase Products: ❌ No images field`)
    return ["/placeholder.svg"]
  }

  try {
    let imageArray = []

    if (typeof images === "string") {
      if (images.trim().startsWith("[")) {
        const parsed = JSON.parse(images)
        if (Array.isArray(parsed)) {
          imageArray = parsed.map((item) => item.url || item.imageUrl || item).filter(Boolean)
        }
      } else {
        imageArray = [images]
      }
    } else if (Array.isArray(images)) {
      imageArray = images.map((item) => item.url || item.imageUrl || item).filter(Boolean)
    }

    console.log(` Supabase Products: ✅ Extracted ${imageArray.length} images`)
    return imageArray.length > 0 ? imageArray : ["/placeholder.svg"]
  } catch (e) {
    console.error(" Supabase Products: ❌ Error extracting images:", e.message)
    return ["/placeholder.svg"]
  }
}

function calculateRelevanceScore(product, keywords, categoryType) {
  let score = 0
  const productName = product.product_name?.toLowerCase() || ""

  for (const keyword of keywords) {
    if (productName.includes(keyword.toLowerCase())) {
      score += 10
    }
  }

  if (product.availability !== false && product.stock_status !== "Out of Stock") {
    score += 5
  }

  const price = Number.parseFloat(product.price) || 0
  if (price > 0) score += 5

  console.log(` Supabase Products:   "${productName.substring(0, 50)}..." = ${score} points`)
  return score
}

// Search products from your Supabase database
export async function searchProductsFromDB(keywords, options = {}) {
  const { limit = 25, categoryType = "general", priceRange = null } = options

  console.log(` ========================================`)
  console.log(` BUDGET FILTER DEBUG - ${categoryType.toUpperCase()}`)
  console.log(` ========================================`)
  console.log(` Keywords: [${keywords.join(", ")}]`)

  const isUnlimited = priceRange?.isUnlimited === true || priceRange?.max === null || priceRange?.max === 99999
  const budgetMin = priceRange?.min || 0
  const budgetMax = priceRange?.max || 99999

  console.log(` Budget Type: ${isUnlimited ? "LUXURY (UNLIMITED)" : "FIXED RANGE"}`)
  console.log(` Budget Min: $${budgetMin}`)
  console.log(` Budget Max: ${isUnlimited ? "NO LIMIT" : "$" + budgetMax}`)

  try {
    const conditions = keywords.map((k) => `product_name.ilike.%${k}%`).join(",")

    let query = supabase.from("zara_cloth_test").select("*").or(conditions).gte("price", budgetMin)

    if (!isUnlimited) {
      query = query.lte("price", budgetMax)
      console.log(` STRICT QUERY: $${budgetMin} <= price <= $${budgetMax}`)
    } else {
      console.log(` LUXURY QUERY: price >= $${budgetMin} (NO UPPER LIMIT)`)
    }

    const { data, error } = await query.limit(limit * 3)

    if (error) {
      console.error(" Search error:", error.message)
      throw error
    }

    console.log(` STRICT SEARCH RESULTS: ${data?.length || 0} products found`)

    if (isUnlimited) {
      console.log(` LUXURY MODE: Using all ${data?.length || 0} products (no expansion needed)`)
    }

    let finalData = data || []

    if (!isUnlimited && finalData.length < 5) {
      console.log(` ⚠️ Only ${finalData.length} products in strict budget - EXPANDING...`)

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

        console.log(` EXPANSION ${exp.label}: $${expandedMin.toFixed(0)} - $${expandedMax.toFixed(0)}`)

        const { data: expandedData } = await supabase
          .from("zara_cloth_test")
          .select("*")
          .or(conditions)
          .gte("price", expandedMin)
          .lte("price", expandedMax)
          .limit(limit * 3)

        if (expandedData && expandedData.length > finalData.length) {
          console.log(` ✅ Expansion found ${expandedData.length} products`)
          finalData = expandedData
        }
      }
    }

    if (finalData.length === 0) {
      console.warn(" ❌ No products found even after expansion!")
      return []
    }

    console.log(` SCORING ${finalData.length} products...`)

    const scored = finalData.map((p) => {
      let score = 0
      const price = Number.parseFloat(p.price) || 0
      const productName = p.product_name?.toLowerCase() || ""

      for (const keyword of keywords) {
        if (productName.includes(keyword.toLowerCase())) {
          score += 10
        }
      }

      // 🔥 NEW: PREFER HIGHER PRICES for better quality perception
      if (isUnlimited) {
        if (price >= budgetMin) {
          score += 50
          score += Math.min(30, price / 50) // Extra bonus for luxury
          console.log(
            `   ✓ "${productName.substring(0, 30)}..." $${price} = LUXURY OK (+${50 + Math.min(30, price / 50)} pts)`,
          )
        }
      } else {
        if (price >= budgetMin && price <= budgetMax) {
          const budgetRange = budgetMax - budgetMin
          const pricePosition = (price - budgetMin) / budgetRange // 0 to 1
          
          // 🔥 BONUS for items in UPPER part of range
          let positionBonus = 0
          if (pricePosition >= 0.7) {
            positionBonus = 30 // Top 30% of range = BEST
          } else if (pricePosition >= 0.5) {
            positionBonus = 20 // Upper-middle
          } else if (pricePosition >= 0.3) {
            positionBonus = 10 // Middle
          }
          
          score += 100 + positionBonus
          console.log(`   ✓ "${productName.substring(0, 30)}..." $${price} = IN BUDGET (+${100 + positionBonus} pts, ${(pricePosition * 100).toFixed(0)}% of range)`)
        } else if (price < budgetMin) {
          const distance = budgetMin - price
          const penalty = Math.min(50, distance / 2)
          score += 50 - penalty
          console.log(
            `   ~ "${productName.substring(0, 30)}..." $${price} = BELOW BUDGET (+${(50 - penalty).toFixed(0)} pts)`,
          )
        } else {
          const distance = price - budgetMax
          const penalty = Math.min(40, distance / 3)
          score += 20 - penalty
          console.log(
            `   ✗ "${productName.substring(0, 30)}..." $${price} = OVER BUDGET (+${Math.max(0, 20 - penalty).toFixed(0)} pts)`,
          )
        }
      }

      return { ...p, relevanceScore: Math.max(0, score) }
    })

    scored.sort((a, b) => b.relevanceScore - a.relevanceScore)

    console.log(` TOP 5 SCORED PRODUCTS:`)
    scored.slice(0, 5).forEach((p, i) => {
      console.log(`   ${i + 1}. "${p.product_name.substring(0, 40)}..." - $${p.price} - ${p.relevanceScore} pts`)
    })

    const withinBudget = scored.filter((p) => {
      const price = Number.parseFloat(p.price) || 0
      return isUnlimited ? price >= budgetMin : price >= budgetMin && price <= budgetMax
    }).length

    console.log(` WITHIN BUDGET: ${withinBudget}/${scored.length} products`)
    console.log(` ========================================`)

    const products = scored
      .slice(0, limit * 2)
      .map((p) => {
        const allImages = extractAllImageUrls(p.images || p.image, p.product_name)
        const validImages = allImages.filter((img) => img && img !== "/placeholder.svg" && img.startsWith("http"))

        if (validImages.length === 0) return null

        const productUrl = p.product_url || p.url || p.link || p.href
        if (!productUrl) {
          console.warn(` ⚠️ NO URL FOUND for: "${p.product_name.substring(0, 50)}" (ID: ${p.product_id})`)
        } else {
          console.log(` ✅ URL found for: "${p.product_name.substring(0, 50)}" -> ${productUrl.substring(0, 60)}...`)
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
    console.error(" Fatal error:", error)
    return []
  }
}

// 🔥 COMPLETELY NEW: SMART TIER-BASED BUDGET ALLOCATION
function calculateCategoryBudgets(totalPriceRange) {
  const isUnlimited = totalPriceRange?.isUnlimited === true || totalPriceRange?.max === null || totalPriceRange?.max === 99999
  const totalMin = totalPriceRange?.min || 50
  const totalMax = totalPriceRange?.max || 300

  console.log(``)
  console.log(` ╔════════════════════════════════════════════════════════╗`)
  console.log(` ║        SMART TIER-BASED BUDGET ALLOCATION             ║`)
  console.log(` ╚════════════════════════════════════════════════════════╝`)
  console.log(` Total Outfit Budget: $${totalMin} - ${isUnlimited ? 'UNLIMITED' : '$' + totalMax}`)
  console.log(``)

  // 🔥 DETECT BUDGET TIER
  let tier = 'budget'
  if (isUnlimited || totalMin >= 500) {
    tier = 'luxury'
  } else if (totalMin >= 300) {
    tier = 'premium'
  } else if (totalMin >= 150) {
    tier = 'moderate'
  }

  console.log(` 🎯 TIER DETECTED: ${tier.toUpperCase()}`)
  console.log(``)

  let categoryBudgets

  if (tier === 'luxury') {
    // LUXURY: $500+ or unlimited
    categoryBudgets = {
      tops: {
        min: Math.round(totalMin * 0.30),
        max: null,
        isUnlimited: true,
        percentage: '30%+',
        targetRange: 'premium quality priority'
      },
      bottoms: {
        min: Math.round(totalMin * 0.35),
        max: null,
        isUnlimited: true,
        percentage: '35%+',
        targetRange: 'premium quality priority'
      },
      shoes: {
        min: Math.round(totalMin * 0.35),
        max: null,
        isUnlimited: true,
        percentage: '35%+',
        targetRange: 'premium quality priority'
      }
    }
  } else if (tier === 'premium') {
    // 🔥 PREMIUM: $300-$500 - MORE GENEROUS ALLOCATION
    categoryBudgets = {
      tops: {
        min: Math.round(totalMin * 0.30), // Higher starting point
        max: Math.round(totalMax * 0.40), // Can go up to 40%!
        isUnlimited: false,
        percentage: '30-40%',
        targetRange: 'aim 75-85% of max'
      },
      bottoms: {
        min: Math.round(totalMin * 0.35),
        max: Math.round(totalMax * 0.45), // Bottoms get most
        isUnlimited: false,
        percentage: '35-45%',
        targetRange: 'aim 75-85% of max'
      },
      shoes: {
        min: Math.round(totalMin * 0.25),
        max: Math.round(totalMax * 0.40),
        isUnlimited: false,
        percentage: '25-40%',
        targetRange: 'aim 75-85% of max'
      }
    }
  } else if (tier === 'moderate') {
    // MODERATE: $150-$300 - BALANCED
    categoryBudgets = {
      tops: {
        min: Math.round(totalMin * 0.25),
        max: Math.round(totalMax * 0.35),
        isUnlimited: false,
        percentage: '25-35%',
        targetRange: 'aim 65-75% of max'
      },
      bottoms: {
        min: Math.round(totalMin * 0.30),
        max: Math.round(totalMax * 0.40),
        isUnlimited: false,
        percentage: '30-40%',
        targetRange: 'aim 65-75% of max'
      },
      shoes: {
        min: Math.round(totalMin * 0.25),
        max: Math.round(totalMax * 0.35),
        isUnlimited: false,
        percentage: '25-35%',
        targetRange: 'aim 65-75% of max'
      }
    }
  } else {
    // BUDGET: $50-$150 - CONSERVATIVE
    categoryBudgets = {
      tops: {
        min: Math.round(totalMin * 0.25),
        max: Math.round(totalMax * 0.33),
        isUnlimited: false,
        percentage: '25-33%',
        targetRange: 'aim 55-65% of max'
      },
      bottoms: {
        min: Math.round(totalMin * 0.30),
        max: Math.round(totalMax * 0.38),
        isUnlimited: false,
        percentage: '30-38%',
        targetRange: 'aim 55-65% of max'
      },
      shoes: {
        min: Math.round(totalMin * 0.25),
        max: Math.round(totalMax * 0.33),
        isUnlimited: false,
        percentage: '25-33%',
        targetRange: 'aim 55-65% of max'
      }
    }
  }

  console.log(` 👕 TOPS:    $${categoryBudgets.tops.min} - ${categoryBudgets.tops.max || '∞'} (${categoryBudgets.tops.percentage})`)
  console.log(`    Strategy: ${categoryBudgets.tops.targetRange}`)
  console.log(``)
  console.log(` 👖 BOTTOMS: $${categoryBudgets.bottoms.min} - ${categoryBudgets.bottoms.max || '∞'} (${categoryBudgets.bottoms.percentage})`)
  console.log(`    Strategy: ${categoryBudgets.bottoms.targetRange}`)
  console.log(``)
  console.log(` 👞 SHOES:   $${categoryBudgets.shoes.min} - ${categoryBudgets.shoes.max || '∞'} (${categoryBudgets.shoes.percentage})`)
  console.log(`    Strategy: ${categoryBudgets.shoes.targetRange}`)
  console.log(``)

  if (!isUnlimited) {
    const minTotal = categoryBudgets.tops.min + categoryBudgets.bottoms.min + categoryBudgets.shoes.min
    const maxTotal = categoryBudgets.tops.max + categoryBudgets.bottoms.max + categoryBudgets.shoes.max
    const targetPercent = tier === 'premium' ? 0.80 : tier === 'moderate' ? 0.70 : 0.60
    const targetTotal = Math.round(minTotal + (maxTotal - minTotal) * targetPercent)
    
    console.log(` 💰 OUTFIT TOTALS:`)
    console.log(`    Min possible:  $${minTotal}`)
    console.log(`    Target range:  $${targetTotal} (${(targetPercent * 100).toFixed(0)}% of max)`)
    console.log(`    Max possible:  $${maxTotal}`)
    console.log(`    Original goal: $${totalMin} - $${totalMax}`)
    console.log(``)
  }

  console.log(` ════════════════════════════════════════════════════════`)
  console.log(``)

  return categoryBudgets
}

// Search by category type with SMART TIER-BASED SPLIT
export async function searchProductsByCategories(profile) {
  console.log("")
  console.log(" ╔════════════════════════════════════════════════════════╗")
  console.log(" ║     SMART CATEGORY SEARCH (TIER-OPTIMIZED)            ║")
  console.log(" ╚════════════════════════════════════════════════════════╝")
  console.log("")

  const totalPriceRange = profile.priceRange || null
  const isUnlimited = totalPriceRange?.isUnlimited === true || totalPriceRange?.max === null || totalPriceRange?.max === 99999

  if (totalPriceRange) {
    console.log(` TOTAL OUTFIT BUDGET: $${totalPriceRange.min} - ${isUnlimited ? "UNLIMITED" : "$" + totalPriceRange.max}`)
  }

  // 🔥 SMART TIER-BASED BUDGET CALCULATION
  const categoryBudgets = calculateCategoryBudgets(totalPriceRange)

  const categoryKeywords = {
    tops: ["shirt", "blouse", "top", "sweater", "jacket", "blazer", "tshirt", "tee", "cardigan"],
    bottoms: ["trouser", "pant", "jean", "skirt", "short", "legging"],
    shoes: ["shoe", "boot", "sneaker", "sandal", "heel", "flat", "ankle", "trainer"],
  }

  try {
    console.log(" 🔍 Searching with tier-optimized budgets...")
    console.log("")

    const tops = await searchProductsFromDB(categoryKeywords.tops, {
      limit: 30,
      categoryType: "tops",
      priceRange: categoryBudgets.tops,
    })

    const bottoms = await searchProductsFromDB(categoryKeywords.bottoms, {
      limit: 30,
      categoryType: "bottoms",
      priceRange: categoryBudgets.bottoms,
    })

    const shoes = await searchProductsFromDB(categoryKeywords.shoes, {
      limit: 30,
      categoryType: "shoes",
      priceRange: categoryBudgets.shoes,
    })

    const calculateActualRange = (items) => {
      if (!items || items.length === 0) return { min: 0, max: 0, avg: 0 }
      const prices = items.map(i => i.price).sort((a, b) => a - b)
      return {
        min: Math.round(prices[0]),
        max: Math.round(prices[prices.length - 1]),
        avg: Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length)
      }
    }

    const topsRange = calculateActualRange(tops)
    const bottomsRange = calculateActualRange(bottoms)
    const shoesRange = calculateActualRange(shoes)

    console.log(``)
    console.log(` ╔════════════════════════════════════════════════════════╗`)
    console.log(` ║               SEARCH RESULTS SUMMARY                   ║`)
    console.log(` ╚════════════════════════════════════════════════════════╝`)
    console.log(``)
    console.log(` 👕 TOPS: ${tops.length} products`)
    console.log(`    Budget: $${categoryBudgets.tops.min} - ${categoryBudgets.tops.max || '∞'}`)
    console.log(`    Actual: $${topsRange.min} - $${topsRange.max} (avg $${topsRange.avg})`)
    console.log(`    Within budget: ${tops.filter((t) => t.isWithinBudget).length}/${tops.length}`)
    console.log(``)
    console.log(` 👖 BOTTOMS: ${bottoms.length} products`)
    console.log(`    Budget: $${categoryBudgets.bottoms.min} - ${categoryBudgets.bottoms.max || '∞'}`)
    console.log(`    Actual: $${bottomsRange.min} - $${bottomsRange.max} (avg $${bottomsRange.avg})`)
    console.log(`    Within budget: ${bottoms.filter((b) => b.isWithinBudget).length}/${bottoms.length}`)
    console.log(``)
    console.log(` 👞 SHOES: ${shoes.length} products`)
    console.log(`    Budget: $${categoryBudgets.shoes.min} - ${categoryBudgets.shoes.max || '∞'}`)
    console.log(`    Actual: $${shoesRange.min} - $${shoesRange.max} (avg $${shoesRange.avg})`)
    console.log(`    Within budget: ${shoes.filter((s) => s.isWithinBudget).length}/${shoes.length}`)
    console.log(``)
    console.log(` 💰 OUTFIT TOTALS:`)
    console.log(`    Min possible: $${topsRange.min + bottomsRange.min + shoesRange.min}`)
    console.log(`    Average:      $${topsRange.avg + bottomsRange.avg + shoesRange.avg}`)
    console.log(`    Max possible: $${topsRange.max + bottomsRange.max + shoesRange.max}`)
    console.log(`    Target range: $${totalPriceRange?.min} - ${isUnlimited ? '∞' : '$' + totalPriceRange?.max}`)
    
    const avgTotal = topsRange.avg + bottomsRange.avg + shoesRange.avg
    if (!isUnlimited) {
      if (avgTotal >= totalPriceRange.min && avgTotal <= totalPriceRange.max) {
        console.log(`    Status: ✅ ON TARGET!`)
      } else if (avgTotal < totalPriceRange.min) {
        console.log(`    Status: ⚠️ BELOW by $${totalPriceRange.min - avgTotal}`)
      } else {
        console.log(`    Status: ⚠️ ABOVE by $${avgTotal - totalPriceRange.max}`)
      }
    }
    
    console.log(``)
    console.log(` ════════════════════════════════════════════════════════`)
    console.log(``)

    return { tops, bottoms, shoes }
  } catch (error) {
    console.error(" Category search failed:", error)
    return { tops: [], bottoms: [], shoes: [] }
  }
}