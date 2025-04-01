
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Define types for API parameters
interface OutfitRequest {
  bodyStructure: 'X' | 'V' | 'H' | 'O' | 'A';
  mood: string;
  style: 'classic' | 'romantic' | 'minimalist' | 'casual' | 'boohoo' | 'sporty';
}

// Define the outfit suggestion response type
interface OutfitSuggestion {
  top: string;        // Hex color code
  bottom: string;     // Hex color code
  shoes: string;      // Hex color code
  coat?: string;      // Optional hex color code
  description: string;
  recommendations: string[];
  occasion?: 'work' | 'casual' | 'weekend' | 'date night' | 'general';
}

// Generate a random hex color
function getRandomColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

// Generate outfit suggestions based on user preferences
function generateOutfitSuggestions(params: OutfitRequest): OutfitSuggestion[] {
  console.log("Generating outfit with params:", params);
  
  // Color themes based on style
  const styleColors = {
    classic: {
      tops: ['#FFFFFF', '#E0E0E0', '#2C3E50', '#000000', '#0E2C4B'],
      bottoms: ['#000000', '#1F2833', '#2C3E50', '#FFFFFF', '#808080'],
      shoes: ['#000000', '#5D4037', '#2C3E50', '#808080'],
    },
    romantic: {
      tops: ['#F8BBD0', '#F48FB1', '#F06292', '#FADADD', '#FFEBEE'],
      bottoms: ['#FFFFFF', '#F5F5F5', '#FCE4EC', '#F8BBD0', '#F7CAC9'],
      shoes: ['#F48FB1', '#F06292', '#FFFFFF', '#E91E63'],
    },
    minimalist: {
      tops: ['#FFFFFF', '#F5F5F5', '#ECEFF1', '#E0E0E0', '#FAFAFA'],
      bottoms: ['#000000', '#212121', '#424242', '#616161', '#757575'],
      shoes: ['#000000', '#212121', '#9E9E9E', '#E0E0E0'],
    },
    casual: {
      tops: ['#90CAF9', '#42A5F5', '#F5F5F5', '#BBDEFB', '#2196F3'],
      bottoms: ['#1976D2', '#0D47A1', '#INDIGO', '#303F9F', '#3F51B5'],
      shoes: ['#000000', '#212121', '#1976D2', '#303F9F'],
    },
    boohoo: {
      tops: ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5'],
      bottoms: ['#000000', '#212121', '#1A237E', '#311B92', '#4A148C'],
      shoes: ['#880E4F', '#4A148C', '#311B92', '#000000'],
    },
    sporty: {
      tops: ['#FFFFFF', '#F5F5F5', '#EEEEEE', '#00B0FF', '#2979FF'],
      bottoms: ['#000000', '#212121', '#0D47A1', '#1A237E', '#01579B'],
      shoes: ['#E65100', '#F57F17', '#FF6F00', '#000000'],
    }
  };
  
  // Get colors based on style
  const colors = styleColors[params.style] || styleColors.classic;
  
  // Adjust colors based on body structure
  const bodyAdjustedColors = adjustColorsForBody(colors, params.bodyStructure);
  
  // Further adjust based on mood
  const moodAdjustedColors = adjustColorsForMood(bodyAdjustedColors, params.mood);
  
  // Generate descriptions based on chosen colors and style
  const outfits: OutfitSuggestion[] = [];
  
  // Generate 1-3 outfit suggestions
  const numOutfits = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 0; i < numOutfits; i++) {
    const top = getRandomArrayElement(moodAdjustedColors.tops);
    const bottom = getRandomArrayElement(moodAdjustedColors.bottoms);
    const shoes = getRandomArrayElement(moodAdjustedColors.shoes);
    
    // Sometimes add a coat
    const hasCoat = Math.random() > 0.6;
    const coat = hasCoat ? getRandomArrayElement([...moodAdjustedColors.tops, ...moodAdjustedColors.bottoms]) : undefined;
    
    // Generate description and recommendations
    const description = generateDescription(top, bottom, shoes, coat, params.style);
    const recommendations = generateRecommendations(params.style, params.bodyStructure);
    
    // Determine appropriate occasion
    const occasions: Array<'work' | 'casual' | 'weekend' | 'date night' | 'general'> = 
      ['work', 'casual', 'weekend', 'date night', 'general'];
    const occasion = getRandomArrayElement(occasions);
    
    outfits.push({
      top,
      bottom,
      shoes,
      ...(coat && { coat }),
      description,
      recommendations,
      occasion
    });
  }
  
  return outfits;
}

