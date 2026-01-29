import { supabase } from "./supabase"

// ============================================================================
// CONFIGURATION
// ============================================================================

<<<<<<< HEAD
const VECTOR_SERVER_URL = "https://embeding.buythelook.us"
=======
const VECTOR_SERVER_URL = "http://localhost:3001"
>>>>>>> 6d8a377c95d862fe2b8c54f8b15384f8c64ba20a
const USE_VECTOR_SEARCH = true
// V5.1: AI query generation now happens on server - no need for separate call

// ============================================================================
// V4 COLOR SYSTEM - HEX TO NAME MAPPING FOR SEMANTIC SEARCH
// ============================================================================

const HEX_TO_COLOR_NAME = {
  "#000000": "black", "#1A1A1A": "black", "#2C3E50": "navy", "#4A4A4A": "charcoal",
  "#FFFFFF": "white", "#F5F5F5": "white", "#F5F5DC": "cream", "#FFF8DC": "cream",
  "#808080": "grey", "#A9A9A9": "grey", "#D3D3D3": "light grey", "#C0C0C0": "silver",
  "#708090": "slate", "#000080": "navy", "#191970": "midnight blue", "#4169E1": "royal blue",
  "#4682B4": "steel blue", "#87CEEB": "sky blue", "#ADD8E6": "light blue",
  "#228B22": "forest green", "#32CD32": "lime green", "#DC143C": "crimson",
  "#FF0000": "red", "#8B0000": "dark red", "#800020": "burgundy",
  "#FFB6C1": "light pink", "#FFC0CB": "pink", "#FF69B4": "hot pink",
  "#FF4500": "orange red", "#FFA500": "orange", "#FFD700": "gold", "#FFFF00": "yellow",
  "#F0E68C": "khaki", "#4B0082": "indigo", "#800080": "purple", "#E6E6FA": "lavender",
  "#DDA0DD": "plum", "#8B4513": "brown", "#D2B48C": "tan", "#DEB887": "burlywood", "#F5DEB3": "wheat"
}

function hexToColorName(hex) {
  if (!hex) return null
  const normalized = hex.toUpperCase()
  if (HEX_TO_COLOR_NAME[normalized]) return HEX_TO_COLOR_NAME[normalized]
  
  const r = parseInt(normalized.slice(1, 3), 16)
  const g = parseInt(normalized.slice(3, 5), 16)
  const b = parseInt(normalized.slice(5, 7), 16)
  
  if (r > 200 && g > 200 && b > 200) return "white"
  if (r < 50 && g < 50 && b < 50) return "black"
  if (r > g && r > b) return r > 200 ? "red" : "burgundy"
  if (g > r && g > b) return "green"
  if (b > r && b > g) return b > 200 ? "blue" : "navy"
  return "grey"
}

/**
 * ✅ V4: Build color-enhanced query using allowedColors from profile
 * Injects color names with weighting for semantic search
 */
/**
 * ✅ V4 FIX: Build HEAVILY color-enhanced query using allowedColors from profile
 * Increased weighting: 1st color 5x, 2nd color 3x, 3rd color 2x
 * Colors appear at START, MIDDLE, and END for maximum semantic impact
 */
function buildColorEnhancedQueryV4(baseQuery, allowedColors, category) {
  if (!allowedColors || !allowedColors[category]) return baseQuery
  
  const categoryColors = allowedColors[category]
  const colorNames = categoryColors
    .slice(0, 4)  // Take top 4 colors now
    .map(c => c.name || hexToColorName(c.hex))
    .filter(Boolean)
  
  if (colorNames.length === 0) return baseQuery
  
  console.log(`   🎨 Injecting colors for ${category}: ${colorNames.join(", ")}`)
  
  // ✅ FIX: INCREASED weighting (1st: 5x, 2nd: 3x, 3rd: 2x, 4th: 1x)
  const weightedColors = []
  colorNames.forEach((color, index) => {
    const weights = [5, 3, 2, 1]
    const weight = weights[index] || 1
    for (let i = 0; i < weight; i++) {
      weightedColors.push(color)
    }
  })
  
  // ✅ FIX: Triple injection strategy - START, MIDDLE, and END
  const colorPrefix = colorNames.join(" ")  // All colors at start
  const colorMiddle = weightedColors.join(" ")  // Weighted in middle
  const colorSuffix = colorNames.slice(0, 2).join(" ")  // Top 2 at end
  
  // Result: "[all colors] [weighted colors x11] [base query] [top 2 colors]"
  return `${colorPrefix} ${colorMiddle} ${baseQuery} ${colorSuffix}`
}

