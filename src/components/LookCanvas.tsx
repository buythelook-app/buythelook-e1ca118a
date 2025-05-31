
import { useEffect, useRef, useState } from "react";
import { removeBackground, loadImageFromUrl } from "@/utils/backgroundRemoval";

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
  const [processingCount, setProcessingCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset loading state when items change
    setLoadingState('loading');
    setLoadedCount(0);
    setProcessingCount(0);

    // Set up canvas with device pixel ratio
    const scale = window.devicePixelRatio || 1;
    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);

    // Clear and set background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Render a loading message if no items
    if (items.length === 0) {
      ctx.font = '16px Arial';
      ctx.fillStyle = '#666666';
      ctx.textAlign = 'center';
      ctx.fillText('No outfit items to display', width / 2, height / 2);
      setLoadingState('error');
      return;
    }

    // Sort items in correct rendering order
    const renderOrder = { outerwear: 0, top: 1, bottom: 2, shoes: 3 };
    const sortedItems = [...items].sort((a, b) => {
      const orderA = renderOrder[a.type] ?? 999;
      const orderB = renderOrder[b.type] ?? 999;
      return orderA - orderB;
    });

    // Define positions with enhanced shoe positioning and cropping
    const defaultPositions = {
      outerwear: { x: width * 0.02, y: height * 0.02, width: width * 0.96, height: height * 0.5 },
      top: { x: width * 0.02, y: height * 0.02, width: width * 0.96, height: height * 0.5 },
      bottom: { x: width * 0.02, y: height * 0.25, width: width * 0.96, height: height * 0.5 },
      dress: { x: width * 0.02, y: height * 0.02, width: width * 0.96, height: height * 0.9 },
      shoes: { x: width * 0.2, y: height * 0.6, width: width * 0.6, height: height * 0.3 },
      accessory: { x: width * 0.02, y: height * 0.25, width: width * 0.96, height: height * 0.5 },
      sunglasses: { x: width * 0.02, y: height * 0.02, width: width * 0.96, height: height * 0.5 },
      cart: { x: width * 0.02, y: height * 0.02, width: width * 0.96, height: height * 0.5 }
    };

    // Show loading state
    ctx.font = '16px Arial';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'center';
    ctx.fillText('Loading and processing outfit items...', width / 2, height / 2);

    const loadImages = async () => {
      try {
        let successCount = 0;
        let errorCount = 0;
        
        console.log('Loading and processing images for items:', sortedItems);
        
        for (const item of sortedItems) {
          console.log('Processing item:', item.id, item.type, item.image);
          
          try {
            setProcessingCount(prev => prev + 1);
            
            // Load the original image
            const originalImg = await loadImageFromUrl(item.image);
            console.log('Original image loaded:', item.image);

            // Remove background from the image
            console.log('Removing background for item:', item.id);
            const processedBlob = await removeBackground(originalImg);
            
            // Create a new image from the processed blob
            const processedImageUrl = URL.createObjectURL(processedBlob);
            const processedImg = new Image();
            
            await new Promise((resolve, reject) => {
              processedImg.onload = () => {
                console.log('Processed image loaded successfully:', item.id);
                successCount++;
                setLoadedCount(prev => prev + 1);
                resolve(null);
              };
              processedImg.onerror = (e) => {
                console.error('Error loading processed image:', item.id, e);
                errorCount++;
                setLoadedCount(prev => prev + 1);
                reject(e);
              };
              processedImg.src = processedImageUrl;
            });

            const position = item.position || defaultPositions[item.type];
            if (position) {
              const aspectRatio = processedImg.width / processedImg.height;
              let drawWidth = position.width;
              let drawHeight = position.height;

              if (drawWidth / drawHeight > aspectRatio) {
                drawWidth = drawHeight * aspectRatio;
              } else {
                drawHeight = drawWidth / aspectRatio;
              }

              const centerX = position.x + (position.width - drawWidth) / 2;
              const centerY = position.y + (position.height - drawHeight) / 2;

              ctx.save();
              ctx.drawImage(
                processedImg,
                centerX,
                centerY,
                drawWidth,
                drawHeight
              );
              ctx.restore();
            }

            // Clean up the blob URL
            URL.revokeObjectURL(processedImageUrl);

          } catch (imgError) {
            console.error('Error processing item:', item.id, imgError);
            errorCount++;
            setLoadedCount(prev => prev + 1);
          }
        }

        // Update loading state based on success/error count
        if (errorCount === sortedItems.length) {
          setLoadingState('error');
          
          // Draw error message
          ctx.clearRect(0, 0, width, height);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.font = '16px Arial';
          ctx.fillStyle = '#ff0000';
          ctx.textAlign = 'center';
          ctx.fillText('Failed to process outfit images', width / 2, height / 2);
        } else if (successCount > 0) {
          setLoadingState('success');
        } else {
          setLoadingState('error');
        }

      } catch (error) {
        console.error('Error in loadImages:', error);
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
            <p>עיבוד תמונות... {loadedCount}/{items.length}</p>
            <p className="text-xs text-gray-600">מסיר רקע מהפריטים</p>
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
