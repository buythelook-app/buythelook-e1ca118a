// ============================================================================
// profile-builder/route.ts - V4 UPDATE
// ============================================================================
// CHANGES:
// 1. Accept 'mood' and 'style' from quiz data
// 2. Call generateAllowedColorPalette() to create HEX targets
// 3. Output 'allowedColors' in profile for supabase-products to use
// ============================================================================

import { callOpenAI } from "@/lib/openai"
import { NextResponse } from "next/server"

// ============================================================================
// V4 COLOR SYSTEM (Copy from server_IMPROVED.js or import)
// ============================================================================

const MOOD_COLOR_MAPPING = {
  elegant: {
    hexPalette: {
      top: ["#000000", "#FFFFFF", "#2C3E50", "#1A1A1A", "#708090"],
      bottom: ["#000000", "#2C3E50", "#1A1A1A", "#4A4A4A", "#FFFFFF"],
      shoes: ["#000000", "#1A1A1A", "#8B4513", "#2C3E50"],
      coat: ["#000000", "#2C3E50", "#1A1A1A", "#FFFFFF", "#708090"]
    }
  },
  energized: {
    hexPalette: {
      top: ["#FF4500", "#FFD700", "#FF6347", "#FFA500", "#FFFFFF"],
      bottom: ["#000000", "#FFFFFF", "#2C3E50", "#1A1A1A"],
      shoes: ["#FFFFFF", "#000000", "#FF4500", "#FFD700"],
      coat: ["#FF4500", "#FFD700", "#000000", "#FFFFFF"]
    }
  },
  romantic: {
    hexPalette: {
      top: ["#FFB6C1", "#E6E6FA", "#FFC0CB", "#FFFFFF", "#F5DEB3"],
      bottom: ["#FFFFFF", "#F5F5DC", "#FFE4E1", "#E6E6FA"],
      shoes: ["#FFB6C1", "#FFFFFF", "#D2B48C", "#DDA0DD"],
      coat: ["#FFB6C1", "#E6E6FA", "#FFFFFF", "#FFC0CB"]
    }
  },
  powerful: {
    hexPalette: {
      top: ["#000000", "#800020", "#2C3E50", "#FFFFFF", "#1A1A1A"],
      bottom: ["#000000", "#2C3E50", "#1A1A1A", "#191970"],
      shoes: ["#000000", "#800020", "#8B4513", "#2C3E50"],
      coat: ["#000000", "#800020", "#2C3E50", "#1A1A1A"]
    }
  },
  calm: {
    hexPalette: {
      top: ["#87CEEB", "#E0FFFF", "#B0E0E6", "#FFFFFF", "#F0FFF0"],
      bottom: ["#FFFFFF", "#F5F5F5", "#E0FFFF", "#F0FFF0"],
      shoes: ["#FFFFFF", "#D2B48C", "#87CEEB", "#B0E0E6"],
      coat: ["#87CEEB", "#E0FFFF", "#FFFFFF", "#B0E0E6"]
    }
  },
  flowing: {
    hexPalette: {
      top: ["#E6E6FA", "#F0E68C", "#FAFAD2", "#FFFFFF", "#FFEFD5"],
      bottom: ["#FFFFFF", "#FFF8DC", "#FAF0E6", "#F5F5DC"],
      shoes: ["#D2B48C", "#DEB887", "#F5DEB3", "#FFFFFF"],
      coat: ["#E6E6FA", "#FAFAD2", "#FFFFFF", "#FAF0E6"]
    }
  },
  optimist: {
    hexPalette: {
      top: ["#FFD700", "#FFA500", "#FFFFFF", "#F0E68C", "#FFFACD"],
      bottom: ["#FFFFFF", "#F5F5DC", "#FFFACD", "#000000"],
      shoes: ["#FFFFFF", "#FFD700", "#D2B48C", "#FFA500"],
      coat: ["#FFD700", "#FFA500", "#FFFFFF", "#F0E68C"]
    }
  },
  mysterious: {
    hexPalette: {
      top: ["#191970", "#2F4F4F", "#4B0082", "#000000", "#301934"],
      bottom: ["#000000", "#191970", "#2F4F4F", "#1A1A1A"],
      shoes: ["#000000", "#191970", "#4B0082", "#2F4F4F"],
      coat: ["#191970", "#2F4F4F", "#4B0082", "#000000"]
    }
  },
  sweet: {
    hexPalette: {
      top: ["#FFB6C1", "#FFC0CB", "#FFFFFF", "#FFE4E1", "#FFF0F5"],
      bottom: ["#FFFFFF", "#FFE4E1", "#FFF0F5", "#F5F5DC"],
      shoes: ["#FFB6C1", "#FFFFFF", "#FFC0CB", "#D2B48C"],
      coat: ["#FFB6C1", "#FFC0CB", "#FFFFFF", "#FFE4E1"]
    }
  },
  passionate: {
    hexPalette: {
      top: ["#DC143C", "#FF0000", "#8B0000", "#000000", "#FFFFFF"],
      bottom: ["#000000", "#1A1A1A", "#2C3E50", "#FFFFFF"],
      shoes: ["#000000", "#DC143C", "#8B0000", "#8B4513"],
      coat: ["#DC143C", "#8B0000", "#000000", "#B22222"]
    }
  },
  general: {
    hexPalette: {
      top: ["#000000", "#FFFFFF", "#2C3E50", "#808080", "#D3D3D3"],
      bottom: ["#000000", "#FFFFFF", "#2C3E50", "#808080", "#1A1A1A"],
      shoes: ["#000000", "#FFFFFF", "#8B4513", "#2C3E50"],
      coat: ["#000000", "#2C3E50", "#808080", "#FFFFFF"]
    }
  }
}

