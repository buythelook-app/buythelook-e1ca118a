
import { StyleRecommendations } from '../types/styleTypes';

export const styleRecommendations: Record<string, StyleRecommendations> = {
  Classic: {
    top: { type: "Blouse", color: "white", style: "elegant" },
    bottom: { type: "Tailored Trousers", color: "navy", style: "fitted" },
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
    bottom: { type: "High-Waisted Jeans", color: "gray", style: "distressed" },
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
  },
  Minimalist: {
    top: { type: "Button-down Shirt", color: "white", style: "clean" },
    bottom: { type: "Tailored Trousers", color: "black", style: "straight-leg" },
    shoes: { type: "Leather Loafers", color: "black", style: "minimal" },
    accessory: { type: "Simple Necklace", color: "gold", style: "delicate" },
    sunglasses: { type: "Rectangular", color: "black", style: "frameless" },
    outerwear: { type: "Structured Blazer", color: "black", style: "clean-lined" },
    essentials: [
      { category: "tops", items: ["White button-down", "Black crew neck tee", "Gray v-neck tee", "Beige turtleneck", "Black lightweight sweater"] },
      { category: "bottoms", items: ["Black tailored trousers", "Dark blue straight-leg jeans", "Navy wide-leg pants", "Black pencil skirt"] },
      { category: "dresses", items: ["Black slip dress", "Beige shirt dress", "Black wrap dress"] },
      { category: "outerwear", items: ["Black structured blazer", "Beige trench coat", "Navy wool coat", "Black leather jacket"] },
      { category: "shoes", items: ["Black leather loafers", "White leather sneakers", "Black Chelsea boots", "Nude pointed-toe pumps", "Black strappy sandals"] }
    ]
  },
  Work: {
    top: { type: "Button-down Shirt", color: "light blue", style: "crisp" },
    bottom: { type: "Tailored Trousers", color: "navy", style: "straight-leg" },
    shoes: { type: "Loafers", color: "brown", style: "polished" },
    accessory: { type: "Watch", color: "silver", style: "professional" },
    sunglasses: { type: "Classic", color: "black", style: "subtle" },
    outerwear: { type: "Blazer", color: "navy", style: "structured" }
  }
};
