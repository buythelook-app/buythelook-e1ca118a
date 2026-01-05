// Predefined style guidelines for each fashion aesthetic

export type StyleType =
  | "classic"
  | "romantic"
  | "dramatic"
  | "natural"
  | "bohemian"
  | "minimalist"
  | "edgy"
  | "preppy"
  | "sporty"
  | "elegant"
  | "casual"
  | "trendy"

export interface StyleGuide {
  description: string
  keyPieces: string[]
  silhouettes: string[]
  fabrics: string[]
  patterns: string[]
  accessories: string[]
  avoid: string[]
  searchKeywords: string[]
}

export const STYLE_GUIDELINES: Record<StyleType, StyleGuide> = {
  classic: {
    description: "Timeless, tailored, sophisticated",
    keyPieces: ["blazer", "trench coat", "pencil skirt", "white shirt", "black dress", "tailored pants"],
    silhouettes: ["tailored", "structured", "straight", "fitted"],
    fabrics: ["wool", "cotton", "silk", "cashmere", "tweed"],
    patterns: ["stripes", "houndstooth", "checks", "solids"],
    accessories: ["leather bag", "pearl earrings", "simple watch", "pumps"],
    avoid: ["overly trendy", "loud patterns", "distressed items"],
    searchKeywords: ["classic", "tailored", "timeless", "sophisticated", "structured", "elegant"],
  },

  romantic: {
    description: "Soft, feminine, delicate details",
    keyPieces: ["lace blouse", "floral dress", "soft cardigan", "ruffled top", "feminine skirt"],
    silhouettes: ["flowing", "soft", "draped", "fit-and-flare"],
    fabrics: ["chiffon", "lace", "silk", "satin", "soft cotton"],
    patterns: ["florals", "lace", "soft prints", "pastels"],
    accessories: ["delicate jewelry", "ribbons", "feminine shoes", "small bag"],
    avoid: ["harsh lines", "boxy shapes", "heavy fabrics"],
    searchKeywords: ["romantic", "feminine", "soft", "lace", "floral", "ruffled", "delicate"],
  },

  dramatic: {
    description: "Bold, striking, statement-making",
    keyPieces: ["statement coat", "bold dress", "structured jacket", "dramatic silhouette"],
    silhouettes: ["bold", "angular", "oversized", "architectural"],
    fabrics: ["leather", "structured fabrics", "bold textures"],
    patterns: ["bold prints", "geometric", "animal print", "color blocking"],
    accessories: ["statement jewelry", "bold bag", "dramatic shoes"],
    avoid: ["overly delicate", "soft pastels", "minimal styling"],
    searchKeywords: ["dramatic", "bold", "statement", "striking", "architectural", "powerful"],
  },

  bohemian: {
    description: "Free-spirited, relaxed, eclectic",
    keyPieces: ["maxi dress", "embroidered top", "fringe jacket", "peasant blouse", "wide-leg pants"],
    silhouettes: ["flowing", "relaxed", "layered", "loose"],
    fabrics: ["cotton", "linen", "crochet", "suede", "natural fibers"],
    patterns: ["paisley", "ethnic prints", "tie-dye", "florals"],
    accessories: ["layered jewelry", "wide-brim hat", "fringe bag", "sandals"],
    avoid: ["overly structured", "corporate", "minimalist"],
    searchKeywords: ["bohemian", "boho", "flowing", "embroidered", "fringe", "maxi", "relaxed"],
  },

  minimalist: {
    description: "Clean lines, simple, refined",
    keyPieces: ["simple tee", "straight-leg pants", "minimal dress", "structured coat"],
    silhouettes: ["clean", "straight", "simple", "refined"],
    fabrics: ["quality basics", "cotton", "wool", "simple textures"],
    patterns: ["solids", "minimal patterns", "monochrome"],
    accessories: ["simple jewelry", "structured bag", "classic shoes"],
    avoid: ["excessive details", "loud patterns", "over-accessorizing"],
    searchKeywords: ["minimalist", "simple", "clean", "refined", "minimal", "monochrome"],
  },

  edgy: {
    description: "Rock-inspired, bold, unconventional",
    keyPieces: ["leather jacket", "ripped jeans", "band tee", "combat boots", "studded items"],
    silhouettes: ["fitted", "asymmetric", "layered", "deconstructed"],
    fabrics: ["leather", "denim", "distressed fabrics", "metal details"],
    patterns: ["dark colors", "graphic prints", "grunge aesthetics"],
    accessories: ["chunky boots", "studded belt", "layered chains", "dark makeup"],
    avoid: ["overly feminine", "pastel colors", "delicate fabrics"],
    searchKeywords: ["edgy", "rock", "leather", "studded", "grunge", "bold", "dark"],
  },

  preppy: {
    description: "Polished, collegiate, classic American",
    keyPieces: ["polo shirt", "blazer", "chinos", "cable knit sweater", "button-down shirt"],
    silhouettes: ["tailored", "neat", "clean", "structured"],
    fabrics: ["cotton", "wool", "oxford cloth", "tweed"],
    patterns: ["stripes", "gingham", "argyle", "plaids"],
    accessories: ["loafers", "pearls", "leather belt", "tote bag"],
    avoid: ["overly casual", "distressed items", "grunge"],
    searchKeywords: ["preppy", "polished", "collegiate", "classic", "neat", "tailored"],
  },

  sporty: {
    description: "Athletic, comfortable, active",
    keyPieces: ["joggers", "sneakers", "athletic jacket", "tank top", "leggings"],
    silhouettes: ["relaxed", "fitted", "functional", "comfortable"],
    fabrics: ["jersey", "technical fabrics", "cotton", "stretch materials"],
    patterns: ["solid colors", "stripes", "athletic logos"],
    accessories: ["sneakers", "baseball cap", "sporty bag", "athletic watch"],
    avoid: ["overly formal", "restrictive clothing", "delicate fabrics"],
    searchKeywords: ["sporty", "athletic", "comfortable", "casual", "active", "relaxed"],
  },

  elegant: {
    description: "Refined, sophisticated, luxurious",
    keyPieces: ["silk blouse", "tailored dress", "elegant coat", "high-quality basics"],
    silhouettes: ["refined", "tailored", "graceful", "polished"],
    fabrics: ["silk", "cashmere", "fine wool", "luxury materials"],
    patterns: ["subtle patterns", "refined prints", "quality textures"],
    accessories: ["fine jewelry", "luxury bag", "classic heels"],
    avoid: ["overly casual", "cheap-looking fabrics", "loud patterns"],
    searchKeywords: ["elegant", "refined", "sophisticated", "luxurious", "polished", "graceful"],
  },

  casual: {
    description: "Comfortable, everyday, relaxed",
    keyPieces: ["jeans", "t-shirt", "sweater", "casual dress", "sneakers"],
    silhouettes: ["relaxed", "comfortable", "easy", "versatile"],
    fabrics: ["cotton", "denim", "jersey", "comfortable materials"],
    patterns: ["basic patterns", "everyday prints", "versatile colors"],
    accessories: ["casual bag", "sneakers", "simple jewelry"],
    avoid: ["overly formal", "restrictive clothing", "excessive accessories"],
    searchKeywords: ["casual", "comfortable", "relaxed", "everyday", "easy", "versatile"],
  },

  trendy: {
    description: "Fashion-forward, current, up-to-date",
    keyPieces: ["trending items", "statement pieces", "current season styles"],
    silhouettes: ["on-trend", "contemporary", "fashion-forward"],
    fabrics: ["trending materials", "modern fabrics", "innovative textures"],
    patterns: ["current prints", "trending patterns", "seasonal colors"],
    accessories: ["trendy items", "statement pieces", "current accessories"],
    avoid: ["outdated styles", "overly classic", "dated looks"],
    searchKeywords: ["trendy", "fashionable", "current", "on-trend", "contemporary", "modern"],
  },
}

