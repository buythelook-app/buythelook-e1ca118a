import { useEffect, useRef, useState } from "react";
import { analyzeImagesWithAI } from "@/services/aiImageAnalysisService";

interface OutfitItem {
  id: string;
  image: string;
  type: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear' | 'cart';
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface LookCanvasProps {
  items: OutfitItem[];
  width?: number;
  height?: number;
}

export const LookCanvas = ({ items, width = 400, height = 700 }: LookCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadingState, setLoadingState] = useState<'loading' | 'success' | 'error'>('loading');
  const [loadedCount, setLoadedCount] = useState(0);
  const [aiProcessedImages, setAiProcessedImages] = useState<{ [key: string]: string }>({});

  // Enhanced function to extract product-only images (no models)
  const extractProductOnlyImage = (imageData: any): string => {
    if (!imageData) {
      console.log('No image data provided');
      return '/placeholder.svg';
    }
    
    let imageUrls: string[] = [];
    
    // Handle different image data formats
    if (typeof imageData === 'string') {
      try {
        const parsed = JSON.parse(imageData);
        if (Array.isArray(parsed)) {
          imageUrls = parsed.filter(url => typeof url === 'string');
        } else {
          imageUrls = [imageData];
        }
      } catch {
        imageUrls = [imageData];
      }
    } else if (Array.isArray(imageData)) {
      imageUrls = imageData.filter(url => typeof url === 'string');
    }
    
    // Priority order: 8th, 7th, 6th images (more likely to be product-only)
    const productOnlyPatterns = [
      /_8_\d+_1\.jpg/, // 8th image - highest priority
      /_7_\d+_1\.jpg/, // 7th image
      /_6_\d+_1\.jpg/, // 6th image
      /_9_\d+_1\.jpg/, // 9th image if available
    ];
    
    for (const pattern of productOnlyPatterns) {
      const matchingImage = imageUrls.find(url => pattern.test(url));
      if (matchingImage) {
        console.log(`Found product-only image with pattern ${pattern}:`, matchingImage);
        return matchingImage;
      }
    }
    
    console.log('No suitable product-only images found, using placeholder');
    return '/placeholder.svg';
  };

  // Get AI-selected image for an item with enhanced filtering
  const getAISelectedImage = async (item: OutfitItem): Promise<string> => {
    try {
      console.log(`🤖 Getting AI-selected image for item ${item.id}`);
      
      // Check if we already have the AI result cached
      if (aiProcessedImages[item.id]) {
        console.log(`📦 Using cached AI image for ${item.id}: ${aiProcessedImages[item.id]}`);
        return aiProcessedImages[item.id];
      }

      // First try to extract product-only image directly
      const directProductImage = extractProductOnlyImage(item.image);
      if (directProductImage !== '/placeholder.svg') {
        console.log(`✅ Found direct product-only image for ${item.id}: ${directProductImage}`);
        
        // Cache the result
        setAiProcessedImages(prev => ({
          ...prev,
          [item.id]: directProductImage
        }));
        
        return directProductImage;
      }

      // If no direct product image found, try AI analysis
      const aiResult = await analyzeImagesWithAI(item.id, 1);
      
      if (aiResult.success && aiResult.results && aiResult.results.length > 0) {
        const selectedImage = aiResult.results[0].selectedImage;
        if (selectedImage && selectedImage !== '/placeholder.svg') {
          console.log(`✅ AI selected image for ${item.id}: ${selectedImage}`);
          
          // Cache the result
          setAiProcessedImages(prev => ({
            ...prev,
            [item.id]: selectedImage
          }));
          
          return selectedImage;
        }
      }
      
      console.log(`⚠️ No suitable product image found for ${item.id}, using placeholder`);
      return '/placeholder.svg';
      
    } catch (error) {
      console.error(`❌ Error getting product image for ${item.id}:`, error);
      return '/placeholder.svg';
    }
  };

