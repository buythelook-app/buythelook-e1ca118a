import { useEffect, useRef, useState } from "react";

interface OutfitItem {
  id: string;
  image: string;
  type: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear' | 'cart';
  name?: string;
  product_subfamily?: string;
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

  // Ensure we always have the right items based on outfit type
  const validateAndOrderItems = (inputItems: OutfitItem[]): OutfitItem[] => {
    console.log('🔍 [LookCanvas] Validating and ordering items:', inputItems.map(item => ({
      id: item.id,
      type: item.type,
      name: item.name || 'Unknown'
    })));

    // Check if we have a dress
    const dressItem = inputItems.find(item => item.type === 'dress');
    const topItem = inputItems.find(item => item.type === 'top');
    const bottomItem = inputItems.find(item => item.type === 'bottom');
    const shoesItem = inputItems.find(item => item.type === 'shoes');

    const orderedItems: OutfitItem[] = [];
    
    if (dressItem) {
      // For dress outfits: dress + optional hosiery/tights + shoes
      console.log('✅ [LookCanvas] Dress outfit detected');
      
      // Add the dress
      orderedItems.push(dressItem);
      
      // Check if bottom item is hosiery/tights (צמוד)
      if (bottomItem && (
        bottomItem.name?.includes('גרביון') || 
        bottomItem.name?.includes('טייץ') ||
        bottomItem.name?.includes('גרב') ||
        bottomItem.product_subfamily?.includes('גרביון') ||
        bottomItem.product_subfamily?.includes('טייץ')
      )) {
        console.log('✅ [LookCanvas] Adding hosiery/tights with dress');
        orderedItems.push(bottomItem);
      }
      
      // Add shoes
      if (shoesItem) {
        orderedItems.push(shoesItem);
      } else {
        console.warn('❌ [LookCanvas] No shoes item found, using default shoes image');
        orderedItems.push({
          id: 'placeholder-shoes',
          image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop',
          type: 'shoes',
          name: 'נעליים'
        });
      }
    } else {
      // For regular outfits: top + bottom + shoes
      console.log('✅ [LookCanvas] Regular outfit (top + bottom + shoes)');
      
      if (topItem) {
        orderedItems.push(topItem);
      } else {
        console.warn('❌ [LookCanvas] No top item found, using placeholder');
        orderedItems.push({
          id: 'placeholder-top',
          image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop',
          type: 'top',
          name: 'חולצה'
        });
      }

      if (bottomItem) {
        orderedItems.push(bottomItem);
      } else {
        console.warn('❌ [LookCanvas] No bottom item found, using placeholder');
        orderedItems.push({
          id: 'placeholder-bottom',
          image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=400&fit=crop',
          type: 'bottom',
          name: 'מכנסיים'
        });
      }

      if (shoesItem) {
        orderedItems.push(shoesItem);
      } else {
        console.warn('❌ [LookCanvas] No shoes item found, using default shoes image');
        orderedItems.push({
          id: 'placeholder-shoes',
          image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop',
          type: 'shoes',
          name: 'נעליים'
        });
      }
    }

    console.log('✅ [LookCanvas] Final ordered items:', orderedItems.map((item, i) => `${i}. ${item.type} (${item.id})`));
    return orderedItems;
  };

  // Enhanced function to extract product-only images (no models)
  const extractProductOnlyImage = (imageData: any): string => {
    if (!imageData) {
      console.log('🔍 [LookCanvas] No image data provided');
      return 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=400&fit=crop';
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
        console.log(`🔍 [LookCanvas] Found product-only image with pattern ${pattern}:`, matchingImage);
        return matchingImage;
      }
    }
    
