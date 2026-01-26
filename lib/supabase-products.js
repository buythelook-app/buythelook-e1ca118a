import { supabase } from "./supabase"

// ============================================================================
// CONFIGURATION
// ============================================================================

const VECTOR_SERVER_URL =  "https://embeding.buythelook.us"
const USE_VECTOR_SEARCH = true

// ============================================================================
// VECTOR SEARCH (NEW)
// ============================================================================

async function callVectorSearchAPI(query, options = {}) {
  const {
    limit = 40,
    category = "general",
    occasion = "everyday",
    priceRange = null,
    totalBudget = null,
    style = null,
  } = options

  try {
    console.log(`🔍 Vector API: "${query}" (${category}, ${occasion}${style ? `, ${style}` : ""})`)

    const response = await fetch(`${VECTOR_SERVER_URL}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: query,
        limit: limit * 2,
        category: category,
        occasion: occasion,
        priceRange: priceRange,
        totalBudget: totalBudget,
        style: style, // Pass style to vector server
      }),
    })

    if (!response.ok) {
      console.error(`❌ Vector API error: ${response.status}`)
      return []
    }

    const data = await response.json()
    const productIds = data.product_ids || []

    console.log(`✅ Vector API returned ${productIds.length} product IDs`)
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
    // FIX: Convert IDs to both string and number for comparison
    const orderedProducts = productIds
      .map((searchId) => {
        // Try matching as-is, as string, and as number
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
          // DON'T filter out - use placeholder instead
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

function isValidProductForOccasion(product, occasion) {
  const name = (product.product_name || "").toLowerCase()
  const desc = (product.description || "").toLowerCase()
  const combined = `${name} ${desc}`

  const occ = (occasion || "everyday").toLowerCase()

  if (occ === "workout") {
    const hardReject = [
      "beaded",
      "sequin",
      "rhinestone",
      "crystal embellished",
      "tuxedo",
      "formal dress",
      "gala",
      "cocktail dress",
      "evening gown",
      "party dress",
      "prom",
      "wedding dress",
      "faux fur coat",
      "velvet gown",
      "satin dress",
      "strapless dress",
      "off shoulder gown",
      "ballgown",
    ]

    const rejectCount = hardReject.filter((k) => combined.includes(k)).length
    if (rejectCount >= 2) return false

    const workoutAccept = [
      "athletic",
      "sport",
      "gym",
      "fitness",
      "training",
      "workout",
      "activewear",
      "performance",
      "running",
      "yoga",
      "jogging",
      "moisture",
      "breathable",
      "stretch",
      "compression",
      "dri-fit",
      "sneaker",
      "trainer",
      "running shoe",
      "legging",
      "jogger",
      "sweatshirt",
      "hoodie",
      "sports bra",
    ]

    const hasWorkoutKeyword = workoutAccept.some((k) => combined.includes(k))
    const hasRejectKeyword = rejectCount > 0

    return hasWorkoutKeyword && !hasRejectKeyword
  }

  if (occ === "party" || occ === "formal") {
    const rejectCasual = ["sweatpant", "jogger athletic", "gym shorts", "yoga pant"]
    if (rejectCasual.some((k) => combined.includes(k))) return false
  }

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
      shoes: { min: 0.4, max: 0.5 }, // Athletic shoes are expensive
      tops: { min: 0.25, max: 0.3 },
      bottoms: { min: 0.25, max: 0.3 },
    },
    party: {
      tops: { min: 0.35, max: 0.4 }, // Statement tops
      shoes: { min: 0.3, max: 0.35 }, // Heels/dress shoes
      bottoms: { min: 0.25, max: 0.3 },
    },
    work: {
      tops: { min: 0.35, max: 0.4 }, // Blazers, professional tops
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
  console.log(" Products Search Route: Starting product search from Supabase vaclall ")

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
  console.log("🎯 HYBRID SEARCH (Vector + Fallback)")
  console.log("========================================")
  console.log("Mode:", USE_VECTOR_SEARCH ? "VECTOR SEARCH" : "TRADITIONAL SEARCH")
  console.log("Server:", VECTOR_SERVER_URL)
  console.log("Occasion:", occasion)
  if (style) console.log("Style:", style) // Log style if present
  console.log("========================================\n")

  try {
    let tops = []
    let bottoms = []
    let shoes = []

    if (USE_VECTOR_SEARCH) {
      console.log("🚀 Attempting vector search...\n")

      const [topsIds, bottomsIds, shoesIds] = await Promise.all([
        callVectorSearchAPI(categoryKeywords.tops.join(" "), {
          limit: 40,
          category: "tops",
          occasion,
          priceRange: categoryBudgets.tops,
          totalBudget: totalPriceRange,
          style: style, // Pass style to vector search
        }),
        callVectorSearchAPI(categoryKeywords.bottoms.join(" "), {
          limit: 40,
          category: "bottoms",
          occasion,
          priceRange: categoryBudgets.bottoms,
          totalBudget: totalPriceRange,
          style: style, // Pass style to vector search
        }),
        callVectorSearchAPI(categoryKeywords.shoes.join(" "), {
          limit: 40,
          category: "shoes",
          occasion,
          priceRange: categoryBudgets.shoes,
          totalBudget: totalPriceRange,
          style: style, // Pass style to vector search
        }),
      ])

      // Fetch full products
      ;[tops, bottoms, shoes] = await Promise.all([
        fetchProductsByIds(topsIds, { limit: 40, categoryType: "tops", priceRange: categoryBudgets.tops }),
        fetchProductsByIds(bottomsIds, { limit: 40, categoryType: "bottoms", priceRange: categoryBudgets.bottoms }),
        fetchProductsByIds(shoesIds, { limit: 40, categoryType: "shoes", priceRange: categoryBudgets.shoes }),
      ])

      // Check if vector search returned enough results
      const vectorSuccess = tops.length >= 10 && bottoms.length >= 10 && shoes.length >= 10

      if (!vectorSuccess) {
        console.log("\n⚠️  Vector search returned insufficient results, falling back to traditional search...\n")
        // Fallback will be triggered below
      }
    }

    // Fallback to traditional search if vector search failed or is disabled
    if (!USE_VECTOR_SEARCH || tops.length < 10 || bottoms.length < 10 || shoes.length < 10) {
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
        bottoms.length < 10 ? fallbackSearch(categoryKeywords.bottoms, 'bottoms', categoryBudgets.bottoms) : Promise.resolve(bottoms),
        shoes.length < 10 ? fallbackSearch(categoryKeywords.shoes, 'shoes', categoryBudgets.shoes) : Promise.resolve(shoes)
      ])
      
      tops = fallbackResults[0]
      bottoms = fallbackResults[1]
      shoes = fallbackResults[2]
    }

    console.log("========================================")
    console.log("✅ SEARCH COMPLETE")
    console.log("========================================")
    console.log(`Tops: ${tops.length}`)
    console.log(`Bottoms: ${bottoms.length}`)
    console.log(`Shoes: ${shoes.length}`)
    console.log("========================================\n")

    return { tops, bottoms, shoes }
  } catch (err) {
    console.error("❌ Search failed:", err)
    return { tops: [], bottoms: [], shoes: [] }
  }
}
