// Style-based color palettes from original Lovable specification

export interface StyleColorPalette {
  colors: string[]
  description: string
}

export const STYLE_COLORS: Record<string, StyleColorPalette> = {
  minimalist: {
    colors: ["white", "black", "gray", "beige", "cream", "navy"],
    description: "Clean, simple palette with neutral tones",
  },
  classic: {
    colors: ["navy", "white", "black", "gray", "brown", "camel"],
    description: "Timeless, traditional colors that never go out of style",
  },
  romantic: {
    colors: ["pink", "lavender", "cream", "rose", "peach", "soft blue"],
    description: "Soft, feminine colors with gentle tones",
  },
  modern: {
    colors: ["black", "white", "gray", "metallic", "neon", "bold"],
    description: "Contemporary palette with striking contrasts",
  },
  bohemian: {
    colors: ["terracotta", "rust", "mustard", "olive", "cream", "earth tones"],
    description: "Earthy, natural colors with warm undertones",
  },
  boho: {
    colors: ["terracotta", "rust", "mustard", "olive", "cream"],
    description: "Free-spirited, earthy colors with bohemian flair",
  },
  sporty: {
    colors: ["blue", "red", "gray", "black", "neon", "white"],
    description: "Athletic, active colors with high energy",
  },
  edgy: {
    colors: ["black", "charcoal", "burgundy", "olive", "leather brown"],
    description: "Bold, dark colors with edge and attitude",
  },
  elegant: {
    colors: ["black", "navy", "white", "burgundy", "champagne", "gold"],
    description: "Refined, sophisticated colors for formal occasions",
  },
  casual: {
    colors: ["denim", "white", "gray", "khaki", "olive", "navy"],
    description: "Comfortable, everyday colors for relaxed style",
  },
  preppy: {
    colors: ["navy", "white", "pink", "green", "yellow", "striped"],
    description: "Clean, collegiate colors with classic appeal",
  },
  trendy: {
    colors: ["seasonal", "bold", "mixed", "statement", "fashion-forward"],
    description: "Current fashion colors that change with trends",
  },
}

export function getStyleColors(style: string): StyleColorPalette {
  return STYLE_COLORS[style?.toLowerCase()] || STYLE_COLORS["casual"]
}
