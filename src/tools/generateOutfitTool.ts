
import { supabase } from '../lib/supabaseClient';

// Body structure to Hebrew mapping
const BODY_STRUCTURE_MAPPING = {
  'X': 'hourglass',    // Hourglass
  'V': 'triangle',     // Inverted triangle (broad shoulders)
  'H': 'rectangle',    // Rectangle
  'O': 'oval',         // Oval/Apple
  'A': 'pear'          // Pear
};

// Enhanced body structure recommendations with specific clothing attributes
const BODY_STRUCTURE_RECOMMENDATIONS = {
  'X': {
    description: "מבנה גוף שעון חול - מותן מוגדר וכתפיים ומותניים ברוחב דומה",
    recommendations: ["הדגש את המותן המוגדר", "בחר בגדים מותאמים לגוף", "המנע מבגדים רחבים מדי"],
    preferred_fits: ['מותאם', 'צמוד', 'מדגיש מותן', 'wrap', 'fitted'],
    preferred_silhouettes: ['A-line', 'מותאם לגוף', 'bodycon'],
    avoid_keywords: ['רחב', 'oversized', 'boxy', 'ישר מדי', 'loose'],
    top_preferences: ['V-neck', 'wrap', 'מותאם', 'צמוד לגוף'],
    bottom_preferences: ['high-waisted', 'מותן גבוה', 'מותאם', 'skinny', 'straight']
  },
  'V': {
    description: "מבנה גוף משולש הפוך - כתפיים רחבות יחסית למותניים",
    recommendations: ["הוסף נפח לחלק התחתון", "בחר חצאיות ומכנסיים עם פרטים", "המנע מדגש על הכתפיים"],
    preferred_fits: ['רחב בתחתית', 'A-line', 'flare', 'wide-leg'],
    preferred_silhouettes: ['A-line', 'bootcut', 'wide', 'עם נפח'],
    avoid_keywords: ['כתפיים רחבות', 'shoulder pads', 'horizontal stripes על', 'tight בתחתית'],
    top_preferences: ['V-neck', 'scoop neck', 'פשוט', 'ללא פרטים בכתפיים'],
    bottom_preferences: ['A-line', 'flare', 'wide-leg', 'bootcut', 'עם נפח', 'רחב']
  },
  'H': {
    description: "מבנה גוף מלבני - כתפיים, מותן ומותניים ברוחב דומה",
    recommendations: ["צור אשליה של קווי גוף", "הוסף פרטים בחלק העליון והתחתון", "השתמש בחגורות להגדרת המותן"],
    preferred_fits: ['עם פרטים', 'layered', 'textured', 'peplum', 'ruffles'],
    preferred_silhouettes: ['peplum', 'עם שכבות', 'textured'],
    avoid_keywords: ['ישר מדי', 'simple', 'plain', 'minimal'],
    top_preferences: ['peplum', 'עם פרטים', 'ruffles', 'textured', 'layered'],
    bottom_preferences: ['עם פרטים', 'textured', 'pleated', 'A-line']
  },
  'O': {
    description: "מבנה גוף סגלגל - חלק האמצע רחב יותר",
    recommendations: ["הדגש את הרגליים והזרועות", "בחר קווי V בחלק העליון", "המנע מהדגשת האמצע"],
    preferred_fits: ['empire', 'A-line', 'flowing', 'loose', 'tunic'],
    preferred_silhouettes: ['empire waist', 'A-line', 'flowing', 'tunic'],
    avoid_keywords: ['צמוד באמצע', 'tight waist', 'belt', 'חגורה'],
    top_preferences: ['V-neck', 'empire', 'tunic', 'flowing', 'loose'],
    bottom_preferences: ['straight', 'bootcut', 'A-line', 'wide-leg']
  },
  'A': {
    description: "מבנה גוף אגס - מותניים רחבים יחסית לכתפיים",
    recommendations: ["הדגש את החלק העליון", "הוסף נפח לכתפיים", "בחר חצאיות A ומכנסיים ישרים"],
    preferred_fits: ['עם פרטים בחלק עליון', 'statement sleeves', 'horizontal stripes על'],
    preferred_silhouettes: ['A-line', 'straight', 'bootcut'],
    avoid_keywords: ['צמוד בתחתית', 'tight bottom', 'skinny'],
    top_preferences: ['statement', 'עם פרטים', 'horizontal stripes', 'bold patterns'],
    bottom_preferences: ['A-line', 'straight', 'bootcut', 'wide-leg']
  }
};

/**
 * Enhanced filtering function that uses body structure recommendations
 */