const STYLE_COLOR_MAPPING = {
  classic: {
    description: "Timeless, elegant, and structured",
    preferredColors: ["navy", "black", "white", "gray", "brown", "beige"],
    fullPalette: ["#1C2541", "#2C3E50", "#34495E", "#5D4E37", "#8B4513", "#722F37", "#2E4A3E", "#F5F5DC", "#FFFFF0", "#FFFFFF", "#1A1A1A", "#708090", "#D4C4A8", "#4A4A4A", "#8B7355"],
    colorNames: ["dark navy", "blue-gray", "deep gray", "camel brown", "saddle brown", "burgundy", "forest green", "beige", "ivory", "white", "black", "slate gray", "light khaki", "charcoal", "walnut"],
    hexPalette: {
      top: ["#FFFFFF", "#2C3E50", "#1A1A1A", "#F5F5DC", "#708090"],
      bottom: ["#2C3E50", "#1A1A1A", "#8B4513", "#D4C4A8", "#4A4A4A"],
      shoes: ["#8B4513", "#1A1A1A", "#2C3E50", "#D4C4A8", "#722F37"],
      coat: ["#2C3E50", "#8B4513", "#1A1A1A", "#D4C4A8", "#722F37"]
    }
  },
  romantic: {
    description: "Soft, feminine, and dreamy",
    preferredColors: ["pink", "rose", "cream", "lavender", "soft blue", "white"],
    fullPalette: ["#FFB6C1", "#FFC0CB", "#FF69B4", "#DB7093", "#C71585", "#E6E6FA", "#DDA0DD", "#D8BFD8", "#FFE4E1", "#FFF0F5", "#FFDAB9", "#F5DEB3", "#FFFACD", "#FAF0E6", "#FDF5E6"],
    colorNames: ["light pink", "pink", "hot pink", "pale violet red", "medium violet red", "lavender", "plum", "thistle", "misty rose", "lavender blush", "peach puff", "wheat", "lemon chiffon", "linen", "old lace"],
    hexPalette: {
      top: ["#FFB6C1", "#FFC0CB", "#E6E6FA", "#FFFFFF", "#FFE4E1"],
      bottom: ["#FFFFFF", "#F5DEB3", "#FFE4E1", "#FFC0CB", "#FAF0E6"],
      shoes: ["#FFB6C1", "#FFFFFF", "#D8BFD8", "#E6E6FA", "#FFDAB9"],
      coat: ["#FFB6C1", "#E6E6FA", "#FFFFFF", "#FFC0CB", "#DDA0DD"]
    }
  },
  minimalist: {
    description: "Simple, clean, and essential-focused",
    preferredColors: ["black", "white", "gray", "beige", "navy", "cream", "stone", "charcoal"],
    fullPalette: ["#000000", "#1A1A1A", "#2D2D2D", "#4A4A4A", "#6B6B6B", "#8C8C8C", "#A8A8A8", "#C4C4C4", "#E0E0E0", "#F0F0F0", "#FAFAFA", "#FFFFFF", "#E8DCD0", "#D3C4B5", "#C2B8A3"],
    colorNames: ["pure black", "near black", "dark charcoal", "charcoal", "dark gray", "gray", "medium gray", "light gray", "silver", "off-white", "broken white", "pure white", "greige", "taupe", "stone"],
    hexPalette: {
      top: ["#FFFFFF", "#000000", "#808080", "#F0F0F0", "#E8DCD0"],
      bottom: ["#000000", "#FFFFFF", "#4A4A4A", "#1A1A1A", "#2C3E50"],
      shoes: ["#000000", "#FFFFFF", "#808080", "#D3C4B5", "#1A1A1A"],
      coat: ["#000000", "#FFFFFF", "#4A4A4A", "#2C3E50", "#E8DCD0"]
    }
  },
  casual: {
    description: "Relaxed, everyday, and comfortable",
    preferredColors: ["blue", "denim", "gray", "white", "khaki", "brown", "green", "beige", "navy", "black", "red", "olive", "tan", "burgundy", "coral", "teal"],
    fullPalette: ["#4169E1", "#6495ED", "#87CEEB", "#708090", "#556B2F", "#6B8E23", "#8FBC8F", "#F5DEB3", "#D2B48C", "#BC8F8F", "#CD853F", "#A0522D", "#FFFFF0", "#FFFAF0", "#FAF0E6", "#DEB887", "#B22222", "#2F4F4F"],
    colorNames: ["royal blue", "cornflower blue", "sky blue", "slate gray", "dark olive", "olive drab", "dark sea green", "wheat", "tan", "rosy brown", "peru", "sienna", "ivory", "floral white", "linen", "burlywood", "firebrick", "dark slate gray"],
    hexPalette: {
      top: ["#FFFFFF", "#000000", "#4169E1", "#708090", "#6B8E23"],
      bottom: ["#000000", "#2C3E50", "#D2B48C", "#4169E1", "#556B2F"],
      shoes: ["#FFFFFF", "#000000", "#D2B48C", "#8B4513", "#708090"],
      coat: ["#2C3E50", "#000000", "#708090", "#8B4513", "#556B2F"]
    }
  },
  elegant: {
    description: "Sophisticated, refined, and luxurious",
    preferredColors: ["black", "navy", "gray", "burgundy", "white", "gold"],
    fullPalette: ["#000000", "#1A1A1A", "#2C3E50", "#191970", "#4A4A4A", "#800020", "#722F37", "#C0C0C0", "#FFD700", "#FFFFFF", "#708090", "#36454F", "#F5F5F5", "#D4AF37", "#B8860B"],
    colorNames: ["black", "near black", "navy", "midnight blue", "charcoal", "burgundy", "wine", "silver", "gold", "white", "slate", "charcoal", "off-white", "metallic gold", "dark gold"],
    hexPalette: {
      top: ["#000000", "#FFFFFF", "#2C3E50", "#C0C0C0", "#708090"],
      bottom: ["#000000", "#2C3E50", "#1A1A1A", "#FFFFFF", "#4A4A4A"],
      shoes: ["#000000", "#1A1A1A", "#8B4513", "#C0C0C0", "#FFD700"],
      coat: ["#000000", "#2C3E50", "#1A1A1A", "#C0C0C0", "#800020"]
    }
  },
  sporty: {
    description: "Athletic, dynamic, and active",
    preferredColors: ["blue", "black", "white", "red", "gray", "green"],
    fullPalette: ["#00BFFF", "#1E90FF", "#00CED1", "#20B2AA", "#3CB371", "#32CD32", "#7FFF00", "#ADFF2F", "#FFFF00", "#FFD700", "#FFA500", "#FF4500", "#FFFFFF", "#000000", "#C0C0C0", "#FF6B6B"],
    colorNames: ["deep sky blue", "dodger blue", "dark turquoise", "light sea green", "medium sea green", "lime green", "chartreuse", "green yellow", "yellow", "gold", "orange", "orange red", "white", "black", "silver", "coral"],
    hexPalette: {
      top: ["#000000", "#FFFFFF", "#1E90FF", "#FF4500", "#32CD32"],
      bottom: ["#000000", "#2C3E50", "#1E90FF", "#FFFFFF", "#4A4A4A"],
      shoes: ["#FFFFFF", "#000000", "#1E90FF", "#FF4500", "#32CD32"],
      coat: ["#000000", "#2C3E50", "#1E90FF", "#FFFFFF", "#FF4500"]
    }
  },
  boohoo: {
    description: "Bold, trendy, and statement-making",
    preferredColors: ["red", "pink", "purple", "blue", "green", "gold", "orange"],
    fullPalette: ["#FF0000", "#FF4500", "#FF6347", "#FF1493", "#FF00FF", "#8B008B", "#9400D3", "#8A2BE2", "#4B0082", "#0000FF", "#00CED1", "#00FF7F", "#ADFF2F", "#FFD700", "#FFA500", "#DC143C"],
    colorNames: ["pure red", "orange red", "tomato", "deep pink", "magenta", "dark magenta", "dark violet", "blue violet", "indigo", "pure blue", "dark turquoise", "spring green", "green yellow", "gold", "orange", "crimson"],
    hexPalette: {
      top: ["#FF1493", "#FF0000", "#8A2BE2", "#FFD700", "#FFFFFF"],
      bottom: ["#000000", "#0000FF", "#4B0082", "#FFFFFF", "#1A1A1A"],
      shoes: ["#FF1493", "#FFD700", "#000000", "#FF0000", "#8A2BE2"],
      coat: ["#FF0000", "#8A2BE2", "#000000", "#FFD700", "#FF1493"]
    }
  },
  nordic: {
    description: "Clean, cozy, and nature-inspired",
    preferredColors: ["white", "cream", "gray", "beige", "soft blue", "forest green"],
    fullPalette: ["#FFFFFF", "#F5F5F5", "#FAFAFA", "#F5F5DC", "#E8DCD0", "#D3C4B5", "#C4C4C4", "#A8A8A8", "#808080", "#87CEEB", "#B0E0E6", "#2E4A3E", "#3CB371", "#556B2F", "#8FBC8F"],
    colorNames: ["white", "white smoke", "snow", "beige", "greige", "taupe", "light gray", "medium gray", "gray", "sky blue", "powder blue", "forest green", "medium sea green", "dark olive", "dark sea green"],
    hexPalette: {
      top: ["#FFFFFF", "#F5F5DC", "#E8DCD0", "#87CEEB", "#2E4A3E"],
      bottom: ["#FFFFFF", "#F5F5F5", "#E8DCD0", "#C4C4C4", "#556B2F"],
      shoes: ["#FFFFFF", "#D3C4B5", "#8B4513", "#2E4A3E", "#808080"],
      coat: ["#E8DCD0", "#2E4A3E", "#FFFFFF", "#D3C4B5", "#556B2F"]
    }
  },
  bohemian: {
    description: "Free-spirited, artistic, and earthy",
    preferredColors: ["brown", "tan", "cream", "rust", "olive", "terracotta"],
    fullPalette: ["#8B4513", "#D2691E", "#CD853F", "#DEB887", "#F4A460", "#D2B48C", "#BC8F8F", "#A0522D", "#556B2F", "#6B8E23", "#808000", "#F5DEB3", "#FAEBD7", "#FFE4C4", "#E8DCD0"],
    colorNames: ["saddle brown", "chocolate", "peru", "burlywood", "sandy brown", "tan", "rosy brown", "sienna", "dark olive green", "olive drab", "olive", "wheat", "antique white", "bisque", "greige"],
    hexPalette: {
      top: ["#DEB887", "#F5DEB3", "#FFFFFF", "#F4A460", "#D2691E"],
      bottom: ["#8B4513", "#D2691E", "#DEB887", "#556B2F", "#D2B48C"],
      shoes: ["#8B4513", "#D2B48C", "#DEB887", "#CD853F", "#A0522D"],
      coat: ["#DEB887", "#8B4513", "#D2691E", "#F4A460", "#556B2F"]
    }
  },
  edgy: {
    description: "Bold, unconventional, and rebellious",
    preferredColors: ["black", "red", "silver", "purple", "dark gray"],
    fullPalette: ["#000000", "#1A1A1A", "#2D2D2D", "#DC143C", "#8B0000", "#4B0082", "#800080", "#C0C0C0", "#A9A9A9", "#696969", "#FFFFFF", "#B22222", "#8B008B", "#483D8B", "#2F4F4F"],
    colorNames: ["black", "near black", "dark charcoal", "crimson", "dark red", "indigo", "purple", "silver", "dark gray", "dim gray", "white", "firebrick", "dark magenta", "dark slate blue", "dark slate gray"],
    hexPalette: {
      top: ["#000000", "#1A1A1A", "#DC143C", "#FFFFFF", "#4B0082"],
      bottom: ["#000000", "#1A1A1A", "#2C3E50", "#696969", "#2D2D2D"],
      shoes: ["#000000", "#1A1A1A", "#DC143C", "#C0C0C0", "#4B0082"],
      coat: ["#000000", "#1A1A1A", "#DC143C", "#2C3E50", "#4B0082"]
    }
  },
  glamorous: {
    description: "Luxurious, sparkly, and show-stopping",
    preferredColors: ["gold", "silver", "black", "white", "red"],
    fullPalette: ["#FFD700", "#D4AF37", "#B8860B", "#C0C0C0", "#A9A9A9", "#000000", "#1A1A1A", "#FFFFFF", "#F5F5F5", "#DC143C", "#8B0000", "#800020", "#E6E6FA", "#DDA0DD", "#FF69B4"],
    colorNames: ["gold", "metallic gold", "dark goldenrod", "silver", "dark gray", "black", "near black", "white", "white smoke", "crimson", "dark red", "burgundy", "lavender", "plum", "hot pink"],
    hexPalette: {
      top: ["#FFD700", "#C0C0C0", "#000000", "#FFFFFF", "#D4AF37"],
      bottom: ["#000000", "#FFFFFF", "#2C3E50", "#1A1A1A", "#C0C0C0"],
      shoes: ["#FFD700", "#C0C0C0", "#000000", "#D4AF37", "#DC143C"],
      coat: ["#FFD700", "#C0C0C0", "#000000", "#FFFFFF", "#800020"]
    }
  },
  preppy: {
    description: "Classic, polished, and collegiate",
    preferredColors: ["navy", "white", "red", "green", "khaki", "pink"],
    fullPalette: ["#000080", "#2C3E50", "#FFFFFF", "#DC143C", "#228B22", "#006400", "#F0E68C", "#D2B48C", "#FFB6C1", "#FFC0CB", "#87CEEB", "#F5F5DC", "#FFFFF0", "#8B4513", "#B22222"],
    colorNames: ["navy", "dark navy", "white", "crimson", "forest green", "dark green", "khaki", "tan", "light pink", "pink", "sky blue", "beige", "ivory", "saddle brown", "firebrick"],
    hexPalette: {
      top: ["#FFFFFF", "#000080", "#228B22", "#DC143C", "#FFB6C1"],
      bottom: ["#000080", "#2C3E50", "#D2B48C", "#FFFFFF", "#F0E68C"],
      shoes: ["#8B4513", "#D2B48C", "#000080", "#FFFFFF", "#228B22"],
      coat: ["#000080", "#228B22", "#DC143C", "#2C3E50", "#FFFFFF"]
    }
  },
  modern: {
    description: "Contemporary, sleek, and fashion-forward",
    preferredColors: ["black", "white", "gray", "navy", "steel blue"],
    fullPalette: ["#000000", "#1A1A1A", "#2D2D2D", "#FFFFFF", "#F5F5F5", "#808080", "#A9A9A9", "#C0C0C0", "#2C3E50", "#34495E", "#4682B4", "#5F9EA0", "#708090", "#778899", "#B0C4DE"],
    colorNames: ["black", "near black", "dark charcoal", "white", "white smoke", "gray", "dark gray", "silver", "navy", "dark slate", "steel blue", "cadet blue", "slate gray", "light slate gray", "light steel blue"],
    hexPalette: {
      top: ["#000000", "#FFFFFF", "#808080", "#2C3E50", "#4682B4"],
      bottom: ["#000000", "#2C3E50", "#808080", "#FFFFFF", "#1A1A1A"],
      shoes: ["#000000", "#FFFFFF", "#808080", "#2C3E50", "#4682B4"],
      coat: ["#000000", "#2C3E50", "#808080", "#FFFFFF", "#4682B4"]
    }
  }
}

