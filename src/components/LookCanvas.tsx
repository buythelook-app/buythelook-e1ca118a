
import { useEffect, useRef, useState } from "react";
import { analyzeImagesWithAI } from "@/services/aiImageAnalysisService";

interface OutfitItem {
  id: string;
  image: string;
  type: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear' | 'cart';
  name?: string;
  product_subfamily?: string;
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

  // Function to classify item type based on product_subfamily
  const classifyItemType = (item: OutfitItem): 'top' | 'bottom' | 'shoes' => {
    const subfamily = item.product_subfamily?.toLowerCase() || '';
    const name = item.name?.toLowerCase() || '';
    
    console.log(`🔍 Classifying item ${item.id}: subfamily="${subfamily}", name="${name}"`);
    
    // Bottom items
    if (subfamily.includes('pants') || subfamily.includes('trousers') || 
        subfamily.includes('jeans') || subfamily.includes('shorts') || 
        subfamily.includes('skirt') || subfamily.includes('leggings') ||
        name.includes('pants') || name.includes('jeans') || name.includes('shorts') || name.includes('skirt')) {
      console.log(`✅ Classified as BOTTOM: ${item.id}`);
      return 'bottom';
    }
    
    // Shoes
    if (subfamily.includes('shoes') || subfamily.includes('sneakers') || 
        subfamily.includes('boots') || subfamily.includes('sandals') || 
        subfamily.includes('heels') || subfamily.includes('flats') ||
        name.includes('shoes') || name.includes('sneakers') || name.includes('boots')) {
      console.log(`✅ Classified as SHOES: ${item.id}`);
      return 'shoes';
    }
    
    // Default to top for everything else (shirts, blouses, sweaters, etc.)
    console.log(`✅ Classified as TOP: ${item.id}`);
    return 'top';
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

  // Create complete outfit ensuring proper item selection and positioning
  const createCompleteOutfit = (items: OutfitItem[]): OutfitItem[] => {
    console.log('🔍 ===== DEBUGGING CANVAS ITEM CLASSIFICATION =====');
    console.log('🔍 Raw items received:', items.map(item => ({
      id: item.id,
      originalType: item.type,
      name: item.name || 'Unknown',
      product_subfamily: item.product_subfamily || 'Unknown subfamily'
    })));
    
    if (!items || items.length === 0) {
      console.log('❌ No items provided');
      return [];
    }
    
    // Classify all items properly based on their subfamily
    const classifiedItems = items.map(item => ({
      ...item,
      classifiedType: classifyItemType(item)
    }));
    
    console.log('🔍 Items after classification:', classifiedItems.map(item => ({
      id: item.id,
      originalType: item.type,
      classifiedType: item.classifiedType,
      name: item.name,
      subfamily: item.product_subfamily
    })));
    
    // Group items by classified type
    const topItems = classifiedItems.filter(item => item.classifiedType === 'top');
    const bottomItems = classifiedItems.filter(item => item.classifiedType === 'bottom');
    const shoeItems = classifiedItems.filter(item => item.classifiedType === 'shoes');
    
    console.log('🔍 Grouped items:');
    console.log(`  - TOP items: ${topItems.length}`, topItems.map(i => i.id));
    console.log(`  - BOTTOM items: ${bottomItems.length}`, bottomItems.map(i => i.id));
    console.log(`  - SHOES items: ${shoeItems.length}`, shoeItems.map(i => i.id));
    
    // Create exactly 3 display items in the correct order - ALWAYS 3 ITEMS
    const outfit: OutfitItem[] = [];
    
    // 1. TOP item (position 0) - MANDATORY
    if (topItems.length > 0) {
      outfit.push({
        ...topItems[0],
        type: 'top'
      });
      console.log('✅ Added TOP item:', topItems[0].id, topItems[0].name);
    } else {
      // Create placeholder top - ALWAYS ADD A TOP
      outfit.push({
        id: 'placeholder-top',
        image: '/placeholder.svg',
        type: 'top',
        name: 'חלק עליון',
        product_subfamily: 'top'
      });
      console.log('📦 Added placeholder TOP');
    }
    
    // 2. BOTTOM item (position 1) - MANDATORY
    if (bottomItems.length > 0) {
      outfit.push({
        ...bottomItems[0],
        type: 'bottom'
      });
      console.log('✅ Added BOTTOM item:', bottomItems[0].id, bottomItems[0].name);
    } else {
      // Create placeholder bottom - ALWAYS ADD A BOTTOM
      outfit.push({
        id: 'placeholder-bottom',
        image: '/placeholder.svg',
        type: 'bottom',
        name: 'חלק תחתון',
        product_subfamily: 'bottom'
      });
      console.log('📦 Added placeholder BOTTOM');
    }
    
    // 3. SHOES item (position 2) - MANDATORY
    if (shoeItems.length > 0) {
      outfit.push({
        ...shoeItems[0],
        type: 'shoes'
      });
      console.log('✅ Added SHOES item:', shoeItems[0].id, shoeItems[0].name);
    } else {
      // Create placeholder shoes - ALWAYS ADD SHOES
      outfit.push({
        id: 'placeholder-shoes',
        image: '/placeholder.svg',
        type: 'shoes',
        name: 'נעליים',
        product_subfamily: 'shoes'
      });
      console.log('📦 Added placeholder SHOES');
    }
    
    // VERIFY WE ALWAYS HAVE EXACTLY 3 ITEMS
    if (outfit.length !== 3) {
      console.error(`❌ ERROR: Expected 3 items but got ${outfit.length}`);
      // Force 3 items if something went wrong
      while (outfit.length < 3) {
        outfit.push({
          id: `force-placeholder-${outfit.length}`,
          image: '/placeholder.svg',
          type: outfit.length === 1 ? 'bottom' : 'shoes',
          name: `פריט ${outfit.length + 1}`,
          product_subfamily: 'placeholder'
        });
      }
    }
    
    console.log(`✅ Final outfit created with exactly ${outfit.length} items:`);
    outfit.forEach((item, i) => {
      console.log(`${i + 1}. ${item.type.toUpperCase()}: ${item.id} (${item.name || 'Unknown'})`);
    });
    console.log('🔍 ===== END DEBUGGING =====');
    
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

    // Create complete outfit with exactly 3 items
    const completeOutfit = createCompleteOutfit(items);
    
    if (completeOutfit.length === 0) {
      ctx.font = '16px Arial';
      ctx.fillStyle = '#666666';
      ctx.textAlign = 'center';
      ctx.fillText('לא נמצאו פריטים מתאימים', width / 2, height / 2);
      setLoadingState('error');
      return;
    }

    console.log('📐 Final display order:', completeOutfit.map((item, i) => `${i}. ${item.type} (${item.id})`));

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
        
        console.log(`🔍 Loading exactly ${completeOutfit.length} items for display (should be 3)`);
        
        // Clear the canvas for clean rendering
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // Process all items in the outfit (should be exactly 3)
        for (let i = 0; i < completeOutfit.length; i++) {
          const item = completeOutfit[i];
          const itemPosition = ['TOP', 'BOTTOM', 'SHOES'][i] || `ITEM_${i}`;
          console.log(`🔍 Processing ${itemPosition} item: ${item.id} (${item.type}) at position ${i}`);
          
          try {
            // Get product-only image
            const productImageUrl = await getAISelectedImage(item);
            
            // Load the image
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            await new Promise((resolve, reject) => {
              img.onload = () => {
                console.log(`✅ Product image loaded: ${item.id} (${itemPosition})`);
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
            
            console.log(`✅ Drew ${itemPosition} at position ${i}: x=${Math.round(drawX)}, y=${Math.round(drawY)}, w=${Math.round(drawWidth)}, h=${Math.round(drawHeight)}`);

          } catch (imgError) {
            console.error(`❌ Error processing item: ${item.id}`, imgError);
            errorCount++;
            setLoadedCount(prev => prev + 1);
          }
        }

        // Update loading state based on success/error count
        if (successCount > 0) {
          setLoadingState('success');
          console.log(`✅ Successfully loaded ${successCount} out of ${completeOutfit.length} items`);
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
