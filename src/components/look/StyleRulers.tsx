
import { Slider } from "@/components/ui/slider";

interface StyleRulersProps {
  elegance: number;
  colorIntensity: number;
  onEleganceChange: (value: number[]) => void;
  onColorIntensityChange: (value: number[]) => void;
}

export const StyleRulers = ({
  elegance,
  colorIntensity,
  onEleganceChange,
  onColorIntensityChange,
}: StyleRulersProps) => {
  return (
    <div className="space-y-8 p-4 border rounded-lg mb-8">
      <div>
        <h3 className="text-lg font-medium mb-2">Style Preferences</h3>
        <p className="text-sm text-gray-500 mb-4">
          Adjust these sliders to fine-tune your style recommendations
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Elegance Level</label>
            <span className="text-sm text-netflix-accent">{elegance}%</span>
          </div>
          <Slider
            value={[elegance]}
            min={0}
            max={100}
            step={1}
            onValueChange={onEleganceChange}
            className="my-4"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Casual</span>
            <span>Elegant</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Color Intensity</label>
            <span className="text-sm text-netflix-accent">{colorIntensity}%</span>
          </div>
          <Slider
            value={[colorIntensity]}
            min={0}
            max={100}
            step={1}
            onValueChange={onColorIntensityChange}
            className="my-4"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Subtle</span>
            <span>Vibrant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
