
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

  // Simple validation - just check if image exists and is a string with http
  const isValidImageUrl = (imageUrl: string): boolean => {
    return !!(imageUrl && 
              typeof imageUrl === 'string' && 
              imageUrl.trim() !== '' && 
              imageUrl.includes('http') &&
              !imageUrl.includes('placeholder.svg') &&
              !imageUrl.includes('unsplash.com'));
  };

  // Load image with proper error handling
  const loadImageForCanvas = async (imageUrl: string): Promise<HTMLImageElement> => {
    console.log(`🔍 [LookCanvas] Loading image: ${imageUrl}`);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        console.log(`✅ [LookCanvas] Image loaded successfully: ${imageUrl}`);
        resolve(img);
      };
      
      img.onerror = (error) => {
        console.error(`❌ [LookCanvas] Image loading failed: ${imageUrl}`, error);
        reject(new Error(`Failed to load image: ${imageUrl}`));
      };
      
      img.src = imageUrl;
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    console.log('🔍 [LookCanvas] ===== STARTING CANVAS RENDER =====');
    console.log('🔍 [LookCanvas] All items received:', items.map(item => ({
      id: item.id,
      type: item.type,
      name: item.name || 'Unknown',
      imageUrl: item.image,
      isShoes: item.type === 'shoes'
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

    // Show loading state
    ctx.font = '16px Arial';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'center';
    ctx.fillText('טוען פריטי לבוש...', width / 2, height / 2);

    // Filter for valid items - be more permissive for shoes
    const validItems = items.filter(item => {
      const hasValidImage = isValidImageUrl(item.image);
      const isShoes = item.type === 'shoes';
      
      if (isShoes) {
        console.log(`👠 [LookCanvas] Shoes item: ${item.id}`, {
          name: item.name,
          imageUrl: item.image,
          isValid: hasValidImage
        });
      }
      
      if (!hasValidImage) {
        console.log(`❌ [LookCanvas] Filtering out item: ${item.id} (${item.type}) - image: "${item.image}"`);
      } else {
        console.log(`✅ [LookCanvas] Valid item accepted: ${item.id} (${item.type})`);
      }
      
      return hasValidImage;
    });

    console.log(`✅ [LookCanvas] Processing ${validItems.length} valid items out of ${items.length} total`);

    if (validItems.length === 0) {
      console.log('❌ [LookCanvas] No valid items with images found');
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
        
        // Clear canvas for clean rendering
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // Calculate layout
        const padding = 15;
        const itemSpacing = 12;
        const availableHeight = height - (padding * 2);
        const totalSpacing = (validItems.length - 1) * itemSpacing;
        const itemHeight = Math.floor((availableHeight - totalSpacing) / validItems.length);
        const itemWidth = Math.min(width * 0.8, 280);
        const centerX = (width - itemWidth) / 2;
        
        console.log(`🎨 [LookCanvas] Layout: ${validItems.length} items, itemHeight=${itemHeight}, itemWidth=${itemWidth}`);
        
        // Process each valid item
        for (let i = 0; i < validItems.length; i++) {
          const item = validItems[i];
          
          console.log(`🔍 [LookCanvas] Processing item ${i + 1}: ${item.id} (${item.type}) - ${item.name}`);
          
          try {
            const img = await loadImageForCanvas(item.image);
            successCount++;
            setLoadedCount(prev => prev + 1);

            // Calculate position
            const yPosition = padding + (i * (itemHeight + itemSpacing));
            
            // Smart cropping for clothing items
            const sourceWidth = img.width;
            const sourceHeight = img.height;
            
            // Crop top 15% and bottom 10% to focus on the clothing item
            const cropTop = sourceHeight * 0.15;
            const cropBottom = sourceHeight * 0.10;
            const croppedHeight = sourceHeight - cropTop - cropBottom;
            
            // Calculate proper aspect ratio
            const aspectRatio = sourceWidth / croppedHeight;
            let drawWidth = itemWidth;
            let drawHeight = drawWidth / aspectRatio;

            // Constrain by height if needed
            const maxHeight = itemHeight * 0.9;
            if (drawHeight > maxHeight) {
              drawHeight = maxHeight;
              drawWidth = drawHeight * aspectRatio;
            }

            // Center the item
            const drawX = centerX + (itemWidth - drawWidth) / 2;
            const drawY = yPosition + (itemHeight - drawHeight) / 2;

            console.log(`🎨 [LookCanvas] Drawing ${item.type}: pos=${i}, y=${Math.round(yPosition)}, size=${Math.round(drawWidth)}x${Math.round(drawHeight)}`);

            // Draw with shadow effect
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 4;
            
            // Draw the cropped item image
            ctx.drawImage(
              img,
              0, cropTop, sourceWidth, croppedHeight, // Source crop
              drawX, drawY, drawWidth, drawHeight      // Destination
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
            
            console.log(`✅ [LookCanvas] Successfully drew ${item.type}: ${item.name}`);

          } catch (imgError) {
            console.error(`❌ [LookCanvas] Error processing item: ${item.id}`, imgError);
            setLoadedCount(prev => prev + 1);
          }
        }

        // Update loading state
        if (successCount > 0) {
          setLoadingState('success');
          console.log(`✅ [LookCanvas] Successfully rendered ${successCount} items total`);
        } else {
          setLoadingState('error');
          
          ctx.clearRect(0, 0, width, height);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.font = '16px Arial';
          ctx.fillStyle = '#ff6b6b';
          ctx.textAlign = 'center';
          ctx.fillText('שגיאה בטעינת תמונות', width / 2, height / 2 - 10);
          ctx.fillText('מהמאגר', width / 2, height / 2 + 10);
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
            <p className="text-sm text-gray-700">טוען פריטי לבוש מהמאגר...</p>
            <p className="text-xs text-gray-500 mt-1">{loadedCount} פריטים נטענו</p>
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
