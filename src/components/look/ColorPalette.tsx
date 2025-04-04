
import { OutfitColors } from "@/services/utils/outfitStorageUtils";

interface ColorPaletteProps {
  outfitColors: OutfitColors | null;
}

export const ColorPalette = ({ outfitColors }: ColorPaletteProps) => {
  if (!outfitColors) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-medium mb-3">Color Palette</h2>
      <div className="flex gap-2">
        <ColorSwatch color={outfitColors.top} label="Top" />
        <ColorSwatch color={outfitColors.bottom} label="Bottom" />
        <ColorSwatch color={outfitColors.shoes} label="Shoes" />
        {outfitColors.coat && (
          <ColorSwatch color={outfitColors.coat} label="Coat" />
        )}
      </div>
    </div>
  );
};

const ColorSwatch = ({ color, label }: { color: string; label: string }) => (
  <div className="flex flex-col items-center">
    <div
      className="w-12 h-12 rounded-full border border-gray-300"
      style={{ backgroundColor: color }}
    />
    <span className="text-xs mt-1">{label}</span>
  </div>
);
