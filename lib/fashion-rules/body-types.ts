// Predefined body type styling rules based on fashion theory
// These rules ensure consistent, expert-level recommendations

export type BodyType = "hourglass" | "pear" | "apple" | "rectangle" | "inverted-triangle" | "athletic"

export interface BodyTypeRules {
  description: string
  emphasis: string[]
  avoid: string[]
  bestSilhouettes: string[]
  bestNecklines: string[]
  bestFits: string[]
  bestLengths: string[]
  fabricAdvice: string[]
  keywords: string[]
}

export const BODY_TYPE_RULES: Record<BodyType, BodyTypeRules> = {
  hourglass: {
    description: "Balanced bust and hips with defined waist",
    emphasis: ["waist", "curves"],
    avoid: ["boxy", "shapeless", "oversized", "drop-waist"],
    bestSilhouettes: ["fitted", "wrap", "belted", "bodycon", "fit-and-flare", "peplum"],
    bestNecklines: ["v-neck", "sweetheart", "scoop", "wrap"],
    bestFits: ["fitted", "tailored", "structured"],
    bestLengths: ["midi", "knee-length", "high-waisted"],
    fabricAdvice: ["structured fabrics", "medium weight", "fabrics that drape"],
    keywords: ["wrap dress", "fitted blazer", "high-waisted pants", "belted coat", "bodycon", "cinched waist"],
  },

  pear: {
    description: "Wider hips than bust, defined waist",
    emphasis: ["shoulders", "upper body", "bust"],
    avoid: ["tight bottoms", "hip pockets", "tapered pants", "clingy skirts"],
    bestSilhouettes: ["a-line", "fit-and-flare", "empire waist", "structured tops"],
    bestNecklines: ["boat neck", "off-shoulder", "wide neck", "v-neck"],
    bestFits: ["fitted top, flowing bottom", "structured shoulders", "bootcut"],
    bestLengths: ["above-knee skirts", "wide-leg pants", "bootcut"],
    fabricAdvice: ["structured tops", "flowing bottoms", "darker colors for lower body"],
    keywords: [
      "structured blazer",
      "off-shoulder top",
      "a-line skirt",
      "bootcut jeans",
      "wide-leg pants",
      "statement necklace",
    ],
  },

  apple: {
    description: "Fuller midsection, narrower hips",
    emphasis: ["legs", "shoulders", "bust"],
    avoid: ["clingy fabrics", "tight waists", "belts at waist", "cropped tops"],
    bestSilhouettes: ["empire waist", "a-line", "shift dress", "tunic"],
    bestNecklines: ["v-neck", "scoop", "cowl", "open collar"],
    bestFits: ["flowing", "draped", "structured shoulders"],
    bestLengths: ["above-knee", "midi", "tunic-length"],
    fabricAdvice: ["flowing fabrics", "structured shoulders", "vertical details"],
    keywords: ["empire waist dress", "tunic top", "v-neck", "open cardigan", "structured blazer", "straight-leg pants"],
  },

  rectangle: {
    description: "Balanced bust, waist, and hips with minimal curves",
    emphasis: ["waist", "curves", "definition"],
    avoid: ["straight cuts", "boxy shapes", "shapeless"],
    bestSilhouettes: ["belted", "peplum", "ruffled", "layered", "textured"],
    bestNecklines: ["sweetheart", "scoop", "cowl", "ruffled"],
    bestFits: ["belted", "cinched", "fitted with volume"],
    bestLengths: ["varied lengths", "high-waisted", "asymmetric"],
    fabricAdvice: ["textured fabrics", "patterns", "layers"],
    keywords: ["belted coat", "peplum top", "ruffled blouse", "high-waisted pants", "textured fabrics", "layered look"],
  },

  "inverted-triangle": {
    description: "Broader shoulders than hips",
    emphasis: ["lower body", "hips", "legs"],
    avoid: ["shoulder pads", "boat necks", "cap sleeves", "tight bottoms"],
    bestSilhouettes: ["a-line", "fit-and-flare", "wide-leg", "full skirts"],
    bestNecklines: ["v-neck", "scoop", "halter"],
    bestFits: ["fitted tops, voluminous bottoms", "bootcut", "wide-leg"],
    bestLengths: ["a-line skirts", "wide-leg pants", "palazzo"],
    fabricAdvice: ["simple tops", "detailed bottoms", "darker tops"],
    keywords: ["v-neck top", "wide-leg pants", "a-line skirt", "palazzo pants", "bootcut jeans", "statement belt"],
  },

  athletic: {
    description: "Muscular build with minimal curves",
    emphasis: ["waist", "femininity", "curves"],
    avoid: ["boxy", "shapeless", "too fitted"],
    bestSilhouettes: ["soft", "draped", "feminine details", "cinched waist"],
    bestNecklines: ["sweetheart", "cowl", "scoop", "wrap"],
    bestFits: ["soft fabrics", "flowing", "belted"],
    bestLengths: ["varied", "high-waisted", "midi"],
    fabricAdvice: ["soft fabrics", "draping", "feminine details"],
    keywords: ["wrap dress", "soft blazer", "draped top", "feminine details", "belted waist", "flowing fabrics"],
  },
}

// Helper function to get search keywords for body type
export function getBodyTypeKeywords(bodyType: BodyType): string[] {
  return BODY_TYPE_RULES[bodyType]?.keywords || []
}

// Helper function to validate outfit for body type
export function validateOutfitForBodyType(
  bodyType: BodyType,
  items: string[],
): {
  score: number
  recommendations: string[]
} {
  const rules = BODY_TYPE_RULES[bodyType]
  if (!rules) return { score: 50, recommendations: [] }

  const itemsLower = items.map((i) => i.toLowerCase())
  const recommendations: string[] = []
  let score = 50 // Base score

  // Check for best silhouettes
  const hasBestSilhouette = rules.bestSilhouettes.some((s) => itemsLower.some((item) => item.includes(s)))
  if (hasBestSilhouette) score += 15
  else recommendations.push(`Consider ${rules.bestSilhouettes.slice(0, 2).join(" or ")} silhouettes`)

  // Check for avoidance items
  const hasAvoidItems = rules.avoid.some((a) => itemsLower.some((item) => item.includes(a)))
  if (hasAvoidItems) {
    score -= 20
    recommendations.push(`Avoid ${rules.avoid.slice(0, 2).join(" and ")} for this body type`)
  }

  // Check for emphasis
  const emphasizesCorrectly = rules.emphasis.some((e) => itemsLower.some((item) => item.includes(e)))
  if (emphasizesCorrectly) score += 10

  return { score: Math.max(0, Math.min(100, score)), recommendations }
}
