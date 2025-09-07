import { Label } from "@/components/ui/label";

interface ColorPreferencesStepProps {
  selectedColors: string[];
  onColorToggle: (color: string) => void;
}

export const ColorPreferencesStep = ({ selectedColors, onColorToggle }: ColorPreferencesStepProps) => {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-display font-semibold mb-4">Select your color preferences</h2>
      <div className="flex-1 flex items-center">
        <div className="grid grid-cols-2 gap-2 w-full">
          {["warm", "cool", "neutral", "bright", "pastel", "dark"].map((color) => (
            <div key={color} className={`flex items-center space-x-2 p-2 rounded-md border transition-all cursor-pointer ${
              selectedColors.includes(color) ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-400"
            }`} onClick={() => onColorToggle(color)}>
              <input
                type="checkbox"
                id={color}
                checked={selectedColors.includes(color)}
                onChange={() => onColorToggle(color)}
                className="w-4 h-4 accent-blue-600"
              />
              <Label htmlFor={color} className="text-sm font-medium cursor-pointer flex-1 capitalize">{color}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};