  // Filter items to ensure complete outfit with one item per category - ensuring at least 3 items
  const createCompleteOutfit = (items: OutfitItem[]): OutfitItem[] => {
    const outfit: OutfitItem[] = [];
    
    // First, check if we have a dress (dress replaces top + bottom)
    const dress = items.find(item => item.type === 'dress');
    
    if (dress) {
      // If we have a dress, use it instead of top + bottom
      outfit.push(dress);
      console.log('✅ Added dress to outfit:', dress.id);
    } else {
      // If no dress, we MUST have both top and bottom for a complete outfit
      const top = items.find(item => item.type === 'top');
      const bottom = items.find(item => item.type === 'bottom');
      
      if (top) {
        outfit.push(top);
        console.log('✅ Added top to outfit:', top.id);
      }
      
      if (bottom) {
        outfit.push(bottom);
        console.log('✅ Added bottom to outfit:', bottom.id);
      }
      
      // If we don't have both top and bottom, this is not a complete outfit
      if (!top || !bottom) {
        console.log('⚠️ Incomplete outfit - missing top or bottom');
        // Still add what we have, but mark as incomplete
      }
    }
    
    // Always try to add shoes - this is essential for a complete outfit
    const shoes = items.find(item => item.type === 'shoes');
    if (shoes) {
      outfit.push(shoes);
      console.log('✅ Added shoes to outfit:', shoes.id);
    } else {
      console.log('⚠️ No shoes found for outfit');
    }
    
    // Optionally add one outerwear item (jacket, coat, etc.)
    const outerwear = items.find(item => item.type === 'outerwear');
    if (outerwear) {
      outfit.push(outerwear);
      console.log('✅ Added outerwear to outfit:', outerwear.id);
    }
    
    // Ensure we have at least 3 items for a meaningful outfit display
    if (outfit.length < 3) {
      console.log(`⚠️ Outfit has only ${outfit.length} items, adding more items if available`);
      
      // Add any remaining items that we haven't used yet
      const remainingItems = items.filter(item => !outfit.find(outfitItem => outfitItem.id === item.id));
      const additionalItems = remainingItems.slice(0, 3 - outfit.length);
      
      additionalItems.forEach(item => {
        outfit.push(item);
        console.log(`✅ Added additional ${item.type} to complete outfit:`, item.id);
      });
    }
    
    console.log(`📦 Complete outfit created with ${outfit.length} items:`, outfit.map(item => `${item.type} (${item.id})`));
    return outfit;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset loading state when items change
    setLoadingState('loading');
    setLoadedCount(0);

    // Set up canvas with device pixel ratio
    const scale = window.devicePixelRatio || 1;
    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);

    // Clear and set background to clean white
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Render a loading message if no items
    if (items.length === 0) {
      ctx.font = '16px Arial';
      ctx.fillStyle = '#666666';
      ctx.textAlign = 'center';
      ctx.fillText('אין פריטי תלבושת להצגה', width / 2, height / 2);
      setLoadingState('error');
      return;
    }

    // Create complete outfit with multiple items
    const completeOutfit = createCompleteOutfit(items);
    
    if (completeOutfit.length === 0) {
      ctx.font = '16px Arial';
      ctx.fillStyle = '#666666';
      ctx.textAlign = 'center';
      ctx.fillText('לא ניתן להרכיב תלבושת', width / 2, height / 2);
      setLoadingState('error');
      return;
    }

    // Sort outfit items in correct display order: top/dress first, then bottom, then shoes
    const renderOrder = { 
      top: 1,           // חלק עליון - בראש
      dress: 1,         // שמלות כמו חלק עליון - בראש
      outerwear: 2,     // ז'קטים אחרי חלק עליון
      bottom: 3,        // חלק תחתון - באמצע
      shoes: 4,         // נעליים - בתחתית
      accessory: 5,     // אביזרים - אחרונים
      sunglasses: 6,    // משקפיים - אחרונים
      cart: 7           // עגלה - אחרון
    };
    
    const sortedOutfitItems = [...completeOutfit].sort((a, b) => {
      const orderA = renderOrder[a.type] ?? 999;
      const orderB = renderOrder[b.type] ?? 999;
      return orderA - orderB;
    });

    // Define layout with proper spacing for outfit categories
    const padding = 15;
    const itemSpacing = 10;
    const availableHeight = height - (padding * 2);
    const itemHeight = Math.max(150, (availableHeight - (itemSpacing * (sortedOutfitItems.length - 1))) / sortedOutfitItems.length);
    const itemWidth = width * 0.85; // 85% of canvas width
    const centerX = (width - itemWidth) / 2;
    
    // Show loading state
    ctx.font = '16px Arial';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'center';
    ctx.fillText('טוען תמונות מוצרים בלבד (ללא דוגמניות)...', width / 2, height / 2);

