
import { useEffect, useRef, useState } from "react";

interface OutfitItem {
  id: string;
  image: string;
  type: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear';
  name?: string;
  color?: string;
}

interface AvatarProps {
  items: OutfitItem[];
  bodyShape: 'X' | 'V' | 'H' | 'O' | 'A';
  width?: number;
  height?: number;
}

const BODY_SHAPE_PATHS = {
  'X': {
    // Hourglass - wider at shoulders and hips, narrow waist
    path: "M150 80 C 180 80, 200 100, 200 130 L 190 180 C 190 200, 180 220, 170 240 L 180 280 C 180 320, 170 360, 150 400 L 250 400 C 230 360, 220 320, 220 280 L 230 240 C 220 220, 210 200, 210 180 L 200 130 C 200 100, 220 80, 250 80 Z",
    description: "שעון חול"
  },
  'V': {
    // Inverted triangle - broad shoulders, narrow hips
    path: "M120 80 C 160 80, 200 90, 240 100 L 230 140 C 220 180, 210 220, 200 260 L 190 300 C 185 340, 180 380, 175 400 L 225 400 C 220 380, 215 340, 210 300 L 200 260 C 190 220, 180 180, 170 140 L 160 100 C 200 90, 240 80, 280 80 Z",
    description: "משולש הפוך"
  },
  'H': {
    // Rectangle - straight up and down
    path: "M170 80 L 230 80 L 230 140 L 230 200 L 230 260 L 230 320 L 230 380 L 230 400 L 170 400 L 170 380 L 170 320 L 170 260 L 170 200 L 170 140 L 170 80 Z",
    description: "מלבן"
  },
  'O': {
    // Oval/Apple - wider in the middle
    path: "M150 80 C 190 80, 220 90, 240 120 L 250 160 C 260 200, 260 240, 250 280 L 240 320 C 220 350, 190 380, 150 400 L 250 400 C 210 380, 180 350, 160 320 L 150 280 C 140 240, 140 200, 150 160 L 160 120 C 180 90, 210 80, 250 80 Z",
    description: "אובלי"
  },
  'A': {
    // Pear - narrow shoulders, wider hips
    path: "M180 80 L 220 80 L 220 120 L 210 160 C 205 200, 200 240, 190 280 L 170 320 C 150 360, 130 380, 110 400 L 290 400 C 270 380, 250 360, 230 320 L 210 280 C 200 240, 195 200, 190 160 L 180 120 L 180 80 Z",
    description: "אגס"
  }
};

export const Avatar = ({ items, bodyShape, width = 400, height = 600 }: AvatarProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderAvatar = async () => {
      setIsLoading(true);
      
      // Set up canvas
      const scale = window.devicePixelRatio || 1;
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);

      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw background
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, width, height);

      // Draw body shape
      const bodyShapeInfo = BODY_SHAPE_PATHS[bodyShape];
      ctx.fillStyle = '#e9ecef';
      ctx.strokeStyle = '#6c757d';
      ctx.lineWidth = 2;
      
      // Create SVG-like path for body shape (simplified rectangle for now)
      const centerX = width / 2;
      const bodyWidth = 120;
      const bodyHeight = 300;
      const startY = 120;

      // Different body shapes
      switch (bodyShape) {
        case 'X': // Hourglass
          ctx.beginPath();
          ctx.moveTo(centerX - bodyWidth/2, startY);
          ctx.lineTo(centerX + bodyWidth/2, startY);
          ctx.lineTo(centerX + bodyWidth/3, startY + bodyHeight/3);
          ctx.lineTo(centerX + bodyWidth/2, startY + bodyHeight);
          ctx.lineTo(centerX - bodyWidth/2, startY + bodyHeight);
          ctx.lineTo(centerX - bodyWidth/3, startY + bodyHeight/3);
          ctx.closePath();
          break;
          
        case 'V': // Inverted triangle
          ctx.beginPath();
          ctx.moveTo(centerX - bodyWidth/2, startY);
          ctx.lineTo(centerX + bodyWidth/2, startY);
          ctx.lineTo(centerX + bodyWidth/4, startY + bodyHeight);
          ctx.lineTo(centerX - bodyWidth/4, startY + bodyHeight);
          ctx.closePath();
          break;
          
        case 'A': // Pear
          ctx.beginPath();
          ctx.moveTo(centerX - bodyWidth/4, startY);
          ctx.lineTo(centerX + bodyWidth/4, startY);
          ctx.lineTo(centerX + bodyWidth/2, startY + bodyHeight);
          ctx.lineTo(centerX - bodyWidth/2, startY + bodyHeight);
          ctx.closePath();
          break;
          
        case 'O': // Oval
          ctx.beginPath();
          ctx.ellipse(centerX, startY + bodyHeight/2, bodyWidth/2, bodyHeight/2, 0, 0, 2 * Math.PI);
          break;
          
        default: // 'H' Rectangle
          ctx.fillRect(centerX - bodyWidth/2, startY, bodyWidth, bodyHeight);
          break;
      }
      
      ctx.fill();
      ctx.stroke();

      // Draw head
      ctx.beginPath();
      ctx.arc(centerX, startY - 40, 30, 0, 2 * Math.PI);
      ctx.fillStyle = '#e9ecef';
      ctx.fill();
      ctx.stroke();

      // Draw clothing items
      for (const item of items) {
        if (!item.image) continue;
        
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = item.image;
          });

          // Position items based on type
          let x, y, itemWidth, itemHeight;
          
          switch (item.type) {
            case 'top':
              x = centerX - 50;
              y = startY + 20;
              itemWidth = 100;
              itemHeight = 80;
              break;
            case 'bottom':
              x = centerX - 45;
              y = startY + 120;
              itemWidth = 90;
              itemHeight = 100;
              break;
            case 'shoes':
              x = centerX - 30;
              y = startY + 260;
              itemWidth = 60;
              itemHeight = 40;
              break;
            case 'dress':
              x = centerX - 50;
              y = startY + 20;
              itemWidth = 100;
              itemHeight = 180;
              break;
            default:
              continue;
          }

          // Draw item with some transparency
          ctx.globalAlpha = 0.9;
          ctx.drawImage(img, x, y, itemWidth, itemHeight);
          ctx.globalAlpha = 1.0;

        } catch (error) {
          console.log(`Failed to load item image: ${item.name}`);
        }
      }

      setIsLoading(false);
    };

    renderAvatar();
  }, [items, bodyShape, width, height]);

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
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
          <div className="bg-white p-4 rounded-lg shadow-md text-center border">
            <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-700">יוצר אבטאר...</p>
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
        מבנה גוף: {BODY_SHAPE_PATHS[bodyShape].description}
      </div>
    </div>
  );
};
