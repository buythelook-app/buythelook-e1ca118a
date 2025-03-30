
/**
 * Functions for mapping style data between different formats
 */

import { EventType, EVENT_TO_STYLES } from "@/components/filters/eventTypes";

export const mapBodyShape = (shape: string): "X" | "V" | "H" | "O" | "A" => {
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

export const mapStyle = (style: string): "classic" | "romantic" | "minimalist" | "casual" | "boohoo" | "sporty" => {
  // Normalize style name to lowercase for case-insensitive matching
  const normalizedStyle = style?.toLowerCase().trim() || "casual";
  
  const styleMap: { [key: string]: "classic" | "romantic" | "minimalist" | "casual" | "boohoo" | "sporty" } = {
    // Original mappings
    "elegant": "classic",
    "romantic": "romantic",
    "minimal": "minimalist",
    "minimalist": "minimalist",
    "casual": "casual",
    "bohemian": "boohoo",
    "boohoo": "boohoo",
    "athletic": "sporty",
    "sportive": "sporty",
    
    // Add lowercase variants for case insensitivity
    "classic": "classic",
    "classy": "classic",
    "modern": "minimalist",
    "boo hoo": "boohoo",
    "nordic": "minimalist",
    "sporty": "sporty"
  };
  
  // Try to find a match in the map
  const mappedStyle = styleMap[normalizedStyle];
  
  console.log("Mapping style:", style, "normalized to:", normalizedStyle, "mapped to:", mappedStyle || "casual (default)");
  
  return mappedStyle || "casual"; // Default to casual if no match
};

export const getEventStyles = (): string => {
  const selectedEvent = localStorage.getItem('selected-event') as EventType | null;
  
  if (selectedEvent && selectedEvent in EVENT_TO_STYLES) {
    const eventStyles = EVENT_TO_STYLES[selectedEvent as Exclude<EventType, null>];
    console.log("Using event styles:", eventStyles);
    return eventStyles[0] || "classic";
  }
  
  console.log("No event selected or invalid event, using default style");
  return "classic";
};

export const mapDashboardItemToOutfitItem = (item: any): any => {
  return {
    id: item.id,
    title: item.name,
    description: item.description || 'Stylish piece for your wardrobe',
    image: item.image || '',
    price: item.price || '$49.99',
    type: item.type
  };
};
