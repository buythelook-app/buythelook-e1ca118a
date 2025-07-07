
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
  
  const drawHead = (ctx: CanvasRenderingContext2D, centerX: number, headY: number) => {
    console.log('Drawing head at:', centerX, headY);
    
    // Head circle
    ctx.fillStyle = '#fdbcb4'; // Skin tone
    ctx.strokeStyle = '#e0a084';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, headY, 40, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#2c2c2c';
    ctx.beginPath();
    ctx.arc(centerX - 15, headY - 8, 4, 0, 2 * Math.PI);
    ctx.arc(centerX + 15, headY - 8, 4, 0, 2 * Math.PI);
    ctx.fill();

    // Nose
    ctx.strokeStyle = '#e0a084';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX, headY - 3);
    ctx.lineTo(centerX - 3, headY + 2);
    ctx.stroke();

    // Mouth
    ctx.strokeStyle = '#d4907a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, headY + 8, 12, 0, Math.PI);
    ctx.stroke();

    // Hair
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(centerX, headY - 20, 45, Math.PI, 2 * Math.PI);
    ctx.fill();
  };

  const drawBodyShape = (ctx: CanvasRenderingContext2D, centerX: number, startY: number) => {
    console.log('Drawing body shape:', bodyShape, 'at:', centerX, startY);
    
    const bodyWidth = 100;
    const bodyHeight = 180;
    
    // Body color
    ctx.fillStyle = '#fdbcb4'; // Skin tone
    ctx.strokeStyle = '#e0a084';
    ctx.lineWidth = 3;

    ctx.beginPath();
    
    switch (bodyShape) {
      case 'X': // Hourglass - wider at shoulders and hips, narrow waist
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
        break;
        
      case 'V': // Inverted triangle - broad shoulders, narrow hips
        ctx.moveTo(centerX - bodyWidth/2, startY);
        ctx.lineTo(centerX + bodyWidth/2, startY);
        ctx.lineTo(centerX + bodyWidth/3, startY + bodyHeight);
        ctx.lineTo(centerX - bodyWidth/3, startY + bodyHeight);
        break;
        
      case 'A': // Pear - narrow shoulders, wider hips
        ctx.moveTo(centerX - bodyWidth/3, startY);
        ctx.lineTo(centerX + bodyWidth/3, startY);
        ctx.lineTo(centerX + bodyWidth/2, startY + bodyHeight);
        ctx.lineTo(centerX - bodyWidth/2, startY + bodyHeight);
        break;
        
      case 'O': // Oval - wider in the middle
        ctx.ellipse(centerX, startY + bodyHeight/2, bodyWidth/2.2, bodyHeight/2, 0, 0, 2 * Math.PI);
        break;
        
      default: // 'H' Rectangle - straight up and down
        ctx.rect(centerX - bodyWidth/2, startY, bodyWidth, bodyHeight);
        break;
    }
    
    ctx.fill();
    ctx.stroke();
  };

  const drawArmsAndLegs = (ctx: CanvasRenderingContext2D, centerX: number, startY: number) => {
    console.log('Drawing arms and legs at:', centerX, startY);
    
    const bodyHeight = 180;
    
    ctx.fillStyle = '#fdbcb4';
    ctx.strokeStyle = '#e0a084';
    ctx.lineWidth = 2;

    // Arms
    const armWidth = 20;
    const armLength = 100;
    // Left arm
    ctx.fillRect(centerX - 70, startY + 20, armWidth, armLength);
    ctx.strokeRect(centerX - 70, startY + 20, armWidth, armLength);
    // Right arm
    ctx.fillRect(centerX + 50, startY + 20, armWidth, armLength);
    ctx.strokeRect(centerX + 50, startY + 20, armWidth, armLength);

    // Legs
    const legWidth = 25;
    const legLength = 120;
    const legStartY = startY + bodyHeight;
    // Left leg
    ctx.fillRect(centerX - 35, legStartY, legWidth, legLength);
    ctx.strokeRect(centerX - 35, legStartY, legWidth, legLength);
    // Right leg
    ctx.fillRect(centerX + 10, legStartY, legWidth, legLength);
    ctx.strokeRect(centerX + 10, legStartY, legWidth, legLength);
  };

  const drawClothingItem = async (ctx: CanvasRenderingContext2D, item: OutfitItem, centerX: number, bodyStartY: number) => {
    if (!item.image) return;
    
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = item.image;
      });

      console.log('Drawing clothing item:', item.type, item.name);

      // Position items based on type and body shape
      let x, y, itemWidth, itemHeight;
      
      switch (item.type) {
        case 'top':
          x = centerX - 55;
          y = bodyStartY + 15;
          itemWidth = 110;
          itemHeight = 90;
          break;
        case 'bottom':
          x = centerX - 50;
          y = bodyStartY + 100;
          itemWidth = 100;
          itemHeight = 100;
          break;
        case 'shoes':
          x = centerX - 40;
          y = bodyStartY + 180 + 100; // At feet level
          itemWidth = 80;
          itemHeight = 30;
          break;
        case 'dress':
          x = centerX - 55;
          y = bodyStartY + 15;
          itemWidth = 110;
          itemHeight = 160;
          break;
        case 'outerwear':
          x = centerX - 60;
          y = bodyStartY + 10;
          itemWidth = 120;
          itemHeight = 100;
          break;
        case 'accessory':
          x = centerX - 20;
          y = bodyStartY - 30;
          itemWidth = 40;
          itemHeight = 40;
          break;
        case 'sunglasses':
          x = centerX - 25;
          y = 80 - 20; // On the head
          itemWidth = 50;
          itemHeight = 20;
          break;
        default:
          return;
      }

      // Apply transparency for clothing overlay effect
      ctx.globalAlpha = 0.8;
      
      // Draw with rounded corners for better integration
      ctx.save();
      ctx.beginPath();
      
      // Create rounded rectangle path
      const radius = 8;
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + itemWidth - radius, y);
      ctx.quadraticCurveTo(x + itemWidth, y, x + itemWidth, y + radius);
      ctx.lineTo(x + itemWidth, y + itemHeight - radius);
      ctx.quadraticCurveTo(x + itemWidth, y + itemHeight, x + itemWidth - radius, y + itemHeight);
      ctx.lineTo(x + radius, y + itemHeight);
      ctx.quadraticCurveTo(x, y + itemHeight, x, y + itemHeight - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      
      ctx.clip();
      ctx.drawImage(img, x, y, itemWidth, itemHeight);
      ctx.restore();
      
      ctx.globalAlpha = 1.0;

    } catch (error) {
      console.log(`Failed to load clothing image: ${item.name}`, error);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderAvatar = async () => {
      console.log('Starting avatar render with items:', items.length);
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
      gradient.addColorStop(0, '#f0f9ff');
      gradient.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const headY = 80;
      const bodyStartY = 140;

      console.log('Drawing avatar base - Head, Body, Arms, Legs');
      
      // Draw avatar base first
      drawHead(ctx, centerX, headY);
      drawArmsAndLegs(ctx, centerX, bodyStartY);
      drawBodyShape(ctx, centerX, bodyStartY);

      // Draw clothing items on top
      console.log('Drawing clothing items:', items.map(i => `${i.type}: ${i.name}`));
      for (const item of items) {
        await drawClothingItem(ctx, item, centerX, bodyStartY);
      }

      setIsLoading(false);
      console.log('Avatar render complete');
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
