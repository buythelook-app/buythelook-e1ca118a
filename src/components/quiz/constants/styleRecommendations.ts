import { StyleRecommendations } from '../types/styleTypes';

export const styleRecommendations: Record<string, StyleRecommendations> = {
  Modern: {
    top: { type: "T-shirt", color: "black", style: "fitted" },
    bottom: { type: "Jeans", color: "dark blue", style: "slim" },
    shoes: { type: "Sneakers", color: "white", style: "minimalist" },
    accessory: { type: "Watch", color: "silver", style: "digital" },
    sunglasses: { type: "Wayfarer", color: "black", style: "modern" },
    outerwear: { type: "Bomber Jacket", color: "black", style: "sleek" }
  },
  Classic: {
    top: { type: "Blouse", color: "white", style: "elegant" },
    bottom: { type: "Trousers", color: "navy", style: "tailored" },
    shoes: { type: "Heels", color: "black", style: "classic" },
    accessory: { type: "Pearl Necklace", color: "white", style: "timeless" },
    sunglasses: { type: "Aviator", color: "gold", style: "classic" },
    outerwear: { type: "Blazer", color: "navy", style: "fitted" }
  },
  Nordic: {
    top: { type: "Sweater", color: "cream", style: "oversized" },
    bottom: { type: "Pants", color: "beige", style: "relaxed" },
    shoes: { type: "Boots", color: "brown", style: "minimal" },
    accessory: { type: "Scarf", color: "gray", style: "chunky" },
    sunglasses: { type: "Round", color: "tortoise", style: "vintage" },
    outerwear: { type: "Wool Coat", color: "camel", style: "structured" }
  },
  Sporty: {
    top: { type: "Athletic Shirt", color: "gray", style: "performance" },
    bottom: { type: "Leggings", color: "black", style: "compression" },
    shoes: { type: "Running Shoes", color: "multi", style: "athletic" },
    accessory: { type: "Sports Watch", color: "black", style: "digital" },
    sunglasses: { type: "Sport Wrap", color: "black", style: "performance" },
    outerwear: { type: "Track Jacket", color: "navy", style: "athletic" }
  }
};