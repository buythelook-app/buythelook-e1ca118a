// Predefined color theory rules for skin tones
// Based on seasonal color analysis

export type SkinTone = "warm" | "cool" | "neutral"

export interface ColorPalette {
  description: string
  bestColors: string[]
  avoidColors: string[]
  neutrals: string[]
  metallics: string[]
  patterns: string[]
  searchKeywords: string[]
}

export const COLOR_PALETTES: Record<SkinTone, ColorPalette> = {
  warm: {
    description: "Golden, peachy, or yellow undertones",
    bestColors: [
      "coral",
      "peach",
      "orange",
      "rust",
      "terracotta",
      "olive",
      "moss green",
      "warm brown",
      "camel",
      "mustard",
      "golden yellow",
      "warm red",
      "tomato red",
    ],
    avoidColors: ["icy pink", "bright white", "stark black", "cool gray", "royal blue", "emerald green", "burgundy"],
    neutrals: ["cream", "beige", "camel", "brown", "warm gray", "ivory"],
    metallics: ["gold", "bronze", "copper", "rose gold"],
    patterns: ["warm florals", "earth tones", "autumn colors"],
    searchKeywords: [
      "coral",
      "rust",
      "olive",
      "camel",
      "terracotta",
      "peach",
      "golden",
      "bronze",
      "warm tones",
      "earth tones",
    ],
  },

  cool: {
    description: "Pink, red, or blue undertones",
    bestColors: [
      "navy",
      "royal blue",
      "emerald",
      "teal",
      "magenta",
      "fuchsia",
      "cool pink",
      "lavender",
      "charcoal",
      "pure white",
      "icy blue",
      "burgundy",
    ],
    avoidColors: ["orange", "rust", "mustard", "golden yellow", "warm brown", "peach", "terracotta"],
    neutrals: ["pure white", "charcoal", "cool gray", "black", "navy"],
    metallics: ["silver", "platinum", "white gold"],
    patterns: ["cool florals", "jewel tones", "winter colors"],
    searchKeywords: [
      "navy",
      "emerald",
      "fuchsia",
      "royal blue",
      "burgundy",
      "silver",
      "cool tones",
      "jewel tones",
      "charcoal",
    ],
  },

  neutral: {
    description: "Balanced undertones, can wear both warm and cool",
    bestColors: [
      "dusty rose",
      "soft teal",
      "jade",
      "mauve",
      "sage",
      "taupe",
      "slate blue",
      "soft coral",
      "muted purple",
      "warm gray",
      "cool beige",
    ],
    avoidColors: ["extremely bright colors", "overly saturated tones"],
    neutrals: ["beige", "taupe", "gray", "soft white", "charcoal"],
    metallics: ["gold", "silver", "rose gold", "mixed metals"],
    patterns: ["muted florals", "soft tones", "balanced colors"],
    searchKeywords: ["taupe", "sage", "dusty rose", "jade", "mauve", "neutral tones", "soft colors", "balanced colors"],
  },
}

// Helper function to get color keywords for skin tone
export function getColorKeywords(skinTone: SkinTone): string[] {
  return COLOR_PALETTES[skinTone]?.searchKeywords || []
}

// Helper function to validate color for skin tone
export function validateColorForSkinTone(
  skinTone: SkinTone,
  colors: string[],
): {
  score: number
  recommendations: string[]
} {
  const palette = COLOR_PALETTES[skinTone]
  if (!palette) return { score: 50, recommendations: [] }

  const colorsLower = colors.map((c) => c.toLowerCase())
  const recommendations: string[] = []
  let score = 50 // Base score

  // Check for best colors
  const hasBestColors = palette.bestColors.some((bc) => colorsLower.some((color) => color.includes(bc)))
  if (hasBestColors) score += 20
  else recommendations.push(`Try ${palette.bestColors.slice(0, 3).join(", ")} for your skin tone`)

  // Check for avoid colors
  const hasAvoidColors = palette.avoidColors.some((ac) => colorsLower.some((color) => color.includes(ac)))
  if (hasAvoidColors) {
    score -= 25
    recommendations.push(`Avoid ${palette.avoidColors.slice(0, 2).join(" and ")} with your skin tone`)
  }

  // Check for neutrals (always safe)
  const hasNeutrals = palette.neutrals.some((n) => colorsLower.some((color) => color.includes(n)))
  if (hasNeutrals) score += 5

  return { score: Math.max(0, Math.min(100, score)), recommendations }
}
