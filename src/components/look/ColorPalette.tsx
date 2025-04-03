
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface OutfitColorsProps {
  [key: string]: string;
}

interface ColorPaletteProps {
  outfitColors: OutfitColorsProps | null;
}

export const ColorPalette = ({ outfitColors }: ColorPaletteProps) => {
  if (!outfitColors) return null;
  
  // Validate color to make sure it's a valid CSS color
  const validateColor = (color: string): string => {
    const isValidColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) || 
                        CSS.supports('color', color);
    return isValidColor ? color : '#CCCCCC';
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Personal Color Palette</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 justify-center">
          {Object.entries(outfitColors).map(([piece, color]) => (
            <div key={piece} className="text-center">
              <div 
                className="w-16 h-16 rounded-full mb-2" 
                style={{ backgroundColor: validateColor(color) }}
              />
              <p className="text-sm capitalize">{piece}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
