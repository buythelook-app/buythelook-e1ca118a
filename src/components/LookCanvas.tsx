
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

export const LookCanvas = ({ items, width = 600, height = 800 }: LookCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadingState, setLoadingState] = useState<'loading' | 'success' | 'error'>('loading');
  const [loadedCount, setLoadedCount] = useState(0);
  const [aiProcessedImages, setAiProcessedImages] = useState<{ [key: string]: string }>({});

  // Get AI-selected image for an item
  const getAISelectedImage = async (item: OutfitItem): Promise<string> => {
    try {
      console.log(`🤖 Getting AI-selected image for item ${item.id}`);
      
      // Check if we already have the AI result cached
      if (aiProcessedImages[item.id]) {
        console.log(`📦 Using cached AI image for ${item.id}: ${aiProcessedImages[item.id]}`);
        return aiProcessedImages[item.id];
      }

      // Get AI analysis for this specific item
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
      
      console.log(`⚠️ AI analysis failed for ${item.id}, using original image`);
      return item.image;
      
    } catch (error) {
      console.error(`❌ Error getting AI image for ${item.id}:`, error);
      return item.image;
    }
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

    // Clear and set background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f8f9fa';
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

    // Sort items in correct rendering order
    const renderOrder = { top: 0, outerwear: 1, bottom: 2, dress: 2, shoes: 3 };
    const sortedItems = [...items].sort((a, b) => {
      const orderA = renderOrder[a.type] ?? 999;
      const orderB = renderOrder[b.type] ?? 999;
      return orderA - orderB;
    });

    // Define positions in thirds with proper spacing
    const thirdHeight = height / 3;
    const itemSpacing = 20; // Space between items
    
    const defaultPositions = {
      // Top third - for tops and outerwear, distributed horizontally
      top: { 
        x: width * 0.1, 
        y: itemSpacing, 
        width: width * 0.35, 
        height: thirdHeight - (itemSpacing * 2) 
      },
      outerwear: { 
        x: width * 0.55, 
        y: itemSpacing, 
        width: width * 0.35, 
        height: thirdHeight - (itemSpacing * 2) 
      },
      
      // Middle third - for bottoms and dresses, distributed horizontally
      bottom: { 
        x: width * 0.1, 
        y: thirdHeight + itemSpacing, 
        width: width * 0.35, 
        height: thirdHeight - (itemSpacing * 2) 
      },
      dress: { 
        x: width * 0.55, 
        y: thirdHeight + itemSpacing, 
        width: width * 0.35, 
        height: thirdHeight - (itemSpacing * 2) 
      },
      
      // Bottom third - for shoes and accessories, distributed horizontally
      shoes: { 
        x: width * 0.1, 
        y: (thirdHeight * 2) + itemSpacing, 
        width: width * 0.35, 
        height: thirdHeight - (itemSpacing * 2) 
      },
      accessory: { 
        x: width * 0.55, 
        y: (thirdHeight * 2) + itemSpacing, 
        width: width * 0.35, 
        height: thirdHeight - (itemSpacing * 2) 
      },
      sunglasses: { 
        x: width * 0.25, 
        y: itemSpacing, 
        width: width * 0.5, 
        height: thirdHeight * 0.3 
      },
      cart: { 
        x: width * 0.1, 
        y: thirdHeight + itemSpacing, 
        width: width * 0.8, 
        height: thirdHeight - (itemSpacing * 2) 
      }
    };

    // Show loading state
    ctx.font = '16px Arial';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'center';
    ctx.fillText('טוען ומעבד תמונות ללא דוגמניות...', width / 2, height / 2);

    const loadImages = async () => {
      try {
        let successCount = 0;
        let errorCount = 0;
        
        console.log('🔍 Loading AI-selected images for items:', sortedItems);
        
        for (let i = 0; i < sortedItems.length; i++) {
          const item = sortedItems[i];
          console.log(`🔍 Processing item ${i + 1}/${sortedItems.length}: ${item.id} (${item.type})`);
          
          try {
            // Get AI-selected image without model
            const aiSelectedImageUrl = await getAISelectedImage(item);
            
            // Load the AI-selected image
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            await new Promise((resolve, reject) => {
              img.onload = () => {
                console.log(`✅ AI-selected image loaded: ${item.id}`);
                successCount++;
                setLoadedCount(prev => prev + 1);
                resolve(null);
              };
              img.onerror = (e) => {
                console.error(`❌ Error loading AI-selected image: ${item.id}`, e);
                errorCount++;
                setLoadedCount(prev => prev + 1);
                reject(e);
              };
              img.src = aiSelectedImageUrl;
            });

            const position = item.position || defaultPositions[item.type];
            if (position) {
              // Calculate proper aspect ratio and fit within designated area
              const aspectRatio = img.width / img.height;
              let drawWidth = position.width;
              let drawHeight = position.height;

              // Maintain aspect ratio while fitting in the designated area
              if (drawWidth / drawHeight > aspectRatio) {
                drawWidth = drawHeight * aspectRatio;
              } else {
                drawHeight = drawWidth / aspectRatio;
              }

              // Center the item within its designated area
              const centerX = position.x + (position.width - drawWidth) / 2;
              const centerY = position.y + (position.height - drawHeight) / 2;

              ctx.save();
              
              // Add subtle border for each item
              ctx.strokeStyle = '#e0e0e0';
              ctx.lineWidth = 1;
              ctx.strokeRect(centerX - 2, centerY - 2, drawWidth + 4, drawHeight + 4);
              
              // Draw the item image
              ctx.drawImage(
                img,
                centerX,
                centerY,
                drawWidth,
                drawHeight
              );
              
              ctx.restore();
              
              console.log(`✅ Drew ${item.type} (AI-selected) at: x=${Math.round(centerX)}, y=${Math.round(centerY)}, w=${Math.round(drawWidth)}, h=${Math.round(drawHeight)}`);
            }

          } catch (imgError) {
            console.error(`❌ Error processing item: ${item.id}`, imgError);
            errorCount++;
            setLoadedCount(prev => prev + 1);
          }
        }

        // Update loading state based on success/error count
        if (errorCount === sortedItems.length) {
          setLoadingState('error');
          
          // Draw error message
          ctx.clearRect(0, 0, width, height);
          ctx.fillStyle = '#f8f9fa';
          ctx.fillRect(0, 0, width, height);
          ctx.font = '16px Arial';
          ctx.fillStyle = '#ff0000';
          ctx.textAlign = 'center';
          ctx.fillText('שגיאה בעיבוד תמונות ללא דוגמניות', width / 2, height / 2);
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
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="border rounded-lg shadow-lg bg-white"
        style={{ 
          maxWidth: '100%',
          width: `${width}px`,
          height: `${height}px`
        }}
      />
      {loadingState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
          <div className="bg-white p-3 rounded shadow text-center">
            <p>מעבד תמונות ללא דוגמניות... {loadedCount}/{items.length}</p>
            <p className="text-xs text-gray-600">סוכן AI בוחר תמונות מתאימות</p>
          </div>
        </div>
      )}
      {loadingState === 'error' && items.length > 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-10 rounded-lg">
          <div className="bg-white p-3 rounded shadow text-center">
            <p className="text-red-500 mb-1">שגיאה בעיבוד התמונות</p>
            <p className="text-xs text-gray-600">נסה לרענן את העמוד</p>
          </div>
        </div>
      )}
    </div>
  );
};