    const loadImages = async () => {
      try {
        let successCount = 0;
        let errorCount = 0;
        
        console.log('🔍 Loading complete outfit in correct order:', sortedOutfitItems.map(item => `${item.type} (${item.id})`));
        
        // Clear the canvas for clean rendering
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        for (let i = 0; i < sortedOutfitItems.length; i++) {
          const item = sortedOutfitItems[i];
          console.log(`🔍 Processing ${item.type} item ${i + 1}/${sortedOutfitItems.length}: ${item.id}`);
          
          try {
            // Get product-only image (enhanced with AI selection)
            const productImageUrl = await getAISelectedImage(item);
            
            // Skip if no suitable image found
            if (productImageUrl === '/placeholder.svg') {
              console.log(`⚠️ Skipping item ${item.id} - no suitable product image available`);
              errorCount++;
              setLoadedCount(prev => prev + 1);
              continue;
            }
            
            // Load the product-only image
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            await new Promise((resolve, reject) => {
              img.onload = () => {
                console.log(`✅ Product image loaded: ${item.id} (${item.type})`);
                successCount++;
                setLoadedCount(prev => prev + 1);
                resolve(null);
              };
              img.onerror = (e) => {
                console.error(`❌ Error loading product image: ${item.id}`, e);
                errorCount++;
                setLoadedCount(prev => prev + 1);
                reject(e);
              };
              img.src = productImageUrl;
            });

            // Calculate position for this item in vertical layout - מלמעלה למטה
            const yPosition = padding + (i * (itemHeight + itemSpacing));
            
            // Calculate proper aspect ratio and fit within designated area
            const aspectRatio = img.width / img.height;
            let drawWidth = itemWidth;
            let drawHeight = itemHeight;

            // Maintain aspect ratio while fitting in the designated area
            if (drawWidth / drawHeight > aspectRatio) {
              drawWidth = drawHeight * aspectRatio;
            } else {
              drawHeight = drawWidth / aspectRatio;
            }

            // Ensure minimum size for better visibility
            const minSize = 120;
            if (drawWidth < minSize || drawHeight < minSize) {
              if (drawWidth < drawHeight) {
                drawWidth = minSize;
                drawHeight = minSize / aspectRatio;
              } else {
                drawHeight = minSize;
                drawWidth = minSize * aspectRatio;
              }
            }

            // Center the item horizontally
            const drawX = centerX + (itemWidth - drawWidth) / 2;
            const drawY = yPosition + (itemHeight - drawHeight) / 2;

            ctx.save();
            
            // Add subtle shadow effect for depth
            ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
            ctx.shadowBlur = 12;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 6;
            
            // Draw the item image
            ctx.drawImage(
              img,
              drawX,
              drawY,
              drawWidth,
              drawHeight
            );
            
            ctx.restore();
            
            console.log(`✅ Drew ${item.type} at position ${i + 1}: x=${Math.round(drawX)}, y=${Math.round(drawY)}, w=${Math.round(drawWidth)}, h=${Math.round(drawHeight)}`);

          } catch (imgError) {
            console.error(`❌ Error processing item: ${item.id}`, imgError);
            errorCount++;
            setLoadedCount(prev => prev + 1);
          }
        }

        // Update loading state based on success/error count
        if (errorCount === sortedOutfitItems.length) {
          setLoadingState('error');
          
          // Draw error message
          ctx.clearRect(0, 0, width, height);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.font = '16px Arial';
          ctx.fillStyle = '#ff0000';
          ctx.textAlign = 'center';
          ctx.fillText('לא נמצאו תמונות מתאימות של מוצרים בלבד', width / 2, height / 2);
        } else if (successCount > 0) {
          setLoadingState('success');
        } else {
          setLoadingState('error');
        }

      } catch (error) {
        console.error('❌ Error in loadImages:', error);
        setLoadingState('error');
      }
    };

    loadImages();
  }, [items, width, height]);

  return (
    <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        className="border-0 bg-white"
        style={{ 
          maxWidth: '100%',
          width: `${width}px`,
          height: `${height}px`
        }}
      />
      {loadingState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
          <div className="bg-white p-4 rounded-lg shadow-md text-center border">
            <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-700">מחפש תמונות מוצרים בלבד...</p>
            <p className="text-xs text-gray-500 mt-1">{loadedCount}/{items.length} - מסנן תמונות ללא דוגמניות</p>
          </div>
        </div>
      )}
      {loadingState === 'error' && items.length > 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-95 rounded-lg">
          <div className="bg-white p-4 rounded-lg shadow-md text-center border border-red-200">
            <p className="text-red-500 mb-1 font-medium">לא נמצאו תמונות מתאימות</p>
            <p className="text-xs text-gray-600">מחפש תמונות מוצרים ללא דוגמניות</p>
          </div>
        </div>
      )}
    </div>
  );
};
