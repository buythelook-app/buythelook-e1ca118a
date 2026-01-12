/**
 * Style-specific product search keywords
 * Maps fashion styles to specific search terms and product attributes
 */

export const STYLE_KEYWORDS = {
  classic: {
    name: "Classic",
    keywords: ["timeless", "traditional", "elegant", "tailored", "refined", "sophisticated"],
    colors: ["navy", "black", "white", "camel", "gray", "beige"],
    patterns: ["solid", "pinstripe", "houndstooth"],
    avoid: ["trendy", "edgy", "distressed", "oversized"],
    description: "Timeless, elegant pieces that never go out of style",
  },
  romantic: {
    name: "Romantic",
    keywords: ["feminine", "soft", "delicate", "flowy", "lace", "ruffles", "floral"],
    colors: ["blush", "rose", "lavender", "cream", "soft-pink"],
    patterns: ["floral", "lace", "polka-dot"],
    avoid: ["masculine", "edgy", "harsh", "geometric"],
    description: "Soft, feminine styles with delicate details",
  },
  dramatic: {
    name: "Dramatic",
    keywords: ["bold", "statement", "striking", "angular", "structured", "high-contrast"],
    colors: ["black", "red", "white", "jewel-tones"],
    patterns: ["geometric", "bold-prints", "color-blocking"],
    avoid: ["subtle", "muted", "delicate", "pastel"],
    description: "Bold, striking pieces that make a statement",
  },
  bohemian: {
    name: "Bohemian",
    keywords: ["boho", "free-spirited", "flowy", "layered", "ethnic", "relaxed", "vintage"],
    colors: ["earthy", "rust", "olive", "burgundy", "mustard"],
    patterns: ["paisley", "tribal", "floral", "tie-dye"],
    avoid: ["structured", "formal", "sleek", "minimalist"],
    description: "Free-spirited, relaxed styles with artistic flair",
  },
  minimalist: {
    name: "Minimalist",
    keywords: ["simple", "clean", "sleek", "modern", "understated", "streamlined"],
    colors: ["black", "white", "gray", "nude", "navy"],
    patterns: ["solid", "monochrome"],
    avoid: ["busy", "ornate", "excessive-detail", "loud-prints"],
    description: "Clean, simple lines with understated elegance",
  },
  edgy: {
    name: "Edgy",
    keywords: ["rock", "leather", "studs", "bold", "unconventional", "modern", "street"],
    colors: ["black", "gray", "dark-colors", "metallics"],
    patterns: ["solid", "graphic", "animal-print"],
    avoid: ["romantic", "delicate", "preppy", "traditional"],
    description: "Bold, modern styles with an edge",
  },
  preppy: {
    name: "Preppy",
    keywords: ["collegiate", "polished", "traditional", "neat", "all-american"],
    colors: ["navy", "white", "red", "pink", "green"],
    patterns: ["stripes", "gingham", "plaid"],
    avoid: ["edgy", "bohemian", "grunge", "oversized"],
    description: "Polished, collegiate-inspired classic styles",
  },
  sporty: {
    name: "Sporty",
    keywords: ["athletic", "active", "casual", "comfortable", "functional", "sporty-chic"],
    colors: ["black", "white", "bright-colors", "neon"],
    patterns: ["solid", "color-blocking", "stripes"],
    avoid: ["formal", "delicate", "restrictive", "evening"],
    description: "Athletic-inspired comfortable casual wear",
  },
  elegant: {
    name: "Elegant",
    keywords: ["refined", "graceful", "sophisticated", "polished", "luxurious", "chic"],
    colors: ["black", "navy", "burgundy", "emerald", "champagne"],
    patterns: ["solid", "subtle-texture"],
    avoid: ["casual", "sporty", "distressed", "oversized"],
    description: "Refined, sophisticated pieces for polished looks",
  },
  casual: {
    name: "Casual",
    keywords: ["relaxed", "comfortable", "easy", "laid-back", "everyday"],
    colors: ["denim", "neutrals", "earth-tones"],
    patterns: ["solid", "simple-prints"],
    avoid: ["formal", "evening", "restrictive"],
    description: "Comfortable, easy everyday wear",
  },
  trendy: {
    name: "Trendy",
    keywords: ["current", "fashionable", "modern", "on-trend", "contemporary", "fashion-forward"],
    colors: ["seasonal-colors", "trending-colors"],
    patterns: ["current-trends"],
    avoid: ["dated", "outdated", "traditional"],
    description: "Current fashion-forward styles",
  },
  modern: {
    name: "Modern",
    keywords: ["contemporary", "current", "sleek", "updated", "fresh", "now", "sharp", "professional"],
    colors: ["monochrome", "neutrals", "bold-accents"],
    patterns: ["geometric", "abstract", "clean-lines"],
    avoid: ["vintage", "retro", "dated"],
    description: "Contemporary updated classic styles",
  },
  nordic: {
    name: "Nordic",
    keywords: ["scandinavian", "cozy", "nature-inspired", "clean", "simple", "warm", "organic", "neutral"],
    colors: ["white", "beige", "gray", "natural", "earth-tones", "soft-blue"],
    patterns: ["solid", "simple", "geometric", "nature-inspired"],
    avoid: ["loud", "flashy", "excessive-ornament", "tropical"],
    description: "Clean, cozy Scandinavian-inspired natural aesthetics",
  },
  bohochic: {
    name: "Boho Chic",
    keywords: ["boho", "free-spirited", "artistic", "earthy", "layered", "flowy", "vintage", "eclectic"],
    colors: ["earth-tones", "rust", "olive", "burgundy", "mustard", "terracotta"],
    patterns: ["paisley", "tribal", "floral", "tie-dye", "ethnic"],
    avoid: ["structured", "formal", "sleek", "corporate"],
    description: "Free-spirited artistic earthy bohemian style",
  },
} as const

export type StyleType = keyof typeof STYLE_KEYWORDS

export function getStyleKeywords(style: string): (typeof STYLE_KEYWORDS)[StyleType] | null {
  if (!style) return null

  const normalizedStyle = style?.toLowerCase().trim()

  // Direct match
  if (normalizedStyle in STYLE_KEYWORDS) {
    return STYLE_KEYWORDS[normalizedStyle as StyleType]
  }

  // Fuzzy match
  for (const [key, value] of Object.entries(STYLE_KEYWORDS)) {
    if (value.name.toLowerCase().includes(normalizedStyle) || normalizedStyle.includes(key)) {
      return value
    }
  }

  return null
}
