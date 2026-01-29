// ============================================================================
// OUTFIT PICKER V4 - WITH COLOR SCORING & VALIDATION
// ============================================================================
// This is the updated outfit-picker route that scores outfits on:
// - Color harmony (complementary/analogous/triadic)
// - Mood alignment (does color match mood palette)
// - Style match (does item match style palette)
// - Applies 35% color weight in diversity scoring
// ============================================================================

import { callOpenAI } from "@/lib/openai"
import { NextResponse } from "next/server"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import { BODY_TYPE_RULES, type BodyType } from "@/lib/fashion-rules/body-types"
import { COLOR_PALETTES, type SkinTone } from "@/lib/fashion-rules/color-theory"
import { STYLE_GUIDELINES, type StyleType } from "@/lib/fashion-rules/style-guidelines"

// ============================================================================
// COLOR SCORING SYSTEM (From color-system-v4.js)
// ============================================================================

interface ColorItem {
  hex: string
  name: string
}

interface AllowedColorPalette {
  top: ColorItem[]
  bottom: ColorItem[]
  shoes: ColorItem[]
  coat: ColorItem[]
}

interface ColorScore {
  score: number
  maxScore: number
  harmony: "excellent" | "good" | "acceptable" | "needs_improvement"
  moodAlignment: number
  styleMatch: number
  colorHarmony: number
  recommendations: string[] | null
}

const MOOD_PRIMARY_COLORS: Record<string, string[]> = {
  elegant: ["black", "white", "navy", "charcoal", "silver"],
  energized: ["orange", "gold", "red", "yellow", "white"],
  romantic: ["pink", "lavender", "blush", "white", "rose"],
  powerful: ["black", "burgundy", "navy", "red", "white"],
  calm: ["sky blue", "light blue", "white", "mint", "powder blue"],
  flowing: ["lavender", "khaki", "cream", "white", "beige"],
  optimist: ["gold", "orange", "yellow", "white", "cream"],
  mysterious: ["midnight blue", "indigo", "purple", "black", "dark slate"],
  sweet: ["pink", "blush", "white", "rose", "lavender"],
  passionate: ["crimson", "red", "dark red", "black", "white"],
  general: ["black", "white", "navy", "grey", "tan"]
}

const STYLE_PRIMARY_COLORS: Record<string, string[]> = {
  minimalist: ["white", "black", "grey", "cream", "navy"],
  classic: ["navy", "white", "brown", "tan", "black"],
  romantic: ["pink", "lavender", "white", "rose", "blush"],
  casual: ["white", "black", "navy", "blue", "tan"],
  elegant: ["black", "white", "navy", "silver", "grey"],
  sporty: ["black", "white", "blue", "orange", "green"],
  modern: ["black", "white", "grey", "navy", "blue"]
}

const NEUTRAL_COLORS = ["black", "white", "grey", "gray", "cream", "ivory", "tan", "beige", "navy", "charcoal"]

// ============================================================================
// STYLE-PRODUCT CONSISTENCY RULES (For title validation)
// ============================================================================

interface StyleProductRules {
  allowedShoeTypes: string[]
  disallowedShoeTypes: string[]
  titleKeywords: string[]  // Words that match this style
  conflictingKeywords: string[]  // Words that conflict with this style
}

