export interface OutfitItem {
  color: string;
  product_name: string;
  description: string;
  price: string;
  image: string;
}

export interface GeneratedOutfit {
  top: OutfitItem;
  bottom: OutfitItem;
  shoes: OutfitItem;
  coat?: OutfitItem;
  description: string;
}

export interface OutfitRecommendation {
  recommendations: string[];
  occasion: 'work' | 'casual' | 'weekend' | 'date night' | 'general';
}

// Add new interface for coordinated agent response
export interface CoordinatedOutfitData {
  looks: any[];
  reasoning?: string;
  recommendations: string[];
  validation?: any;
  timestamp: string;
  agentFlow: string;
}

export interface EnhancedOutfitData extends CoordinatedOutfitData {
  learningData?: {
    applied: boolean;
    insights: number;
    homepageIntegration: boolean;
  };
}

export interface OutfitResponse {
  success: boolean;
  data?: EnhancedOutfitData;
  error?: string;
}
