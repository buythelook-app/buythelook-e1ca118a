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
      score += 20
    }
  }

  // Stock bonus
  if (product.availability !== false && product.stock_status !== "Out of Stock") {
    score += 10
  }

  // Price bonus (prefer mid-range)
  const price = Number.parseFloat(product.price) || 0
  if (price > 0) score += 5

  console.log(`[v0] Supabase Products:   "${productName.substring(0, 50)}..." = ${score} points`)
  return score
}

// Search products from your Supabase database
export async function searchProductsFromDB(keywords, options = {}) {
  const { limit = 25, categoryType = "general" } = options

  console.log(`[v0] Supabase Products: ========================================`)
  console.log(`[v0] Supabase Products: SEARCH REQUEST`)
  console.log(`[v0] Supabase Products: Keywords: [${keywords.join(", ")}]`)
  console.log(`[v0] Supabase Products: Category Type: ${categoryType}`)
  console.log(`[v0] Supabase Products: Limit: ${limit}`)

  try {
    // Build OR conditions for each keyword
    const conditions = keywords.map((k) => `product_name.ilike.%${k}%`).join(",")

    console.log(`[v0] Supabase Products: Query conditions: ${conditions}`)

    const { data, error } = await supabase
      .from("zara_cloth")
      .select("*")
      .or(conditions)
      .limit(limit * 2) // Get extra for scoring

    if (error) {
      console.error("[v0] Supabase Products: ❌ Search error:", error.message)
      throw error
    }

    console.log(`[v0] Supabase Products: ✅ Raw results: ${data?.length || 0} items`)

    if (data && data.length > 0) {
      console.log("[v0] Supabase Products: First item keys:", Object.keys(data[0]))
      console.log("[v0] Supabase Products: First item URL check:", {
        url: data[0].url,
        product_url: data[0].product_url,
        link: data[0].link,
        href: data[0].href,
      })
    }

    if (!data || data.length === 0) {
      console.warn("[v0] Supabase Products: ⚠️ No products found. Testing DB connection...")

      const { data: testData } = await supabase.from("zara_cloth").select("product_name, price").limit(3)

      if (testData && testData.length > 0) {
        console.log("[v0] Supabase Products: ✅ DB works. Sample products:")
        testData.forEach((p) => console.log(`[v0] Supabase Products:   - ${p.product_name} ($${p.price})`))
        console.log("[v0] Supabase Products: 💡 Your keywords didn't match any products.")
      }

      return []
    }

    // Score and sort
    const scored = data.map((p) => ({
      ...p,
      relevanceScore: calculateRelevanceScore(p, keywords, categoryType),
    }))

    scored.sort((a, b) => b.relevanceScore - a.relevanceScore)

    console.log(`[v0] Supabase Products: Top ${Math.min(5, scored.length)} scored products:`)
    scored.slice(0, 5).forEach((p, i) => {
      console.log(
        `[v0] Supabase Products:   ${i + 1}. "${p.product_name.substring(0, 40)}..." - ${p.relevanceScore} pts - $${p.price}`,
      )
    })

    // Format results
    const products = scored
      .slice(0, limit * 2) // Process more items initially to allow for filtering
      .map((p) => {
        const allImages = extractAllImageUrls(p.images || p.image, p.product_name)
        const validImages = allImages.filter((img) => img && img !== "/placeholder.svg" && img.startsWith("http"))

        if (validImages.length === 0) {
          console.warn(
            `[v0] Supabase Products: ⚠️ Skipping product "${p.product_name}" (ID: ${p.id}) - No valid images found.`,
          )
          return null
        }

        return {
          id: p.id || p.product_id?.toString(),
          name: p.product_name,
          price: Number.parseFloat(p.price) || 0,
          priceText: `${p.currency || "$"}${p.price}`,
          brand: p.brand || "Zara",
          images: validImages, // Use the validated images
          image: validImages[0], // Use first valid image
          url: p.product_url || p.url || p.link || p.href || "#",
          product_url: p.product_url || p.url || p.link || p.href || "#",
          color: p.color || p.colour || "N/A",
          category: p.category || p.scraped_category || categoryType,
          description: p.description,
          isInStock: p.availability !== false && p.stock_status !== "Out of Stock",
          relevanceScore: p.relevanceScore,
        }
      })
      .filter(Boolean) // Remove null entries
      .slice(0, limit) // Apply limit after filtering

    console.log(`[v0] Supabase Products: ✅ Returning ${products.length} products`)
    if (products[0]) {
      console.log(`[v0] Supabase Products: Sample product image: "${products[0].image}"`)
      console.log(`[v0] Supabase Products: Sample product URL: "${products[0].product_url}"`)
    }
    console.log(`[v0] Supabase Products: ========================================`)

    return products
  } catch (error) {
    console.error("[v0] Supabase Products: ❌ Fatal error:", error)
    return []
  }
}

