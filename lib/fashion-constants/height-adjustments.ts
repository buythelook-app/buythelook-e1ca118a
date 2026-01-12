/**
 * Height-specific fit and proportion recommendations
 * Maps height ranges to specific fit preferences and styling rules
 */

export const HEIGHT_ADJUSTMENTS = {
  petite: {
    name: "Petite (Under 5'4\")",
    heightRange: { min: 0, max: 64 }, // in inches
    fitPreferences: {
      tops: ["cropped", "fitted", "tailored", "petite-sizing"],
      bottoms: ["high-waisted", "ankle-length", "petite-inseam", "cropped"],
      dresses: ["above-knee", "midi", "petite-length"],
      outerwear: ["cropped-jackets", "fitted-coats"],
      avoid: ["oversized", "floor-length", "drop-waist", "long-tunics"],
    },
    proportionRules: {
      emphasize: ["vertical-lines", "monochrome", "fitted-silhouettes", "high-waist"],
      avoid: ["horizontal-stripes", "drop-waist", "bulky-layers", "ankle-straps"],
      hemLength: "Show ankles or legs to create length",
      rise: "High-rise or mid-rise to elongate legs",
    },
    keywords: ["petite", "cropped", "fitted", "high-waisted", "ankle-length", "tailored"],
    description: "Fitted, proportioned pieces that create vertical lines",
  },
  average: {
    name: "Average (5'4\" - 5'7\")",
    heightRange: { min: 64, max: 67 },
    fitPreferences: {
      tops: ["regular-fit", "standard-length"],
      bottoms: ["regular-inseam", "full-length", "standard"],
      dresses: ["knee-length", "midi", "maxi"],
      outerwear: ["regular-length"],
      avoid: [],
    },
    proportionRules: {
      emphasize: ["balanced-proportions", "defined-waist"],
      avoid: [],
      hemLength: "Standard lengths work well",
      rise: "Mid-rise or high-rise for best proportion",
    },
    keywords: ["regular-fit", "standard-length", "classic-fit"],
    description: "Standard proportions work well for most styles",
  },
  tall: {
    name: "Tall (5'8\"+)",
    heightRange: { min: 68, max: 999 },
    fitPreferences: {
      tops: ["longer-length", "tall-sizing", "extended-torso"],
      bottoms: ["long-inseam", "extra-long", "tall-length"],
      dresses: ["maxi", "full-length", "tall-sizing"],
      outerwear: ["long-coats", "extended-sleeves"],
      avoid: ["cropped-tops", "ankle-pants", "short-jackets"],
    },
    proportionRules: {
      emphasize: ["horizontal-details", "layering", "maxi-lengths", "wide-leg"],
      avoid: ["very-short-hems", "cropped-everything", "tiny-details"],
      hemLength: "Can wear full-length and maxi styles",
      rise: "Mid-rise to low-rise for balanced proportions",
    },
    keywords: ["tall", "long-length", "extended", "maxi", "full-length"],
    description: "Longer lengths and extended proportions for tall frames",
  },
} as const

export type HeightCategory = keyof typeof HEIGHT_ADJUSTMENTS

export function getHeightCategory(heightInInches: number): HeightCategory {
  if (heightInInches < 64) return "petite"
  if (heightInInches >= 68) return "tall"
  return "average"
}

export function getHeightAdjustments(heightInInches: number) {
  const category = getHeightCategory(heightInInches)
  return HEIGHT_ADJUSTMENTS[category]
}

// Helper to convert height from quiz format to inches
export function parseHeight(height: string | number): number {
  if (typeof height === "number") return height

  // Handle formats like "5'4", "5'4\"", "64", etc.
  const feetInches = height.match(/(\d+)'(\d+)/)
  if (feetInches) {
    return Number.parseInt(feetInches[1]) * 12 + Number.parseInt(feetInches[2])
  }

  return Number.parseInt(height) || 66 // default to 5'6"
}
