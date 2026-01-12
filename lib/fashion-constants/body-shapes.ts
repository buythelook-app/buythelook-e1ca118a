// Body shape rules based on original Lovable specification
// Body shapes: X (hourglass), V (inverted-triangle), H (rectangle), O (oval/apple), A (pear)

export type BodyShape = "X" | "V" | "H" | "O" | "A"

export interface BodyShapeRule {
  name: string
  description: string
  goals: string[]
  avoid: string[]
  tops: string[]
  bottoms: string[]
  shoes: string[]
  keywords: string[]
}

export const BODY_SHAPE_RULES: Record<BodyShape, BodyShapeRule> = {
  X: {
    // Hourglass - balanced bust and hips with defined waist
    name: "Hourglass (X-shape)",
    description: "Balanced bust and hips with defined waist. Goal: Accentuate the waist and show curves.",
    goals: ["accentuate waist", "show curves", "balance proportions"],
    avoid: ["loose tops", "boxy silhouettes", "shapeless clothing", "oversized items"],
    tops: ["fitted", "wrap", "belted", "v-neck", "scoop neck", "peplum"],
    bottoms: ["pencil skirts", "high-waist pants", "A-line", "fitted jeans", "wrap skirts"],
    shoes: ["heels", "pointed flats", "ankle boots", "strappy sandals"],
    keywords: ["fitted", "wrap", "belted", "defined waist", "curves", "tailored"],
  },

  A: {
    // Pear - wider hips than bust
    name: "Pear (A-shape)",
    description: "Wider hips than bust, defined waist. Goal: Balance by emphasizing shoulders and upper body.",
    goals: ["emphasize shoulders", "balance proportions", "draw attention up"],
    avoid: ["tight bottoms", "skinny jeans", "hip pockets", "tapered pants", "clingy skirts"],
    tops: ["boat neck", "off-shoulder", "detailed", "structured", "bright colors", "patterns"],
    bottoms: ["A-line skirts", "wide-leg pants", "dark colors", "straight cut", "bootcut"],
    shoes: ["nude heels", "pointed flats", "boots", "simple styles"],
    keywords: ["structured tops", "A-line", "wide-leg", "balance", "emphasize top"],
  },

  H: {
    // Rectangle - straight body with minimal curves
    name: "Rectangle (H-shape)",
    description: "Balanced bust, waist, and hips with minimal curves. Goal: Create curves and define waist.",
    goals: ["create curves", "define waist", "add dimension"],
    avoid: ["straight cuts", "shapeless clothing", "boxy items", "tube dresses"],
    tops: ["peplum", "ruffles", "textured", "layered", "belted", "wrap"],
    bottoms: ["textured", "patterned", "flared", "pleated", "detailed"],
    shoes: ["statement shoes", "heels", "embellished flats", "ankle straps"],
    keywords: ["textured", "peplum", "ruffles", "belted", "layers", "define waist"],
  },

  V: {
    // Inverted Triangle - broader shoulders than hips
    name: "Inverted Triangle (V-shape)",
    description: "Broader shoulders than hips. Goal: Balance by adding volume below and simplifying top.",
    goals: ["balance broad shoulders", "add volume below", "minimize shoulders"],
    avoid: ["shoulder pads", "tight tops", "boat necks", "cap sleeves", "bold patterns on top"],
    tops: ["V-neck", "scoop neck", "halter", "simple", "dark colors", "flowing"],
    bottoms: ["detailed", "patterned", "flared", "wide-leg", "bright colors", "A-line"],
    shoes: ["statement shoes", "embellished", "colorful", "detailed"],
    keywords: ["simple tops", "detailed bottoms", "V-neck", "flowing", "balance"],
  },

  O: {
    // Oval/Apple - fuller midsection
    name: "Oval (O-shape)",
    description: "Fuller midsection, narrower hips. Goal: Create vertical lines and elongate silhouette.",
    goals: ["elongate silhouette", "draw eyes up", "create vertical lines"],
    avoid: ["tight waists", "horizontal stripes", "belts at waist", "clingy fabrics", "crop tops"],
    tops: ["V-neck", "empire waist", "A-line", "flowing", "vertical details", "tunics"],
    bottoms: ["straight leg", "bootcut", "dark colors", "high-waist", "simple"],
    shoes: ["heels", "pointed", "simple", "elongating styles"],
    keywords: ["V-neck", "empire waist", "vertical lines", "flowing", "elongate"],
  },
}
