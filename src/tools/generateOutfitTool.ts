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

// Event-specific clothing recommendations
const EVENT_RECOMMENDATIONS = {
  workwear: {
    description: "Clothing suitable for a professional office or work environment",
    include_keywords: [
      "blazer", "shirt", "button-down", "trousers", "slacks", "blouse", "midi skirt",
      "high-waist", "wide-leg", "tailored", "wrap dress", "structured", "knit", "v-neck"
    ],
    exclude_keywords: [
      "crop", "sleeveless", "mini skirt", "denim", "ripped", "transparent", "cut-out",
      "sports", "casual", "t-shirt", "hoodie"
    ]
  }
};

// Global tracker for used items across all outfits in the same generation
let usedItemIds = new Set<string>();

/**
 * Enhanced filtering function that uses body structure recommendations
 * and ensures data consistency
 */
function filterItemsByBodyStructure(items: any[], bodyStructure: string): any[] {
  const recommendations = BODY_STRUCTURE_RECOMMENDATIONS[bodyStructure as keyof typeof BODY_STRUCTURE_RECOMMENDATIONS];

  if (!recommendations) {
    console.log(`No recommendations found for body structure: ${bodyStructure}`);
    return items;
  }

  return items.filter(item => {
    // Validate that the item has all required fields to prevent data mismatch
    if (!item.product_name || !item.description) {
      console.log(`Filtering out item with incomplete data: ${item.id}`);
      return false;
    }

    // Check if item was already used in this generation
    if (usedItemIds.has(item.id)) {
      console.log(`Filtering out already used item: ${item.id}`);
      return false;
    }

    const text = `${item.product_name} ${item.description}`.toLowerCase();

    const hasPreferredFit = recommendations.preferred_fits?.some(fit => text.includes(fit.toLowerCase()));
    const hasPreferredSilhouette = recommendations.preferred_silhouettes?.some(s => text.includes(s.toLowerCase()));
    const avoidsBadKeywords = recommendations.avoid_keywords?.every(k => !text.includes(k.toLowerCase()));

    // Log filtering decisions for debugging
    if (hasPreferredFit || hasPreferredSilhouette) {
      console.log(`Item "${item.product_name}" matches preferences for ${bodyStructure}`);
    }

    return (hasPreferredFit || hasPreferredSilhouette) && avoidsBadKeywords;
  });
}

/**
 * Improved item type detection based on product name and family
 */
function detectItemType(item: any): 'top' | 'bottom' | 'shoes' | 'dress' | 'outerwear' {
  const productName = (item.product_name || '').toLowerCase();
  const productFamily = (item.product_family || '').toLowerCase();
  const description = (item.description || '').toLowerCase();
  
  // More accurate detection logic
  if (productName.includes('חולצ') || productName.includes('טופ') || productName.includes('בלוז') ||
      productFamily.includes('shirt') || productFamily.includes('top') || productFamily.includes('blouse')) {
    return 'top';
  }
  
  if (productName.includes('מכנס') || productFamily.includes('trouser') || productFamily.includes('pant') ||
      description.includes('מכנס')) {
    return 'bottom';
  }
  
  if (productName.includes('חצאית') || productFamily.includes('skirt')) {
    return 'bottom';
  }
  
  if (productName.includes('שמלה') || productFamily.includes('dress')) {
    return 'dress';
  }
  
  if (productName.includes('נעל') || productFamily.includes('shoe') || productFamily.includes('boot')) {
    return 'shoes';
  }
  
  if (productName.includes('מעיל') || productName.includes('ז\'קט') || productFamily.includes('jacket') || productFamily.includes('coat')) {
    return 'outerwear';
  }
  
  // Default fallback based on common patterns
  return 'top';
}

/**
 * Validates that item data is consistent (image matches description)
 */
function validateItemConsistency(item: any): boolean {
  // Basic validation - ensure we have both image and description
  if (!item.image || !item.product_name || !item.description) {
    console.warn(`Item ${item.id} missing essential data - image, name, or description`);
    return false;
  }

  // Additional validation can be added here
  return true;
}