const HEX_TO_COLOR_NAME: Record<string, string> = {
  "#000000": "black", "#1A1A1A": "black", "#2C3E50": "navy", "#4A4A4A": "charcoal",
  "#FFFFFF": "white", "#F5F5F5": "white", "#F5F5DC": "cream", "#FFF8DC": "cream",
  "#808080": "grey", "#C0C0C0": "silver", "#708090": "slate",
  "#DC143C": "crimson", "#800020": "burgundy", "#8B0000": "dark red",
  "#FFB6C1": "light pink", "#FFC0CB": "pink", "#E6E6FA": "lavender",
  "#FF4500": "orange", "#FFA500": "orange", "#FFD700": "gold",
  "#4682B4": "steel blue", "#87CEEB": "sky blue", "#4169E1": "royal blue",
  "#228B22": "forest green", "#32CD32": "lime green",
  "#8B4513": "brown", "#D2B48C": "tan", "#DEB887": "burlywood"
}

function hexToColorName(hex: string): string {
  if (!hex) return "neutral"
  const normalized = hex.toUpperCase()
  if (HEX_TO_COLOR_NAME[normalized]) return HEX_TO_COLOR_NAME[normalized]
  
  const r = parseInt(normalized.slice(1, 3), 16)
  const g = parseInt(normalized.slice(3, 5), 16)
  const b = parseInt(normalized.slice(5, 7), 16)
  
  if (r > 200 && g > 200 && b > 200) return "white"
  if (r < 50 && g < 50 && b < 50) return "black"
  if (r > g && r > b) return "red"
  if (g > r && g > b) return "green"
  if (b > r && b > g) return "blue"
  return "grey"
}