function filterItemsByBodyStructure(items: any[], bodyStructure: string, itemType: 'top' | 'bottom' | 'shoes'): any[] {
  const recommendations = BODY_STRUCTURE_RECOMMENDATIONS[bodyStructure as keyof typeof BODY_STRUCTURE_RECOMMENDATIONS];
  
  if (!recommendations) {
    console.log(`No recommendations found for body structure: ${bodyStructure}`);
    return items;
  }

  return items.filter(item => {
    const itemName = (item.product_name || '').toLowerCase();
    const itemDescription = (item.description || '').toLowerCase();
    const itemFamily = (item.product_family || '').toLowerCase();
    const itemSubfamily = (item.product_subfamily || '').toLowerCase();
    const searchableText = `${itemName} ${itemDescription} ${itemFamily} ${itemSubfamily}`;

    // Check if item should be avoided
    const shouldAvoid = recommendations.avoid_keywords.some(keyword => 
      searchableText.includes(keyword.toLowerCase())
    );
    
    if (shouldAvoid) {
      console.log(`Filtering out item "${item.product_name}" - contains avoid keyword for ${bodyStructure}`);
      return false;
    }

    // For shoes, we don't need body-specific filtering
    if (itemType === 'shoes') {
      return true;
    }

    // Check for preferred fits and silhouettes
    const hasPreferredFit = recommendations.preferred_fits.some(fit => 
      searchableText.includes(fit.toLowerCase())
    );
    
    const hasPreferredSilhouette = recommendations.preferred_silhouettes.some(silhouette => 
      searchableText.includes(silhouette.toLowerCase())
    );

    // Type-specific preferences
    let hasTypePreference = false;
    if (itemType === 'top') {
      hasTypePreference = recommendations.top_preferences.some(pref => 
        searchableText.includes(pref.toLowerCase())
      );
    } else if (itemType === 'bottom') {
      hasTypePreference = recommendations.bottom_preferences.some(pref => 
        searchableText.includes(pref.toLowerCase())
      );
    }

    // Item is preferred if it matches any of the criteria
    const isPreferred = hasPreferredFit || hasPreferredSilhouette || hasTypePreference;
    
    if (isPreferred) {
      console.log(`Item "${item.product_name}" preferred for ${bodyStructure} body type`);
    }

    return isPreferred;
  });
}

/**
 * Tool for generating outfit suggestions
 * Creates combinations of clothing items based on user parameters including body structure
 */
