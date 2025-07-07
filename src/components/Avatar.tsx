
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

export const Avatar = ({ items, bodyShape, width = 400, height = 600 }: AvatarProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const drawBodyShape = (ctx: CanvasRenderingContext2D, centerX: number, startY: number) => {
    const bodyWidth = 80;
    const bodyHeight = 200;
    
    // Body color
    ctx.fillStyle = '#f4c2a1'; // Skin tone
    ctx.strokeStyle = '#d4a574';
    ctx.lineWidth = 2;

    switch (bodyShape) {
      case 'X': // Hourglass - wider at shoulders and hips, narrow waist
        ctx.beginPath();
        // Shoulders
        ctx.moveTo(centerX - bodyWidth/2, startY);
        ctx.lineTo(centerX + bodyWidth/2, startY);
        // Right side down to waist
        ctx.quadraticCurveTo(centerX + bodyWidth/2, startY + bodyHeight/4, centerX + bodyWidth/3, startY + bodyHeight/2);
        // Right side from waist to hips
        ctx.quadraticCurveTo(centerX + bodyWidth/3, startY + bodyHeight*0.75, centerX + bodyWidth/2, startY + bodyHeight);
        // Bottom
        ctx.lineTo(centerX - bodyWidth/2, startY + bodyHeight);
        // Left side from hips to waist
        ctx.quadraticCurveTo(centerX - bodyWidth/3, startY + bodyHeight*0.75, centerX - bodyWidth/3, startY + bodyHeight/2);
        // Left side from waist to shoulders
        ctx.quadraticCurveTo(centerX - bodyWidth/2, startY + bodyHeight/4, centerX - bodyWidth/2, startY);
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'V': // Inverted triangle - broad shoulders, narrow hips
        ctx.beginPath();
        ctx.moveTo(centerX - bodyWidth/2, startY);
        ctx.lineTo(centerX + bodyWidth/2, startY);
        ctx.lineTo(centerX + bodyWidth/3, startY + bodyHeight);
        ctx.lineTo(centerX - bodyWidth/3, startY + bodyHeight);
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'A': // Pear - narrow shoulders, wider hips
        ctx.beginPath();
        ctx.moveTo(centerX - bodyWidth/3, startY);
        ctx.lineTo(centerX + bodyWidth/3, startY);
        ctx.lineTo(centerX + bodyWidth/2, startY + bodyHeight);
        ctx.lineTo(centerX - bodyWidth/2, startY + bodyHeight);
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'O': // Oval - wider in the middle
        ctx.beginPath();
        ctx.ellipse(centerX, startY + bodyHeight/2, bodyWidth/2.2, bodyHeight/2, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        break;
        
      default: // 'H' Rectangle - straight up and down
        ctx.fillRect(centerX - bodyWidth/2, startY, bodyWidth, bodyHeight);
        ctx.strokeRect(centerX - bodyWidth/2, startY, bodyWidth, bodyHeight);
        break;
    }
  };

  const drawHead = (ctx: CanvasRenderingContext2D, centerX: number, headY: number) => {
    // Head
    ctx.fillStyle = '#f4c2a1';
    ctx.strokeStyle = '#d4a574';
    ctx.beginPath();
    ctx.arc(centerX, headY, 35, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Simple facial features
    // Eyes
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(centerX - 12, headY - 8, 3, 0, 2 * Math.PI);
    ctx.arc(centerX + 12, headY - 8, 3, 0, 2 * Math.PI);
    ctx.fill();

    // Nose
    ctx.strokeStyle = '#d4a574';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, headY - 2);
    ctx.lineTo(centerX - 2, headY + 3);
    ctx.stroke();

    // Mouth
    ctx.beginPath();
    ctx.arc(centerX, headY + 8, 8, 0, Math.PI);
    ctx.stroke();

    // Hair
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(centerX, headY - 15, 38, Math.PI, 2 * Math.PI);
    ctx.fill();
  };

  const drawArmsAndLegs = (ctx: CanvasRenderingContext2D, centerX: number, startY: number) => {
    const bodyHeight = 200;
    
    ctx.fillStyle = '#f4c2a1';
    ctx.strokeStyle = '#d4a574';
    ctx.lineWidth = 2;

    // Arms
    const armWidth = 15;
    const armLength = 80;
    // Left arm
    ctx.fillRect(centerX - 55, startY + 20, armWidth, armLength);
    ctx.strokeRect(centerX - 55, startY + 20, armWidth, armLength);
    // Right arm
    ctx.fillRect(centerX + 40, startY + 20, armWidth, armLength);
    ctx.strokeRect(centerX + 40, startY + 20, armWidth, armLength);

    // Legs
    const legWidth = 20;
    const legLength = 100;
    const legStartY = startY + bodyHeight;
    // Left leg
    ctx.fillRect(centerX - 30, legStartY, legWidth, legLength);
    ctx.strokeRect(centerX - 30, legStartY, legWidth, legLength);
    // Right leg
    ctx.fillRect(centerX + 10, legStartY, legWidth, legLength);
    ctx.strokeRect(centerX + 10, legStartY, legWidth, legLength);
  };

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
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#e3f2fd');
      gradient.addColorStop(1, '#f8f9fa');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const headY = 80;
      const bodyStartY = 140;

      // Draw avatar base
      drawHead(ctx, centerX, headY);
      drawArmsAndLegs(ctx, centerX, bodyStartY);
      drawBodyShape(ctx, centerX, bodyStartY);

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

          // Position items based on type and body shape
          let x, y, itemWidth, itemHeight;
          
          switch (item.type) {
            case 'top':
              x = centerX - 45;
              y = bodyStartY + 10;
              itemWidth = 90;
              itemHeight = 70;
              break;
            case 'bottom':
              x = centerX - 40;
              y = bodyStartY + 90;
              itemWidth = 80;
              itemHeight = 80;
              break;
            case 'shoes':
              x = centerX - 35;
              y = bodyStartY + 200 + 80; // At feet level
              itemWidth = 70;
              itemHeight = 25;
              break;
            case 'dress':
              x = centerX - 45;
              y = bodyStartY + 10;
              itemWidth = 90;
              itemHeight = 140;
              break;
            case 'outerwear':
              x = centerX - 50;
              y = bodyStartY + 5;
              itemWidth = 100;
              itemHeight = 90;
              break;
            case 'accessory':
              x = centerX - 15;
              y = bodyStartY - 20;
              itemWidth = 30;
              itemHeight = 30;
              break;
            case 'sunglasses':
              x = centerX - 20;
              y = headY - 15;
              itemWidth = 40;
              itemHeight = 15;
              break;
            default:
              continue;
          }

          // Apply transparency for clothing overlay effect
          ctx.globalAlpha = 0.85;
          
          // Draw with rounded corners for better integration
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(x, y, itemWidth, itemHeight, 5);
          ctx.clip();
          ctx.drawImage(img, x, y, itemWidth, itemHeight);
          ctx.restore();
          
          ctx.globalAlpha = 1.0;

        } catch (error) {
          console.log(`Failed to load item image: ${item.name}`);
        }
      }

      setIsLoading(false);
    };

    renderAvatar();
  }, [items, bodyShape, width, height]);

  const BODY_SHAPE_DESCRIPTIONS = {
    'X': 'שעון חול',
    'V': 'משולש הפוך', 
    'H': 'מלבן',
    'O': 'אובלי',
    'A': 'אגס'
  };

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
        מבנה גוף: {BODY_SHAPE_DESCRIPTIONS[bodyShape]}
      </div>
    </div>
  );
};