// ============================================================================
// STYLE → SHOE TYPE MAPPING (The missing link!)
// ============================================================================

const STYLE_SHOE_PREFERENCES = {
  casual: {
    prefer: ["sneaker", "flat", "loafer", "sandal", "slip-on", "canvas", "trainer", "espadrille"],
    avoid: ["heel", "stiletto", "pump", "platform heel", "kitten heel", "dress shoe"],
    queryBoost: "sneaker flat loafer casual"
  },
  sporty: {
    prefer: ["sneaker", "trainer", "athletic", "running", "sport shoe"],
    avoid: ["heel", "stiletto", "pump", "oxford", "loafer", "boot", "sandal"],
    queryBoost: "sneaker trainer athletic sport"
  },
  elegant: {
    prefer: ["heel", "pump", "stiletto", "kitten heel", "oxford", "loafer", "dress shoe"],
    avoid: ["sneaker", "trainer", "athletic", "flip flop", "sport", "canvas"],
    queryBoost: "heel pump elegant dress shoe"
  },
  classic: {
    prefer: ["pump", "loafer", "oxford", "ballet flat", "kitten heel", "mule"],
    avoid: ["athletic", "flip flop", "sport", "chunky sneaker", "platform"],
    queryBoost: "loafer pump oxford classic"
  },
  romantic: {
    prefer: ["heel", "strappy sandal", "pump", "ballet flat", "kitten heel", "mule"],
    avoid: ["sneaker", "athletic", "combat boot", "chunky", "sport"],
    queryBoost: "strappy heel sandal feminine"
  },
  minimalist: {
    prefer: ["flat", "loafer", "sneaker", "mule", "slip-on", "sandal", "oxford"],
    avoid: ["embellished", "sparkle", "glitter", "chunky platform", "statement"],
    queryBoost: "clean flat loafer minimal"
  },
  glamorous: {
    prefer: ["heel", "stiletto", "pump", "platform", "strappy", "embellished"],
    avoid: ["sneaker", "athletic", "flat", "loafer", "sport", "canvas"],
    queryBoost: "stiletto heel glamorous statement"
  },
  edgy: {
    prefer: ["boot", "combat boot", "platform", "chunky", "ankle boot", "sneaker"],
    avoid: ["ballet flat", "delicate", "dainty", "kitten heel", "feminine"],
    queryBoost: "boot platform chunky edgy"
  },
  bohemian: {
    prefer: ["sandal", "flat", "espadrille", "boot", "ankle boot", "mule", "wedge"],
    avoid: ["stiletto", "formal pump", "oxford", "athletic", "sport"],
    queryBoost: "sandal espadrille boho flat"
  },
  preppy: {
    prefer: ["loafer", "oxford", "ballet flat", "boat shoe", "sneaker", "pump"],
    avoid: ["stiletto", "platform", "combat boot", "chunky"],
    queryBoost: "loafer oxford preppy classic"
  }
}

// ============================================================================
// STYLE → FABRIC/MATERIAL FILTERING (V5.1)
// Prevents casual styles from returning satin, silk, velvet, etc.
// ============================================================================