// Search by category type (tops, bottoms, shoes)
export async function searchProductsByCategories(profile) {
  console.log("[v0] Supabase Products: ========================================")
  console.log("[v0] Supabase Products: STARTING CATEGORY SEARCH")
  console.log("[v0] Supabase Products: ========================================")

  // Define category keywords based on your Zara product names
  const categoryKeywords = {
    tops: ["shirt", "blouse", "top", "sweater", "jacket", "blazer", "tshirt", "tee", "cardigan"],
    bottoms: ["trouser", "pant", "jean", "skirt", "short", "legging"],
    shoes: ["shoe", "boot", "sneaker", "sandal", "heel", "flat", "ankle", "trainer"],
  }

  try {
    console.log("[v0] Supabase Products: 🔍 Searching TOPS...")
    const tops = await searchProductsFromDB(categoryKeywords.tops, {
      limit: 30,
      categoryType: "tops",
    })
    console.log(`[v0] Supabase Products: ✅ Found ${tops.length} tops`)

    console.log("[v0] Supabase Products: 🔍 Searching BOTTOMS...")
    const bottoms = await searchProductsFromDB(categoryKeywords.bottoms, {
      limit: 30,
      categoryType: "bottoms",
    })
    console.log(`[v0] Supabase Products: ✅ Found ${bottoms.length} bottoms`)

    console.log("[v0] Supabase Products: 🔍 Searching SHOES...")
    const shoes = await searchProductsFromDB(categoryKeywords.shoes, {
      limit: 30,
      categoryType: "shoes",
    })
    console.log(`[v0] Supabase Products: ✅ Found ${shoes.length} shoes`)

    const total = tops.length + bottoms.length + shoes.length

    console.log(`[v0] Supabase Products: ========================================`)
    console.log(`[v0] Supabase Products: SEARCH COMPLETE`)
    console.log(`[v0] Supabase Products: 👕 Tops: ${tops.length}`)
    console.log(`[v0] Supabase Products: 👖 Bottoms: ${bottoms.length}`)
    console.log(`[v0] Supabase Products: 👞 Shoes: ${shoes.length}`)
    console.log(`[v0] Supabase Products: 📦 TOTAL: ${total} products`)
    console.log(`[v0] Supabase Products: ========================================`)

    if (total === 0) {
      console.error("[v0] Supabase Products: ❌ CRITICAL: No products found in ANY category!")
      console.error("[v0] Supabase Products: This means either:")
      console.error("[v0] Supabase Products: 1. Your zara_cloth table is empty")
      console.error("[v0] Supabase Products: 2. Product names don't contain common clothing keywords")
      console.error("[v0] Supabase Products: 3. RLS policies are blocking access")
    }

    return { tops, bottoms, shoes }
  } catch (error) {
    console.error("[v0] Supabase Products: ❌ Category search failed:", error)
    return { tops: [], bottoms: [], shoes: [] }
  }
}
