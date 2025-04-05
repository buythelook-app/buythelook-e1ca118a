
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
  },
  Minimalist: {
    top: { type: "T-shirt", color: "beige", style: "clean" },
    bottom: { type: "Straight Trousers", color: "taupe", style: "simple" },
    shoes: { type: "Loafers", color: "tan", style: "minimal" },
    accessory: { type: "Simple Necklace", color: "gold", style: "delicate" },
    sunglasses: { type: "Rectangular", color: "tortoise", style: "frameless" },
    outerwear: { type: "Unstructured Coat", color: "oatmeal", style: "clean-lined" }
  },
  Casual: {
    top: { type: "Cotton T-shirt", color: "light blue", style: "relaxed" },
    bottom: { type: "Denim Jeans", color: "medium blue", style: "straight" },
    shoes: { type: "Canvas Sneakers", color: "white", style: "comfortable" },
    accessory: { type: "Fabric Wristband", color: "navy", style: "casual" },
    sunglasses: { type: "Wayfarer", color: "black", style: "classic" },
    outerwear: { type: "Denim Jacket", color: "blue", style: "relaxed" }
  },
  "Casual Alternative": {
    top: { type: "Jersey Hoodie", color: "grey", style: "cozy" },
    bottom: { type: "Twill Joggers", color: "khaki", style: "relaxed-fit" },
    shoes: { type: "Sporty Sneakers", color: "black", style: "athletic" },
    accessory: { type: "Canvas Cap", color: "charcoal", style: "street" },
    sunglasses: { type: "Sports Wrap", color: "black", style: "functional" },
    outerwear: { type: "Bomber Jacket", color: "olive", style: "streetwear" }
  },
  "Casual Chic": {
    top: { type: "Chambray Shirt", color: "light blue", style: "relaxed button-up" },
    bottom: { type: "Linen Shorts", color: "sand", style: "comfortable" },
    shoes: { type: "Casual Flats", color: "tan", style: "slip-on" },
    accessory: { type: "Woven Bracelet", color: "multi", style: "artisanal" },
    sunglasses: { type: "Round", color: "tortoise", style: "vintage" },
    outerwear: { type: "Light Cardigan", color: "cream", style: "soft knit" }
  }
};

