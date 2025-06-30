
import { supabase } from '../lib/supabaseClient';

// Body structure to Hebrew mapping
const BODY_STRUCTURE_MAPPING = {
  'X': 'hourglass',    // Hourglass
  'V': 'triangle',     // Inverted triangle (broad shoulders)
  'H': 'rectangle',    // Rectangle
  'O': 'oval',         // Oval/Apple
  'A': 'pear'          // Pear
};

// Style recommendations based on body structure
const BODY_STRUCTURE_RECOMMENDATIONS = {
  'X': {
    description: "מבנה גוף שעון חול - מותן מוגדר וכתפיים ומותניים ברוחב דומה",
    recommendations: ["הדגש את המותן המוגדר", "בחר בגדים מותאמים לגוף", "המנע מבגדים רחבים מדי"]
  },
  'V': {
    description: "מבנה גוף משולש הפוך - כתפיים רחבות יחסית למותניים",
    recommendations: ["הוסף נפח לחלק התחתון", "בחר חצאיות ומכנסיים עם פרטים", "המנע מדגש על הכתפיים"]
  },
  'H': {
    description: "מבנה גוף מלבני - כתפיים, מותן ומותניים ברוחב דומה",
    recommendations: ["צור אשליה של קווי גוף", "הוסף פרטים בחלק העליון והתחתון", "השתמש בחגורות להגדרת המותן"]
  },
  'O': {
    description: "מבנה גוף סגלגל - חלק האמצע רחב יותר",
    recommendations: ["הדגש את הרגליים והזרועות", "בחר קווי V בחלק העליון", "המנע מהדגשת האמצע"]
  },
  'A': {
    description: "מבנה גוף אגס - מותניים רחבים יחסית לכתפיים",
    recommendations: ["הדגש את החלק העליון", "הוסף נפח לכתפיים", "בחר חצאיות A ומכנסיים ישרים"]
  }
};

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
      
      // Get items from database based on body structure and style
      const { data: items, error } = await supabase
        .from('zara_cloth')
        .select('*')
        .limit(50);
      
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

      // Filter items based on body structure recommendations
      const filteredItems = items?.filter(item => {
        const itemName = (item.product_name || '').toLowerCase();
        
        // Basic filtering logic based on body structure
        switch (bodyStructure) {
          case 'X': // Hourglass - fitted items
            return itemName.includes('מותאם') || itemName.includes('צמוד') || 
                   !itemName.includes('רחב') && !itemName.includes('oversized');
          
          case 'V': // Inverted triangle - add volume to bottom
            return (itemName.includes('חצאית') || itemName.includes('מכנס')) ||
                   (itemName.includes('חולצ') && !itemName.includes('כתף'));
          
          case 'H': // Rectangle - create curves
            return itemName.includes('פרטים') || itemName.includes('עיטור') ||
                   itemName.includes('חגורה') || !itemName.includes('ישר');
          
          case 'O': // Oval - elongate silhouette
            return itemName.includes('v') || itemName.includes('אורך') ||
                   !itemName.includes('צמוד באמצע');
          
          case 'A': // Pear - emphasize top
            return (itemName.includes('חולצ') && itemName.includes('פרט')) ||
                   (itemName.includes('מכנס') && itemName.includes('ישר'));
          
          default:
            return true;
        }
      }) || [];

      console.log(`Found ${filteredItems.length} items suitable for body structure ${bodyStructure}`);

      // Select items for outfit
      const tops = filteredItems.filter(item => 
        item.product_name?.toLowerCase().includes('חולצ') || 
        item.product_name?.toLowerCase().includes('טופ')
      );
      
      const bottoms = filteredItems.filter(item => 
        item.product_name?.toLowerCase().includes('מכנס') || 
        item.product_name?.toLowerCase().includes('חצאית')
      );
      
      const shoes = filteredItems.filter(item => 
        item.product_name?.toLowerCase().includes('נעל')
      );

      if (tops.length > 0 && bottoms.length > 0 && shoes.length > 0) {
        const selectedTop = tops[0];
        const selectedBottom = bottoms[0];
        const selectedShoes = shoes[0];
        
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
              description: `${bodyRecommendations?.description || 'A stylish outfit'} - ${selectedTop?.product_name || 'top'} with ${selectedBottom?.product_name || 'bottom'}`,
              recommendations: bodyRecommendations?.recommendations || [
                "This outfit is tailored for your body structure",
                "The proportions complement your natural silhouette"
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
