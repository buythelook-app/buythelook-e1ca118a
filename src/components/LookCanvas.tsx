
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

  // Enhanced function to extract product-only images (no models)
  const extractProductOnlyImage = (imageData: any): string => {
    if (!imageData) {
      console.log('🔍 [LookCanvas] No image data provided');
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
        console.log(`🔍 [LookCanvas] Found product-only image with pattern ${pattern}:`, matchingImage);
        return matchingImage;
      }
    }
    
    console.log('🔍 [LookCanvas] No suitable product-only images found, using placeholder');
    return '/placeholder.svg';
  };

  // Get best available image for an item
  const getBestImage = (item: OutfitItem): string => {
    console.log(`🔍 [LookCanvas] Getting best image for item ${item.id}`);
    
    // First try to extract product-only image directly
    const directProductImage = extractProductOnlyImage(item.image);
    if (directProductImage !== '/placeholder.svg') {
      console.log(`✅ [LookCanvas] Found direct product image for ${item.id}: ${directProductImage}`);
      return directProductImage;
    }

    // Fallback to original image or placeholder
    const fallbackImage = item.image || '/placeholder.svg';
    console.log(`📦 [LookCanvas] Using fallback image for ${item.id}: ${fallbackImage}`);
    return fallbackImage;
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

    // Render a loading message if no items
    if (!items || items.length === 0) {
      console.log('❌ [LookCanvas] No items provided');
      ctx.font = '16px Arial';
      ctx.fillStyle = '#666666';
      ctx.textAlign = 'center';
      ctx.fillText('אין פריטי תלבושת להצגה', width / 2, height / 2);
      setLoadingState('error');
      return;
    }

    // Validate we have exactly 3 items in the right order
    if (items.length !== 3) {
      console.error(`❌ [LookCanvas] Expected 3 items but got ${items.length}`);
      ctx.font = '16px Arial';
      ctx.fillStyle = '#ff0000';
      ctx.textAlign = 'center';
      ctx.fillText(`שגיאה: נדרשים 3 פריטים, קיבלתי ${items.length}`, width / 2, height / 2);
      setLoadingState('error');
      return;
    }

    // Verify item types are correct
    const expectedTypes = ['top', 'bottom', 'shoes'];
    const actualTypes = items.map(item => item.type);
    
    console.log('🔍 [LookCanvas] Expected types:', expectedTypes);
    console.log('🔍 [LookCanvas] Actual types:', actualTypes);
    
    for (let i = 0; i < 3; i++) {
      if (actualTypes[i] !== expectedTypes[i]) {
        console.error(`❌ [LookCanvas] Position ${i}: expected ${expectedTypes[i]}, got ${actualTypes[i]}`);
      }
    }

    console.log('🔍 [LookCanvas] Final display order:', items.map((item, i) => `${i}. ${item.type} (${item.id})`));

    // Define layout for items in vertical arrangement
    const padding = 15;
    const itemSpacing = 10;
    const availableHeight = height - (padding * 2);
    const itemHeight = Math.max(150, (availableHeight - (itemSpacing * 2)) / 3); // Always 3 items
    const itemWidth = width * 0.85;
    const centerX = (width - itemWidth) / 2;
    
    // Show loading state
    ctx.font = '16px Arial';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'center';
    ctx.fillText('טוען תמונות מוצרים...', width / 2, height / 2);

    const loadImages = async () => {
      try {
        let successCount = 0;
        let errorCount = 0;
        
        console.log(`🔍 [LookCanvas] Loading exactly ${items.length} items for display`);
        
        // Clear the canvas for clean rendering
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // Process all items (should be exactly 3)
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const itemPosition = ['TOP', 'BOTTOM', 'SHOES'][i] || `ITEM_${i}`;
          console.log(`🔍 [LookCanvas] Processing ${itemPosition} item: ${item.id} (${item.type}) at position ${i}`);
          
          try {
            // Get best available image
            const imageUrl = getBestImage(item);
            
            // Load the image
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            await new Promise((resolve, reject) => {
              img.onload = () => {
                console.log(`✅ [LookCanvas] Image loaded: ${item.id} (${itemPosition})`);
                successCount++;
                setLoadedCount(prev => prev + 1);
                resolve(null);
              };
              img.onerror = (e) => {
                console.error(`❌ [LookCanvas] Error loading image: ${item.id}`, e);
                errorCount++;
                setLoadedCount(prev => prev + 1);
                reject(e);
              };
              img.src = imageUrl;
            });

            // Calculate position for this item - fixed positions for 3 items
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
            
            console.log(`✅ [LookCanvas] Drew ${itemPosition} at position ${i}: x=${Math.round(drawX)}, y=${Math.round(drawY)}, w=${Math.round(drawWidth)}, h=${Math.round(drawHeight)}`);

          } catch (imgError) {
            console.error(`❌ [LookCanvas] Error processing item: ${item.id}`, imgError);
            errorCount++;
            setLoadedCount(prev => prev + 1);
          }
        }

        // Update loading state based on success/error count
        if (successCount > 0) {
          setLoadingState('success');
          console.log(`✅ [LookCanvas] Successfully loaded ${successCount} out of ${items.length} items`);
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
            <p className="text-sm text-gray-700">טוען פריטי תלבושת...</p>
            <p className="text-xs text-gray-500 mt-1">{loadedCount} פריטים נטענו</p>
          </div>
        </div>
      )}
      {loadingState === 'error' && items.length > 0 && (
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
