
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
    <div className="space-y-6 bg-white p-8 rounded-lg shadow-xl border-2 border-gray-100">
      <h3 className="text-2xl font-semibold mb-6 text-gray-900">Style Analysis</h3>
      
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-base font-semibold text-gray-800">Elegance</label>
            <span className="text-base font-medium text-netflix-accent">{elegance}%</span>
          </div>
          <Slider
            defaultValue={[elegance]}
            max={100}
            step={1}
            onValueChange={onEleganceChange}
            className="w-full"
          />
          <div className="flex justify-between text-sm font-medium text-gray-600">
            <span>Casual</span>
            <span>Elegant</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-base font-semibold text-gray-800">Color Intensity</label>
            <span className="text-base font-medium text-netflix-accent">{colorIntensity}%</span>
          </div>
          <Slider
            defaultValue={[colorIntensity]}
            max={100}
            step={1}
            onValueChange={onColorIntensityChange}
            className="w-full"
          />
          <div className="flex justify-between text-sm font-medium text-gray-600">
            <span>Muted</span>
            <span>Vibrant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
