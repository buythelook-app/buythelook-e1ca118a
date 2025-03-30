import { DashboardItem, OutfitItem, MinimalistCriteria } from "@/types/lookTypes";
import { EventType, EVENT_TO_STYLES } from "@/components/filters/eventTypes";

const API_URL = 'https://mwsblnposuyhrgzrtoyo.supabase.co/functions/v1/generate-outfit';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13c2JsbnBvc3V5aHJnenJ0b3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4OTUyOTYsImV4cCI6MjA1MzQ3MTI5Nn0.gyU3tLyZ_1yY82BKkii8EyeaGzFn9muZR6G6ELJocQk';

const MINIMALIST_CRITERIA: MinimalistCriteria = {
  naturalColors: [
    'black', 'white', 'grey', 'gray', 'beige', 'cream', 'ivory', 'tan', 
    'camel', 'navy', 'olive', 'brown', 'khaki', 'taupe', 'nude', 'charcoal',
    'stone', 'sand', 'oatmeal', 'neutral', 'off-white', 'ecru'
  ],
  nonMinimalistPatterns: [
    'floral', 'animal', 'graphic', 'print', 'logo', 'pattern', 'plaid', 'check',
    'stripe', 'polka', 'dot', 'sequin', 'glitter', 'embellish', 'embroidery',
    'neon', 'vibrant', 'bright', 'multi-color', 'colorful', 'paisley', 'abstract'
  ],
  acceptableTopTypes: [
    't-shirt', 'tee', 'shirt', 'blouse', 'sweater', 'pullover', 'tunic',
    'turtleneck', 'mock neck', 'tank', 'camisole', 'button-up', 'button-down',
    'oxford', 'henley', 'v-neck', 'crewneck', 'cotton shirt'
  ],
  acceptableBottomTypes: [
    'pant', 'trouser', 'jean', 'denim', 'chino', 'skirt', 'short',
    'straight leg', 'wide leg', 'tailored', 'cigarette', 'high waist',
    'linen', 'cotton', 'wool'
  ],
  acceptableShoeTypes: [
    'loafer', 'oxford', 'flat', 'mule', 'slide', 'ballet', 'pump',
    'leather', 'minimal', 'simple', 'clean', 'sneaker', 'derby', 'sandal',
    'ankle boot', 'chelsea boot'
  ],
  preferredColors: {
    top: ['white', 'cream', 'beige', 'ivory', 'oatmeal', 'sand', 'off-white', 'ecru', 'grey', 'gray'],
    bottom: ['black', 'navy', 'charcoal', 'grey', 'gray', 'tan', 'taupe', 'khaki', 'olive', 'brown'],
    shoes: ['black', 'brown', 'tan', 'white', 'beige', 'nude', 'camel']
  }
};

const mapBodyShape = (shape: string): "X" | "V" | "H" | "O" | "A" => {
  const shapeMap: { [key: string]: "X" | "V" | "H" | "O" | "A" } = {
    hourglass: "X",
    athletic: "H",
    pear: "A",
    apple: "O",
    rectangle: "H",
    inverted_triangle: "V"
  };
  return shapeMap[shape.toLowerCase()] || "H";
};

const mapStyle = (style: string): "classic" | "romantic" | "minimalist" | "casual" | "boohoo" | "sporty" => {
  const styleMap: { [key: string]: "classic" | "romantic" | "minimalist" | "casual" | "boohoo" | "sporty" } = {
    elegant: "classic",
    romantic: "romantic",
    minimal: "minimalist",
    minimalist: "minimalist",
    Minimalist: "minimalist",
    casual: "casual",
    bohemian: "boohoo",
    boohoo: "boohoo",
    athletic: "sporty",
    sportive: "sporty",
    Classy: "classic",
    Classic: "classic",
    Modern: "minimalist",
    "Boo Hoo": "boohoo",
    Nordic: "minimalist",
    Sporty: "sporty"
  };
  
  console.log("Mapping style:", style, "to:", styleMap[style] || "casual");
  return styleMap[style] || "casual";
};

const getEventStyles = (): string => {
  const selectedEvent = localStorage.getItem('selected-event') as EventType | null;
  
  if (selectedEvent && selectedEvent in EVENT_TO_STYLES) {
    const eventStyles = EVENT_TO_STYLES[selectedEvent as Exclude<EventType, null>];
    console.log("Using event styles:", eventStyles);
    return eventStyles[0] || "classic";
  }
  
  console.log("No event selected or invalid event, using default style");
  return "classic";
};