const STYLE_FABRIC_PREFERENCES = {
  casual: {
    prefer: ["cotton", "jersey", "denim", "canvas", "linen", "fleece", "knit", "chambray", "terry", "twill"],
    avoid: ["satin", "silk", "velvet", "sequin", "lace", "chiffon", "organza", "brocade", "taffeta", "lamé"]
  },
  sporty: {
    prefer: ["jersey", "mesh", "nylon", "lycra", "performance", "technical", "stretch", "fleece"],
    avoid: ["satin", "silk", "velvet", "sequin", "lace", "chiffon", "organza", "wool formal"]
  },
  elegant: {
    prefer: ["satin", "silk", "velvet", "chiffon", "lace", "crepe", "wool", "cashmere", "tweed"],
    avoid: ["jersey casual", "fleece", "denim distressed", "canvas", "nylon athletic"]
  },
  romantic: {
    prefer: ["lace", "chiffon", "silk", "organza", "tulle", "voile", "satin", "eyelet", "broderie"],
    avoid: ["denim", "canvas", "nylon", "fleece", "leather tough"]
  },
  minimalist: {
    prefer: ["cotton", "linen", "wool", "cashmere", "silk", "jersey", "crepe"],
    avoid: ["sequin", "glitter", "embellished", "brocade", "lace heavy", "tulle"]
  },
  bohemian: {
    prefer: ["cotton", "linen", "crochet", "embroidered", "fringe", "suede", "gauze"],
    avoid: ["satin formal", "sequin", "nylon athletic", "lycra"]
  },
  edgy: {
    prefer: ["leather", "denim", "mesh", "vinyl", "studded", "distressed", "coated", "patent"],
    avoid: ["lace delicate", "chiffon soft", "tulle", "pastel silk", "eyelet"]
  },
  glamorous: {
    prefer: ["sequin", "satin", "silk", "velvet", "metallic", "lamé", "beaded", "crystal", "sparkle"],
    avoid: ["cotton casual", "denim basic", "fleece", "jersey plain", "canvas"]
  },
  classic: {
    prefer: ["cotton", "wool", "cashmere", "silk", "linen", "tweed", "leather", "suede"],
    avoid: ["sequin", "glitter", "mesh athletic", "nylon sporty", "distressed heavy"]
  },
  preppy: {
    prefer: ["cotton", "oxford cloth", "cable knit", "wool", "seersucker", "madras", "piqué"],
    avoid: ["sequin", "glitter", "mesh", "vinyl", "distressed", "ripped"]
  },
  nordic: {
    prefer: ["wool", "cashmere", "cotton", "linen", "knit", "fleece cozy"],
    avoid: ["sequin", "glitter", "satin flashy", "velvet bold", "mesh"]
  },
  modern: {
    prefer: ["cotton", "wool", "silk", "leather", "cashmere", "crepe", "structured"],
    avoid: ["sequin heavy", "glitter", "fringe", "overly embellished"]
  }
}

/**
 * Filter products by fabric/material based on style
 * @param {Array} products - Products to filter
 * @param {string} style - User's style
 * @param {string} category - Product category (tops, bottoms)
 * @returns {Array} Filtered products
 */
function filterByFabricStyle(products, style, category) {
  // Only apply fabric filtering to tops and bottoms (not shoes)
  if (!style || !products.length || category === "shoes") return products
  
  const styleKey = style.toLowerCase()
  const prefs = STYLE_FABRIC_PREFERENCES[styleKey]
  
  if (!prefs) return products
  
  const avoidPatterns = prefs.avoid.map(a => a.toLowerCase().split(" ")[0]) // Take first word only
  
  const filtered = products.filter(product => {
    const name = (product.name || product.product_name || "").toLowerCase()
    const desc = (product.description || "").toLowerCase()
    const combined = `${name} ${desc}`
    
    // Check if product matches any avoid pattern
    const shouldAvoid = avoidPatterns.some(pattern => {
      // Exact match or word boundary match
      return combined.includes(pattern) && 
             // Make sure it's not a false positive (e.g., "satin" in "satiny" is fine to catch)
             (combined.includes(` ${pattern}`) || combined.includes(`${pattern} `) || combined.startsWith(pattern))
    })
    
    if (shouldAvoid) {
      console.log(`   🧵 Fabric filter rejected: "${(product.name || product.product_name || "").substring(0, 50)}" (style: ${style})`)
    }
    
    return !shouldAvoid
  })
  
  if (products.length > filtered.length) {
    console.log(`   🧵 Fabric filter: ${products.length} → ${filtered.length} products (${style} style, ${category})`)
  }
  
  return filtered
}