function colorNameToHex(colorName: string): string | null {
  const nameToHex: Record<string, string> = {
    // Basic colors
    black: "#000000", white: "#FFFFFF", navy: "#2C3E50", grey: "#808080", gray: "#808080",
    red: "#DC143C", blue: "#4682B4", green: "#228B22", pink: "#FFB6C1",
    purple: "#800080", orange: "#FFA500", yellow: "#FFD700", brown: "#8B4513",
    cream: "#F5F5DC", beige: "#F5F5DC", burgundy: "#800020", gold: "#FFD700",
    silver: "#C0C0C0", tan: "#D2B48C", coral: "#FF6347",
    // Extended colors (V4 FIX)
    lavender: "#E6E6FA", plum: "#DDA0DD", violet: "#EE82EE",
    teal: "#008080", turquoise: "#40E0D0", mint: "#98FF98",
    olive: "#808000", khaki: "#F0E68C", chartreuse: "#7FFF00",
    salmon: "#FA8072", peach: "#FFCBA4", rose: "#FF007F",
    indigo: "#4B0082", magenta: "#FF00FF", crimson: "#DC143C",
    maroon: "#800000", chocolate: "#D2691E", sienna: "#A0522D",
    ivory: "#FFFFF0", linen: "#FAF0E6", wheat: "#F5DEB3"
  }
  return nameToHex[colorName?.toLowerCase()] || null
}