const validateMood = (mood: string | null): string => {
  const validMoods = [
    "mystery", "quiet", "elegant", "energized", 
    "flowing", "optimist", "calm", "romantic", 
    "unique", "sweet", "childish", "passionate", 
    "powerful"
  ];
  
  if (!mood || !validMoods.includes(mood.toLowerCase())) {
    return "energized";
  }
  return mood.toLowerCase();
};

const requestCache = new Map();

const generateOutfit = async (bodyStructure: string, style: string, mood: string) => {
  try {
    const cacheKey = `${bodyStructure}:${style}:${mood}`;
    
    if (requestCache.has(cacheKey)) {
      console.log('Using cached outfit data for:', cacheKey);
      return requestCache.get(cacheKey);
    }
    
    const requestBody = {
      bodyStructure,
      style,
      mood: validateMood(mood)
    };
    
    console.log('Generating outfit with params:', requestBody);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY,
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit'
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API response:', data);
    
    requestCache.set(cacheKey, data);
    
    if (requestCache.size > 20) {
      const oldestKey = requestCache.keys().next().value;
      requestCache.delete(oldestKey);
    }
    
    return data;
  } catch (error) {
    console.error('Error in generateOutfit:', error);
    throw error;
  }
};

const extractText = (item: any): { name: string; description: string; color: string; type: string } => {
  if (!item) return { name: '', description: '', color: '', type: '' };
  
  return {
    name: (item.product_name || '').toLowerCase(),
    description: (item.description || '').toLowerCase(),
    color: (item.color || '').toLowerCase(),
    type: (item.type || item.category || '').toLowerCase()
  };
};

const hasNonMinimalistPattern = (item: any): boolean => {
  if (!item) return false;
  
  const text = extractText(item);
  
  return MINIMALIST_CRITERIA.nonMinimalistPatterns.some(pattern => 
    text.name.includes(pattern) || 
    text.description.includes(pattern)
  );
};

const isUnderwear = (item: any): boolean => {
  if (!item) return false;
  
  const text = extractText(item);
  const underwearTerms = ['underwear', 'lingerie', 'bra', 'panties', 'briefs', 'boxer', 'thong'];
  
  return underwearTerms.some(term => 
    text.name.includes(term) || 
    text.description.includes(term) ||
    text.type.includes(term)
  );
};

const scoreItem = (item: any, type: 'top' | 'bottom' | 'shoes'): number => {
  if (!item) return 0;
  
  let score = 0;
  const text = extractText(item);
  
  if (MINIMALIST_CRITERIA.naturalColors.some(color => 
    text.name.includes(color) || 
    text.description.includes(color) ||
    text.color.includes(color))) {
    score += 15;
  }
  
  if (type in MINIMALIST_CRITERIA.preferredColors) {
    const preferredColors = MINIMALIST_CRITERIA.preferredColors[type as keyof typeof MINIMALIST_CRITERIA.preferredColors];
    if (preferredColors.some(color => 
      text.name.includes(color) || 
      text.description.includes(color) ||
      text.color.includes(color))) {
      score += 25;
    }
  }
  
  if (hasNonMinimalistPattern(item)) {
    score -= 50;
  }
  
  return score;
};

const hasMinimalistColor = (item: any, preferredColors?: string[]): boolean => {
  if (!item) return false;
  
  const text = extractText(item);
  
  if (preferredColors && preferredColors.length > 0) {
    if (preferredColors.some(color => 
      text.name.includes(color) || 
      text.description.includes(color) ||
      text.color.includes(color))) {
      console.log(`Found preferred color in item: ${text.name}`);
      return true;
    }
  }
  
  return MINIMALIST_CRITERIA.naturalColors.some(color => 
    text.name.includes(color) || 
    text.description.includes(color) ||
    text.color.includes(color)
  );
};

const isMinimalistTop = (item: any): boolean => {
  if (!item) return false;
  
  const text = extractText(item);
  
  if (hasNonMinimalistPattern(item)) {
    console.log(`Top rejected (pattern/embellishment): ${text.name}`);
    return false;
  }
  
  const hasPriorityColor = hasMinimalistColor(item, MINIMALIST_CRITERIA.preferredColors.top);
  if (hasPriorityColor) {
    console.log(`Top has priority color: ${text.name}`);
  } else {
    const hasNeutralColor = hasMinimalistColor(item);
    if (!hasNeutralColor) {
      console.log(`Top rejected (non-neutral color): ${text.name}`);
      return false;
    }
  }
  
  const isAcceptableType = MINIMALIST_CRITERIA.acceptableTopTypes.some(type => 
    text.name.includes(type) || 
    text.description.includes(type) ||
    text.type.includes(type)
  );
  
  if (isAcceptableType) {
    console.log(`Top accepted (minimalist criteria): ${text.name}`);
    return true;
  }
  
  if (hasPriorityColor && !hasNonMinimalistPattern(item)) {
    console.log(`Top conditionally accepted (natural color, no pattern): ${text.name}`);
    return true;
  }
  
  console.log(`Top rejected (doesn't match minimalist criteria): ${text.name}`);
  return false;
};