const STYLE_PRODUCT_RULES: Record<string, StyleProductRules> = {
  casual: {
    allowedShoeTypes: ["sneaker", "flat", "loafer", "sandal", "espadrille", "mule", "slip-on", "canvas", "trainer"],
    disallowedShoeTypes: ["heel", "stiletto", "pump", "high heel", "platform heel", "kitten heel"],
    titleKeywords: ["casual", "relaxed", "effortless", "easy", "laid-back", "weekend", "everyday"],
    conflictingKeywords: ["formal", "elegant", "glamorous", "dressy", "sophisticated"]
  },
  sporty: {
    allowedShoeTypes: ["sneaker", "trainer", "athletic", "running", "flat", "sport"],
    disallowedShoeTypes: ["heel", "stiletto", "pump", "oxford", "loafer", "boot"],
    titleKeywords: ["sporty", "athletic", "active", "dynamic", "energetic"],
    conflictingKeywords: ["formal", "elegant", "romantic", "glamorous"]
  },
  elegant: {
    allowedShoeTypes: ["heel", "pump", "stiletto", "kitten heel", "oxford", "loafer", "mule"],
    disallowedShoeTypes: ["sneaker", "trainer", "athletic", "flip flop", "sport"],
    titleKeywords: ["elegant", "sophisticated", "refined", "polished", "chic"],
    conflictingKeywords: ["casual", "sporty", "athletic", "relaxed"]
  },
  classic: {
    allowedShoeTypes: ["pump", "loafer", "oxford", "flat", "kitten heel", "ballet", "mule", "heel"],
    disallowedShoeTypes: ["sneaker", "athletic", "flip flop", "sport", "trainer"],
    titleKeywords: ["classic", "timeless", "traditional", "refined", "polished"],
    conflictingKeywords: ["edgy", "sporty", "athletic", "trendy"]
  },
  romantic: {
    allowedShoeTypes: ["heel", "pump", "sandal", "flat", "ballet", "kitten heel", "mule", "strappy"],
    disallowedShoeTypes: ["sneaker", "athletic", "combat", "chunky", "sport"],
    titleKeywords: ["romantic", "feminine", "soft", "delicate", "dreamy", "sweet"],
    conflictingKeywords: ["edgy", "sporty", "athletic", "tough"]
  },
  minimalist: {
    allowedShoeTypes: ["flat", "loafer", "sneaker", "mule", "slip-on", "sandal", "oxford"],
    disallowedShoeTypes: ["embellished", "sparkle", "glitter", "chunky platform"],
    titleKeywords: ["minimal", "clean", "simple", "understated", "sleek"],
    conflictingKeywords: ["maximalist", "bold", "statement", "glamorous"]
  },
  glamorous: {
    allowedShoeTypes: ["heel", "stiletto", "pump", "platform", "strappy", "embellished"],
    disallowedShoeTypes: ["sneaker", "athletic", "flat", "loafer", "sport"],
    titleKeywords: ["glamorous", "glam", "luxe", "statement", "bold", "dazzling"],
    conflictingKeywords: ["casual", "minimal", "sporty", "relaxed"]
  },
  edgy: {
    allowedShoeTypes: ["boot", "combat", "platform", "chunky", "ankle boot", "heel", "sneaker"],
    disallowedShoeTypes: ["ballet", "delicate", "dainty", "kitten heel"],
    titleKeywords: ["edgy", "bold", "statement", "rock", "avant-garde", "fierce"],
    conflictingKeywords: ["romantic", "soft", "delicate", "sweet", "feminine"]
  },
  bohemian: {
    allowedShoeTypes: ["sandal", "flat", "espadrille", "boot", "ankle boot", "mule", "wedge"],
    disallowedShoeTypes: ["stiletto", "formal pump", "oxford", "athletic"],
    titleKeywords: ["boho", "bohemian", "free-spirited", "earthy", "relaxed", "artsy"],
    conflictingKeywords: ["formal", "corporate", "structured", "minimalist"]
  },
  preppy: {
    allowedShoeTypes: ["loafer", "oxford", "ballet", "flat", "boat shoe", "sneaker", "pump"],
    disallowedShoeTypes: ["stiletto", "platform", "combat", "chunky"],
    titleKeywords: ["preppy", "polished", "classic", "collegiate", "refined"],
    conflictingKeywords: ["edgy", "grunge", "bohemian", "street"]
  }
}

/**
 * Detect shoe formality level from product name/description
 */
function detectShoeFormality(shoeName: string): "casual" | "dressy" | "athletic" | "neutral" {
  const nameLower = shoeName.toLowerCase()
  
  const athleticIndicators = ["sneaker", "trainer", "athletic", "running", "sport", "gym"]
  const dressyIndicators = ["heel", "stiletto", "pump", "platform heel", "kitten", "strappy heel", "dress shoe"]
  const casualIndicators = ["flat", "sandal", "loafer", "slip-on", "canvas", "espadrille", "mule"]
  
  if (athleticIndicators.some(ind => nameLower.includes(ind))) return "athletic"
  if (dressyIndicators.some(ind => nameLower.includes(ind))) return "dressy"
  if (casualIndicators.some(ind => nameLower.includes(ind))) return "casual"
  
  return "neutral"
}

/**
 * Validate and fix outfit title to match actual products
 */