interface ColorEntry {
  hex: string
  name: string
}

interface AllowedColors {
  top: ColorEntry[]
  bottom: ColorEntry[]
  shoes: ColorEntry[]
  coat: ColorEntry[]
}

// ============================================================================
// OCCASION → MOOD MAPPING (V4 FIX!)
// Auto-detect mood from occasion when mood is not explicitly set
// ============================================================================
const OCCASION_TO_MOOD_MAPPING: Record<string, string> = {
  date: "romantic",
  wedding: "elegant",
  party: "energized",
  club: "passionate",
  interview: "powerful",
  work: "elegant",
  business: "powerful",
  vacation: "optimist",
  beach: "calm",
  brunch: "sweet",
  dinner: "elegant",
  casual: "general",
  everyday: "general",
  workout: "energized",
  formal: "elegant",
  cocktail: "glamorous"
}

function generateAllowedColorPalette(options: { mood?: string; style?: string; userColors?: string[]; occasion?: string }): AllowedColors {
  const { mood = 'general', style = 'casual', userColors = [], occasion = 'everyday' } = options
  
  // ✅ FIX #1: Auto-detect mood from occasion if mood is "general"
  let effectiveMood = mood.toLowerCase()
  if (effectiveMood === 'general' && occasion) {
    const occasionMood = OCCASION_TO_MOOD_MAPPING[occasion.toLowerCase()]
    if (occasionMood) {
      effectiveMood = occasionMood
      console.log(`   🎯 Auto-detected mood "${effectiveMood}" from occasion "${occasion}"`)
    }
  }
  
  const moodPalette = (MOOD_COLOR_MAPPING as any)[effectiveMood]?.hexPalette || MOOD_COLOR_MAPPING.general.hexPalette
  const stylePalette = (STYLE_COLOR_MAPPING as any)[style.toLowerCase()]?.hexPalette || STYLE_COLOR_MAPPING.casual.hexPalette
  
  const result: AllowedColors = { top: [], bottom: [], shoes: [], coat: [] }
  
  // ✅ FIX #2: Convert user color names to HEX FIRST
  const userHexColors = userColors.map(c => {
    if (c.startsWith('#')) return c.toUpperCase()
    return colorNameToHex(c)
  }).filter(Boolean) as string[]
  
  console.log(`   👤 User colors: ${userColors.join(', ')} → HEX: ${userHexColors.map(h => hexToColorName(h)).join(', ')}`)
  
  for (const category of ['top', 'bottom', 'shoes', 'coat'] as const) {
    const moodColors: string[] = moodPalette[category] || []
    const styleColors: string[] = stylePalette[category] || []
    
    // Get mood/style intersection colors
    let intersection = moodColors.filter((c: string) => styleColors.includes(c))
    if (intersection.length < 2) {
      intersection = [...new Set([...moodColors.slice(0, 2), ...styleColors.slice(0, 2)])]
    }
    
    // ✅ FIX #3: USER COLORS FIRST - highest priority!
    let categoryColors: string[] = []
    if (userHexColors.length > 0) {
      // User colors go FIRST (highest priority)
      categoryColors = [...userHexColors]
    }
    // Then add mood/style colors
    categoryColors = [...new Set([...categoryColors, ...intersection])].slice(0, 6)
    
    result[category] = categoryColors.map(hex => ({
      hex: hex,
      name: hexToColorName(hex)
    }))
  }
  
  console.log(`🎨 Generated Color Palette (mood: ${effectiveMood}, style: ${style}):`)
  console.log(`   Top: ${result.top.map(c => c.name).join(', ')}`)
  console.log(`   Bottom: ${result.bottom.map(c => c.name).join(', ')}`)
  console.log(`   Shoes: ${result.shoes.map(c => c.name).join(', ')}`)
  
  return result
}