/**
 * Enhanced occasion-specific filtering with precise definitions
 */
function filterByOccasion(items: any[], occasion: string): any[] {
  return items.filter(item => {
    const text = `${item.product_name} ${item.description}`.toLowerCase();
    const itemType = detectItemType(item);
    
    switch (occasion) {
      case 'work':
        const workRecommendations = EVENT_RECOMMENDATIONS.workwear;
        
        // Check if item contains any include keywords
        const hasIncludeKeywords = workRecommendations.include_keywords.some(keyword => text.includes(keyword.toLowerCase()));
        
        // Check if item contains any exclude keywords
        const hasExcludeKeywords = workRecommendations.exclude_keywords.some(keyword => text.includes(keyword.toLowerCase()));
        
        // For shoes - only formal/business shoes for work
        if (itemType === 'shoes') {
          const workShoeKeywords = ['עסקי', 'פורמלי', 'עור', 'קלאסי', 'מגף', 'עקב נמוך'];
          const avoidCasualShoes = !text.includes('סניקרס') && !text.includes('ספורט') && !text.includes('ריצה');
          return workShoeKeywords.some(keyword => text.includes(keyword)) && avoidCasualShoes;
        }
        
        // Item is suitable for work if it has include keywords and doesn't have exclude keywords
        return hasIncludeKeywords && !hasExcludeKeywords;
        
      case 'weekend':
        // Weekend casual items - comfortable, relaxed
        const weekendKeywords = ['נוח', 'יומיומי', 'רגיל', 'קז\'ואל', 'רלקס'];
        const hasWeekendKeywords = weekendKeywords.some(keyword => text.includes(keyword)) || 
                                  text.includes('ג\'ינס') || text.includes('טי שירט');
        
        // For shoes - ONLY flat casual shoes (sports/sneakers/flat)
        if (itemType === 'shoes') {
          const casualShoeKeywords = ['סניקרס', 'ספורט', 'ריצה', 'התעמלות', 'שטוח', 'נוח', 'קז\'ואל'];
          const avoidHeels = !text.includes('עקב') && !text.includes('פורמלי') && !text.includes('עסקי');
          return casualShoeKeywords.some(keyword => text.includes(keyword)) && avoidHeels;
        }
        
        return hasWeekendKeywords;
        
      case 'evening':
        // Evening formal items - elegant, dressy
        const eveningKeywords = ['ערב', 'אלגנטי', 'חגיגי', 'פורמלי', 'מיוחד'];
        const hasEveningKeywords = eveningKeywords.some(keyword => text.includes(keyword));
        
        // For shoes - elegant/formal shoes including heels
        if (itemType === 'shoes') {
          const eveningShoeKeywords = ['עקב', 'אלגנטי', 'ערב', 'פורמלי', 'חגיגי', 'עור'];
          return eveningShoeKeywords.some(keyword => text.includes(keyword));
        }
        
        return hasEveningKeywords;
        
      default:
        return true;
    }
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
    
    // Reset used items tracker for new generation
    usedItemIds.clear();
    
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
        .limit(200); // Increased limit for better variety
      
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

      // Improved categorization with better type detection
      const categorizedItems = {
        tops: items?.filter(item => {
          const type = detectItemType(item);
          return type === 'top' && validateItemConsistency(item);
        }) || [],
        bottoms: items?.filter(item => {
          const type = detectItemType(item);
          return (type === 'bottom' || type === 'dress') && validateItemConsistency(item);
        }) || [],
        shoes: items?.filter(item => {
          const type = detectItemType(item);
          return type === 'shoes' && validateItemConsistency(item);
        }) || []
      };

      console.log(`Categorized items: ${categorizedItems.tops.length} tops, ${categorizedItems.bottoms.length} bottoms, ${categorizedItems.shoes.length} shoes`);

      // Apply body structure and occasion filtering
      const occasion = mood === 'casual' ? 'weekend' : mood === 'elegant' ? 'evening' : 'work';
      
      const filteredTops = filterByOccasion(filterItemsByBodyStructure(categorizedItems.tops, bodyStructure), occasion);
      const filteredBottoms = filterByOccasion(filterItemsByBodyStructure(categorizedItems.bottoms, bodyStructure), occasion);
      const filteredShoes = filterByOccasion(filterItemsByBodyStructure(categorizedItems.shoes, bodyStructure), occasion);

      console.log(`After filtering for ${bodyStructure} and ${occasion}:`);
      console.log(`- Tops: ${categorizedItems.tops.length} → ${filteredTops.length} items`);
      console.log(`- Bottoms: ${categorizedItems.bottoms.length} → ${filteredBottoms.length} items`);
      console.log(`- Shoes: ${categorizedItems.shoes.length} → ${filteredShoes.length} items`);

      if (filteredTops.length > 0 && filteredBottoms.length > 0 && filteredShoes.length > 0) {
        // Select items and mark them as used
        const selectedTop = filteredTops[0];
        const selectedBottom = filteredBottoms[0];
        const selectedShoes = filteredShoes[0];
        
        // Add to used items tracker
        usedItemIds.add(selectedTop.id);
        usedItemIds.add(selectedBottom.id);
        usedItemIds.add(selectedShoes.id);
        
        // Validate consistency before returning
        if (!validateItemConsistency(selectedTop) || 
            !validateItemConsistency(selectedBottom) || 
            !validateItemConsistency(selectedShoes)) {
          console.warn('Selected items failed consistency check, using fallback');
          return {
            success: true,
            data: [
              {
                top: "#2C3E50",
                bottom: "#BDC3C7",
                shoes: "#7F8C8D", 
                coat: "#34495E",
                description: `${bodyRecommendations?.description || 'A stylish outfit'} - תלבושת מותאמת למבנה הגוף ${bodyStructure}`,
                recommendations: bodyRecommendations?.recommendations || [
                  "Choose fitted clothing that complements your body shape",
                  "Focus on creating balanced proportions"
                ],
                occasion: occasion
              }
            ]
          };
        }
        
        return {
          success: true,
          data: [
            {
              top: {
                color: selectedTop?.colour || "#2C3E50",
                product_name: selectedTop?.product_name || "Stylish top",
                description: selectedTop?.description || "Stylish top piece",
                price: selectedTop?.price?.toString() || "49.99",
                image: GenerateOutfitTool.extractImageUrl(selectedTop?.image),
                id: selectedTop?.id
              },
              bottom: {
                color: selectedBottom?.colour || "#BDC3C7",
                product_name: selectedBottom?.product_name || "Comfortable bottom",
                description: selectedBottom?.description || "Comfortable bottom piece", 
                price: selectedBottom?.price?.toString() || "59.99",
                image: GenerateOutfitTool.extractImageUrl(selectedBottom?.image),
                id: selectedBottom?.id
              },
              shoes: {
                color: selectedShoes?.colour || "#7F8C8D",
                product_name: selectedShoes?.product_name || "Stylish shoes",
                description: selectedShoes?.description || "Stylish footwear",
                price: selectedShoes?.price?.toString() || "69.99",
                image: GenerateOutfitTool.extractImageUrl(selectedShoes?.image),
                id: selectedShoes?.id
              },
              description: `${bodyRecommendations?.description || 'A stylish outfit'} - ${selectedTop?.product_name || 'top'} עם ${selectedBottom?.product_name || 'bottom'} שנבחרו במיוחד למבנה גוף ${bodyStructure} ל${occasion}`,
              recommendations: [
                ...(bodyRecommendations?.recommendations || []),
                `${selectedTop?.product_name || 'הפריט העליון'} מתאים למבנה הגוף ${bodyStructure}`,
                `${selectedBottom?.product_name || 'הפריט התחתון'} יוצר את הצללית האידיאלית עבורך`,
                `מתאים לאירוע: ${occasion}`
              ],
              occasion: occasion
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
            description: `${bodyRecommendations?.description || 'A stylish outfit'} - תלבושת מותאמת למבנה הגוף שלך ל${occasion}`,
            recommendations: bodyRecommendations?.recommendations || [
              "Choose fitted clothing that complements your body shape",
              "Focus on creating balanced proportions"
            ],
            occasion: occasion
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
