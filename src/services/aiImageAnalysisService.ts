
import { supabase } from "@/integrations/supabase/client";

interface ImageAnalysisResult {
  itemId: string;
  productName: string;
  selectedImage: string;
  originalImageData: any;
  timestamp: string;
}

interface AIImageAnalysisResponse {
  success: boolean;
  results?: ImageAnalysisResult[];
  totalProcessed?: number;
  message?: string;
  error?: string;
}

/**
 * Analyzes images using AI to find the best image without models for items
 */
export const analyzeImagesWithAI = async (itemId?: string, limit: number = 10): Promise<AIImageAnalysisResponse> => {
  try {
    console.log("🤖 Starting AI image analysis...");
    
    // Build query parameters
    const params = new URLSearchParams();
    if (itemId) {
      params.append('itemId', itemId);
    }
    params.append('limit', limit.toString());
    
    // Call the AI image analyzer edge function
    const { data, error } = await supabase.functions.invoke('image-analyzer', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (error) {
      console.error('❌ Error calling AI image analyzer:', error);
      throw new Error(error.message);
    }
    
    if (!data || !data.success) {
      console.error('❌ AI image analysis failed:', data);
      throw new Error(data?.error || 'AI image analysis failed');
    }
    
    console.log(`✅ AI image analysis completed: ${data.totalProcessed} items processed`);
    return data;
    
  } catch (error) {
    console.error('❌ Error in AI image analysis service:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error in AI image analysis'
    };
  }
};

/**
 * Updates an item's image with the AI-selected best image
 */
export const updateItemImageWithAI = async (itemId: string): Promise<{ success: boolean; newImage?: string; error?: string }> => {
  try {
    console.log(`🔄 Updating item ${itemId} with AI-selected image...`);
    
    // Analyze this specific item
    const analysisResult = await analyzeImagesWithAI(itemId, 1);
    
    if (!analysisResult.success || !analysisResult.results || analysisResult.results.length === 0) {
      throw new Error(analysisResult.error || 'No analysis results received');
    }
    
    const result = analysisResult.results[0];
    const selectedImage = result.selectedImage;
    
    // Update the item in the database with the selected image
    const { error: updateError } = await supabase
      .from('zara_cloth')
      .update({ 
        image: selectedImage,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId);
    
    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }
    
    console.log(`✅ Successfully updated item ${itemId} with AI-selected image: ${selectedImage}`);
    
    return {
      success: true,
      newImage: selectedImage
    };
    
  } catch (error) {
    console.error(`❌ Error updating item ${itemId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error updating item'
    };
  }
};
