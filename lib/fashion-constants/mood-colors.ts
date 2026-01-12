// Mood-based color palettes from original Lovable specification

export interface MoodColorPalette {
  colors: string[]
  description: string
}

export const MOOD_COLORS: Record<string, MoodColorPalette> = {
  confident: {
    colors: ["black", "navy", "white", "charcoal", "burgundy"],
    description: "Bold, strong colors that project confidence and authority",
  },
  elegant: {
    colors: ["black", "navy", "white", "burgundy", "gold", "charcoal"],
    description: "Sophisticated, timeless colors for elegant occasions",
  },
  romantic: {
    colors: ["pink", "rose", "lavender", "soft blue", "cream", "peach"],
    description: "Soft, feminine colors that create a romantic mood",
  },
  energetic: {
    colors: ["red", "orange", "yellow", "bright blue", "coral"],
    description: "Vibrant, energizing colors that stand out",
  },
  calm: {
    colors: ["light blue", "mint", "sage", "soft gray", "powder blue"],
    description: "Soothing, peaceful colors for a relaxed vibe",
  },
  playful: {
    colors: ["pink", "yellow", "turquoise", "coral", "lime"],
    description: "Fun, cheerful colors that express personality",
  },
  powerful: {
    colors: ["black", "red", "royal blue", "emerald", "deep purple"],
    description: "Strong, commanding colors that make a statement",
  },
  casual: {
    colors: ["denim", "white", "gray", "khaki", "olive", "navy"],
    description: "Relaxed, everyday colors for casual settings",
  },
}

export function getMoodColors(mood: string): MoodColorPalette {
  return MOOD_COLORS[mood?.toLowerCase()] || MOOD_COLORS["confident"]
}
