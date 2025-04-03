
import { StyleRecommendations } from '../types/styleTypes';

/**
 * Application Description:
 * 
 * Fashion Outfit Generator is a personalized styling application that creates AI-powered outfit recommendations
 * based on users' body structure, mood, and preferred style. The application uses a combination of frontend React
 * components and backend Supabase services to provide a seamless fashion recommendation experience.
 * 
 * Frontend Features:
 * - Style quiz to collect user preferences and body measurements
 * - Personalized outfit recommendations with color visualization
 * - Responsive design for mobile and desktop viewing
 * - Mood-based filtering for different outfit occasions
 * - Outfit detail views with style tips and recommendations
 * - Interactive UI with style canvas visualization
 * 
 * Backend Services:
 * - Supabase database for storing user preferences and style profiles
 * - AI-powered outfit generation via edge functions
 * - Color-based item matching algorithm
 * - User authentication and profile management
 * - Storage of outfit suggestions and recommendations
 *
 * The app helps users discover their personal style and get outfit recommendations that
 * match their body type, color preferences, and style profile while adapting to
 * different moods and occasions.
 */

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

// Mapping function to normalize style names for matching
export const mapStylePreference = (stylePreference: string): string => {
  // Normalize style name for consistent matching
  const normalizedStyle = stylePreference.toLowerCase().trim();
  
  // Map common variations to our standard style categories
  if (normalizedStyle.includes('classic') || normalizedStyle.includes('elegant') || normalizedStyle.includes('sophisticated')) {
    return 'Classic';
  } else if (normalizedStyle.includes('minimal') || normalizedStyle.includes('simple') || normalizedStyle.includes('clean')) {
    return 'Minimalist';
  } else if (normalizedStyle.includes('modern') || normalizedStyle.includes('contemporary')) {
    return 'Modern';
  } else if (normalizedStyle.includes('boho') || normalizedStyle.includes('boo hoo') || normalizedStyle.includes('bohemian')) {
    return 'Boo Hoo';
  } else if (normalizedStyle.includes('nordic') || normalizedStyle.includes('scandinavian')) {
    return 'Nordic';
  } else if (normalizedStyle.includes('classy') || normalizedStyle.includes('luxe') || normalizedStyle.includes('luxury')) {
    return 'Classy';
  } else if (normalizedStyle.includes('work') || normalizedStyle.includes('professional') || normalizedStyle.includes('business')) {
    return 'Work';
  }
  
  // Default to Classic if no match is found
  return 'Classic';
};

// Get recommendations based on user style preferences
export const getRecommendationsForUserStyle = (userStyle: string): StyleRecommendations => {
  const mappedStyle = mapStylePreference(userStyle);
  return styleRecommendations[mappedStyle] || styleRecommendations.Classic;
};
