/**
 * Occasion-specific product search keywords
 * Maps occasions from quiz to specific search terms for product filtering
 */

export const OCCASION_KEYWORDS = {
  everyday: {
    name: "Everyday Wear",
    categories: ["t-shirts", "jeans", "sneakers", "casual-tops", "casual-pants", "flats"],
    keywords: ["casual", "everyday", "comfortable", "relaxed", "easy", "basic"],
    avoid: ["formal", "evening", "cocktail", "sequin", "satin"],
    formality: "casual",
    description: "Comfortable everyday wear for casual outings",
  },
  work: {
    name: "Work/Office",
    categories: ["blazers", "trousers", "blouses", "dress-pants", "loafers", "pumps"],
    keywords: ["professional", "office", "business", "work", "formal", "tailored", "structured"],
    avoid: ["casual", "distressed", "loungewear", "athletic", "beach"],
    formality: "formal",
    description: "Professional attire for office and business settings",
  },
  casual: {
    name: "Casual/Everyday",
    categories: ["t-shirts", "jeans", "sneakers", "casual-tops", "casual-pants", "flats"],
    keywords: ["casual", "everyday", "comfortable", "relaxed", "easy", "basic"],
    avoid: ["formal", "evening", "cocktail", "sequin", "satin"],
    formality: "casual",
    description: "Comfortable everyday wear for casual outings",
  },
  party: {
    name: "Party/Event",
    categories: ["dresses", "heels", "cocktail-dresses", "nice-tops", "skirts", "dress-pants"],
    keywords: ["party", "event", "cocktail", "dressy", "fun", "trendy", "night-out", "celebration"],
    avoid: ["casual", "athletic", "work", "office", "loungewear"],
    formality: "semi-formal",
    description: "Stylish outfits for parties and social gatherings",
  },
  evening: {
    name: "Evening/Party",
    categories: ["dresses", "heels", "cocktail-dresses", "dress-pants", "blouses"],
    keywords: ["evening", "party", "cocktail", "dressy", "elegant", "glamorous", "night-out"],
    avoid: ["casual", "athletic", "work", "office"],
    formality: "semi-formal",
    description: "Stylish outfits for evening events and parties",
  },
  formal: {
    name: "Formal Event",
    categories: ["evening-gowns", "formal-dresses", "dress-shoes", "clutches", "blazers"],
    keywords: ["formal", "gown", "black-tie", "elegant", "sophisticated", "luxe", "evening-wear"],
    avoid: ["casual", "distressed", "sporty", "everyday"],
    formality: "formal",
    description: "Elegant attire for formal occasions and black-tie events",
  },
  weekend: {
    name: "Weekend/Leisure",
    categories: ["jeans", "sweaters", "casual-dresses", "sneakers", "boots", "t-shirts"],
    keywords: ["weekend", "leisure", "comfortable", "relaxed", "easy", "laid-back"],
    avoid: ["formal", "business", "office", "evening-gown"],
    formality: "casual",
    description: "Relaxed outfits for weekend activities",
  },
  date: {
    name: "Date Night",
    categories: ["dresses", "heels", "nice-tops", "jeans", "skirts"],
    keywords: ["date", "romantic", "chic", "flattering", "stylish", "feminine"],
    avoid: ["casual-t-shirt", "athletic", "office"],
    formality: "smart-casual",
    description: "Romantic and flattering outfits for date nights",
  },
  vacation: {
    name: "Vacation/Travel",
    categories: ["sundresses", "shorts", "sandals", "swimwear", "casual-tops", "light-pants"],
    keywords: ["vacation", "travel", "resort", "beach", "summer", "comfortable", "breezy", "light"],
    avoid: ["formal", "business", "heavy", "winter-coat"],
    formality: "casual",
    description: "Comfortable and stylish outfits for travel and vacation",
  },
  workout: {
    name: "Workout/Gym",
    categories: ["sports-bras", "leggings", "athletic-tops", "sneakers", "yoga-pants", "activewear"],
    keywords: ["workout", "gym", "athletic", "activewear", "fitness", "yoga", "sports", "training", "performance"],
    avoid: ["blazer", "heel", "dress", "formal", "sequin", "leather-jacket", "office"],
    formality: "athletic",
    description: "Performance activewear for workouts and fitness activities",
  },
  gym: {
    name: "Gym/Fitness",
    categories: ["sports-bras", "leggings", "athletic-tops", "sneakers", "yoga-pants", "activewear"],
    keywords: ["gym", "workout", "athletic", "activewear", "fitness", "training", "performance", "sports"],
    avoid: ["blazer", "heel", "dress", "formal", "sequin", "leather-jacket", "office"],
    formality: "athletic",
    description: "Gym attire for fitness and training",
  },
  sports: {
    name: "Sports/Athletic",
    categories: ["sports-bras", "athletic-shorts", "running-shoes", "athletic-tops", "track-pants"],
    keywords: ["sports", "athletic", "activewear", "performance", "running", "training", "gym"],
    avoid: ["blazer", "heel", "dress", "formal", "sequin", "leather-jacket", "office"],
    formality: "athletic",
    description: "Athletic wear for sports and active pursuits",
  },
}

export function getOccasionKeywords(occasion: string) {
  const normalized = occasion?.toLowerCase().trim() || "casual"
  console.log(`[v0] Occasion Keywords: Looking up "${occasion}" (normalized: "${normalized}")`)

  const result = OCCASION_KEYWORDS[normalized] || OCCASION_KEYWORDS["casual"]

  if (!OCCASION_KEYWORDS[normalized]) {
    console.warn(`[v0] Occasion Keywords: ⚠️  No match for "${occasion}", defaulting to "casual"`)
  } else {
    console.log(`[v0] Occasion Keywords: ✅ Found "${result.name}" with ${result.keywords.length} keywords`)
  }

  return result
}