// ============================================================================
// MAIN POST HANDLER
// ============================================================================

export async function POST(request: Request) {
  console.log(" Profile Builder V4: Starting profile building with COLOR SYSTEM")

  try {
    const quizData = await request.json()
    console.log(" Profile Builder V4: Quiz data received:", JSON.stringify(quizData, null, 2))

    // V4: Extract mood, style, occasion and colors from quiz data
    const mood = quizData.mood || quizData.selected_mood || 'general'
    const style = quizData.style || quizData.selected_style || 'casual'
    const occasion = quizData.occasion || quizData.default_occasion || 'everyday'
    const userColors = quizData.colors || quizData.preferred_colors || []
    
    console.log(" Profile Builder V4: Mood:", mood, "Style:", style, "Occasion:", occasion)
    console.log(" Profile Builder V4: User selected colors:", userColors)

    // Budget normalization (same as before)
    const normalizeBudget = (budget: string): { min: number; max: number | null } => {
      if (!budget) return { min: 50, max: 150 }
      const budgetLower = budget.toLowerCase().trim()
      
      if (budgetLower === "budget") return { min: 50, max: 150 }
      if (budgetLower === "moderate") return { min: 150, max: 300 }
      if (budgetLower === "premium") return { min: 300, max: 500 }
      if (budgetLower === "luxury") return { min: 500, max: null }

      if (budgetLower.includes("under")) {
        const match = budget.match(/\$?(\d+)/i)
        if (match) return { min: 0, max: Number.parseInt(match[1]) }
      }

      if (budgetLower.includes("+") || budgetLower.includes("above")) {
        const match = budget.match(/\$?(\d+)/i)
        if (match) return { min: Number.parseInt(match[1]), max: null }
      }

      const rangeMatch = budget.match(/\$?(\d+)\s*[-–—to]\s*\$?(\d+)/i)
      if (rangeMatch) {
        return { min: Number.parseInt(rangeMatch[1]), max: Number.parseInt(rangeMatch[2]) }
      }

      const singleMatch = budget.match(/\$?(\d+)/i)
      if (singleMatch) return { min: 0, max: Number.parseInt(singleMatch[1]) }

      return { min: 50, max: 150 }
    }

    const priceRange = normalizeBudget(quizData.budget || quizData.override_budget || quizData.default_budget)

    // V4: Generate allowed color palette based on mood + style + user colors
    const allowedColors = generateAllowedColorPalette({
      mood,
      style,
      occasion,  // V4 FIX: Pass occasion for mood auto-detection
      userColors: Array.isArray(userColors) ? userColors : [userColors].filter(Boolean)
    })

    console.log(" Profile Builder V4: ========================================")
    console.log(" Profile Builder V4: COLOR PALETTE GENERATED")
    console.log(" Profile Builder V4: ========================================")

    const displayMax = priceRange.max === null ? "unlimited" : `$${priceRange.max}`

    const prompt = `You are an expert fashion consultant creating a personalized shopping profile.

USER DATA:
- Gender: ${quizData.gender || "female"}
- Body Shape: ${quizData.bodyShape || quizData.body_type || "hourglass"}
- Height: ${quizData.height || "average"}
- Style: ${style}
- Mood: ${mood}
- Occasion: ${quizData.occasion || quizData.default_occasion || "everyday"}
- Colors: ${Array.isArray(userColors) ? userColors.join(", ") : userColors || "black, white, navy"}
- Budget: $${priceRange.min} - ${displayMax}
- Additional: ${quizData.additionalDetails || quizData.additional_notes || "None"}

YOUR TASK:
Create a structured profile for product search.

CRITICAL: The budget is STRICTLY $${priceRange.min} - ${displayMax}. All search queries MUST target products within this price range.

Generate SPECIFIC search keywords that will find real products.

GOOD keywords: "fitted blazer black", "high waisted jeans blue", "ankle boots leather"
BAD keywords: "nice clothes", "professional outfit", "hourglass style"

Return ONLY valid JSON:
{
  "bodyProfile": {
    "shape": "${quizData.bodyShape || quizData.body_type || "hourglass"}",
    "fitGuidelines": ["Specific fit 1", "Specific fit 2", "Specific fit 3"],
    "avoid": ["Thing to avoid 1", "Thing to avoid 2"]
  },
  "colorStrategy": {
    "primary": ["color1", "color2", "color3"],
    "accent": ["accent1", "accent2"],
    "avoid": ["color to avoid"]
  },
  "styleKeywords": {
    "aesthetic": ["${style}", "keyword2"],
    "formality": "casual"
  },
  "searchQueries": {
    "tops": ["specific top search 1", "specific top search 2", "specific top search 3"],
    "bottoms": ["specific bottom search 1", "specific bottom search 2", "specific bottom search 3"],
    "shoes": ["specific shoe search 1", "specific shoe search 2", "specific shoe search 3"]
  },
  "priceRange": {
    "min": ${priceRange.min},
    "max": ${priceRange.max === null ? 99999 : priceRange.max},
    "isUnlimited": ${priceRange.max === null}
  },
  "occasionGuidelines": {
    "occasion": "${quizData.occasion || quizData.default_occasion || "everyday"}",
    "formality": "casual|smart-casual|business-casual|formal",
    "mustHave": ["essential 1", "essential 2"],
    "avoid": ["avoid 1", "avoid 2"]
  }
}`

    console.log(" Profile Builder V4: Calling OpenAI...")
    const response = await callOpenAI({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      responseFormat: "json_object",
      temperature: 0.7,
    })

    console.log(" Profile Builder V4: OpenAI response received")
    const profile = JSON.parse(response)

    // Ensure price range is set correctly
    profile.priceRange = {
      min: priceRange.min,
      max: priceRange.max === null ? 99999 : priceRange.max,
      isUnlimited: priceRange.max === null,
    }

    // V4: Add allowedColors to profile output
    profile.allowedColors = allowedColors
    profile.mood = mood
    profile.style = style

    console.log(" Profile Builder V4: ========================================")
    console.log(" Profile Builder V4: FINAL PROFILE WITH COLORS")
    console.log(" Profile Builder V4: Min: $" + profile.priceRange.min)
    console.log(" Profile Builder V4: Max: $" + (profile.priceRange.isUnlimited ? "UNLIMITED" : profile.priceRange.max))
    console.log(" Profile Builder V4: Mood:", profile.mood)
    console.log(" Profile Builder V4: Style:", profile.style)
    console.log(" Profile Builder V4: Top Colors:", profile.allowedColors.top.map((c: ColorEntry) => c.name).join(", "))
    console.log(" Profile Builder V4: ========================================")

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error: any) {
    console.error(" Profile Builder V4: Error occurred:", error)
    console.error(" Profile Builder V4: Error stack:", error.stack)
    return NextResponse.json({ error: "Profile building failed", details: error.message }, { status: 500 })
  }
}
