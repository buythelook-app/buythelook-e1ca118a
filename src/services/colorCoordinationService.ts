
export interface ColorHarmony {
  primary: string;
  complementary: string[];
  analogous: string[];
  triadic: string[];
  mood: string;
}

export interface FabricCompatibility {
  fabric: string;
  compatibleWith: string[];
  incompatibleWith: string[];
  occasions: string[];
}

// Color coordination based on color theory
export const COLOR_HARMONIES: Record<string, ColorHarmony> = {
  black: {
    primary: 'black',
    complementary: ['white', 'gray', 'silver'],
    analogous: ['charcoal', 'navy', 'dark gray'],
    triadic: ['red', 'gold', 'white'],
    mood: 'elegant'
  },
  white: {
    primary: 'white',
    complementary: ['black', 'navy', 'gray'],
    analogous: ['cream', 'beige', 'ivory'],
    triadic: ['blue', 'red', 'yellow'],
    mood: 'clean'
  },
  navy: {
    primary: 'navy',
    complementary: ['white', 'cream', 'beige'],
    analogous: ['blue', 'royal blue', 'dark blue'],
    triadic: ['burgundy', 'gold', 'white'],
    mood: 'professional'
  },
  beige: {
    primary: 'beige',
    complementary: ['brown', 'cream', 'white'],
    analogous: ['tan', 'sand', 'khaki'],
    triadic: ['navy', 'burgundy', 'forest green'],
    mood: 'neutral'
  },
  gray: {
    primary: 'gray',
    complementary: ['white', 'black', 'silver'],
    analogous: ['charcoal', 'light gray', 'slate'],
    triadic: ['blue', 'pink', 'yellow'],
    mood: 'versatile'
  }
};

// Fabric compatibility rules
export const FABRIC_COMPATIBILITY: FabricCompatibility[] = [
  {
    fabric: 'cotton',
    compatibleWith: ['denim', 'linen', 'wool', 'polyester'],
    incompatibleWith: ['silk', 'satin'],
    occasions: ['casual', 'work', 'weekend']
  },
  {
    fabric: 'wool',
    compatibleWith: ['cotton', 'cashmere', 'tweed'],
    incompatibleWith: ['polyester', 'spandex'],
    occasions: ['work', 'formal', 'winter']
  },
  {
    fabric: 'silk',
    compatibleWith: ['silk', 'satin', 'chiffon'],
    incompatibleWith: ['denim', 'cotton'],
    occasions: ['formal', 'evening', 'date night']
  },
  {
    fabric: 'denim',
    compatibleWith: ['cotton', 'linen', 'jersey'],
    incompatibleWith: ['silk', 'satin', 'chiffon'],
    occasions: ['casual', 'weekend']
  },
  {
    fabric: 'leather',
    compatibleWith: ['denim', 'cotton', 'wool'],
    incompatibleWith: ['silk', 'chiffon'],
    occasions: ['casual', 'evening', 'edgy']
  }
];

// Mood to color mapping
export const MOOD_COLOR_MAPPING: Record<string, string[]> = {
  elegant: ['black', 'navy', 'gray', 'burgundy', 'white'],
  energized: ['red', 'orange', 'bright blue', 'yellow', 'green'],
  romantic: ['pink', 'rose', 'lavender', 'cream', 'soft blue'],
  powerful: ['black', 'red', 'navy', 'burgundy', 'dark gray'],
  calm: ['blue', 'beige', 'white', 'light gray', 'mint'],
  flowing: ['blue', 'teal', 'aqua', 'white', 'light blue'],
  optimist: ['yellow', 'orange', 'bright green', 'coral', 'white'],
  mysterious: ['black', 'dark purple', 'navy', 'burgundy', 'charcoal'],
  sweet: ['pink', 'peach', 'cream', 'soft yellow', 'lavender'],
  passionate: ['red', 'burgundy', 'deep pink', 'black', 'gold']
};

export class ColorCoordinationService {
  /**
   * Check if two colors are compatible based on color theory
   */
  static areColorsCompatible(color1: string, color2: string): boolean {
    const normalizedColor1 = this.normalizeColor(color1);
    const normalizedColor2 = this.normalizeColor(color2);
    
    const harmony1 = COLOR_HARMONIES[normalizedColor1];
    const harmony2 = COLOR_HARMONIES[normalizedColor2];
    
    if (!harmony1 || !harmony2) {
      // If colors not in our harmony map, allow basic combinations
      return this.basicColorCompatibility(normalizedColor1, normalizedColor2);
    }
    
    // Check if colors are complementary, analogous, or triadic
    return (
      harmony1.complementary.includes(normalizedColor2) ||
      harmony1.analogous.includes(normalizedColor2) ||
      harmony1.triadic.includes(normalizedColor2) ||
      normalizedColor1 === normalizedColor2
    );
  }
  
