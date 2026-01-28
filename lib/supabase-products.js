import { supabase } from "./supabase"

// ============================================================================
// CONFIGURATION
// ============================================================================

const VECTOR_SERVER_URL = "https://embeding.buythelook.us"
const USE_VECTOR_SEARCH = true

// ============================================================================
// VECTOR SEARCH (NEW)
// ============================================================================

async function callVectorSearchAPI(query, options = {}) {
  const {
    limit = 80,  // Increased default
    category = "general",
    occasion = "everyday",
    priceRange = null,
    totalBudget = null,
    style = null,
  } = options

  try {
    console.log(`🔍 Vector API: "${query.substring(0, 60)}..." (${category}, ${occasion}${style ? `, ${style}` : ""})`)
    console.log(`   📋 DIAGNOSTIC: Requesting ${limit} products, budget: $${priceRange?.min || 0}-$${priceRange?.max || 'unlimited'}`)

    const response = await fetch(`${VECTOR_SERVER_URL}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: query,
        limit: limit,  // Don't double anymore, we're passing higher limits
        category: category,
        occasion: occasion,
        priceRange: priceRange,
        totalBudget: totalBudget,
        style: style,
      }),
    })

    if (!response.ok) {
      console.error(`❌ Vector API error: ${response.status}`)
      return []
    }

    const data = await response.json()
    const productIds = data.product_ids || []

    console.log(`✅ Vector API returned ${productIds.length} product IDs`)
    
    // DIAGNOSTIC: Log if we got fewer than expected
    if (productIds.length < limit / 2) {
      console.log(`   ⚠️  DIAGNOSTIC: Got only ${productIds.length}/${limit} requested - vector search may have filtering issues`)
      if (data.budget) {
        console.log(`   💰 Server budget info: ${JSON.stringify(data.budget)}`)
      }
    }
    
    return productIds
  } catch (error) {
    console.error("❌ Vector API call failed:", error.message)
    return []
  }
}

async function fetchProductsByIds(productIds, options = {}) {
  const { limit = 40, categoryType = "general", priceRange = null } = options

  if (!productIds || productIds.length === 0) {
    console.log("⚠️  No product IDs to fetch")
    return []
  }

  try {
    console.log(`📥 Fetching ${productIds.length} products from Supabase...`)

    // Batch fetch in chunks of 100 to avoid URL length limits
    const CHUNK_SIZE = 100
    let allProducts = []
    
    for (let i = 0; i < productIds.length; i += CHUNK_SIZE) {
      const chunk = productIds.slice(i, i + CHUNK_SIZE)
      
      // Try both 'id' and 'product_id' fields for compatibility
      const { data: products, error } = await supabase
        .from("zara_cloth_scraper")
        .select("*")
        .or(`id.in.(${chunk.join(',')}),product_id.in.(${chunk.join(',')})`)

      if (error) {
        console.error(`❌ Supabase error (chunk ${i / CHUNK_SIZE + 1}):`, error)
        continue
      }

      if (products) {
        allProducts.push(...products)
      }
    }

    console.log(`✅ Fetched ${allProducts.length} products`)

    // DEBUG: Check first few IDs and product structures
    console.log(`[v0] First 3 requested IDs:`, productIds.slice(0, 3))
    if (allProducts.length > 0) {
      console.log(`[v0] First product structure:`, {
        id: allProducts[0].id,
        product_id: allProducts[0].product_id,
        id_type: typeof allProducts[0].id,
        product_id_type: typeof allProducts[0].product_id
      })
    }

    // Maintain order from vector search (most relevant first)
    const orderedProducts = productIds
      .map((searchId) => {
        const idNum = Number(searchId)
        const idStr = String(searchId)
        
        return allProducts.find((p) => 
          p.id === searchId || 
          p.product_id === searchId ||
          p.id === idNum ||
          p.product_id === idNum ||
          String(p.id) === idStr ||
          String(p.product_id) === idStr
        )
      })
      .filter(Boolean)

    const isUnlimited = priceRange?.isUnlimited === true || priceRange?.max === null || priceRange?.max >= 99999

    console.log(`✅ Processing ${orderedProducts.length} products for formatting... (fetched: ${allProducts.length}, requested: ${productIds.length})`)

    // Format output with detailed debugging
    let noImageCount = 0
    let validProductCount = 0
    
    const formattedProducts = orderedProducts
      .slice(0, limit)
      .map((p, index) => {
        const allImgs = extractAllImageUrls(p.images || p.image)
        const validImgs = allImgs.filter((img) => img && img !== "/placeholder.svg" && img.startsWith("http"))

        if (validImgs.length === 0) {
          noImageCount++
          console.log(`   ⚠️ No valid images for: ${(p.product_name || 'Unknown').substring(0, 50)} (raw: ${typeof p.images})`)
          validImgs.push("/placeholder.svg")
        }

        const url = p.product_url || p.url || p.link || p.href || "#"
        const productPrice = Number.parseFloat(p.price) || 0

        const minPrice = priceRange?.min || 0
        const maxPrice = isUnlimited ? 99999 : priceRange?.max || 99999

        validProductCount++
        
        return {
          id: p.id || p.product_id,
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
          relevanceScore: 100 - index,
          isWithinBudget: isUnlimited ? productPrice >= minPrice : productPrice >= minPrice && productPrice <= maxPrice,
        }
      })
      .filter(Boolean)

    if (noImageCount > 0) {
      console.log(`   📊 Image stats: ${noImageCount} products with missing images (using placeholder)`)
    }
    
    console.log(`✅ Returning ${formattedProducts.length} formatted products (${validProductCount} valid)`)

    return formattedProducts
  } catch (error) {
    console.error("❌ Fetch failed:", error)
    return []
  }
}

// ============================================================================
// TRADITIONAL SEARCH (FALLBACK)
// ============================================================================

function isValidProductForCategory(product, requestedCategory) {
  // PRIORITY: Use outfit_category from database (set at scrape time - 100% accurate)
  if (product.outfit_category) {
    return product.outfit_category === requestedCategory
  }
  
  // FALLBACK: Text-based detection for old data without outfit_category
  const name = (product.product_name || "").toLowerCase()
  const desc = (product.description || "").toLowerCase()
  const combined = `${name} ${desc}`

  if (requestedCategory === "tops") {
    const rejectKeywords = [
      "perfume",
      "shoe",
      "sneaker",
      "boot",
      "pant",
      "jean",
      "trouser",
      "legging",
      "short",
      "skirt",
      "bag",
      "purse",
      "hat",
      "cap",
    ]
    if (rejectKeywords.some((k) => combined.includes(k))) return false

    const acceptKeywords = [
      "shirt",
      "blouse",
      "top",
      "tank",
      "tee",
      "sweater",
      "cardigan",
      "hoodie",
      "jacket",
      "blazer",
      "coat",
      "vest",
    ]
    return acceptKeywords.some((k) => combined.includes(k))
  }

  if (requestedCategory === "bottoms") {
    const rejectKeywords = ["perfume", "shoe", "sneaker", "shirt", "blouse", "top", "tank", "jacket", "bag", "hat"]
    if (rejectKeywords.some((k) => combined.includes(k))) return false

    const acceptKeywords = [
      "pant",
      "jean",
      "trouser",
      "legging",
      "short",
      "skirt",
      "jogger",
      "culotte",
      "cargo",
      "chino",
    ]
    return acceptKeywords.some((k) => combined.includes(k))
  }

  if (requestedCategory === "shoes") {
    const rejectKeywords = ["perfume", "shirt", "pant", "jean", "bag", "hat", "jacket"]
    if (rejectKeywords.some((k) => combined.includes(k))) return false

    const acceptKeywords = ["shoe", "sneaker", "boot", "sandal", "trainer", "runner", "loafer", "heel", "flat", "pump"]
    return acceptKeywords.some((k) => combined.includes(k))
  }

  return false
}

/**
 * ✅ FIXED: Much more lenient occasion validation
 * Only rejects EXTREME mismatches, trusts embeddings for subtle matching
 */
function isValidProductForOccasion(product, occasion) {
  const name = (product.product_name || "").toLowerCase()
  const desc = (product.description || "").toLowerCase()
  const combined = `${name} ${desc}`

  const occ = (occasion || "everyday").toLowerCase()

  // WORKOUT: Only reject EXTREME formal/party items (sequins, gowns, etc.)
  if (occ === "workout") {
    // Only reject if product has MULTIPLE extreme formal indicators
    const extremeRejects = ["sequin", "beaded", "rhinestone", "crystal", "tuxedo", "gown", "ballgown", "cocktail dress", "prom", "wedding dress", "velvet gown", "satin dress"]
    const rejectCount = extremeRejects.filter((k) => combined.includes(k)).length
    
    // Only reject if 2+ extreme formal keywords
    if (rejectCount >= 2) {
      console.log(`   ❌ Rejected (extreme formal): ${name.substring(0, 50)}`)
      return false
    }
    
    // ✅ ACCEPT: Athletic items, leggings, joggers, comfortable pants, etc.
    // ✅ ALSO ACCEPT: Neutral items that could work for workout (basic tops, stretchy pants)
    return true // Trust embeddings for the rest
  }

  // WORK: Only reject extreme athletic/party items
  if (occ === "work" || occ === "business") {
    const extremeRejects = ["gym shorts", "yoga pant", "sports bra", "sequin", "glitter", "club"]
    const rejectCount = extremeRejects.filter((k) => combined.includes(k)).length
    if (rejectCount >= 1) return false
    return true
  }

  // PARTY/FORMAL: Only reject extreme athletic items
  if (occ === "party" || occ === "formal") {
    const extremeRejects = ["gym shorts", "yoga pant", "sports bra", "workout top", "athletic short"]
    const rejectCount = extremeRejects.filter((k) => combined.includes(k)).length
    if (rejectCount >= 1) return false
    return true
  }

  // For all other occasions (date, vacation, everyday) - accept everything
  return true
}

function extractAllImageUrls(images) {
  if (!images) return ["/placeholder.svg"]

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

    return imageArray.length > 0 ? imageArray : ["/placeholder.svg"]
  } catch {
    return ["/placeholder.svg"]
  }
}

function calculateCategoryBudgets(totalPriceRange, occasion = "everyday") {
  const isUnlimited =
    totalPriceRange?.isUnlimited === true || totalPriceRange?.max === null || totalPriceRange?.max >= 99999

  const totalMin = totalPriceRange?.min || 50
  const totalMax = totalPriceRange?.max || 300

  // Determine budget tier for flexibility rules
  const avgPrice = (totalMin + totalMax) / 2
  let tier = "budget"
  if (avgPrice >= 700) tier = "luxury"
  else if (avgPrice >= 300) tier = "premium"
  else if (avgPrice >= 150) tier = "moderate"

  // Get occasion-specific category percentages
  const occasionBudgets = {
    workout: {
      shoes: { min: 0.4, max: 0.5 },
      tops: { min: 0.25, max: 0.3 },
      bottoms: { min: 0.25, max: 0.3 },
    },
    party: {
      tops: { min: 0.35, max: 0.4 },
      shoes: { min: 0.3, max: 0.35 },
      bottoms: { min: 0.25, max: 0.3 },
    },
    work: {
      tops: { min: 0.35, max: 0.4 },
      bottoms: { min: 0.3, max: 0.35 },
      shoes: { min: 0.25, max: 0.3 },
    },
    date: {
      tops: { min: 0.35, max: 0.4 },
      bottoms: { min: 0.3, max: 0.35 },
      shoes: { min: 0.25, max: 0.3 },
    },
    vacation: {
      tops: { min: 0.33, max: 0.35 },
      bottoms: { min: 0.33, max: 0.35 },
      shoes: { min: 0.3, max: 0.35 },
    },
    everyday: {
      tops: { min: 0.3, max: 0.35 },
      bottoms: { min: 0.3, max: 0.35 },
      shoes: { min: 0.3, max: 0.35 },
    },
  }

  const categoryPercents = occasionBudgets[occasion] || occasionBudgets.everyday

  // Calculate budgets for each category
  const budgets = {}
  for (const [category, percents] of Object.entries(categoryPercents)) {
    const categoryMin = Math.round(totalMin * percents.min)
    const categoryMax = Math.round(totalMax * percents.max)

    if (tier === "luxury") {
      budgets[category] = {
        min: categoryMin,
        max: null,
        isUnlimited: true,
      }
    } else {
      budgets[category] = {
        min: categoryMin,
        max: categoryMax,
        isUnlimited: false,
      }
    }
  }

  console.log(`💰 Budget Strategy (${tier} tier, ${occasion} occasion):`)
  console.log(`   Total: $${totalMin}-$${isUnlimited ? "unlimited" : totalMax}`)
  console.log(`   Tops: $${budgets.tops.min}-${budgets.tops.isUnlimited ? "unlimited" : "$" + budgets.tops.max}`)
  console.log(
    `   Bottoms: $${budgets.bottoms.min}-${budgets.bottoms.isUnlimited ? "unlimited" : "$" + budgets.bottoms.max}`,
  )
  console.log(`   Shoes: $${budgets.shoes.min}-${budgets.shoes.isUnlimited ? "unlimited" : "$" + budgets.shoes.max}`)

  return budgets
}

// ============================================================================
// MAIN EXPORT (HYBRID APPROACH)
// ============================================================================

export async function searchProductsByCategories(profile) {
  console.log(" Products Search Route: Starting product search from Supabase (IMPROVED v2) ")

  const totalPriceRange = profile.priceRange || null
  const occasion = profile.occasionGuidelines?.occasion || "everyday"
  const style = profile.style || profile.occasionGuidelines?.style || null

  const categoryBudgets = calculateCategoryBudgets(totalPriceRange, occasion)

  const defaultKeywords = {
    tops: ["top", "shirt"],
    bottoms: ["pant", "jean"],
    shoes: ["shoe", "sneaker"],
  }

  const categoryKeywords = {
    tops: profile.searchQueries?.tops?.length > 0 ? profile.searchQueries.tops : defaultKeywords.tops,
    bottoms: profile.searchQueries?.bottoms?.length > 0 ? profile.searchQueries.bottoms : defaultKeywords.bottoms,
    shoes: profile.searchQueries?.shoes?.length > 0 ? profile.searchQueries.shoes : defaultKeywords.shoes,
  }

  console.log("\n========================================")
  console.log("🎯 HYBRID SEARCH (Vector + Fallback) v3 FIXED")
  console.log("========================================")
  console.log("Mode:", USE_VECTOR_SEARCH ? "VECTOR SEARCH" : "TRADITIONAL SEARCH")
  console.log("Server:", VECTOR_SERVER_URL)
  console.log("Occasion:", occasion)
  if (style) console.log("Style:", style)
  console.log("⚠️  FIX: Removed hard occasion filter, trusting embeddings")
  console.log("========================================\n")

  try {
    let tops = []
    let bottoms = []
    let shoes = []

    if (USE_VECTOR_SEARCH) {
      console.log("🚀 Attempting vector search (v2)...\n")

      // ✅ FIXED: Request MORE products from vector API to ensure sufficient results
      const [topsIds, bottomsIds, shoesIds] = await Promise.all([
        callVectorSearchAPI(categoryKeywords.tops.join(" "), {
          limit: 80,  // Increased from 40
          category: "tops",
          occasion,
          priceRange: categoryBudgets.tops,
          totalBudget: totalPriceRange,
          style: style,
        }),
        callVectorSearchAPI(categoryKeywords.bottoms.join(" "), {
          limit: 120, // Increased significantly for bottoms (leggings issue)
          category: "bottoms",
          occasion,
          priceRange: categoryBudgets.bottoms,
          totalBudget: totalPriceRange,
          style: style,
        }),
        callVectorSearchAPI(categoryKeywords.shoes.join(" "), {
          limit: 80,  // Increased from 40
          category: "shoes",
          occasion,
          priceRange: categoryBudgets.shoes,
          totalBudget: totalPriceRange,
          style: style,
        }),
      ])

      // Fetch full products with increased limits
      ;[tops, bottoms, shoes] = await Promise.all([
        fetchProductsByIds(topsIds, { limit: 80, categoryType: "tops", priceRange: categoryBudgets.tops }),
        fetchProductsByIds(bottomsIds, { limit: 120, categoryType: "bottoms", priceRange: categoryBudgets.bottoms }),
        fetchProductsByIds(shoesIds, { limit: 80, categoryType: "shoes", priceRange: categoryBudgets.shoes }),
      ])
      
      // ✅ IMPROVED: Minimal occasion validation - trust embeddings more
      console.log(`\n🔍 Before occasion filter - Tops: ${tops.length}, Bottoms: ${bottoms.length}, Shoes: ${shoes.length}`)
      
      const topsBeforeFilter = tops.length
      const bottomsBeforeFilter = bottoms.length
      const shoesBeforeFilter = shoes.length
      
      tops = tops.filter(p => isValidProductForOccasion({ product_name: p.name, description: p.description }, occasion))
      bottoms = bottoms.filter(p => isValidProductForOccasion({ product_name: p.name, description: p.description }, occasion))
      shoes = shoes.filter(p => isValidProductForOccasion({ product_name: p.name, description: p.description }, occasion))
      
      if (topsBeforeFilter > tops.length) {
        console.log(`   🎯 Tops filtered: ${topsBeforeFilter} → ${tops.length} (removed ${topsBeforeFilter - tops.length} non-${occasion} items)`)
      }
      if (bottomsBeforeFilter > bottoms.length) {
        console.log(`   🎯 Bottoms filtered: ${bottomsBeforeFilter} → ${bottoms.length} (removed ${bottomsBeforeFilter - bottoms.length} non-${occasion} items)`)
      }
      if (shoesBeforeFilter > shoes.length) {
        console.log(`   🎯 Shoes filtered: ${shoesBeforeFilter} → ${shoes.length} (removed ${shoesBeforeFilter - shoes.length} non-${occasion} items)`)
      }

      // ✅ FIXED: Generic fallback for ANY category with insufficient results (not just workout bottoms)
      const categories = [
        { name: 'tops', data: tops, budget: categoryBudgets.tops },
        { name: 'bottoms', data: bottoms, budget: categoryBudgets.bottoms },
        { name: 'shoes', data: shoes, budget: categoryBudgets.shoes }
      ]
      
      for (const cat of categories) {
        if (cat.data.length < 15) {
          console.log(`\n🚨 ${cat.name.toUpperCase()} EMERGENCY FALLBACK: Only ${cat.data.length} found, querying database directly...`)
          
          try {
            // Remove ALL budget restrictions for emergency fallback
            const { data: emergencyProducts, error } = await supabase
              .from("zara_cloth_scraper")
              .select("*")
              .eq('outfit_category', cat.name)
              .limit(500)  // Fetch lots
            
            if (!error && emergencyProducts && emergencyProducts.length > 0) {
              console.log(`   ✅ Found ${emergencyProducts.length} ${cat.name} from direct query (no price filter)`)
              
              // Format products (NO occasion filtering - trust what we get)
              const formattedProducts = emergencyProducts
                .slice(0, 80)
                .map((p, index) => {
                  const allImgs = extractAllImageUrls(p.images || p.image)
                  const validImgs = allImgs.filter((img) => img && img !== "/placeholder.svg" && img.startsWith("http"))
                  
                  if (validImgs.length === 0) validImgs.push("/placeholder.svg")
                  
                  const url = p.product_url || p.url || "#"
                  const productPrice = Number.parseFloat(p.price) || 0
                  
                  return {
                    id: p.id || p.product_id,
                    name: p.product_name || "Unnamed Product",
                    price: productPrice,
                    priceText: `${p.currency || "USD"}${productPrice}`,
                    brand: p.brand || "Zara",
                    images: validImgs,
                    image: validImgs[0],
                    url,
                    product_url: url,
                    color: p.colour || p.color || "N/A",
                    category: cat.name,
                    description: p.description || "",
                    isInStock: p.availability !== false,
                    relevanceScore: 100 - index,
                    isWithinBudget: true,
                  }
                })
                .filter(Boolean)
              
              // Replace the category data
              if (cat.name === 'tops') tops = formattedProducts
              else if (cat.name === 'bottoms') bottoms = formattedProducts
              else if (cat.name === 'shoes') shoes = formattedProducts
              
              console.log(`   ✅ ${cat.name} now has ${formattedProducts.length} products`)
            }
          } catch (dbError) {
            console.error(`   ❌ Direct database fallback failed for ${cat.name}:`, dbError)
          }
        }
      }
      
      // Check if vector search returned enough results
      const usedEmergencyBottoms = occasion === 'workout' && bottoms.length > 0 && bottoms.length < 10
      const vectorSuccess = tops.length >= 10 && (bottoms.length >= 10 || usedEmergencyBottoms) && shoes.length >= 10

      if (!vectorSuccess && !usedEmergencyBottoms) {
        console.log("\n⚠️  Vector search returned insufficient results, falling back to traditional search...\n")
      } else if (usedEmergencyBottoms) {
        console.log(`\n✅ Using emergency fallback bottoms (${bottoms.length} found), skipping traditional search for bottoms`)
      }
    }

    // Fallback to traditional search if vector search failed or is disabled
    const usedEmergencyBottoms = occasion === 'workout' && bottoms.length > 0 && bottoms.length < 10
    const needsFallback = !USE_VECTOR_SEARCH || tops.length < 10 || (bottoms.length < 10 && !usedEmergencyBottoms) || shoes.length < 10
    
    if (needsFallback) {
      console.log("🔄 Using traditional Supabase search...\n")
      
      // Fallback: Direct Supabase query with text search
      const fallbackSearch = async (keywords, category, budget) => {
        try {
          let query = supabase
            .from("zara_cloth_scraper")
            .select("*")
            .or(keywords.map(k => `product_name.ilike.%${k}%`).join(','))
            .gte('price', budget.min)
          
          if (!budget.isUnlimited) {
            query = query.lte('price', budget.max)
          }
          
          query = query.limit(40)
          
          const { data, error } = await query
          
          if (error) {
            console.error(`❌ Fallback search error for ${category}:`, error)
            return []
          }
          
          // Filter and format results
          return (data || [])
            .filter(p => isValidProductForCategory(p, category))
            .filter(p => isValidProductForOccasion(p, occasion))
            .slice(0, 40)
            .map((p, index) => {
              const allImgs = extractAllImageUrls(p.images || p.image)
              const validImgs = allImgs.filter((img) => img && img !== "/placeholder.svg" && img.startsWith("http"))
              
              if (validImgs.length === 0) return null
              
              const url = p.product_url || p.url || p.link || p.href || "#"
              const productPrice = Number.parseFloat(p.price) || 0
              
              return {
                id: p.id,
                name: p.product_name || "Unnamed Product",
                price: productPrice,
                priceText: `${p.currency || "USD"}${productPrice}`,
                brand: p.brand || "Zara",
                images: validImgs,
                image: validImgs[0],
                url,
                product_url: url,
                color: p.colour || p.color || "N/A",
                category: category,
                description: p.description || "",
                isInStock: p.availability !== false && p.stock_status !== "Out of Stock",
                relevanceScore: 100 - index,
                isWithinBudget: productPrice >= budget.min && (budget.isUnlimited || productPrice <= budget.max),
              }
            })
            .filter(Boolean)
        } catch (err) {
          console.error(`❌ Fallback search exception for ${category}:`, err)
          return []
        }
      }
      
      // Run fallback searches in parallel
      const fallbackResults = await Promise.all([
        tops.length < 10 ? fallbackSearch(categoryKeywords.tops, 'tops', categoryBudgets.tops) : Promise.resolve(tops),
        (bottoms.length < 10 && !usedEmergencyBottoms) ? fallbackSearch(categoryKeywords.bottoms, 'bottoms', categoryBudgets.bottoms) : Promise.resolve(bottoms),
        shoes.length < 10 ? fallbackSearch(categoryKeywords.shoes, 'shoes', categoryBudgets.shoes) : Promise.resolve(shoes)
      ])
      
      tops = fallbackResults[0]
      bottoms = fallbackResults[1]
      shoes = fallbackResults[2]
    }

    console.log("========================================")
    console.log("✅ SEARCH COMPLETE (v3 FIXED)")
    console.log("========================================")
    console.log(`Tops: ${tops.length}`)
    console.log(`Bottoms: ${bottoms.length}`)
    console.log(`Shoes: ${shoes.length}`)
    console.log(`Total products: ${tops.length + bottoms.length + shoes.length}`)
    console.log("========================================\n")

    return { tops, bottoms, shoes }
  } catch (err) {
    console.error("❌ Search failed:", err)
    return { tops: [], bottoms: [], shoes: [] }
  }
}
