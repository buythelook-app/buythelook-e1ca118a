import { Label } from "@/components/ui/label";

interface ColorPreferencesStepProps {
  selectedColors: string[];
  onColorToggle: (color: string) => void;
}

export const ColorPreferencesStep = ({ selectedColors, onColorToggle }: ColorPreferencesStepProps) => {
  return (
    <div className="flex-1 flex flex-col">
      <h2 className="text-2xl font-display font-semibold mb-6">Select your color preferences</h2>
      <div className="flex-1 flex items-center">
        <div className="grid grid-cols-2 gap-4 w-full">
          {["warm", "cool", "neutral", "bright", "pastel", "dark"].map((color) => (
            <div key={color} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={color}
                checked={selectedColors.includes(color)}
                onChange={() => onColorToggle(color)}
                className="w-4 h-4"
              />
              <Label htmlFor={color} className="capitalize">{color}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};