const isMinimalistShoe = (item: any): boolean => {
  if (!item) return false;
  
  const text = extractText(item);
  
  const nonMinimalistShoeTerms = [
    'platform', 'chunky', 'high heel', 'stiletto', 'wedge', 
    'glitter', 'sequin', 'rhinestone', 'embellish', 'studded',
    'metallic', 'neon', 'bright', 'multi-color', 'spike', 'printed'
  ];
  
  const hasNonMinimalistFeature = nonMinimalistShoeTerms.some(term => 
    text.name.includes(term) || 
    text.description.includes(term)
  );
  
  if (hasNonMinimalistFeature) {
    console.log(`Shoes rejected (non-minimalist feature): ${text.name}`);
    return false;
  }
  
  const hasPriorityColor = hasMinimalistColor(item, MINIMALIST_CRITERIA.preferredColors.shoes);
  if (hasPriorityColor) {
    console.log(`Shoes have priority color: ${text.name}`);
  } else {
    const hasNeutralColor = hasMinimalistColor(item);
    if (!hasNeutralColor) {
      console.log(`Shoes rejected (non-neutral color): ${text.name}`);
      return false;
    }
  }
  
  const isAcceptableType = MINIMALIST_CRITERIA.acceptableShoeTypes.some(type => 
    text.name.includes(type) || 
    text.description.includes(type)
  );
  
  if (isAcceptableType) {
    console.log(`Shoes accepted (minimalist criteria): ${text.name}`);
    return true;
  }
  
  if (hasPriorityColor && !hasNonMinimalistPattern(item)) {
    console.log(`Shoes conditionally accepted (natural color, no pattern): ${text.name}`);
    return true;
  }
  
  console.log(`Shoes rejected (doesn't match minimalist criteria): ${text.name}`);
  return false;
};

const isMinimalistStyleItem = (item: any, type: string): boolean => {
  if (!item) return false;
  
  switch (type.toLowerCase()) {
    case 'top':
      return isMinimalistTop(item);
    case 'bottom':
      return isMinimalistBottom(item);
    case 'shoes':
      return isMinimalistShoe(item);
    default:
      return hasMinimalistColor(item) && !hasNonMinimalistPattern(item);
  }
};

const extractImageUrl = (product: any): string => {
  if (!product) return '';
  
  try {
    if (Array.isArray(product.image)) {
      return product.image[0] || '';
    }
    return product.image || '';
  } catch (error) {
    console.error('Error extracting image URL:', error);
    return '';
  }
};

const convertToDashboardItem = (item: any, type: string, userStyle: string = ''): DashboardItem | null => {
  if (!item) return null;
  
  if (isUnderwear(item)) {
    console.log('Filtering out underwear item:', item.product_name);
    return null;
  }
  
  if (userStyle === 'Minimalist') {
    if (!isMinimalistStyleItem(item, type)) {
      const text = extractText(item);
      console.log(`Rejected ${type} item for minimalist style: ${text.name}`);
      return null;
    }
  }
  
  const imageUrl = extractImageUrl(item);
  if (!imageUrl) return null;

  return {
    id: String(item.product_id || Math.random()),
    name: item.product_name || `${type.charAt(0).toUpperCase() + type.slice(1)} Item`,
    description: item.description || '',
    image: imageUrl,
    price: item.price ? `$${Number(item.price).toFixed(2)}` : '$49.99',
    type: type
  };
};

const getItemIdentifier = (item: any): string => {
  if (item.product_id?.toString()) return item.product_id.toString();
  if (item.image?.toString()) return item.image.toString();
  return Math.random().toString();
};