// Helper function to get style keywords
export function getStyleKeywords(style: StyleType): string[] {
  return STYLE_GUIDELINES[style]?.searchKeywords || []
}

// Helper function to validate outfit for style
export function validateOutfitForStyle(
  style: StyleType,
  items: string[],
): {
  score: number
  recommendations: string[]
} {
  const guide = STYLE_GUIDELINES[style]
  if (!guide) return { score: 50, recommendations: [] }

  const itemsLower = items.map((i) => i.toLowerCase())
  const recommendations: string[] = []
  let score = 50 // Base score

  // Check for key pieces
  const hasKeyPieces = guide.keyPieces.some((kp) => itemsLower.some((item) => item.includes(kp)))
  if (hasKeyPieces) score += 15
  else recommendations.push(`Consider adding ${guide.keyPieces.slice(0, 2).join(" or ")}`)

  // Check for avoid items
  const hasAvoidItems = guide.avoid.some((a) => itemsLower.some((item) => item.includes(a)))
  if (hasAvoidItems) {
    score -= 15
    recommendations.push(`Avoid ${guide.avoid[0]} for ${style} style`)
  }

  // Check for appropriate fabrics
  const hasAppropFabrics = guide.fabrics.some((f) => itemsLower.some((item) => item.includes(f)))
  if (hasAppropFabrics) score += 10

  return { score: Math.max(0, Math.min(100, score)), recommendations }
}
