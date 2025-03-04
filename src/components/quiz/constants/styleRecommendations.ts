
import { StyleRecommendations } from '../types/styleTypes';

export const styleRecommendations: Record<string, StyleRecommendations> = {
  Classic: {
    top: { type: "Blouse", color: "white", style: "elegant" },
    bottom: { type: "Trousers", color: "navy", style: "tailored" },
    shoes: { type: "Heels", color: "black", style: "classic" },
    accessory: { type: "Pearl Necklace", color: "white", style: "timeless" },
    sunglasses: { type: "Aviator", color: "gold", style: "classic" },
    outerwear: { type: "Blazer", color: "navy", style: "fitted" }
  },
  Modern: {
    top: { type: "Tee", color: "white", style: "minimalist" },
    bottom: { type: "Trousers", color: "light gray", style: "relaxed" },
    shoes: { type: "Ankle Boots", color: "black", style: "sleek" },
    accessory: { type: "Watch", color: "silver", style: "digital" },
    sunglasses: { type: "Wayfarer", color: "black", style: "modern" },
    outerwear: { type: "Blazer", color: "black", style: "oversized" }
  },
  Classy: {
    top: { type: "Silk Blouse", color: "cream", style: "luxurious" },
    bottom: { type: "Pencil Skirt", color: "black", style: "fitted" },
    shoes: { type: "Pumps", color: "nude", style: "elegant" },
    accessory: { type: "Diamond Studs", color: "silver", style: "timeless" },
    sunglasses: { type: "Cat Eye", color: "tortoise", style: "sophisticated" },
    outerwear: { type: "Trench Coat", color: "beige", style: "classic" }
  },
  "Boo Hoo": {
    top: { type: "Halter Top", color: "black", style: "fitted" },
    bottom: { type: "Jeans", color: "gray", style: "high-waisted" },
    shoes: { type: "Ankle Boots", color: "black", style: "heeled" },
    accessory: { type: "Statement Earrings", color: "silver", style: "dangling" },
    sunglasses: { type: "Round", color: "brown", style: "oversized" },
    outerwear: { type: "Leather Jacket", color: "black", style: "cropped" }
  },
  Nordic: {
    top: { type: "Sweater", color: "cream", style: "chunky" },
    bottom: { type: "Trousers", color: "beige", style: "relaxed" },
    shoes: { type: "Ankle Boots", color: "black", style: "chunky" },
    accessory: { type: "Minimal Jewelry", color: "silver", style: "simple" },
    sunglasses: { type: "Round", color: "tortoise", style: "minimal" },
    outerwear: { type: "Wool Coat", color: "camel", style: "oversized" }
  }
};