function validateOutfitTitle(
  originalTitle: string,
  products: { top: any, bottom: any, shoes: any },
  userStyle: string
): string {
  const shoeName = products.shoes?.name || ""
  const shoeFormality = detectShoeFormality(shoeName)
  const styleRules = STYLE_PRODUCT_RULES[userStyle.toLowerCase()] || STYLE_PRODUCT_RULES.classic
  
  let title = originalTitle
  const titleLower = title.toLowerCase()
  
  // Check for style-product conflicts
  const hasConflict = styleRules.conflictingKeywords.some(kw => titleLower.includes(kw))
  
  // Check if "casual" is in title but shoes are dressy
  if (titleLower.includes("casual") && shoeFormality === "dressy") {
    // Replace casual with more appropriate term
    title = title.replace(/casual/gi, "polished")
    title = title.replace(/relaxed/gi, "refined")
    title = title.replace(/effortless/gi, "elegant")
  }
  
  // Check if "sporty" is in title but shoes are heels
  if (titleLower.includes("sporty") && shoeFormality === "dressy") {
    title = title.replace(/sporty/gi, "dynamic")
    title = title.replace(/athletic/gi, "energetic")
  }
  
  // Check if "elegant" is in title but shoes are sneakers
  if (titleLower.includes("elegant") && shoeFormality === "athletic") {
    title = title.replace(/elegant/gi, "modern")
    title = title.replace(/sophisticated/gi, "contemporary")
  }
  
  // Check if "formal" is in title but shoes are casual/athletic
  if (titleLower.includes("formal") && (shoeFormality === "casual" || shoeFormality === "athletic")) {
    title = title.replace(/formal/gi, "smart")
  }
  
  return title
}

/**
 * Check color harmony between outfit pieces
 */
function checkColorHarmony(colors: string[]): number {
  if (colors.length < 2) return 100
  
  const validColors = colors.filter(Boolean).map(c => c.toLowerCase())
  
  // All neutrals = safe harmony
  const allNeutral = validColors.every(c => 
    NEUTRAL_COLORS.some(n => c.includes(n))
  )
  if (allNeutral) return 90
  
  // At least one neutral = good base
  const hasNeutral = validColors.some(c => 
    NEUTRAL_COLORS.some(n => c.includes(n))
  )
  
  // Check for clashing colors
  const warmColors = ["red", "orange", "yellow", "coral", "peach", "gold", "rust", "burgundy"]
  const coolColors = ["blue", "green", "purple", "teal", "navy", "lavender", "mint"]
  
  const hasWarm = validColors.some(c => warmColors.some(w => c.includes(w)))
  const hasCool = validColors.some(c => coolColors.some(w => c.includes(w)))
  
  // Mixed warm/cool without neutral = potential clash
  if (hasWarm && hasCool && !hasNeutral) {
    return 60
  }
  
  return hasNeutral ? 85 : 70
}

/**
 * Score outfit colors against mood palette
 */
function scoreMoodAlignment(colors: string[], mood: string): number {
  if (!mood) return 50
  
  const moodColors = MOOD_PRIMARY_COLORS[mood.toLowerCase()] || MOOD_PRIMARY_COLORS.general
  const validColors = colors.filter(Boolean).map(c => c.toLowerCase())
  
  let matches = 0
  validColors.forEach(color => {
    if (moodColors.some(mc => color.includes(mc) || mc.includes(color))) {
      matches++
    } else if (NEUTRAL_COLORS.some(n => color.includes(n))) {
      matches += 0.5 // Partial credit for neutrals
    }
  })
  
  return Math.min(100, Math.round((matches / validColors.length) * 100))
}

/**
 * Score outfit colors against style palette
 */
function scoreStyleMatch(colors: string[], style: string): number {
  if (!style) return 50
  
  const styleColors = STYLE_PRIMARY_COLORS[style.toLowerCase()] || STYLE_PRIMARY_COLORS.casual
  const validColors = colors.filter(Boolean).map(c => c.toLowerCase())
  
  let matches = 0
  validColors.forEach(color => {
    if (styleColors.some(sc => color.includes(sc) || sc.includes(color))) {
      matches++
    } else if (NEUTRAL_COLORS.some(n => color.includes(n))) {
      matches += 0.5
    }
  })
  
  return Math.min(100, Math.round((matches / validColors.length) * 100))
}

/**
 * Score outfit against allowed color palette
 */
function scoreAgainstAllowedPalette(
  outfit: { top?: { color?: string }, bottom?: { color?: string }, shoes?: { color?: string } },
  allowedPalette: AllowedColorPalette | null
): number {
  if (!allowedPalette) return 50
  
  let score = 0
  let count = 0
  
  const items = [
    { color: outfit.top?.color, allowed: allowedPalette.top },
    { color: outfit.bottom?.color, allowed: allowedPalette.bottom },
    { color: outfit.shoes?.color, allowed: allowedPalette.shoes }
  ]
  
  items.forEach(item => {
    if (!item.color || !item.allowed) return
    count++
    
    const colorLower = item.color.toLowerCase()
    const allowedNames = item.allowed.map(c => c.name?.toLowerCase()).filter(Boolean)
    
    if (allowedNames.some(name => colorLower.includes(name!) || name!.includes(colorLower))) {
      score += 100
    } else if (NEUTRAL_COLORS.some(n => colorLower.includes(n))) {
      score += 80 // Neutrals always acceptable
    } else {
      score += 30
    }
  })
  
  return count > 0 ? Math.round(score / count) : 50
}