// Helper to get random array element
function getRandomArrayElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Adjust colors based on body structure
function adjustColorsForBody(colors: any, bodyStructure: string): any {
  const adjustedColors = {...colors};
  
  switch (bodyStructure) {
    case 'X':
      // Balanced - no specific adjustments needed
      break;
    case 'A':
      // Pear - lighter tops, darker bottoms
      adjustedColors.tops = colors.tops.filter((c: string) => 
        isLighterColor(c) || c === '#FFFFFF' || c.includes('F5'));
      break;
    case 'V':
      // Inverted triangle - darker tops, lighter bottoms
      adjustedColors.bottoms = colors.bottoms.filter((c: string) => 
        isLighterColor(c) || c === '#FFFFFF' || c.includes('F5'));
      break;
    case 'H':
      // Rectangle - add contrast between top and bottom
      break;
    case 'O':
      // Round - prefer darker colors
      adjustedColors.tops = [...colors.tops.filter((c: string) => !isLighterColor(c))];
      adjustedColors.bottoms = [...colors.bottoms.filter((c: string) => !isLighterColor(c))];
      break;
    default:
      // No adjustment
      break;
  }
  
  return adjustedColors;
}

// Basic check if a color is lighter
function isLighterColor(hexColor: string): boolean {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  
  // Calculate perceived brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return brightness > 128;
}

// Adjust colors based on mood
function adjustColorsForMood(colors: any, mood: string): any {
  const adjustedColors = {...colors};
  
  switch (mood.toLowerCase()) {
    case 'mystery':
      // Darker, more muted colors
      adjustedColors.tops = [...colors.tops.filter((c: string) => !isLighterColor(c))];
      adjustedColors.bottoms = [...colors.bottoms.filter((c: string) => !isLighterColor(c))];
      break;
    case 'elegant':
      // Sophisticated colors
      break;
    case 'energized':
      // Brighter colors
      break;
    case 'calm':
      // Soft, muted colors
      break;
    case 'passionate':
      // Add some reds
      adjustedColors.tops = [...colors.tops, '#B71C1C', '#C62828'];
      break;
    case 'powerful':
      // Add some deep colors
      adjustedColors.tops = [...colors.tops, '#1A237E', '#311B92'];
      break;
    default:
      // No specific adjustment
      break;
  }
  
  return adjustedColors;
}

// Generate description for outfit
function generateDescription(top: string, bottom: string, shoes: string, coat: string | undefined, style: string): string {
  const topDescriptions: Record<string, string[]> = {
    '#FFFFFF': ['white', 'pure white', 'clean white', 'crisp white'],
    '#000000': ['black', 'sleek black', 'classic black', 'deep black'],
    '#F5F5F5': ['light gray', 'off-white', 'soft white', 'neutral']
  };
  
  const bottomDescriptions: Record<string, string[]> = {
    '#000000': ['black', 'classic black', 'deep black', 'midnight'],
    '#FFFFFF': ['white', 'bright white', 'clean white', 'light'],
    '#212121': ['charcoal', 'dark gray', 'deep gray', 'slate']
  };
  
  const shoesDescriptions: Record<string, string[]> = {
    '#000000': ['black', 'sleek black', 'classic black', 'elegant black'],
    '#5D4037': ['brown', 'chocolate brown', 'deep brown', 'mahogany'],
    '#FFFFFF': ['white', 'bright white', 'clean white', 'fresh white']
  };
  
  // Get color descriptions or generate generic ones
  const topDesc = topDescriptions[top]
    ? getRandomArrayElement(topDescriptions[top])
    : 'sophisticated';
    
  const bottomDesc = bottomDescriptions[bottom]
    ? getRandomArrayElement(bottomDescriptions[bottom])
    : 'elegant';
    
  const shoesDesc = shoesDescriptions[shoes]
    ? getRandomArrayElement(shoesDescriptions[shoes])
    : 'complementary';
  
  // Style-specific item words
  const topItems = {
    classic: ['blouse', 'shirt', 'top'],
    romantic: ['blouse', 'ruffled top', 'floral top'],
    minimalist: ['t-shirt', 'simple top', 'sleek shirt'],
    casual: ['tee', 'casual top', 'comfortable shirt'],
    boohoo: ['statement top', 'bold shirt', 'graphic tee'],
    sporty: ['athletic top', 'sporty tee', 'performance shirt']
  };
  
  const bottomItems = {
    classic: ['trousers', 'pants', 'slacks'],
    romantic: ['skirt', 'flowing pants', 'maxi skirt'],
    minimalist: ['pants', 'tailored trousers', 'sleek bottoms'],
    casual: ['jeans', 'casual pants', 'comfortable bottoms'],
    boohoo: ['statement pants', 'bold bottoms', 'patterned skirt'],
    sporty: ['track pants', 'athletic bottoms', 'performance leggings']
  };
  
  const shoesItems = {
    classic: ['shoes', 'loafers', 'pumps'],
    romantic: ['heels', 'strappy sandals', 'elegant flats'],
    minimalist: ['flats', 'minimal sneakers', 'clean shoes'],
    casual: ['sneakers', 'casual shoes', 'comfortable footwear'],
    boohoo: ['statement shoes', 'bold footwear', 'eye-catching boots'],
    sporty: ['athletic shoes', 'trainers', 'running shoes']
  };
  
  // Get style-specific items
  const topItem = topItems[style as keyof typeof topItems]
    ? getRandomArrayElement(topItems[style as keyof typeof topItems])
    : 'top';
    
  const bottomItem = bottomItems[style as keyof typeof bottomItems]
    ? getRandomArrayElement(bottomItems[style as keyof typeof bottomItems])
    : 'bottom';
    
  const shoesItem = shoesItems[style as keyof typeof shoesItems]
    ? getRandomArrayElement(shoesItems[style as keyof typeof shoesItems])
    : 'shoes';
  
  // Generate description
  let description = `A ${style} ensemble featuring a ${topDesc} ${topItem} paired with ${bottomDesc} ${bottomItem} and ${shoesDesc} ${shoesItem}.`;
  
  // Add coat to description if present
  if (coat) {
    const coatDesc = topDescriptions[coat]
      ? getRandomArrayElement(topDescriptions[coat])
      : 'complementary';
      
    description += ` Complete with a ${coatDesc} outer layer for added style.`;
  }
  
  return description;
}