    console.log('🔍 [LookCanvas] No suitable product-only images found, using fallback');
    return 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=400&fit=crop';
  };

  // Get best available image for an item
  const getBestImage = (item: OutfitItem): string => {
    console.log(`🔍 [LookCanvas] Getting best image for item ${item.id}`);
    
    // If it's a placeholder, return the image directly
    if (item.id.startsWith('placeholder-')) {
      console.log(`✅ [LookCanvas] Using placeholder image for ${item.id}: ${item.image}`);
      return item.image;
    }
    
    // First try to extract product-only image directly
    const directProductImage = extractProductOnlyImage(item.image);
    if (directProductImage !== 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=400&fit=crop') {
      console.log(`✅ [LookCanvas] Found direct product image for ${item.id}: ${directProductImage}`);
      return directProductImage;
    }

    // Fallback to original image or placeholder
    const fallbackImage = item.image || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=400&fit=crop';
    console.log(`📦 [LookCanvas] Using fallback image for ${item.id}: ${fallbackImage}`);
    return fallbackImage;
  };

  // Load image without background removal
  const loadImageForCanvas = async (imageUrl: string): Promise<HTMLImageElement> => {
    try {
      console.log(`🔍 [LookCanvas] Loading image: ${imageUrl}`);
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });
      
      console.log(`✅ [LookCanvas] Image loaded successfully: ${imageUrl}`);
      return img;
      
    } catch (error) {
      console.error(`❌ [LookCanvas] Image loading failed for: ${imageUrl}`, error);
      throw error;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    console.log('🔍 [LookCanvas] ===== STARTING CANVAS RENDER =====');
    console.log('🔍 [LookCanvas] Received items:', items.map(item => ({
      id: item.id,
      type: item.type,
      name: item.name || 'Unknown'
    })));

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

    // Validate and ensure we have the right items
    const validatedItems = validateAndOrderItems(items);

    // Determine if this is a dress outfit for layout purposes
    const isDressOutfit = validatedItems.some(item => item.type === 'dress');
    
    // Smart layout based on outfit type
    const padding = 15;
    const itemSpacing = 12;
    const availableHeight = height - (padding * 2);
    
    // Calculate layout based on number of items
    const totalSpacing = (validatedItems.length - 1) * itemSpacing;
    const itemHeight = Math.floor((availableHeight - totalSpacing) / validatedItems.length);
    const itemWidth = width * 0.8;
    const centerX = (width - itemWidth) / 2;
    
    console.log(`🔍 [LookCanvas] Layout: ${isDressOutfit ? 'DRESS' : 'REGULAR'} outfit, ${validatedItems.length} items, itemHeight=${itemHeight}`);
    
    // Show loading state
    ctx.font = '16px Arial';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'center';
    ctx.fillText('טוען תמונות...', width / 2, height / 2);

    const loadImages = async () => {
      try {
        let successCount = 0;
        let errorCount = 0;
        
        console.log(`🔍 [LookCanvas] Loading exactly ${validatedItems.length} items for display`);
        
        // Clear the canvas for clean rendering
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // Process all validated items
        for (let i = 0; i < validatedItems.length; i++) {
          const item = validatedItems[i];
          const itemPosition = isDressOutfit ? 
            ['DRESS', 'HOSIERY/TIGHTS', 'SHOES'][i] || `ITEM_${i}` :
            ['TOP', 'BOTTOM', 'SHOES'][i] || `ITEM_${i}`;
          
          console.log(`🔍 [LookCanvas] Processing ${itemPosition} item: ${item.id} (${item.type}) at position ${i}`);
          
          try {
            // Get best available image
            const imageUrl = getBestImage(item);
            
            // Load image without background removal
            const img = await loadImageForCanvas(imageUrl);
            
            console.log(`✅ [LookCanvas] Image loaded: ${item.id} (${itemPosition})`);
            successCount++;
            setLoadedCount(prev => prev + 1);

            // Calculate position for this item
            const yPosition = padding + (i * (itemHeight + itemSpacing));
            
            // Smart cropping: crop top and bottom to focus on the clothing item
            const sourceWidth = img.width;
            const sourceHeight = img.height;
            
            // For cropping, remove 20% from top and 15% from bottom to focus on the item
            const cropTop = sourceHeight * 0.2;
            const cropBottom = sourceHeight * 0.15;
            const croppedHeight = sourceHeight - cropTop - cropBottom;
            
            // Calculate proper aspect ratio with cropped dimensions
            const aspectRatio = sourceWidth / croppedHeight;
            let drawWidth = itemWidth;
            let drawHeight = drawWidth / aspectRatio;

            // If height is too large, constrain by height
            const maxHeight = itemHeight * 0.95;
            if (drawHeight > maxHeight) {
              drawHeight = maxHeight;
              drawWidth = drawHeight * aspectRatio;
            }

            // Center the item horizontally and vertically within its allocated space
            const drawX = centerX + (itemWidth - drawWidth) / 2;
            const drawY = yPosition + (itemHeight - drawHeight) / 2;

            console.log(`🔍 [LookCanvas] Drawing ${itemPosition}: pos=${i}, y=${Math.round(yPosition)}, drawY=${Math.round(drawY)}, h=${Math.round(drawHeight)}, maxY=${Math.round(drawY + drawHeight)}, canvasH=${height}`);

            ctx.save();
            
            // Add subtle shadow effect for depth
            ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 3;
            
            // Draw the cropped item image
            ctx.drawImage(
              img,
              0, cropTop, sourceWidth, croppedHeight, // Source crop (x, y, width, height)
              drawX, drawY, drawWidth, drawHeight      // Destination (x, y, width, height)
            );
            
            ctx.restore();
            
            // Add label for placeholders to make them clear
            if (item.id.startsWith('placeholder-')) {
              ctx.save();
              ctx.font = '14px Arial';
              ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
              ctx.textAlign = 'center';
              ctx.fillText(item.name || item.type, drawX + drawWidth / 2, drawY + drawHeight + 20);
              ctx.restore();
            }
            
            console.log(`✅ [LookCanvas] Drew ${itemPosition} at position ${i}: x=${Math.round(drawX)}, y=${Math.round(drawY)}, w=${Math.round(drawWidth)}, h=${Math.round(drawHeight)}`);

          } catch (imgError) {
            console.error(`❌ [LookCanvas] Error processing item: ${item.id}`, imgError);
            errorCount++;
            setLoadedCount(prev => prev + 1);
            
            // Draw error placeholder for failed items
            const yPosition = padding + (i * (itemHeight + itemSpacing));
            const drawX = centerX;
            const drawY = yPosition + (itemHeight - 40) / 2;
            
            ctx.save();
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(drawX, drawY, itemWidth, 40);
            ctx.font = '14px Arial';
            ctx.fillStyle = '#666666';
            ctx.textAlign = 'center';
            const errorTexts = isDressOutfit ? 
              ['שגיאה בטעינת שמלה', 'שגיאה בטעינת גרביון', 'שגיאה בטעינת נעליים'] :
              ['שגיאה בטעינת חולצה', 'שגיאה בטעינת מכנסיים', 'שגיאה בטעינת נעליים'];
            ctx.fillText(errorTexts[i] || `שגיאה בטעינת פריט ${i + 1}`, drawX + itemWidth / 2, drawY + 25);
            ctx.restore();
          }
        }

        // Update loading state based on success/error count
        if (successCount > 0) {
          setLoadingState('success');
          console.log(`✅ [LookCanvas] Successfully loaded ${successCount} out of ${validatedItems.length} items`);
        } else {
          setLoadingState('error');
          
          // Draw error message
          ctx.clearRect(0, 0, width, height);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.font = '16px Arial';
          ctx.fillStyle = '#ff0000';
          ctx.textAlign = 'center';
          ctx.fillText('לא נמצאו תמונות מתאימות', width / 2, height / 2);
        }

      } catch (error) {
        console.error('❌ [LookCanvas] Error in loadImages:', error);
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
            <p className="text-sm text-gray-700">טוען תמונות...</p>
            <p className="text-xs text-gray-500 mt-1">{loadedCount} פריטים נטענו</p>
          </div>
        </div>
      )}
      {loadingState === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-95 rounded-lg">
          <div className="bg-white p-4 rounded-lg shadow-md text-center border border-red-200">
            <p className="text-red-500 mb-1 font-medium">שגיאה בטעינת התמונות</p>
            <p className="text-xs text-gray-600">נסה לרענן את הדף</p>
          </div>
        </div>
      )}
    </div>
  );
};
