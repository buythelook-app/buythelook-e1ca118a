
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { bodyStructure, mood, style } = await req.json();

    // Validate input
    if (!bodyStructure || !mood || !style) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required parameters: bodyStructure, mood, style" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate body structure
    const validBodyStructures = ['X', 'V', 'H', 'O', 'A'];
    if (!validBodyStructures.includes(bodyStructure)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid body structure. Must be one of: X, V, H, O, A" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate style
    const validStyles = ['classic', 'romantic', 'minimalist', 'casual', 'boohoo', 'sporty'];
    if (!validStyles.includes(style)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Invalid style. Must be one of: ${validStyles.join(', ')}` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate outfit suggestions
    const outfitSuggestions = generateOutfits(bodyStructure, mood, style);

    return new Response(
      JSON.stringify({ success: true, data: outfitSuggestions }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error in generate-outfit function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Unknown error occurred" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Function to generate outfit suggestions
function generateOutfits(bodyStructure, mood, style) {
  // Define color palettes based on style and mood
  const colorPalettes = {
    classic: {
      elegant: ['#2C3E50', '#BDC3C7', '#7F8C8D', '#34495E'],
      casual: ['#ECF0F1', '#95A5A6', '#7F8C8D', '#34495E'],
      energized: ['#E74C3C', '#ECF0F1', '#3498DB', '#2C3E50']
    },
    romantic: {
      elegant: ['#9B59B6', '#D2B4DE', '#BB8FCE', '#7D3C98'],
      casual: ['#F1948A', '#FADBD8', '#F5B7B1', '#E6B0AA'],
      energized: ['#F1948A', '#D2B4DE', '#F5B7B1', '#9B59B6']
    },
    minimalist: {
      elegant: ['#000000', '#FFFFFF', '#EEEEEE', '#444444'],
      casual: ['#EEEEEE', '#FFFFFF', '#DDDDDD', '#AAAAAA'],
      energized: ['#FFFFFF', '#000000', '#FF0000', '#EEEEEE']
    },
    casual: {
      elegant: ['#3498DB', '#85C1E9', '#AED6F1', '#2E86C1'],
      casual: ['#F5CBA7', '#F8F9F9', '#FAD7A0', '#EB984E'],
      energized: ['#F39C12', '#F5CBA7', '#FAD7A0', '#D68910']
    },
    boohoo: {
      elegant: ['#17202A', '#1C2833', '#212F3D', '#283747'],
      casual: ['#17202A', '#AAAAAA', '#888888', '#283747'],
      energized: ['#17202A', '#E74C3C', '#512E5F', '#873600']
    },
    sporty: {
      elegant: ['#1ABC9C', '#48C9B0', '#76D7C4', '#117A65'],
      casual: ['#F4F6F7', '#D0D3D4', '#A6ACAF', '#1ABC9C'],
      energized: ['#E74C3C', '#F4F6F7', '#2ECC71', '#3498DB']
    }
  };

  // Get color palette based on style and mood
  const palette = colorPalettes[style]?.[mood] || colorPalettes.classic.casual;

  // Get descriptions based on body structure
  const bodyTypeDescriptions = {
    'X': 'balanced proportions',
    'V': 'broader shoulders',
    'H': 'straight silhouette',
    'O': 'fuller middle',
    'A': 'fuller lower body'
  };

  // Generate 2-3 outfit suggestions
  const numOutfits = Math.floor(Math.random() * 2) + 2; // 2-3 outfits
  const outfits = [];

  const occasions = ['work', 'casual', 'weekend', 'date night', 'general'];

  for (let i = 0; i < numOutfits; i++) {
    // Randomly select colors from the palette for each item
    const topIndex = Math.floor(Math.random() * palette.length);
    let bottomIndex = Math.floor(Math.random() * palette.length);
    while (bottomIndex === topIndex) {
      bottomIndex = Math.floor(Math.random() * palette.length);
    }
    
    let shoesIndex = Math.floor(Math.random() * palette.length);
    while (shoesIndex === topIndex || shoesIndex === bottomIndex) {
      shoesIndex = Math.floor(Math.random() * palette.length);
    }

    // Decide if we should include a coat (30% chance)
    const includeCoat = Math.random() < 0.3;
    let coatIndex;
    let coat;
    
    if (includeCoat) {
      coatIndex = Math.floor(Math.random() * palette.length);
      while (coatIndex === topIndex || coatIndex === bottomIndex || coatIndex === shoesIndex) {
        coatIndex = Math.floor(Math.random() * palette.length);
      }
      coat = palette[coatIndex];
    }

    // Generate outfit description
    const bodyTypeDescription = bodyTypeDescriptions[bodyStructure] || 'your body type';
    const occasionIndex = Math.floor(Math.random() * occasions.length);
    const occasion = occasions[occasionIndex];

    // Generate recommendations (2-4 items)
    const numRecommendations = Math.floor(Math.random() * 3) + 2; // 2-4 recommendations
    const recommendations = [];
    
    const possibleRecommendations = [
      `This outfit enhances ${bodyTypeDescription} beautifully`,
      `Add a statement necklace to elevate this look`,
      `A structured handbag would complete this ${style} ensemble`,
      `Consider adding a belt to define your waist`,
      `This color combination is perfect for your ${mood} mood`,
      `Layer with a light scarf for versatility`,
      `These proportions work well for your ${bodyStructure} shape`,
      `Add minimal jewelry to maintain the ${style} aesthetic`
    ];
    
    // Select random recommendations
    const usedRecommendations = new Set();
    for (let j = 0; j < numRecommendations; j++) {
      let recIndex = Math.floor(Math.random() * possibleRecommendations.length);
      let attempts = 0;
      while (usedRecommendations.has(recIndex) && attempts < 10) {
        recIndex = Math.floor(Math.random() * possibleRecommendations.length);
        attempts++;
      }
      usedRecommendations.add(recIndex);
      recommendations.push(possibleRecommendations[recIndex]);
    }

    // Create outfit object
    const outfit = {
      top: palette[topIndex],
      bottom: palette[bottomIndex],
      shoes: palette[shoesIndex],
      description: `A ${style} outfit in ${mood} colors that complements your ${bodyTypeDescription}.`,
      recommendations,
      occasion
    };

    if (includeCoat) {
      outfit.coat = coat;
    }

    outfits.push(outfit);
  }

  return outfits;
}