export const fetchFirstOutfitSuggestion = async (): Promise<DashboardItem[]> => {
  try {
    const quizData = localStorage.getItem('styleAnalysis');
    const currentMood = localStorage.getItem('current-mood');
    const styleAnalysis = quizData ? JSON.parse(quizData) : null;
    
    if (!styleAnalysis?.analysis) {
      throw new Error('Style analysis data is missing');
    }

    const bodyShape = mapBodyShape(styleAnalysis.analysis.bodyShape || 'H');
    const eventStyle = getEventStyles();
    const preferredStyle = styleAnalysis.analysis.styleProfile || 'classic';
    const style = mapStyle(eventStyle || preferredStyle);
    const mood = validateMood(currentMood);

    console.log("Using user's preferred style from quiz:", preferredStyle);

    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(generateOutfit(bodyShape, style, mood));
    }
    
    const responses = await Promise.all(promises);
    
    const allTops: any[] = [];
    const allBottoms: any[] = [];
    const allShoes: any[] = [];
    
    responses.forEach(response => {
      if (Array.isArray(response.data)) {
        response.data.forEach(outfit => {
          if (outfit.top) allTops.push(outfit.top);
          if (outfit.bottom) allBottoms.push(outfit.bottom);
          if (outfit.shoes) allShoes.push(outfit.shoes);
        });
      }
    });
    
    console.log(`Found ${allTops.length} tops, ${allBottoms.length} bottoms, and ${allShoes.length} shoes to filter`);
    
    const filteredTops = allTops
      .filter(top => isMinimalistTop(top))
      .sort((a, b) => scoreItem(b, 'top') - scoreItem(a, 'top'));
    
    const filteredBottoms = allBottoms
      .filter(bottom => isMinimalistBottom(bottom))
      .sort((a, b) => scoreItem(b, 'bottom') - scoreItem(a, 'bottom'));
    
    const filteredShoes = allShoes
      .filter(shoes => isMinimalistShoe(shoes))
      .sort((a, b) => scoreItem(b, 'shoes') - scoreItem(a, 'shoes'));
    
    console.log(`After filtering: ${filteredTops.length} tops, ${filteredBottoms.length} bottoms, and ${filteredShoes.length} shoes match minimalist criteria`);
    
    const topItem = filteredTops.length > 0 ? convertToDashboardItem(filteredTops[0], 'top', preferredStyle) : null;
    const bottomItem = filteredBottoms.length > 0 ? convertToDashboardItem(filteredBottoms[0], 'bottom', preferredStyle) : null;
    const shoesItem = filteredShoes.length > 0 ? convertToDashboardItem(filteredShoes[0], 'shoes', preferredStyle) : null;
    
    const items: DashboardItem[] = [];
    
    if (topItem) {
      items.push(topItem);
      console.log("Selected minimalist top:", topItem.name);
    }
    
    if (bottomItem) {
      items.push(bottomItem);
      console.log("Selected minimalist bottom:", bottomItem.name);
    }
    
    if (shoesItem) {
      items.push(shoesItem);
      console.log("Selected minimalist shoes:", shoesItem.name);
    }
    
    if (items.length < 2 && allTops.length > 0 && !topItem) {
      const fallbackTop = convertToDashboardItem(allTops[0], 'top');
      if (fallbackTop) {
        items.push(fallbackTop);
        console.log("Added fallback top (not strictly minimalist):", fallbackTop.name);
      }
    }
    
    if (items.length < 2 && allBottoms.length > 0 && !bottomItem) {
      const fallbackBottom = convertToDashboardItem(allBottoms[0], 'bottom');
      if (fallbackBottom) {
        items.push(fallbackBottom);
        console.log("Added fallback bottom (not strictly minimalist):", fallbackBottom.name);
      }
    }
    
    if (items.length < 3 && allShoes.length > 0 && !shoesItem) {
      const fallbackShoes = convertToDashboardItem(allShoes[0], 'shoes');
      if (fallbackShoes) {
        items.push(fallbackShoes);
        console.log("Added fallback shoes (not strictly minimalist):", fallbackShoes.name);
      }
    }
    
    console.log('Final outfit items:', items);
    
    return items;
  } catch (error) {
    console.error('Error in fetchFirstOutfitSuggestion:', error);
    throw error;
  }
};