/**
 * Build style-enhanced query for shoes
 * Injects preferred shoe types based on user's style
 */
function buildStyleEnhancedShoeQuery(baseQuery, style) {
  if (!style) return baseQuery
  
  const styleKey = style.toLowerCase()
  const prefs = STYLE_SHOE_PREFERENCES[styleKey]
  
  if (!prefs) return baseQuery
  
  console.log(`   👟 Style-based shoe boost for "${style}": ${prefs.queryBoost}`)
  
  // Inject style-preferred shoe types at start and end
  return `${prefs.queryBoost} ${baseQuery} ${prefs.prefer.slice(0, 2).join(" ")}`
}

/**
 * Filter shoes by style after fetch
 */
function filterShoesByStyle(shoes, style) {
  if (!style || !shoes.length) return shoes
  
  const styleKey = style.toLowerCase()
  const prefs = STYLE_SHOE_PREFERENCES[styleKey]
  
  if (!prefs) return shoes
  
  const avoidPatterns = prefs.avoid.map(a => a.toLowerCase())
  
  // Filter out shoes that match "avoid" patterns
  const filtered = shoes.filter(shoe => {
    const name = (shoe.name || "").toLowerCase()
    const desc = (shoe.description || "").toLowerCase()
    const combined = `${name} ${desc}`
    
    // Check if shoe matches any avoid pattern
    const shouldAvoid = avoidPatterns.some(pattern => combined.includes(pattern))
    
    if (shouldAvoid) {
      console.log(`   ⛔ Style filter rejected: ${shoe.name?.substring(0, 40)} (style: ${style})`)
    }
    
    return !shouldAvoid
  })
  
  console.log(`   👟 Style filter: ${shoes.length} → ${filtered.length} shoes (${style})`)
  
  return filtered
}

// ============================================================================
// VECTOR SEARCH (V5.1 - SERVER-SIDE AI QUERIES)
// ============================================================================

/**
 * Call vector search API with profile data
 * V5.1: Server handles AI query generation internally
 */