  /**
   * Get colors that match the mood
   */
  static getColorsForMood(mood: string): string[] {
    return MOOD_COLOR_MAPPING[mood] || MOOD_COLOR_MAPPING.elegant;
  }
  
  /**
   * Check if fabrics are compatible
   */
  static areFabricsCompatible(fabric1: string, fabric2: string): boolean {
    const normalizedFabric1 = this.normalizeFabric(fabric1);
    const normalizedFabric2 = this.normalizeFabric(fabric2);
    
    const compatibility = FABRIC_COMPATIBILITY.find(f => f.fabric === normalizedFabric1);
    if (!compatibility) return true; // Unknown fabrics are allowed
    
    return (
      compatibility.compatibleWith.includes(normalizedFabric2) ||
      normalizedFabric1 === normalizedFabric2
    );
  }
  
  /**
   * Score an outfit based on color and fabric coordination
   */
  static scoreOutfitCoordination(items: any[], mood: string): number {
    let score = 100;
    const colors = items.map(item => this.extractColorFromItem(item));
    const fabrics = items.map(item => this.extractFabricFromItem(item));
    
    // Check color compatibility
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        if (!this.areColorsCompatible(colors[i], colors[j])) {
          score -= 15;
        }
      }
    }
    
    // Check fabric compatibility
    for (let i = 0; i < fabrics.length; i++) {
      for (let j = i + 1; j < fabrics.length; j++) {
        if (!this.areFabricsCompatible(fabrics[i], fabrics[j])) {
          score -= 10;
        }
      }
    }
    
    // Check mood alignment
    const moodColors = this.getColorsForMood(mood);
    const hasMatchingMoodColor = colors.some(color => 
      moodColors.some(moodColor => this.areColorsCompatible(color, moodColor))
    );
    
    if (!hasMatchingMoodColor) {
      score -= 20;
    }
    
    return Math.max(score, 0);
  }
  
  private static normalizeColor(color: string): string {
    const normalized = color.toLowerCase().trim();
    
    // Map common color variations
    const colorMap: Record<string, string> = {
      'negro': 'black',
      'blanco': 'white',
      'azul marino': 'navy',
      'azul': 'blue',
      'gris': 'gray',
      'beige': 'beige',
      'marron': 'brown',
      'rosa': 'pink',
      'rojo': 'red',
      'verde': 'green',
      'amarillo': 'yellow',
      'violeta': 'purple',
      'morado': 'purple'
    };
    
    return colorMap[normalized] || normalized;
  }
  
  private static normalizeFabric(fabric: string): string {
    const normalized = fabric.toLowerCase().trim();
    
    // Map common fabric variations
    const fabricMap: Record<string, string> = {
      'algodon': 'cotton',
      'lana': 'wool',
      'seda': 'silk',
      'cuero': 'leather',
      'vaquero': 'denim',
      'mezclilla': 'denim',
      'poliester': 'polyester'
    };
    
    return fabricMap[normalized] || normalized;
  }
  
  private static basicColorCompatibility(color1: string, color2: string): boolean {
    // Basic compatibility rules for colors not in our harmony map
    const neutrals = ['black', 'white', 'gray', 'beige', 'brown'];
    
    // Neutrals go with everything
    if (neutrals.includes(color1) || neutrals.includes(color2)) {
      return true;
    }
    
    // Same colors are compatible
    return color1 === color2;
  }
  
  private static extractColorFromItem(item: any): string {
    return item.colour || item.color || item.product_name?.toLowerCase() || 'unknown';
  }
  
  private static extractFabricFromItem(item: any): string {
    const description = (item.description || item.materials_description || '').toLowerCase();
    
    // Try to detect fabric from description
    const fabrics = ['cotton', 'wool', 'silk', 'leather', 'denim', 'polyester', 'linen'];
    for (const fabric of fabrics) {
      if (description.includes(fabric)) {
        return fabric;
      }
    }
    
    return 'unknown';
  }
}