export const GenerateOutfitTool = {
  name: "GenerateOutfitTool",
  description: "Generates a personalized outfit recommendation based on body structure, mood, and style",
  execute: async (params: {
    bodyStructure: string,
    mood: string,
    style: string
  }) => {
    console.log(`Generating outfit for: ${JSON.stringify(params)}`);
    
    try {
      const { bodyStructure, mood, style } = params;
      
      // Map body structure to Hebrew equivalent
      const hebrewBodyShape = BODY_STRUCTURE_MAPPING[bodyStructure as keyof typeof BODY_STRUCTURE_MAPPING] || 'hourglass';
      const bodyRecommendations = BODY_STRUCTURE_RECOMMENDATIONS[bodyStructure as keyof typeof BODY_STRUCTURE_RECOMMENDATIONS];
      
      console.log(`Mapped body structure ${bodyStructure} to ${hebrewBodyShape}`);
      console.log(`Using body-specific recommendations:`, bodyRecommendations);
      
      // Get items from database
      const { data: items, error } = await supabase
        .from('zara_cloth')
        .select('*')
        .limit(100);
      
      if (error) {
        console.error('Error fetching items:', error);
        // Fallback to placeholder data
        return {
          success: true,
          data: [
            {
              top: "#2C3E50",
              bottom: "#BDC3C7", 
              shoes: "#7F8C8D",
              coat: "#34495E",
              description: `A sophisticated ensemble tailored for ${bodyRecommendations?.description || 'your body type'}`,
              recommendations: bodyRecommendations?.recommendations || [
                "Choose fitted clothing that complements your body shape",
                "Focus on creating balanced proportions"
              ],
              occasion: mood === 'casual' ? 'casual' : 'work'
            }
          ]
        };
      }

      // Enhanced filtering using body structure
      const allTops = items?.filter(item => 
        item.product_name?.toLowerCase().includes('חולצ') || 
        item.product_name?.toLowerCase().includes('טופ') ||
        item.product_name?.toLowerCase().includes('בלוז')
      ) || [];
      
      const allBottoms = items?.filter(item => 
        item.product_name?.toLowerCase().includes('מכנס') || 
        item.product_name?.toLowerCase().includes('חצאית')
      ) || [];
      
      const allShoes = items?.filter(item => 
        item.product_name?.toLowerCase().includes('נעל')
      ) || [];

      // Apply body structure filtering
      const filteredTops = filterItemsByBodyStructure(allTops, bodyStructure, 'top');
      const filteredBottoms = filterItemsByBodyStructure(allBottoms, bodyStructure, 'bottom');
      const filteredShoes = filterItemsByBodyStructure(allShoes, bodyStructure, 'shoes');

      console.log(`Body structure filtering results for ${bodyStructure}:`);
      console.log(`- Tops: ${allTops.length} → ${filteredTops.length} items`);
      console.log(`- Bottoms: ${allBottoms.length} → ${filteredBottoms.length} items`);
      console.log(`- Shoes: ${allShoes.length} → ${filteredShoes.length} items`);

      if (filteredTops.length > 0 && filteredBottoms.length > 0 && filteredShoes.length > 0) {
        const selectedTop = filteredTops[0];
        const selectedBottom = filteredBottoms[0];
        const selectedShoes = filteredShoes[0];
        
        return {
          success: true,
          data: [
            {
              top: {
                color: selectedTop?.colour || "#2C3E50",
                product_name: selectedTop?.product_name || "Stylish top",
                description: selectedTop?.description || "Stylish top piece",
                price: selectedTop?.price?.toString() || "49.99",
                image: this.extractImageUrl(selectedTop?.image)
              },
              bottom: {
                color: selectedBottom?.colour || "#BDC3C7",
                product_name: selectedBottom?.product_name || "Comfortable bottom",
                description: selectedBottom?.description || "Comfortable bottom piece", 
                price: selectedBottom?.price?.toString() || "59.99",
                image: this.extractImageUrl(selectedBottom?.image)
              },
              shoes: {
                color: selectedShoes?.colour || "#7F8C8D",
                product_name: selectedShoes?.product_name || "Stylish shoes",
                description: selectedShoes?.description || "Stylish footwear",
                price: selectedShoes?.price?.toString() || "69.99",
                image: this.extractImageUrl(selectedShoes?.image)
              },
              description: `${bodyRecommendations?.description || 'A stylish outfit'} - ${selectedTop?.product_name || 'top'} with ${selectedBottom?.product_name || 'bottom'} specifically chosen for ${bodyStructure} body type`,
              recommendations: [
                ...(bodyRecommendations?.recommendations || []),
                `This ${selectedTop?.product_name || 'top'} complements your ${bodyStructure} body structure`,
                `The ${selectedBottom?.product_name || 'bottom'} creates the ideal silhouette for your body type`
              ],
              occasion: mood === 'casual' ? 'casual' : 'work'
            }
          ]
        };
      }

      // Fallback to placeholder data with body structure info
      return {
        success: true,
        data: [
          {
            top: "#2C3E50",
            bottom: "#BDC3C7",
            shoes: "#7F8C8D", 
            coat: "#34495E",
            description: `A sophisticated ensemble tailored for ${bodyRecommendations?.description || 'your body type'}`,
            recommendations: bodyRecommendations?.recommendations || [
              "Choose fitted clothing that complements your body shape",
              "Focus on creating balanced proportions"
            ],
            occasion: mood === 'casual' ? 'casual' : 'work'
          }
        ]
      };
    } catch (error) {
      console.error('Error generating outfit:', error);
      return {
        success: false,
        error: 'Failed to generate outfit based on body structure'
      };
    }
  },

  extractImageUrl: function(imageJson: any): string {
    if (typeof imageJson === 'string') {
      return imageJson;
    }
    
    if (!imageJson) {
      return 'https://static.zara.net/photos///2022/I/0/1/p/7644/040/400/2/w/1920/7644040400_6_1_1.jpg';
    }
    
    if (Array.isArray(imageJson)) {
      return imageJson[0] || 'https://static.zara.net/photos///2022/I/0/1/p/7644/040/400/2/w/1920/7644040400_6_1_1.jpg';
    }
    
    if (typeof imageJson === 'object' && imageJson.urls && Array.isArray(imageJson.urls)) {
      return imageJson.urls[0] || 'https://static.zara.net/photos///2022/I/0/1/p/7644/040/400/2/w/1920/7644040400_6_1_1.jpg';
    }
    
    return 'https://static.zara.net/photos///2022/I/0/1/p/7644/040/400/2/w/1920/7644040400_6_1_1.jpg';
  },
  
  // Add run method as an alias to execute for compatibility
  run: async (input: { style?: string, bodyType?: string, mood?: string }) => {
    const params = {
      bodyStructure: input.bodyType || "X",
      style: input.style || "Classic", 
      mood: input.mood || "Elegant"
    };
    
    const result = await GenerateOutfitTool.execute(params);
    return result.success ? result.data[0] : {};
  }
};