export const fetchDashboardItems = async (): Promise<{[key: string]: DashboardItem[]}> => {
  try {
    const quizData = localStorage.getItem('styleAnalysis');
    const currentMood = localStorage.getItem('current-mood');
    const styleAnalysis = quizData ? JSON.parse(quizData) : null;
    
    if (!styleAnalysis?.analysis) {
      throw new Error('Style analysis data is missing');
    }

    const bodyShape = mapBodyShape(styleAnalysis.analysis.bodyShape || 'H');
    
    const userPreferredStyle = styleAnalysis.analysis.styleProfile || 'classic';
    console.log("User's quiz preference:", userPreferredStyle);
    
    const eventStyle = getEventStyles();
    const baseStyle = mapStyle(userPreferredStyle);
    
    const mood = validateMood(currentMood);

    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    const occasionStyles = {
      'Work': [baseStyle, 'classic', 'minimalist'],
      'Casual': [baseStyle, 'casual', 'sporty'],
      'Evening': [baseStyle, 'romantic', 'classic'],
      'Weekend': [baseStyle, 'boohoo', 'casual']
    };
    
    console.log("Using base style for outfit generation:", baseStyle);
    
    const outfitPromises = [];
    
    for (let i = 0; i < occasions.length; i++) {
      const occasion = occasions[i];
      
      const styleOptions = [baseStyle, ...(occasionStyles[occasion as keyof typeof occasionStyles] || [])];
      
      const uniqueStyles = Array.from(new Set(styleOptions));
      
      const selectedStyle = uniqueStyles[0];
      
      console.log(`Generating outfit for ${occasion} with style: ${selectedStyle}`);
      
      outfitPromises.push(generateOutfit(bodyShape, selectedStyle, mood));
    }
    
    const responses = await Promise.all(outfitPromises);
    const occasionOutfits: {[key: string]: DashboardItem[]} = {};
    const usedItemIds = new Set<string>();

    for (let index = 0; index < responses.length; index++) {
      const response = responses[index];
      const occasion = occasions[index];
      occasionOutfits[occasion] = [];
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        let outfitFound = false;
        
        for (const outfit of response.data) {
          const outfitItems: DashboardItem[] = [];
          const outfitItemIds: string[] = [];
          
          if (outfit.top) {
            const topId = getItemIdentifier(outfit.top);
            if (!usedItemIds.has(topId)) {
              const topItem = convertToDashboardItem(outfit.top, 'top');
              if (topItem) {
                outfitItems.push(topItem);
                outfitItemIds.push(topId);
              }
            }
          }
          
          if (outfit.bottom) {
            const bottomId = getItemIdentifier(outfit.bottom);
            if (!usedItemIds.has(bottomId)) {
              const bottomItem = convertToDashboardItem(outfit.bottom, 'bottom');
              if (bottomItem) {
                outfitItems.push(bottomItem);
                outfitItemIds.push(bottomId);
              }
            }
          }
          
          if (outfit.shoes) {
            const shoesId = getItemIdentifier(outfit.shoes);
            if (!usedItemIds.has(shoesId)) {
              const shoesItem = convertToDashboardItem(outfit.shoes, 'shoes');
              if (shoesItem) {
                outfitItems.push(shoesItem);
                outfitItemIds.push(shoesId);
              }
            }
          }
          
          if (outfitItems.length >= 2) {
            occasionOutfits[occasion] = outfitItems;
            outfitItemIds.forEach(id => usedItemIds.add(id));
            outfitFound = true;
            break;
          }
        }
        
        if (!outfitFound && response.data[0]) {
          const outfit = response.data[0];
          const partialOutfit: DashboardItem[] = [];
          
          if (outfit.top) {
            const topId = getItemIdentifier(outfit.top);
            if (!usedItemIds.has(topId)) {
              const topItem = convertToDashboardItem(outfit.top, 'top');
              if (topItem) {
                partialOutfit.push(topItem);
                usedItemIds.add(topId);
              }
            }
          }
          
          if (outfit.bottom) {
            const bottomId = getItemIdentifier(outfit.bottom);
            if (!usedItemIds.has(bottomId)) {
              const bottomItem = convertToDashboardItem(outfit.bottom, 'bottom');
              if (bottomItem) {
                partialOutfit.push(bottomItem);
                usedItemIds.add(bottomId);
              }
            }
          }
          
          if (outfit.shoes) {
            const shoesId = getItemIdentifier(outfit.shoes);
            if (!usedItemIds.has(shoesId)) {
              const shoesItem = convertToDashboardItem(outfit.shoes, 'shoes');
              if (shoesItem) {
                partialOutfit.push(shoesItem);
                usedItemIds.add(shoesId);
              }
            }
          }
          
          if (partialOutfit.length > 0) {
            occasionOutfits[occasion] = partialOutfit;
          }
        }
      }
    }

    console.log('All outfit items by occasion:', occasionOutfits);
    return occasionOutfits;
  } catch (error) {
    console.error('Error in fetchDashboardItems:', error);
    throw error;
  }
};

export const mapDashboardItemToOutfitItem = (item: DashboardItem): OutfitItem => {
  return {
    id: item.id,
    title: item.name,
    description: item.description || 'Stylish piece for your wardrobe',
    image: item.image || '',
    price: item.price || '$49.99',
    type: item.type
  };
};
