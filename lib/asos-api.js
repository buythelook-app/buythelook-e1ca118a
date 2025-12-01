// ASOS API Integration
const ASOS_API_BASE = "https://asos2.p.rapidapi.com"
const RAPIDAPI_HOST = "asos2.p.rapidapi.com"

async function searchASOS(query, category, limit = 20) {
  console.log("[v0] ASOS: Starting product search")
  console.log("[v0] ASOS: Query:", query)
  console.log("[v0] ASOS: Category:", category)
  console.log("[v0] ASOS: Limit:", limit)

  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY

  console.log("[v0] ASOS: Checking RapidAPI key...")
  console.log("[v0] ASOS: API key exists:", !!RAPIDAPI_KEY)

  if (!RAPIDAPI_KEY || RAPIDAPI_KEY.includes("your_rapidapi")) {
    console.error("[v0] ASOS: Invalid or missing RapidAPI key")
    throw new Error(
      "RapidAPI key is not configured. Please add your API key in the Vars section of the v0 sidebar. Get your key from https://rapidapi.com/hub",
    )
  }

  console.log("[v0] ASOS: API key validated successfully")

  try {
    const url = `${ASOS_API_BASE}/products/v2/list?store=US&offset=0&categoryId=${category}&limit=${limit}&q=${encodeURIComponent(query)}`
    console.log("[v0] ASOS: Request URL:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
    })

    console.log("[v0] ASOS: Response status:", response.status)
    console.log("[v0] ASOS: Response ok:", response.ok)

    if (!response.ok) {
      console.error("[v0] ASOS: API request failed")

      if (response.status === 401 || response.status === 403) {
        console.error("[v0] ASOS: Authentication failed")
        throw new Error(
          "Invalid RapidAPI key. Please update your API key in the Vars section. Get a valid key from https://rapidapi.com/hub",
        )
      }
      throw new Error(`ASOS API error: ${response.status}`)
    }

    const data = await response.json()
    const products = data.products || []

    console.log("[v0] ASOS: Products found:", products.length)
    console.log("[v0] ASOS: First product:", products[0] ? JSON.stringify(products[0], null, 2) : "None")

    return products
  } catch (error) {
    console.error("[v0] ASOS: Search failed with error:", error)
    console.error("[v0] ASOS: Error stack:", error.stack)
    throw error
  }
}

function parseASOSProduct(product) {
  console.log("[v0] ASOS: Parsing product:", product.id)

  const parsed = {
    id: product.id?.toString() || `prod-${Date.now()}`,
    name: product.name || "Product",
    brand: product.brandName || "ASOS",
    price: product.price?.current?.value || 50,
    image: product.imageUrl ? `https://${product.imageUrl}` : "/placeholder.svg",
    url: `https://www.asos.com/${product.url || ""}`,
    color: product.colour || "various",
  }

  console.log("[v0] ASOS: Parsed product:", JSON.stringify(parsed, null, 2))
  return parsed
}

export async function searchAllCategories(profile) {
  console.log("[v0] ASOS: Starting multi-category search")
  console.log("[v0] ASOS: Profile:", JSON.stringify(profile, null, 2))

  const priceRange = profile.priceRange || { min: 50, max: 200 }
  const searchQueries = profile.searchQueries || {}

  console.log("[v0] ASOS: Price range:", priceRange)
  console.log("[v0] ASOS: Search queries:", searchQueries)

  // Category IDs from ASOS
  const categories = {
    tops: 11321, // Women tops
    bottoms: 11325, // Women bottoms
    shoes: 11323, // Women shoes
  }

  const results = {
    tops: [],
    bottoms: [],
    shoes: [],
  }

  // Search tops
  console.log("[v0] ASOS: Searching tops...")
  for (const query of (searchQueries.tops || ["blouse", "shirt"]).slice(0, 3)) {
    console.log("[v0] ASOS: Top query:", query)
    const products = await searchASOS(query, categories.tops, 10)
    const parsed = products.map(parseASOSProduct).filter((p) => p.price >= priceRange.min && p.price <= priceRange.max)
    console.log("[v0] ASOS: Tops found in price range:", parsed.length)
    results.tops.push(...parsed)
  }

  // Search bottoms
  console.log("[v0] ASOS: Searching bottoms...")
  for (const query of (searchQueries.bottoms || ["trousers", "skirt"]).slice(0, 3)) {
    console.log("[v0] ASOS: Bottom query:", query)
    const products = await searchASOS(query, categories.bottoms, 10)
    const parsed = products.map(parseASOSProduct).filter((p) => p.price >= priceRange.min && p.price <= priceRange.max)
    console.log("[v0] ASOS: Bottoms found in price range:", parsed.length)
    results.bottoms.push(...parsed)
  }

  // Search shoes
  console.log("[v0] ASOS: Searching shoes...")
  for (const query of (searchQueries.shoes || ["heels", "boots"]).slice(0, 3)) {
    console.log("[v0] ASOS: Shoe query:", query)
    const products = await searchASOS(query, categories.shoes, 10)
    const parsed = products.map(parseASOSProduct).filter((p) => p.price >= priceRange.min && p.price <= priceRange.max)
    console.log("[v0] ASOS: Shoes found in price range:", parsed.length)
    results.shoes.push(...parsed)
  }

  // Remove duplicates
  console.log("[v0] ASOS: Removing duplicates...")
  const beforeDedupe = {
    tops: results.tops.length,
    bottoms: results.bottoms.length,
    shoes: results.shoes.length,
  }

  results.tops = Array.from(new Map(results.tops.map((p) => [p.id, p])).values())
  results.bottoms = Array.from(new Map(results.bottoms.map((p) => [p.id, p])).values())
  results.shoes = Array.from(new Map(results.shoes.map((p) => [p.id, p])).values())

  console.log("[v0] ASOS: Before dedupe:", beforeDedupe)
  console.log("[v0] ASOS: After dedupe:", {
    tops: results.tops.length,
    bottoms: results.bottoms.length,
    shoes: results.shoes.length,
  })
  console.log("[v0] ASOS: Multi-category search complete")

  return results
}
