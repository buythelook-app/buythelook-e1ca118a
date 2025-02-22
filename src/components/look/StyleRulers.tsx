
import { Slider } from "../ui/slider";

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
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">Style Analysis</h3>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">Elegance</label>
            <span className="text-sm text-gray-500">{elegance}%</span>
          </div>
          <Slider
            defaultValue={[elegance]}
            max={100}
            step={1}
            onValueChange={onEleganceChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Casual</span>
            <span>Elegant</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">Color Intensity</label>
            <span className="text-sm text-gray-500">{colorIntensity}%</span>
          </div>
          <Slider
            defaultValue={[colorIntensity]}
            max={100}
            step={1}
            onValueChange={onColorIntensityChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Muted</span>
            <span>Vibrant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
