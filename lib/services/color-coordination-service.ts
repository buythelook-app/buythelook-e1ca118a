// Color coordination logic from original specification
// Checks if colors harmonize BETWEEN items in an outfit

export class ColorCoordinationService {
  // Color families for same-family matching
  private static COLOR_FAMILIES = [
    ["blue", "navy", "cobalt", "azure", "turquoise"],
    ["red", "crimson", "burgundy", "maroon"],
    ["pink", "rose", "blush", "coral"],
    ["green", "emerald", "olive", "sage", "mint"],
    ["purple", "violet", "lavender", "plum"],
    ["yellow", "gold", "mustard", "amber"],
    ["orange", "coral", "peach", "terracotta"],
    ["brown", "tan", "beige", "camel", "khaki"],
  ]

  // Neutral colors that match everything
  private static NEUTRALS = ["black", "white", "gray", "beige", "brown", "cream", "ivory", "charcoal", "navy"]

  // Complementary color pairs (opposite on color wheel)
  private static COMPLEMENTARY_PAIRS = [
    ["blue", "orange"],
    ["red", "green"],
    ["yellow", "purple"],
    ["navy", "rust"],
    ["teal", "coral"],
  ]

  /**
   * Main color compatibility check
   * Returns true if two colors work well together in an outfit
   */
  static areColorsCompatible(color1: string, color2: string): boolean {
    const c1 = color1.toLowerCase()
    const c2 = color2.toLowerCase()

    // Rule 1: Neutrals match everything
    if (this.NEUTRALS.some((n) => c1.includes(n)) || this.NEUTRALS.some((n) => c2.includes(n))) {
      return true
    }

    // Rule 2: Same color family
    if (this.isSameColorFamily(c1, c2)) {
      return true
    }

    // Rule 3: Complementary colors
    if (this.areComplementaryColors(c1, c2)) {
      return true
    }

    // Rule 4: Analogous colors (next to each other on color wheel)
    if (this.areAnalogousColors(c1, c2)) {
      return true
    }

    return false
  }

  /**
   * Check if two colors belong to the same color family
   */
  private static isSameColorFamily(color1: string, color2: string): boolean {
    return this.COLOR_FAMILIES.some(
      (family) => family.some((c) => color1.includes(c)) && family.some((c) => color2.includes(c)),
    )
  }

  /**
   * Check if two colors are complementary (opposite on color wheel)
   */
  private static areComplementaryColors(color1: string, color2: string): boolean {
    return this.COMPLEMENTARY_PAIRS.some(
      ([c1, c2]) => (color1.includes(c1) && color2.includes(c2)) || (color1.includes(c2) && color2.includes(c1)),
    )
  }

  /**
   * Check if two colors are analogous (adjacent on color wheel)
   */
  private static areAnalogousColors(color1: string, color2: string): boolean {
    const analogousSets = [
      ["blue", "green", "teal"],
      ["red", "orange", "pink"],
      ["yellow", "green", "lime"],
      ["purple", "pink", "magenta"],
      ["orange", "yellow", "gold"],
    ]

    return analogousSets.some((set) => set.some((c) => color1.includes(c)) && set.some((c) => color2.includes(c)))
  }

  /**
   * Validate outfit colors and return a score (0-100)
   * Used by quality checker for programmatic validation
   */
  static validateOutfitColors(colors: string[]): number {
    const result = this.checkOutfitColorHarmony(colors)
    return result.score
  }

  /**
   * Check color harmony for an entire outfit (all items)
   */
  static checkOutfitColorHarmony(colors: string[]): {
    score: number
    feedback: string
  } {
    const uniqueColors = [...new Set(colors.map((c) => c.toLowerCase()))]
    let score = 60 // Base score

    // Check compatibility between consecutive items
    for (let i = 0; i < colors.length - 1; i++) {
      if (this.areColorsCompatible(colors[i], colors[i + 1])) {
        score += 10
      }
    }

    // Bonus for having a neutral base
    const hasNeutral = this.NEUTRALS.some((n) => colors.some((c) => c.toLowerCase().includes(n)))
    if (hasNeutral) score += 10

    // Penalty for too many colors
    if (uniqueColors.length > 3) score -= 15

    score = Math.min(100, Math.max(0, score))

    return {
      score,
      feedback:
        score >= 80
          ? "Excellent color harmony"
          : score >= 60
            ? "Good color coordination"
            : "Colors may clash - consider adjustment",
    }
  }
}