/**
 * Full color scoring for an outfit
 */
function scoreOutfitColors(
  outfit: { top?: { color?: string }, bottom?: { color?: string }, shoes?: { color?: string } },
  allowedPalette: AllowedColorPalette | null,
  mood: string,
  style: string
): ColorScore {
  const colors = [
    outfit.top?.color,
    outfit.bottom?.color,
    outfit.shoes?.color
  ].filter(Boolean) as string[]
  
  const colorHarmony = checkColorHarmony(colors)
  const moodAlignment = scoreMoodAlignment(colors, mood)
  const styleMatch = scoreStyleMatch(colors, style)
  const paletteScore = scoreAgainstAllowedPalette(outfit, allowedPalette)
  
  // Weighted score: 35% color harmony, 25% mood, 20% style, 20% palette match
  const weightedScore = Math.round(
    (colorHarmony * 0.35) +
    (moodAlignment * 0.25) +
    (styleMatch * 0.20) +
    (paletteScore * 0.20)
  )
  
  const recommendations: string[] = []
  
  if (colorHarmony < 70) {
    recommendations.push("Consider adding a neutral piece for better color balance")
  }
  if (moodAlignment < 60) {
    const moodColors = MOOD_PRIMARY_COLORS[mood.toLowerCase()] || []
    recommendations.push(`For ${mood} mood, try colors like ${moodColors.slice(0, 3).join(", ")}`)
  }
  if (styleMatch < 60) {
    const styleColors = STYLE_PRIMARY_COLORS[style.toLowerCase()] || []
    recommendations.push(`For ${style} style, consider ${styleColors.slice(0, 3).join(", ")}`)
  }
  
  return {
    score: weightedScore,
    maxScore: 100,
    harmony: weightedScore >= 80 ? "excellent" : weightedScore >= 65 ? "good" : weightedScore >= 50 ? "acceptable" : "needs_improvement",
    colorHarmony,
    moodAlignment,
    styleMatch,
    recommendations: recommendations.length > 0 ? recommendations : null
  }
}

// ============================================================================
// DIVERSITY SCORING WITH 35% COLOR WEIGHT
// ============================================================================

interface Product {
  id: number | string
  name: string
  price: number
  brand?: string
  color?: string
  relevanceScore?: number
}

/**
 * Calculate diversity score for product selection
 * 35% color, 20% price, 15% brand, 15% name uniqueness, 15% relevance
 */
function calculateDiversityScore(
  product: Product,
  selectedProducts: Product[],
  preferredColors: string[]
): number {
  let score = 0
  
  // 35% - Color matching
  if (product.color) {
    const colorLower = product.color.toLowerCase()
    const matchesPreferred = preferredColors.some(pc => 
      colorLower.includes(pc.toLowerCase()) || pc.toLowerCase().includes(colorLower)
    )
    if (matchesPreferred) {
      score += 35
    } else if (NEUTRAL_COLORS.some(n => colorLower.includes(n))) {
      score += 25 // Neutrals get partial credit
    } else {
      score += 10
    }
  } else {
    score += 15 // Unknown color gets middle score
  }
  
  // 20% - Price diversity
  if (selectedProducts.length > 0) {
    const avgPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0) / selectedProducts.length
    const priceDiff = Math.abs(product.price - avgPrice)
    const priceScore = Math.min(20, (priceDiff / avgPrice) * 40)
    score += priceScore
  } else {
    score += 15
  }
  
  // 15% - Brand diversity
  if (product.brand && selectedProducts.length > 0) {
    const brandAlreadyUsed = selectedProducts.some(p => 
      p.brand?.toLowerCase() === product.brand?.toLowerCase()
    )
    score += brandAlreadyUsed ? 5 : 15
  } else {
    score += 10
  }
  
  // 15% - Name uniqueness
  if (product.name && selectedProducts.length > 0) {
    const nameWords = product.name.toLowerCase().split(/\s+/)
    const existingWords = selectedProducts.flatMap(p => 
      (p.name || "").toLowerCase().split(/\s+/)
    )
    const overlapCount = nameWords.filter(w => existingWords.includes(w)).length
    const uniqueness = 1 - (overlapCount / nameWords.length)
    score += Math.round(uniqueness * 15)
  } else {
    score += 10
  }
  
  // 15% - Relevance score pass-through
  if (product.relevanceScore) {
    score += Math.min(15, (product.relevanceScore / 100) * 15)
  } else {
    score += 7
  }
  
  return Math.round(score)
}