async function callVectorSearchAPI(options = {}) {
  const {
    limit = 80,
    category = "general",
    occasion = "everyday",
    priceRange = null,
    totalBudget = null,
    style = null,
    mood = null,
    allowedColors = null,  // V4: Color palette from profile (server will process)
  } = options

  try {
    console.log(`🔍 Vector API V5.1: ${category} (${occasion}, style: ${style || 'default'})`)
    console.log(`   📋 Budget: $${priceRange?.min || 0}-$${priceRange?.max || 'unlimited'}`)
    
    // V5.1: Pass full profile data, let server build optimized query
    const response = await fetch(`${VECTOR_SERVER_URL}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // V5.1: No pre-built query - server generates AI query from profile
        profile: true,  // Flag to indicate profile mode
        limit: limit,
        category: category,
        occasion: occasion,
        priceRange: priceRange,
        totalBudget: totalBudget,
        style: style,
        mood: mood,
        // Pass colors in format server expects
        userColors: allowedColors ? {
          tops: allowedColors.top,
          bottoms: allowedColors.bottom,
          shoes: allowedColors.shoes,
          coat: allowedColors.coat
        } : null,
      }),
    })

    if (!response.ok) {
      console.error(`❌ Vector API error: ${response.status}`)
      return []
    }

    const data = await response.json()
    const productIds = data.product_ids || []

    console.log(`✅ Vector API returned ${productIds.length} product IDs`)
    
    if (productIds.length < limit / 2) {
      console.log(`   ⚠️  DIAGNOSTIC: Got only ${productIds.length}/${limit} requested`)
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
 * ✅ V4 COMPREHENSIVE: Occasion-specific product validation
 * Filters out inappropriate product types for ALL occasions
 */

// Occasion groupings for filtering rules
const OCCASION_FILTER_RULES = {
  // FORMAL OCCASIONS - No shorts, no athletic, no casual
  formal: {
    reject: ["shorts", "short ", " short", "gym", "athletic", "workout", "sports bra", "jogger", "sweatpant", "track pant", "yoga", "running", "sneaker", "trainer", "flip flop", "slides", "hoodie", "t-shirt", "tee shirt", "cargo", "denim shorts"],
    exceptions: []
  },
  
  // WORK/PROFESSIONAL - No shorts, no athletic, no party
  work: {
    reject: ["shorts", "short ", " short", "gym", "athletic", "workout", "sports bra", "jogger", "sweatpant", "yoga", "sequin", "glitter", "club", "party", "crop top", "mini skirt", "bodycon", "cutout", "backless", "see-through", "mesh top", "flip flop", "slides"],
    exceptions: ["tailored", "bermuda", "dress short"]
  },
  
  // DATE/ROMANTIC - Elegant, no athletic, no gym, no casual shorts
  date: {
    reject: ["shorts", "short ", " short", "gym", "athletic", "workout", "sports bra", "jogger", "sweatpant", "track pant", "yoga", "running", "flip flop", "slides", "crocs", "hiking"],
    exceptions: ["tailored", "dress short", "bermuda", "linen short"]
  },
  
  // PARTY/NIGHTLIFE - No athletic, no overly casual
  party: {
    reject: ["gym shorts", "yoga pant", "sports bra", "workout", "athletic", "sweatpant", "jogger", "track", "running", "hiking", "flip flop", "crocs", "work boot"],
    exceptions: []
  },
  
  // WEDDING/GALA/BLACK TIE - Very formal, no casual at all
  wedding: {
    reject: ["shorts", "short ", " short", "gym", "athletic", "workout", "sports", "jogger", "sweatpant", "yoga", "jeans", "denim", "sneaker", "trainer", "flip flop", "slides", "hoodie", "t-shirt", "cargo", "casual", "everyday"],
    exceptions: []
  },
  
  // INTERVIEW - Professional, conservative
  interview: {
    reject: ["shorts", "short ", " short", "gym", "athletic", "workout", "sports", "jogger", "sweatpant", "yoga", "sequin", "glitter", "party", "club", "crop top", "mini skirt", "bodycon", "cutout", "backless", "see-through", "flip flop", "slides", "sneaker"],
    exceptions: ["tailored"]
  },
  
  // BRUNCH - Smart casual, no athletic, no formal
  brunch: {
    reject: ["gym", "athletic", "workout", "sports bra", "yoga pant", "running", "gown", "ballgown", "tuxedo", "sequin", "formal"],
    exceptions: []
  },
  
  // DINNER - Depends on formality, but no athletic
  dinner: {
    reject: ["gym", "athletic", "workout", "sports bra", "yoga pant", "running", "sweatpant", "jogger", "flip flop", "slides", "crocs"],
    exceptions: []
  },
  
  // WORKOUT/GYM - Athletic only, no formal
  workout: {
    reject: ["sequin", "beaded", "rhinestone", "crystal", "tuxedo", "gown", "ballgown", "cocktail dress", "prom", "wedding dress", "velvet gown", "satin dress", "formal", "evening", "blazer", "suit", "heels", "stiletto", "pump", "loafer", "oxford"],
    exceptions: []
  },
  
  // VACATION/TRAVEL - Most OK, comfort focus
  vacation: {
    reject: ["tuxedo", "ballgown", "wedding dress", "prom dress", "formal gown", "business suit"],
    exceptions: []
  },
  
  // BEACH - Very casual, swimwear OK
  beach: {
    reject: ["tuxedo", "ballgown", "formal", "blazer", "suit", "heels", "stiletto", "oxford", "loafer"],
    exceptions: []
  },
  
  // CASUAL/EVERYDAY - Most things OK
  casual: {
    reject: ["tuxedo", "ballgown", "wedding dress", "prom dress", "formal gown"],
    exceptions: []
  },
  
  // CONCERT/FESTIVAL - Casual/edgy OK
  concert: {
    reject: ["tuxedo", "ballgown", "formal gown", "business suit", "pencil skirt"],
    exceptions: []
  },
  
  // SHOPPING - Comfort casual
  shopping: {
    reject: ["formal", "gown", "tuxedo", "sequin evening", "ballgown"],
    exceptions: []
  }
}

// Map occasion aliases to main categories
const OCCASION_ALIASES = {
  // Formal
  "formal": "formal", "black tie": "formal", "gala": "formal", "ceremony": "formal",
  // Work
  "work": "work", "business": "work", "office": "work", "meeting": "work", "professional": "work",
  // Date
  "date": "date", "romantic": "date", "anniversary": "date", "valentines": "date",
  // Party
  "party": "party", "night out": "party", "club": "party", "nightlife": "party", "birthday": "party", "celebration": "party",
  // Wedding
  "wedding": "wedding", "gala": "wedding", "black-tie": "wedding", "engagement": "wedding",
  // Interview
  "interview": "interview", "job interview": "interview",
  // Brunch
  "brunch": "brunch", "lunch": "brunch", "daytime": "brunch",
  // Dinner
  "dinner": "dinner", "restaurant": "dinner", "evening": "dinner",
  // Workout
  "workout": "workout", "gym": "workout", "exercise": "workout", "fitness": "workout", "yoga": "workout", "running": "workout", "sports": "workout",
  // Vacation
  "vacation": "vacation", "travel": "vacation", "holiday": "vacation", "trip": "vacation",
  // Beach
  "beach": "beach", "pool": "beach", "resort": "beach", "tropical": "beach",
  // Casual
  "casual": "casual", "everyday": "casual", "relaxed": "casual", "weekend": "casual",
  // Concert
  "concert": "concert", "festival": "concert", "show": "concert", "gig": "concert",
  // Shopping
  "shopping": "shopping", "errands": "shopping", "mall": "shopping"
}

function isValidProductForOccasion(product, occasion) {
  const name = (product.product_name || "").toLowerCase()
  const desc = (product.description || "").toLowerCase()
  const combined = `${name} ${desc}`

  const occ = (occasion || "everyday").toLowerCase()
  
  // Map to main occasion category
  const occasionCategory = OCCASION_ALIASES[occ] || "casual"
  const rules = OCCASION_FILTER_RULES[occasionCategory] || OCCASION_FILTER_RULES.casual
  
  // Check if any reject keywords match
  const hasRejectKeyword = rules.reject.some(k => combined.includes(k))
  
  if (hasRejectKeyword) {
    // Check if any exception applies
    const hasException = rules.exceptions.length > 0 && 
      rules.exceptions.some(e => combined.includes(e))
    
    if (!hasException) {
      return false
    }
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
  console.log(" Products Search Route: Starting product search from Supabase (V5 - AI QUERY ENHANCED)")

  const totalPriceRange = profile.priceRange || null
  const occasion = profile.occasionGuidelines?.occasion || "everyday"
  const style = profile.style || profile.occasionGuidelines?.style || null
  const mood = profile.mood || profile.occasionGuidelines?.mood || null
  const bodyType = profile.bodyType || null
  
  // V4: Extract allowed colors from profile (generated by profile-builder)
  const allowedColors = profile.allowedColors || null
  
  if (allowedColors) {
    console.log("\n🎨 ========================================")
    console.log("🎨 V5 AI-ENHANCED SEARCH WITH COLORS")
    console.log("🎨 ========================================")
    console.log(`🎨 Top colors: ${allowedColors.top?.map(c => c.name).join(", ") || 'N/A'}`)
    console.log(`🎨 Bottom colors: ${allowedColors.bottom?.map(c => c.name).join(", ") || 'N/A'}`)
    console.log(`🎨 Shoes colors: ${allowedColors.shoes?.map(c => c.name).join(", ") || 'N/A'}`)
    console.log("🎨 ========================================\n")
  }

  const categoryBudgets = calculateCategoryBudgets(totalPriceRange, occasion)

  console.log("\n========================================")
  console.log("🎯 HYBRID SEARCH v5.1 (Server-Side AI)")
  console.log("========================================")
  console.log("Mode:", USE_VECTOR_SEARCH ? "VECTOR SEARCH" : "TRADITIONAL SEARCH")
  console.log("AI Queries: SERVER-SIDE ✅")
  console.log("Server:", VECTOR_SERVER_URL)
  console.log("Occasion:", occasion)
  if (style) console.log("Style:", style)
  if (mood) console.log("Mood:", mood)
  console.log("Colors:", allowedColors ? "ENABLED ✅" : "DISABLED")
  console.log("========================================\n")

  try {
    let tops = []
    let bottoms = []
    let shoes = []

    if (USE_VECTOR_SEARCH) {
      console.log("🚀 Calling vector search (v5.1 - server handles AI query generation)...\n")

      // V5.1: Pass profile data to server - it generates AI queries internally
      const [topsIds, bottomsIds, shoesIds] = await Promise.all([
        callVectorSearchAPI({
          limit: 80,
          category: "tops",
          occasion,
          priceRange: categoryBudgets.tops,
          totalBudget: totalPriceRange,
          style: style,
          mood: mood,
          allowedColors: allowedColors,
        }),
        callVectorSearchAPI({
          limit: 120,
          category: "bottoms",
          occasion,
          priceRange: categoryBudgets.bottoms,
          totalBudget: totalPriceRange,
          style: style,
          mood: mood,
          allowedColors: allowedColors,
        }),
        callVectorSearchAPI({
          limit: 80,
          category: "shoes",
          occasion,
          priceRange: categoryBudgets.shoes,
          totalBudget: totalPriceRange,
          style: style,
          mood: mood,
          allowedColors: allowedColors,
        }),
      ])

      // Fetch full products
      ;[tops, bottoms, shoes] = await Promise.all([
        fetchProductsByIds(topsIds, { limit: 80, categoryType: "tops", priceRange: categoryBudgets.tops }),
        fetchProductsByIds(bottomsIds, { limit: 120, categoryType: "bottoms", priceRange: categoryBudgets.bottoms }),
        fetchProductsByIds(shoesIds, { limit: 80, categoryType: "shoes", priceRange: categoryBudgets.shoes }),
      ])
      
      console.log(`\n🔍 Search results - Tops: ${tops.length}, Bottoms: ${bottoms.length}, Shoes: ${shoes.length}`)
      
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
      
      // V4.1: Apply style-based shoe filtering (casual style = no heels, etc.)
      if (style) {
        const shoesBeforeStyleFilter = shoes.length
        shoes = filterShoesByStyle(shoes, style)
        if (shoesBeforeStyleFilter > shoes.length) {
          console.log(`   👟 Style filter: ${shoesBeforeStyleFilter} → ${shoes.length} shoes (${style} style)`)
        }
      }
      
      // V5.1: Apply fabric-based filtering for tops and bottoms
      if (style) {
        tops = filterByFabricStyle(tops, style, "tops")
        bottoms = filterByFabricStyle(bottoms, style, "bottoms")
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