// Generate style recommendations
function generateRecommendations(style: string, bodyStructure: string): string[] {
  const generalRecommendations = [
    "Add a statement accessory to enhance your look",
    "Layer with a complementary jacket for cooler weather",
    "Consider a structured handbag to complete the outfit"
  ];
  
  const styleRecommendations: Record<string, string[]> = {
    classic: [
      "Add a pearl necklace for an elegant touch",
      "A structured blazer would elevate this look",
      "Minimal jewelry works best with this refined outfit"
    ],
    romantic: [
      "Add soft, flowing accessories like scarves",
      "Delicate jewelry will complement this feminine look",
      "Consider a floral hair accessory for special occasions"
    ],
    minimalist: [
      "Keep accessories minimal and geometric",
      "A single statement piece works best with this clean look",
      "Consider monochromatic layering for visual interest"
    ],
    casual: [
      "Add a colorful accessory for a fun pop",
      "A casual crossbody bag would complement this relaxed outfit",
      "Roll up sleeves or cuffs for an effortless vibe"
    ],
    boohoo: [
      "Layer with multiple accessories for maximum impact",
      "Don't shy away from bold, contrasting colors",
      "Mix patterns for an eye-catching statement"
    ],
    sporty: [
      "Add a sporty watch or fitness tracker",
      "A baseball cap or beanie can complete this athletic look",
      "Consider performance fabrics for comfort"
    ]
  };
  
  const bodyRecommendations: Record<string, string[]> = {
    X: [
      "This balanced silhouette works perfectly for your X body type",
      "Define your waist to highlight your proportional figure",
      "Both fitted and flowing pieces work well for your balanced shape"
    ],
    A: [
      "The lighter top balances your pear-shaped figure",
      "Draw attention upward with interesting necklines or shoulder details",
      "A-line or flared bottoms complement your shape beautifully"
    ],
    V: [
      "This combination balances your broader shoulders",
      "Darker tops with lighter bottoms create visual harmony",
      "Add volume to your lower body with textured or patterned bottoms"
    ],
    H: [
      "Create curves with waist-defining pieces",
      "Add dimension with layered pieces or textured fabrics",
      "Belt at the waist to create definition for your rectangular shape"
    ],
    O: [
      "Elongate your silhouette with vertical details",
      "Structured pieces create a flattering line for your round shape",
      "V-necks and empire waistlines are particularly flattering for you"
    ]
  };
  
  // Get recommendations specific to style and body type
  const specificStyleRecs = styleRecommendations[style] || [];
  const specificBodyRecs = bodyRecommendations[bodyStructure] || [];
  
  // Combine and select 2-4 recommendations
  const allRecommendations = [...specificStyleRecs, ...specificBodyRecs, ...generalRecommendations];
  const shuffled = allRecommendations.sort(() => 0.5 - Math.random());
  
  const numRecommendations = Math.floor(Math.random() * 3) + 2; // 2-4 recommendations
  return shuffled.slice(0, numRecommendations);
}

// Main server function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request
    const { bodyStructure, style, mood } = await req.json() as OutfitRequest;
    
    console.log("Received request with parameters:", { bodyStructure, style, mood });
    
    // Validate required parameters
    if (!bodyStructure || !style) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required parameters. Please provide bodyStructure and style." 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Generate outfit suggestions
    const outfitSuggestions = generateOutfitSuggestions({
      bodyStructure: bodyStructure as 'X' | 'V' | 'H' | 'O' | 'A',
      style: style as 'classic' | 'romantic' | 'minimalist' | 'casual' | 'boohoo' | 'sporty',
      mood: mood || 'energized'
    });
    
    // Return the response
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: outfitSuggestions 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to generate outfit suggestions.",
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