// ============================================================================
// MAIN ROUTE HANDLER
// ============================================================================

export async function POST(request: Request) {
  console.log(" Outfit Picker: Starting outfit generation")

  try {
    const { profile, products, styledProfile } = await request.json()

    console.log(" Outfit Picker: Profile received")
    console.log(" Outfit Picker: Styled Profile received:", !!styledProfile)
    
    // ========================================================================
    // NEW: Extract mood, style, and allowed colors from profile
    // ========================================================================
    
    const mood = profile.mood || "general"
    const style = profile.style || profile.styleKeywords?.aesthetic?.[0] || "casual"
    const allowedColors: AllowedColorPalette | null = profile.allowedColors || null
    
    console.log(" Outfit Picker: ========================================")
    console.log(" Outfit Picker: COLOR SCORING ENABLED")
    console.log(" Outfit Picker: ========================================")
    console.log(" Outfit Picker: Mood:", mood)
    console.log(" Outfit Picker: Style:", style)
    console.log(" Outfit Picker: Allowed Colors Palette:", allowedColors ? "✅ Present" : "❌ Missing")
    if (allowedColors) {
      console.log(" Outfit Picker: Allowed Top Colors:", allowedColors.top?.map(c => c.name).join(", "))
      console.log(" Outfit Picker: Allowed Bottom Colors:", allowedColors.bottom?.map(c => c.name).join(", "))
      console.log(" Outfit Picker: Allowed Shoe Colors:", allowedColors.shoes?.map(c => c.name).join(", "))
    }
    console.log(" Outfit Picker: ========================================")

    // ========================================================================
    // EXISTING: Image validation
    // ========================================================================

    const hasValidImage = (product: any) => {
      if (!product) return false
      if (product.image && product.image !== "/placeholder.svg" && product.image.trim() !== "") return true
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        return product.images.some((img: string) => img && img !== "/placeholder.svg" && img.trim() !== "")
      }
      return false
    }

    const originalCounts = {
      tops: products.tops?.length || 0,
      bottoms: products.bottoms?.length || 0,
      shoes: products.shoes?.length || 0,
    }

    products.tops = products.tops?.filter(hasValidImage) || []
    products.bottoms = products.bottoms?.filter(hasValidImage) || []
    products.shoes = products.shoes?.filter(hasValidImage) || []

    const filteredCounts = {
      tops: products.tops.length,
      bottoms: products.bottoms.length,
      shoes: products.shoes.length,
    }

    console.log(" Outfit Picker: Image validation completed")
    console.log(` Outfit Picker: Tops ${originalCounts.tops} → ${filteredCounts.tops}`)
    console.log(` Outfit Picker: Bottoms ${originalCounts.bottoms} → ${filteredCounts.bottoms}`)
    console.log(` Outfit Picker: Shoes ${originalCounts.shoes} → ${filteredCounts.shoes}`)

    // ========================================================================
    // NEW: Apply diversity scoring with 35% color weight to pre-sort products
    // ========================================================================
    
    const preferredColors = allowedColors 
      ? [
          ...allowedColors.top.map(c => c.name),
          ...allowedColors.bottom.map(c => c.name),
          ...allowedColors.shoes.map(c => c.name)
        ]
      : profile.colorStrategy?.primary || ["black", "white", "navy"]
    
    console.log(" Outfit Picker: Preferred colors for diversity scoring:", preferredColors.slice(0, 5).join(", "))
    
    // Score and sort products by diversity score
    const scoreAndSort = (productList: Product[], selected: Product[] = []) => {
      return productList
        .map(p => ({
          ...p,
          diversityScore: calculateDiversityScore(p, selected, preferredColors)
        }))
        .sort((a, b) => (b.diversityScore || 0) - (a.diversityScore || 0))
    }
    
    products.tops = scoreAndSort(products.tops)
    products.bottoms = scoreAndSort(products.bottoms)
    products.shoes = scoreAndSort(products.shoes)
    
    console.log(" Outfit Picker: Products re-scored with 35% color weight")

    // ========================================================================
    // EXISTING: Fetch feedback history
    // ========================================================================

    let feedbackHistory = ""
    if (styledProfile && styledProfile.user_id) {
      console.log(" Outfit Picker: Fetching feedback history for user:", styledProfile.user_id)
      const { data: feedbackData } = await supabaseAuth
        .from("generated_outfits")
        .select("name, is_liked, feedback_reason, feedback_text, why_it_works")
        .eq("user_id", styledProfile.user_id)
        .not("is_liked", "is", null)
        .order("created_at", { ascending: false })
        .limit(10)

      if (feedbackData && feedbackData.length > 0) {
        const likes = feedbackData
          .filter((f) => f.is_liked)
          .map((f) => `- Liked \"${f.name}\": ${f.feedback_reason || "General"}`)
          .join("\n")
        const dislikes = feedbackData
          .filter((f) => !f.is_liked)
          .map((f) => `- Disliked \"${f.name}\": ${f.feedback_reason || "General"}`)
          .join("\n")

        feedbackHistory = `
USER FEEDBACK HISTORY:
LIKED: ${likes || "None"}
DISLIKED (AVOID): ${dislikes || "None"}
`
      }
    }

    // ========================================================================
    // EXISTING: Prepare top products for OpenAI
    // ========================================================================

    const productsNeeded = Math.min(products.tops.length, 15)
    
    const topProducts = {
      tops: products.tops.slice(0, productsNeeded).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        brand: p.brand,
        color: p.color,
        description: p.description?.substring(0, 100) || "",
        relevanceScore: p.relevanceScore,
        diversityScore: p.diversityScore
      })),
      bottoms: products.bottoms.slice(0, productsNeeded).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        brand: p.brand,
        color: p.color,
        description: p.description?.substring(0, 100) || "",
        relevanceScore: p.relevanceScore,
        diversityScore: p.diversityScore
      })),
      shoes: products.shoes.slice(0, productsNeeded).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        brand: p.brand,
        color: p.color,
        description: p.description?.substring(0, 100) || "",
        relevanceScore: p.relevanceScore,
        diversityScore: p.diversityScore
      })),
    }

    // ========================================================================
    // EXISTING: Get fashion rules
    // ========================================================================

    const bodyType = (styledProfile?.body_type?.toLowerCase() || profile.bodyProfile?.shape?.toLowerCase() || "hourglass") as BodyType
    const skinTone = (styledProfile?.skin_tone?.toLowerCase() || "neutral") as SkinTone
    const stylePreference = style as StyleType

    const bodyRules = BODY_TYPE_RULES[bodyType] || BODY_TYPE_RULES["hourglass"]
    const colorRules = COLOR_PALETTES[skinTone] || COLOR_PALETTES["neutral"]
    const styleRules = STYLE_GUIDELINES[stylePreference] || STYLE_GUIDELINES["casual"]

    // ========================================================================
    // NEW: Add color palette context to prompt
    // ========================================================================

    const colorPaletteSection = allowedColors ? `
🎨 ALLOWED COLOR PALETTE (MUST PRIORITIZE THESE):
- TOPS: ${allowedColors.top.map(c => c.name).join(", ")}
- BOTTOMS: ${allowedColors.bottom.map(c => c.name).join(", ")}
- SHOES: ${allowedColors.shoes.map(c => c.name).join(", ")}

COLOR SCORING WEIGHT: 35% - Outfits will be scored heavily on color matching!
Select products that match these allowed colors for higher scores.
` : ""

    const userSelectedColors = profile.colorStrategy?.primary || []

    const prompt = `You are an expert personal stylist creating outfits from a curated product selection.

MOOD: ${mood.toUpperCase()}
STYLE: ${style.toUpperCase()}
${colorPaletteSection}

CLIENT PROFILE:
- Body Shape: ${profile.bodyProfile?.shape || "hourglass"}
- Style: ${profile.styleKeywords?.aesthetic?.join(", ") || style}
- Occasion: ${profile.occasionGuidelines?.occasion || "everyday"}
- Budget: ${profile.priceRange?.min || 50}-${profile.priceRange?.max || 200} per outfit

BODY TYPE RULES (${bodyType.toUpperCase()}):
- EMPHASIZE: ${bodyRules.emphasis.join(", ")}
- AVOID: ${bodyRules.avoid.join(", ")}

${feedbackHistory}

AVAILABLE PRODUCTS (Sorted by diversity score - higher = better color match):

TOPS (${topProducts.tops.length} options):
${JSON.stringify(topProducts.tops, null, 2)}

BOTTOMS (${topProducts.bottoms.length} options):
${JSON.stringify(topProducts.bottoms, null, 2)}

SHOES (${topProducts.shoes.length} options):
${JSON.stringify(topProducts.shoes, null, 2)}

🚨 CRITICAL REQUIREMENTS 🚨
1. ZERO PRODUCT REUSE - Each ID used only once across all 9 outfits
2. PRIORITIZE higher diversityScore products (they match preferred colors better)
3. Each outfit total price MUST be within budget
4. Create 9 COMPLETELY DIFFERENT outfits

🏷️ NAMING RULES - TITLES MUST MATCH PRODUCTS:
- If shoes are heels/pumps/stilettos → DO NOT use "casual", "relaxed", "effortless" in title
- If shoes are sneakers/trainers → DO NOT use "elegant", "formal", "sophisticated" in title  
- If shoes are flats/loafers → CAN use "casual", "polished", "refined"
- The outfit name should accurately describe the FORMALITY LEVEL of the actual items selected
- Example: Heels + dress = "Elegant Evening" NOT "Casual Chic"
- Example: Sneakers + jeans = "Relaxed Weekend" NOT "Sophisticated Style"

Return ONLY valid JSON with 9 outfits:
{
  "outfits": [
    {
      "outfitNumber": 1,
      "name": "Creative outfit name that matches product formality",
      "top": { "id": 67780 },
      "bottom": { "id": 65808 },
      "shoes": { "id": 68798 },
      "totalPrice": 165,
      "withinBudget": true,
      "whyItWorks": "Color harmony explanation + body type fit",
      "colorScore": 85,
      "stylistNotes": ["Color tip", "Styling tip"],
      "confidenceScore": 90
    }
  ]
}`

    console.log(" Outfit Picker: Calling OpenAI for 9 outfit generation...")
    const response = await callOpenAI({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      responseFormat: "json_object",
      temperature: 0.8,
    })

    console.log(" Outfit Picker: OpenAI response received")
    const outfitData = JSON.parse(response)

    // ========================================================================
    // EXISTING: Duplicate removal
    // ========================================================================

    const usedIds = { tops: new Set(), bottoms: new Set(), shoes: new Set() }
    let totalDuplicates = 0
    
    outfitData.outfits.forEach((outfit: any, index: number) => {
      const checks = [
        { type: 'TOP', id: outfit.top?.id, set: usedIds.tops },
        { type: 'BOTTOM', id: outfit.bottom?.id, set: usedIds.bottoms },
        { type: 'SHOES', id: outfit.shoes?.id, set: usedIds.shoes }
      ]
      
      checks.forEach(check => {
        if (check.id && check.set.has(check.id)) {
          totalDuplicates++
        } else if (check.id) {
          check.set.add(check.id)
        }
      })
    })
    
    if (totalDuplicates > 0) {
      console.warn(` Outfit Picker: Found ${totalDuplicates} duplicates - fixing...`)
      
      usedIds.tops.clear()
      usedIds.bottoms.clear()
      usedIds.shoes.clear()
      
      outfitData.outfits.forEach((outfit: any, index: number) => {
        if (outfit.top?.id && usedIds.tops.has(outfit.top.id)) {
          const unusedTop = topProducts.tops.find((t: any) => !usedIds.tops.has(t.id))
          if (unusedTop) outfit.top.id = unusedTop.id
        }
        if (outfit.top?.id) usedIds.tops.add(outfit.top.id)
        
        if (outfit.bottom?.id && usedIds.bottoms.has(outfit.bottom.id)) {
          const unusedBottom = topProducts.bottoms.find((b: any) => !usedIds.bottoms.has(b.id))
          if (unusedBottom) outfit.bottom.id = unusedBottom.id
        }
        if (outfit.bottom?.id) usedIds.bottoms.add(outfit.bottom.id)
        
        if (outfit.shoes?.id && usedIds.shoes.has(outfit.shoes.id)) {
          const unusedShoe = topProducts.shoes.find((s: any) => !usedIds.shoes.has(s.id))
          if (unusedShoe) outfit.shoes.id = unusedShoe.id
        }
        if (outfit.shoes?.id) usedIds.shoes.add(outfit.shoes.id)
      })
    }

    // ========================================================================
    // EXISTING + NEW: Enrich outfits with full product data + color scores
    // ========================================================================

    const topMap = new Map(products.tops.map((p: any) => [p.id, p]))
    const bottomMap = new Map(products.bottoms.map((p: any) => [p.id, p]))
    const shoeMap = new Map(products.shoes.map((p: any) => [p.id, p]))

    const enrichedOutfits = outfitData.outfits
      .map((outfit: any, index: number) => {
        const topProduct = topMap.get(outfit.top?.id)
        const bottomProduct = bottomMap.get(outfit.bottom?.id)
        const shoesProduct = shoeMap.get(outfit.shoes?.id)

        if (!topProduct || !bottomProduct || !shoesProduct) {
          console.warn(` Outfit Picker: Missing product in outfit ${outfit.outfitNumber}`)
          return null
        }

        const totalPrice = topProduct.price + bottomProduct.price + shoesProduct.price
        const withinBudget = totalPrice >= (profile.priceRange?.min || 50) && 
                            totalPrice <= (profile.priceRange?.max || 200)

        // ================================================================
        // NEW: Calculate color score for this outfit
        // ================================================================
        const colorScoreResult = scoreOutfitColors(
          {
            top: { color: topProduct.color },
            bottom: { color: bottomProduct.color },
            shoes: { color: shoesProduct.color }
          },
          allowedColors,
          mood,
          style
        )

        console.log(` Outfit ${index + 1} Color Score: ${colorScoreResult.score} (${colorScoreResult.harmony})`)
        
        if (colorScoreResult.recommendations) {
          console.log(`   Recommendations: ${colorScoreResult.recommendations.join("; ")}`)
        }

        // ================================================================
        // NEW: Validate and fix outfit title to match products
        // ================================================================
        const validatedName = validateOutfitTitle(
          outfit.name,
          { top: topProduct, bottom: bottomProduct, shoes: shoesProduct },
          style
        )
        
        if (validatedName !== outfit.name) {
          console.log(` Outfit ${index + 1} Title Fixed: "${outfit.name}" → "${validatedName}"`)
        }

        return {
          id: `outfit-${index + 1}`,
          name: validatedName,  // Use validated name
          totalPrice: totalPrice,
          withinBudget: withinBudget,
          qualityScore: outfit.confidenceScore || 90,
          
          // NEW: Color scoring results
          colorScore: colorScoreResult.score,
          colorHarmony: colorScoreResult.harmony,
          colorDetails: {
            harmonyScore: colorScoreResult.colorHarmony,
            moodAlignment: colorScoreResult.moodAlignment,
            styleMatch: colorScoreResult.styleMatch
          },
          colorRecommendations: colorScoreResult.recommendations,
          
          items: [
            {
              id: topProduct.id,
              name: topProduct.name,
              brand: topProduct.brand,
              price: topProduct.price,
              images: topProduct.images || [topProduct.image],
              image: topProduct.image,
              url: topProduct.url,
              product_url: topProduct.product_url || topProduct.url,
              color: topProduct.color,
              description: topProduct.description,
              category: "top",
            },
            {
              id: bottomProduct.id,
              name: bottomProduct.name,
              brand: bottomProduct.brand,
              price: bottomProduct.price,
              images: bottomProduct.images || [bottomProduct.image],
              image: bottomProduct.image,
              url: bottomProduct.url,
              product_url: bottomProduct.product_url || bottomProduct.url,
              color: bottomProduct.color,
              description: bottomProduct.description,
              category: "bottom",
            },
            {
              id: shoesProduct.id,
              name: shoesProduct.name,
              brand: shoesProduct.brand,
              price: shoesProduct.price,
              images: shoesProduct.images || [shoesProduct.image],
              image: shoesProduct.image,
              url: shoesProduct.url,
              product_url: shoesProduct.product_url || shoesProduct.url,
              color: shoesProduct.color,
              description: shoesProduct.description,
              category: "shoes",
            },
          ],
          whyItWorks: outfit.whyItWorks,
          stylistNotes: outfit.stylistNotes,
        }
      })
      .filter(Boolean)

    // ========================================================================
    // NEW: Log color scoring summary
    // ========================================================================
    
    console.log(" Outfit Picker: ========================================")
    console.log(" Outfit Picker: COLOR SCORING SUMMARY")
    console.log(" Outfit Picker: ========================================")
    
    const avgColorScore = enrichedOutfits.reduce((sum: number, o: any) => sum + (o.colorScore || 0), 0) / enrichedOutfits.length
    const excellentCount = enrichedOutfits.filter((o: any) => o.colorHarmony === "excellent").length
    const goodCount = enrichedOutfits.filter((o: any) => o.colorHarmony === "good").length
    
    console.log(` Outfit Picker: Average Color Score: ${Math.round(avgColorScore)}`)
    console.log(` Outfit Picker: Excellent harmony: ${excellentCount}/9`)
    console.log(` Outfit Picker: Good harmony: ${goodCount}/9`)
    console.log(" Outfit Picker: ========================================")

    return NextResponse.json({
      success: true,
      outfits: enrichedOutfits,
      colorSummary: {
        averageScore: Math.round(avgColorScore),
        excellentCount,
        goodCount,
        mood,
        style
      }
    })
  } catch (error: any) {
    console.error(" Outfit Picker: Error occurred:", error)
    return NextResponse.json({ error: "Outfit generation failed", details: error.message }, { status: 500 })
  }
}
