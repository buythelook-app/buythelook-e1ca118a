// Import supabase
import { supabase } from "./supabase"

export async function searchProductsByClassification(profile) {
  const occasion = (profile.occasionGuidelines?.occasion || "everyday").toLowerCase()
  const priceRange = profile.priceRange || { min: 50, max: 300 }
  const stylePrefs = profile.styleKeywords?.aesthetic || []

  console.log(`\n🔍 CLASSIFICATION-BASED SEARCH`)
  console.log(`   Occasion: ${occasion}`)
  console.log(`   Price Range: $${priceRange.min} - $${priceRange.max}`)
  console.log(`   Style Prefs: ${stylePrefs.join(", ")}`)

  const isUnlimited = priceRange?.isUnlimited === true || priceRange?.max === null || priceRange?.max >= 99999
  const maxPrice = isUnlimited ? 99999 : priceRange.max

  try {
    console.log(`\n🔎 Searching for TOPS...`)
    const { data: topsData } = await supabase
      .from("zara_cloth_test")
      .select("*")
      .eq("ai_classified", true)
      .eq("clothing_category", "tops")
      .contains("occasions", [occasion])
      .gte("price", priceRange.min * 0.8)
      .lte("price", maxPrice * 1.2)
      .limit(40)

    console.log(`🔎 Searching for BOTTOMS...`)
    const { data: bottomsData } = await supabase
      .from("zara_cloth_test")
      .select("*")
      .eq("ai_classified", true)
      .eq("clothing_category", "bottoms")
      .contains("occasions", [occasion])
      .gte("price", priceRange.min * 0.8)
      .lte("price", maxPrice * 1.2)
      .limit(40)

    console.log(`🔎 Searching for SHOES...`)
    const { data: shoesData } = await supabase
      .from("zara_cloth_test")
      .select("*")
      .eq("ai_classified", true)
      .eq("clothing_category", "shoes")
      .contains("occasions", [occasion])
      .gte("price", priceRange.min * 0.8)
      .lte("price", maxPrice * 1.2)
      .limit(40)

    console.log(`\n📊 RESULTS:`)
    console.log(`   Tops: ${topsData?.length || 0}`)
    console.log(`   Bottoms: ${bottomsData?.length || 0}`)
    console.log(`   Shoes: ${shoesData?.length || 0}`)

    // Score and format products
    const tops = (topsData || [])
      .map((p) => formatAndScoreProduct(p, occasion, priceRange, stylePrefs))
      .filter(Boolean)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 30)

    const bottoms = (bottomsData || [])
      .map((p) => formatAndScoreProduct(p, occasion, priceRange, stylePrefs))
      .filter(Boolean)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 30)

    const shoes = (shoesData || [])
      .map((p) => formatAndScoreProduct(p, occasion, priceRange, stylePrefs))
      .filter(Boolean)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 30)

    return { tops, bottoms, shoes }
  } catch (error) {
    console.error("Classification search error:", error)
    return { tops: [], bottoms: [], shoes: [] }
  }
}

function formatAndScoreProduct(product, occasion, priceRange, stylePrefs) {
  let score = 50

  // Occasion match bonus (40 points)
  if (product.occasions?.includes(occasion)) {
    score += 40
  }

  // Style preference bonus - check both style_categories and style_tags (20 points)
  const allStyleFields = [...(product.style_categories || []), ...(product.style_tags || [])]
  const matchingStyles = allStyleFields.filter((tag) =>
    stylePrefs.some((pref) => pref.toLowerCase().includes(tag.toLowerCase())),
  )
  score += Math.min(20, matchingStyles.length * 5)

  // Body fit preference bonus (10 points)
  if (product.body_fits?.length > 0) {
    // Give bonus for having fit information
    score += 5
    // Additional bonus if it matches common preferences
    const preferredFits = ["fitted", "tailored", "regular"]
    if (product.body_fits.some((fit) => preferredFits.includes(fit))) {
      score += 5
    }
  }

  // Fabric quality bonus (10 points)
  const qualityFabrics = ["breathable", "moisture_wicking", "soft", "durable", "wrinkle_resistant"]
  const fabricMatches = (product.fabric_characteristics || []).filter((f) => qualityFabrics.includes(f))
  score += Math.min(10, fabricMatches.length * 2)

  // Formality match (20 points)
  const formalityMap = {
    workout: 1,
    casual: 2,
    everyday: 2,
    date: 3,
    work: 4,
    party: 4,
    formal: 5,
    wedding: 5,
  }
  const expectedFormality = formalityMap[occasion] || 3
  const formalityDiff = Math.abs((product.formality_level || 3) - expectedFormality)
  score += Math.max(0, 20 - formalityDiff * 10)

  // Price optimization (30 points)
  const productPrice = Number.parseFloat(product.price) || 0
  const isUnlimited = priceRange?.isUnlimited || priceRange?.max >= 99999
  const maxPrice = isUnlimited ? 99999 : priceRange.max

  if (productPrice >= priceRange.min && productPrice <= maxPrice) {
    score += 30

    const midPoint = (priceRange.min + maxPrice) / 2
    const distance = Math.abs(productPrice - midPoint)
    const range = maxPrice - priceRange.min
    const proximityScore = Math.max(0, 10 - (distance / range) * 10)
    score += proximityScore
  }

  // Quality indicators (10 points)
  if (product.description?.length > 50) score += 5
  if (product.availability !== false) score += 5

  // Format product
  const allImgs = extractAllImageUrls(product.images || product.image, product.product_name)
  const validImgs = allImgs.filter((img) => img && img !== "/placeholder.svg" && img.startsWith("http"))

  if (validImgs.length === 0) return null

  const url = product.product_url || product.url || product.link || "#"

  return {
    id: product.id,
    name: product.product_name || "Unnamed Product",
    price: productPrice,
    priceText: `${product.currency || "USD"}${productPrice}`,
    brand: product.brand || "Zara",
    images: validImgs,
    image: validImgs[0],
    url,
    product_url: url,
    color: product.colour || product.color || "N/A",
    category: product.clothing_category,
    description: product.description || "",
    isInStock: product.availability !== false,
    relevanceScore: score,
    isWithinBudget: productPrice >= priceRange.min && productPrice <= maxPrice,
    occasions: product.occasions || [],
    events: product.events || [],
    styleCategories: product.style_categories || [],
    styleTags: product.style_tags || [],
    bodyFits: product.body_fits || [],
    fabricCharacteristics: product.fabric_characteristics || [],
    weatherSuitability: product.weather_suitability || [],
    formalityLevel: product.formality_level || 3,
    priceSegment: product.price_segment || "mid",
  }
}

function extractAllImageUrls(images, productName = "unknown") {
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
