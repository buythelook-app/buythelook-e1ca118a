
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

const supabase = createClient(
  'https://aqkeprwxxsryropnhfvm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2Vwcnd4eHNyeXJvcG5oZnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MzE4MjksImV4cCI6MjA1MzQwNzgyOX0.1nstrLtlahU3kGAu-UrzgOVw6XwyKU6n5H5q4Taqtus'
)

interface ImageAnalysisResult {
  imageUrl: string
  hasModel: boolean
  confidence: number
  description: string
}

/**
 * Analyzes a single image to determine if it contains a model/person
 */
async function analyzeImage(imageUrl: string): Promise<ImageAnalysisResult> {
  try {
    console.log(`🔍 Analyzing image: ${imageUrl}`)
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert fashion image analyzer. Your job is to determine if an image contains a human model/person or if it shows only the clothing item/product.

IMPORTANT: Return ONLY a JSON object with this exact format:
{
  "hasModel": boolean,
  "confidence": number (0-100),
  "description": "Brief description of what you see"
}

Rules:
- hasModel: true if you see any part of a human body (face, hands, legs, torso, etc.)
- hasModel: false if you see only the clothing item on a hanger, mannequin, or flat lay
- confidence: how certain you are (0-100)
- description: brief description of what you see`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this fashion image and determine if it contains a human model or just the product:'
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 150
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content.trim()
    
    // Try to parse the JSON response
    let analysisResult
    try {
      analysisResult = JSON.parse(content)
    } catch (parseError) {
      console.warn(`Failed to parse AI response as JSON: ${content}`)
      // Fallback: try to extract boolean from text
      const hasModelMatch = content.toLowerCase().includes('true') || content.toLowerCase().includes('model') || content.toLowerCase().includes('person')
      analysisResult = {
        hasModel: hasModelMatch,
        confidence: 50,
        description: 'Failed to parse AI response'
      }
    }

    return {
      imageUrl,
      hasModel: analysisResult.hasModel || false,
      confidence: analysisResult.confidence || 50,
      description: analysisResult.description || 'AI analysis'
    }

  } catch (error) {
    console.error(`Error analyzing image ${imageUrl}:`, error)
    return {
      imageUrl,
      hasModel: true, // Default to true (has model) if analysis fails
      confidence: 0,
      description: `Analysis failed: ${error.message}`
    }
  }
}

/**
 * Extracts all image URLs from the image data (jsonb array)
 */
function extractImageUrls(imageData: any): string[] {
  if (!imageData) return []
  
  let urls: string[] = []
  
  if (typeof imageData === 'string') {
    try {
      const parsed = JSON.parse(imageData)
      if (Array.isArray(parsed)) {
        urls = parsed.filter(url => typeof url === 'string')
      } else {
        urls = [imageData]
      }
    } catch {
      urls = [imageData]
    }
  } else if (Array.isArray(imageData)) {
    urls = imageData.filter(url => typeof url === 'string')
  }
  
  return urls.filter(url => url && (url.startsWith('http://') || url.startsWith('https://')))
}

/**
 * Finds the best image without a model for a single item
 */
async function findBestImageForItem(item: any): Promise<string> {
  const imageUrls = extractImageUrls(item.image)
  
  if (imageUrls.length === 0) {
    console.log(`No valid image URLs found for item ${item.id}`)
    return '/placeholder.svg'
  }

  console.log(`🔍 Analyzing ${imageUrls.length} images for item ${item.id}`)
  
  // Analyze each image
  const analysisResults: ImageAnalysisResult[] = []
  
  for (const url of imageUrls) {
    const result = await analyzeImage(url)
    analysisResults.push(result)
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  // Find the best image without a model
  const imagesWithoutModel = analysisResults
    .filter(result => !result.hasModel)
    .sort((a, b) => b.confidence - a.confidence) // Sort by confidence descending
  
  if (imagesWithoutModel.length > 0) {
    console.log(`✅ Found ${imagesWithoutModel.length} images without model for item ${item.id}`)
    console.log(`Selected: ${imagesWithoutModel[0].imageUrl} (confidence: ${imagesWithoutModel[0].confidence})`)
    return imagesWithoutModel[0].imageUrl
  }
  
  // Fallback: if no images without model found, use the first image
  console.log(`⚠️ No images without model found for item ${item.id}, using first image`)
  return imageUrls[0]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🤖 Starting AI image analysis for items...')
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Get request parameters
    const url = new URL(req.url)
    const itemId = url.searchParams.get('itemId')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    let query = supabase
      .from('zara_cloth')
      .select('*')
      .limit(limit)
    
    // If specific item ID is requested
    if (itemId) {
      query = query.eq('id', itemId)
    }
    
    const { data: items, error } = await query
    
    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    
    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No items found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📊 Processing ${items.length} items for AI image analysis`)
    
    const results = []
    
    // Process each item
    for (const item of items) {
      console.log(`🔍 Processing item ${item.id}: ${item.product_name}`)
      
      const bestImage = await findBestImageForItem(item)
      
      results.push({
        itemId: item.id,
        productName: item.product_name,
        originalImageData: item.image,
        selectedImage: bestImage,
        timestamp: new Date().toISOString()
      })
      
      console.log(`✅ Completed analysis for item ${item.id}`)
    }

    console.log(`🎉 AI image analysis completed for ${results.length} items`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        totalProcessed: results.length,
        message: 'AI image analysis completed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error in AI image analysis:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Check function logs for more details'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
