
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

export interface OutfitResponse {
  success: boolean;
  data?: GeneratedOutfit & { recommendations?: string[], occasion?: string };
  error?: string;
}
