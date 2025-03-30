
import { QuizFormData } from "@/components/quiz/types";

interface StyleAnalysis {
  analysis: {
    styleProfile: string;
    bodyShape: string;
    preferences: string[];
    colorPreference?: string;
  };
}

export const analyzeStyleWithAI = (quizData: QuizFormData): StyleAnalysis => {
  console.log("Analyzing style with AI", quizData);
  
  // Map the style preferences from the quiz
  let styleProfile = quizData.stylePreferences?.[0] || "Classic";
  
  // Transform user's style choices to match our style naming conventions
  if (styleProfile === "Minimalist" || styleProfile === "Modern" || styleProfile === "Nordic" || styleProfile === "Minimal") {
    // Consolidate the minimalist and modern styles as they're similar
    styleProfile = "Minimalist";
  }
  
  // Determine color preference based on style and user color choices
  let colorPreference = "neutral";
  
  // If the user has selected Minimalist style, prioritize neutral colors and store minimalist recommendations
  if (styleProfile === "Minimalist") {
    colorPreference = "neutral";
    
    try {
      // Store minimalist style recommendations
      const recommendations = [
        "Focus on quality over quantity with timeless pieces",
        "Opt for clean lines and simple silhouettes",
        "Stick to a neutral color palette (black, white, gray, beige, navy, taupe)",
        "Choose natural fabrics like cotton, linen, wool, and silk",
        "Look for functional details and avoid excessive embellishments"
      ];
      
      localStorage.setItem('style-recommendations', JSON.stringify(recommendations));
      
      // Store a minimalist color palette
      const outfitColors = {
        top: "#FFFFFF",
        bottom: "#333333",
        shoes: "#000000",
        accessories: "#CCCCCC"
      };
      
      localStorage.setItem('outfit-colors', JSON.stringify(outfitColors));
      
      // Store minimalist essentials
      const minimalistEssentials = {
        tops: [
          "White button-down shirt",
          "Basic crewneck t-shirts (black, white, gray)",
          "Lightweight knit sweaters",
          "Turtlenecks or mock neck tops",
          "Structured minimal blouses"
        ],
        bottoms: [
          "Tailored trousers (black, beige, gray)",
          "Straight-leg or wide-leg pants",
          "Classic jeans without embellishments",
          "Simple midi or pencil skirts"
        ],
        outerwear: [
          "Structured blazer (black, navy, beige)",
          "Wool coat or trench coat",
          "Minimalist leather jacket"
        ],
        shoes: [
          "Leather loafers (black, brown)",
          "Ballet flats in neutral tones",
          "Chelsea boots in black or taupe",
          "White leather sneakers",
          "Simple pointed-toe pumps"
        ]
      };
      
      localStorage.setItem('minimalist-essentials', JSON.stringify(minimalistEssentials));
      console.log("Stored minimalist style data");
    } catch (error) {
      console.error("Error storing data in localStorage:", error);
    }
  } 
  // Otherwise use their color preferences if available
  else if (quizData.colorPreferences && quizData.colorPreferences.length > 0) {
    if (quizData.colorPreferences.includes("neutral")) {
      colorPreference = "neutral";
    } else if (quizData.colorPreferences.includes("warm")) {
      colorPreference = "warm";
    } else if (quizData.colorPreferences.includes("cool")) {
      colorPreference = "cool";
    }
  }
  
  const result = {
    analysis: {
      styleProfile: styleProfile,
      bodyShape: quizData.bodyShape || "hourglass",
      preferences: quizData.stylePreferences || [],
      colorPreference: colorPreference
    }
  };
  
  console.log("Style analysis result:", result);
  return result;
};
