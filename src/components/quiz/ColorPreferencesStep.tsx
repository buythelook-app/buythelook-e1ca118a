import { Label } from "@/components/ui/label";

interface ColorPreferencesStepProps {
  selectedColors: string[];
  onColorToggle: (color: string) => void;
}

export const ColorPreferencesStep = ({ selectedColors, onColorToggle }: ColorPreferencesStepProps) => {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-display font-semibold mb-6">Select your color preferences</h2>
      <div className="flex-1 flex items-center">
        <div className="grid grid-cols-2 gap-4 w-full">
          {["warm", "cool", "neutral", "bright", "pastel", "dark"].map((color) => (
            <div key={color} className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
              selectedColors.includes(color) ? "border-netflix-accent bg-netflix-accent/10" : "border-gray-200 hover:border-netflix-accent/50"
            }`} onClick={() => onColorToggle(color)}>
              <input
                type="checkbox"
                id={color}
                checked={selectedColors.includes(color)}
                onChange={() => onColorToggle(color)}
                className="w-5 h-5 accent-netflix-accent"
              />
              <Label htmlFor={color} className="text-lg font-medium cursor-pointer flex-1 capitalize">{color}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};