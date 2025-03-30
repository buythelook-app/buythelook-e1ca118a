
export interface StyleItem {
  type: string;
  color: string;
  style: string;
}

export interface StyleRecommendations {
  top: StyleItem;
  bottom: StyleItem;
  shoes: StyleItem;
  accessory: StyleItem;
  sunglasses: StyleItem;
  outerwear: StyleItem;
  essentials?: Array<{
    category: string;
    items: string[];
  }>;
}
