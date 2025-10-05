import { useEffect, useRef, useState } from "react";

interface OutfitItem {
  id: string;
  image: string | string[] | any; // Allow various image formats
  type: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear' | 'cart';
  name?: string;
  product_subfamily?: string;
}

interface LookCanvasProps {
  items: OutfitItem[];
  width?: number;
  height?: number;
}

// Image cache for instant display
const imageCache = new Map<string, HTMLImageElement>();

export const LookCanvas = ({ items, width = 400, height = 700 }: LookCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadingState, setLoadingState] = useState<'loading' | 'success' | 'error'>('loading');
  const [loadedCount, setLoadedCount] = useState(0);

  // Helper function to extract image URL from various formats
  const getImageUrl = (image: any): string => {
    if (!image) return '';
    
    // If it's already a string, return it
    if (typeof image === 'string') return image;
    
    // If it's an array, take the first item
    if (Array.isArray(image) && image.length > 0) {
      const firstItem = image[0];
      // Check if first item is a string
      if (typeof firstItem === 'string') return firstItem;
      // Check if first item is an object with url property
      if (typeof firstItem === 'object' && firstItem?.url) return firstItem.url;
      return '';
    }
    
    // If it's an object with url property
    if (typeof image === 'object' && image.url) {
      return image.url;
    }
    
    return '';
  };

  // Ultra simplified validation - just check for HTTP URLs
  const isValidImageUrl = (image: any, itemType: string): boolean => {
    const imageUrl = getImageUrl(image);
    console.log(`🔍 [LookCanvas] Validating ${itemType} image: "${imageUrl}"`);
    
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
      console.log(`❌ [LookCanvas] Invalid URL: empty or not string`);
      return false;
    }
    
    const hasHttp = imageUrl.includes('http');
    const notPlaceholder = !imageUrl.includes('placeholder.svg');
    const isValid = hasHttp && notPlaceholder;
    
    console.log(`🔍 [LookCanvas] ${itemType} validation result: ${isValid} (hasHttp: ${hasHttp}, notPlaceholder: ${notPlaceholder})`);
    return isValid;
  };

  // Enhanced image loading with cache and instant fallbacks
  const loadImageForCanvas = async (imageUrl: string, itemType: string = 'unknown'): Promise<HTMLImageElement> => {
    // Check cache first for instant display
    if (imageCache.has(imageUrl)) {
      console.log(`⚡ [LookCanvas] Using cached ${itemType} image: ${imageUrl.substring(0, 50)}...`);
      return imageCache.get(imageUrl)!;
    }
    
    console.log(`🔍 [LookCanvas] Loading ${itemType} image: ${imageUrl}`);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error(`⏰ [LookCanvas] ${itemType} image loading timeout: ${imageUrl}`);
        reject(new Error(`Timeout loading ${itemType} image: ${imageUrl}`));
      }, 3000); // 3 second timeout for faster UX

      img.onload = () => {
        clearTimeout(timeout);
        console.log(`✅ [LookCanvas] ${itemType} image loaded successfully: ${imageUrl.substring(0, 50)}...`);
        // Cache the image for instant future use
        imageCache.set(imageUrl, img);
        resolve(img);
      };
      
      img.onerror = (error) => {
        clearTimeout(timeout);
        const displayUrl = typeof imageUrl === 'string' ? imageUrl.substring(0, 100) : String(imageUrl).substring(0, 100);
        console.error(`❌ [LookCanvas] ${itemType} image loading failed: ${displayUrl}`, error);
        reject(new Error(`Failed to load ${itemType} image`));
      };
      
      img.src = imageUrl;
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    console.log('🔥 [LookCanvas] ===== STARTING CANVAS RENDER =====');
    console.log('🔥 [LookCanvas] All items received:', items.map((item, index) => ({
      index: index + 1,
      id: item.id,
      type: item.type,
      name: item.name || 'Unknown',
      imageRaw: item.image,
      imageUrl: getImageUrl(item.image),
      isShoes: item.type === 'shoes',
      imageValid: isValidImageUrl(item.image, item.type)
    })));

    // Reset loading state
    setLoadingState('loading');
    setLoadedCount(0);

    // Set up canvas with device pixel ratio
    const scale = window.devicePixelRatio || 1;
    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);

    // Clear and set background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Immediate display: Draw placeholder layout first for instant UX
    const padding = 15;
    const itemSpacing = 12;
    const availableHeight = height - (padding * 2);
    const totalSpacing = (items.length - 1) * itemSpacing;
    const itemHeight = Math.floor((availableHeight - totalSpacing) / items.length);
    const itemWidth = Math.min(width * 0.8, 280);
    const centerX = (width - itemWidth) / 2;

    // Draw immediate placeholders for instant feedback
    items.forEach((item, index) => {
      const yPosition = padding + (index * (itemHeight + itemSpacing));
      const drawX = centerX;
      const drawY = yPosition;
      
      // Draw placeholder rectangle
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(drawX, drawY, itemWidth, itemHeight * 0.8);
      
      // Add type label immediately
      ctx.font = '12px Arial';
      ctx.fillStyle = '#6b7280';
      ctx.textAlign = 'center';
      const typeLabels = {
        top: 'חולצה',
        bottom: 'מכנס',
        dress: 'שמלה', 
        shoes: 'נעליים',
        outerwear: 'מעיל'
      };
      const label = typeLabels[item.type as keyof typeof typeLabels] || item.type;
      ctx.fillText(label, drawX + itemWidth / 2, drawY + itemHeight * 0.8 + 16);
    });

    // FORCE INCLUDE SHOES - do not filter them out
    const validItems = items.filter(item => {
      if (item.type === 'shoes') {
        const imageUrl = getImageUrl(item.image);
        console.log(`👠 [LookCanvas] SHOES ITEM PROCESSING: "${item.name}"`, {
          id: item.id,
          imageRaw: item.image,
          imageUrl: imageUrl?.substring(0, 50) + '...',
          hasImage: !!imageUrl,
          imageType: typeof item.image
        });
        // Always include shoes even if image validation fails
        return true;
      }
      
      const hasValidImage = isValidImageUrl(item.image, item.type);
      
      if (!hasValidImage) {
        const imageUrl = getImageUrl(item.image);
        console.log(`❌ [LookCanvas] Filtering out non-shoes item: ${item.id} (${item.type}) - image: "${imageUrl?.substring(0, 50)}..."`);
      } else {
        console.log(`✅ [LookCanvas] Valid non-shoes item accepted: ${item.id} (${item.type})`);
      }
      
      return hasValidImage;
    });

    console.log(`✅ [LookCanvas] Processing ${validItems.length} items out of ${items.length} total`);
    
    // Check specifically for shoes
    const shoesItems = validItems.filter(item => item.type === 'shoes');
    console.log(`👠 [LookCanvas] Found ${shoesItems.length} shoes items in validItems`);
    shoesItems.forEach((shoe, index) => {
      const imageUrl = getImageUrl(shoe.image);
      console.log(`👠 [LookCanvas] Shoe ${index + 1}: "${shoe.name}" with image: ${imageUrl}`);
    });

    if (validItems.length === 0) {
      console.log('❌ [LookCanvas] No valid items found');
      setLoadingState('error');
      
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.font = '16px Arial';
      ctx.fillStyle = '#ff6b6b';
      ctx.textAlign = 'center';
      ctx.fillText('לא נמצאו פריטי לבוש עם תמונות', width / 2, height / 2 - 10);
      ctx.fillText('מהמאגר', width / 2, height / 2 + 10);
      return;
    }

    const loadImages = async () => {
      try {
        let successCount = 0;
        
        // Keep placeholder background, load images in parallel for speed
        console.log(`🎨 [LookCanvas] Layout: ${validItems.length} items, itemHeight=${itemHeight}, itemWidth=${itemWidth}`);
        
        // Load all images in parallel for faster UX
        const imagePromises = validItems.map(async (item, i) => {
          console.log(`🔍 [LookCanvas] Processing item ${i + 1}: ${item.id} (${item.type}) - ${item.name}`);
          
          if (item.type === 'shoes') {
            const imageUrl = getImageUrl(item.image);
            console.log(`👠 [LookCanvas] PROCESSING SHOES: "${item.name}" with image: ${imageUrl}`);
          }
          
          try {
            // For shoes, try loading even if URL seems invalid, with fast fallback
            let imageToLoad = getImageUrl(item.image);
            if (item.type === 'shoes' && (!imageToLoad || !isValidImageUrl(item.image, item.type))) {
              console.log(`👠 [LookCanvas] Shoes has invalid image, using fallback`);
              imageToLoad = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop';
            }
            
            const img = await loadImageForCanvas(imageToLoad, item.type);
            return { item, img, index: i, success: true };

          } catch (imgError) {
            console.error(`❌ [LookCanvas] Error processing item: ${item.id}`, imgError);
            if (item.type === 'shoes') {
              console.error(`❌ [LookCanvas] FAILED TO DRAW SHOES: ${item.name} - ${imgError.message}`);
            }
            return { item, img: null, index: i, success: false };
          }
        });

        // Wait for all images to load (or fail) in parallel
        const results = await Promise.allSettled(imagePromises);
        
        // Now draw all successfully loaded images
        results.forEach((result, i) => {
          if (result.status === 'fulfilled' && result.value.success && result.value.img) {
            const { item, img, index } = result.value;
            
            // Calculate position using the original layout
            const yPosition = padding + (index * (itemHeight + itemSpacing));
            
            // Smart cropping for clothing items
            const sourceWidth = img.width;
            const sourceHeight = img.height;
            
            // Different cropping for shoes vs other items
            let cropTop, cropBottom;
            if (item.type === 'shoes') {
              cropTop = sourceHeight * 0.05;
              cropBottom = sourceHeight * 0.05;
            } else {
              cropTop = sourceHeight * 0.15;
              cropBottom = sourceHeight * 0.10;
            }
            
            const croppedHeight = sourceHeight - cropTop - cropBottom;
            const aspectRatio = sourceWidth / croppedHeight;
            let drawWidth = itemWidth;
            let drawHeight = drawWidth / aspectRatio;

            const maxHeight = itemHeight * 0.9;
            if (drawHeight > maxHeight) {
              drawHeight = maxHeight;
              drawWidth = drawHeight * aspectRatio;
            }

            const drawX = centerX + (itemWidth - drawWidth) / 2;
            const drawY = yPosition + (itemHeight - drawHeight) / 2;

            console.log(`🎨 [LookCanvas] Drawing ${item.type}: pos=${index}, y=${Math.round(yPosition)}, size=${Math.round(drawWidth)}x${Math.round(drawHeight)}`);

            // Clear placeholder area first
            ctx.clearRect(drawX - 2, drawY - 2, drawWidth + 4, drawHeight + 20);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(drawX - 2, drawY - 2, drawWidth + 4, drawHeight + 20);

            // Draw with shadow effect
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 4;
            
            ctx.drawImage(
              img,
              0, cropTop, sourceWidth, croppedHeight,
              drawX, drawY, drawWidth, drawHeight
            );
            
            ctx.restore();

            // Add item type label
            ctx.save();
            ctx.font = '12px Arial';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.textAlign = 'center';
            const typeLabels = {
              top: 'חולצה',
              bottom: 'מכנס', 
              dress: 'שמלה',
              shoes: 'נעליים',
              outerwear: 'מעיל'
            };
            const label = typeLabels[item.type as keyof typeof typeLabels] || item.type;
            ctx.fillText(label, drawX + drawWidth / 2, drawY + drawHeight + 16);
            ctx.restore();
            
            successCount++;
            setLoadedCount(prev => prev + 1);
            
            if (item.type === 'shoes') {
              console.log(`✅ [LookCanvas] Successfully drew SHOES: ${item.name}`);
            } else {
              console.log(`✅ [LookCanvas] Successfully drew ${item.type}: ${item.name}`);
            }
          }
        });

        // Update loading state - show success immediately if we have any items
        setLoadingState(successCount > 0 ? 'success' : (validItems.length > 0 ? 'success' : 'error'));
        console.log(`✅ [LookCanvas] Successfully rendered ${successCount} items total (${shoesItems.length} shoes)`);

      } catch (error) {
        console.error('❌ [LookCanvas] Error in loadImages:', error);
        setLoadingState('success'); // Still show success to avoid blocking UX
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
      {loadingState === 'loading' && loadedCount === 0 && (
        <div className="absolute top-4 right-4 bg-white/90 rounded-lg p-2 shadow-md">
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border border-gray-300 border-t-primary rounded-full"></div>
            <p className="text-xs text-gray-600">טוען תמונות...</p>
          </div>
        </div>
      )}
      {loadingState === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-95 rounded-lg">
          <div className="bg-white p-4 rounded-lg shadow-md text-center border border-red-200">
            <p className="text-red-500 mb-1 font-medium">לא נמצאו תמונות מהמאגר</p>
            <p className="text-xs text-gray-600">נא לוודא שיש פריטים עם תמונות במאגר</p>
          </div>
        </div>
      )}
    </div>
  );
};
