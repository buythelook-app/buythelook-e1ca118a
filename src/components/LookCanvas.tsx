import { useEffect, useRef, useState } from "react";

interface OutfitItem {
  id: string;
  image: string | string[] | any;
  type: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear' | 'cart';
  name?: string;
}

interface LookCanvasProps {
  items: OutfitItem[];
  width?: number;
  height?: number;
}

const imageCache = new Map<string, HTMLImageElement>();

export const LookCanvas = ({ items, width = 400, height = 700 }: LookCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadingState, setLoadingState] = useState<'loading' | 'success' | 'error'>('loading');

  const getImageUrl = (image: any): string => {
    if (!image) return '';
    if (typeof image === 'string') return image;
    if (Array.isArray(image) && image.length > 0) {
      const firstItem = image[0];
      if (typeof firstItem === 'string') return firstItem;
      if (typeof firstItem === 'object' && firstItem?.url) return firstItem.url;
      return '';
    }
    if (typeof image === 'object' && image.url) return image.url;
    return '';
  };

  const loadImageForCanvas = async (imageUrl: string): Promise<HTMLImageElement> => {
    if (imageCache.has(imageUrl)) {
      return imageCache.get(imageUrl)!;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout loading image'));
      }, 5000);

      img.onload = () => {
        clearTimeout(timeout);
        imageCache.set(imageUrl, img);
        resolve(img);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Failed to load image'));
      };

      img.src = imageUrl;
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setLoadingState('loading');

    const scale = window.devicePixelRatio || 1;
    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const validItems = items.filter(item => {
      const imageUrl = getImageUrl(item.image);
      return imageUrl && imageUrl.includes('http') && !imageUrl.includes('placeholder');
    });

    if (validItems.length === 0) {
      setLoadingState('error');
      ctx.font = '16px Arial';
      ctx.fillStyle = '#999';
      ctx.textAlign = 'center';
      ctx.fillText('No items with images', width / 2, height / 2);
      return;
    }

    const loadImages = async () => {
      try {
        const padding = 20;
        const itemSpacing = 15;
        const availableHeight = height - (padding * 2);
        const totalSpacing = (validItems.length - 1) * itemSpacing;
        const itemHeight = (availableHeight - totalSpacing) / validItems.length;
        const itemWidth = width * 0.8;
        const centerX = (width - itemWidth) / 2;

        for (let i = 0; i < validItems.length; i++) {
          const item = validItems[i];
          const imageUrl = getImageUrl(item.image);

          try {
            const img = await loadImageForCanvas(imageUrl);
            const yPosition = padding + (i * (itemHeight + itemSpacing));

            const sourceWidth = img.width;
            const sourceHeight = img.height;
            const cropTop = sourceHeight * 0.15;
            const cropBottom = sourceHeight * 0.10;
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

            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 4;

            ctx.drawImage(
              img,
              0, cropTop, sourceWidth, croppedHeight,
              drawX, drawY, drawWidth, drawHeight
            );

            ctx.restore();
          } catch (error) {
            console.error('Error loading item image:', error);
          }
        }

        setLoadingState('success');
      } catch (error) {
        console.error('Error in loadImages:', error);
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
        <div className="absolute top-4 right-4 bg-white/90 rounded-lg p-2 shadow-md">
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border border-gray-300 border-t-primary rounded-full"></div>
            <p className="text-xs text-gray-600">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};
