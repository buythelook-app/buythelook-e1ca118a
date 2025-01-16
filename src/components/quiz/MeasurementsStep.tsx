import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MeasurementsStepProps {
  height: string;
  weight: string;
  waist: string;
  chest: string;
  onHeightChange: (value: string) => void;
  onWeightChange: (value: string) => void;
  onWaistChange: (value: string) => void;
  onChestChange: (value: string) => void;
  step: number;
}

export const MeasurementsStep = ({
  height,
  weight,
  waist,
  chest,
  onHeightChange,
  onWeightChange,
  onWaistChange,
  onChestChange,
  step,
}: MeasurementsStepProps) => {
  if (step === 2) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-display font-semibold mb-6">What's your height?</h2>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            placeholder="Height in cm"
            value={height}
            onChange={(e) => onHeightChange(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-display font-semibold mb-6">What's your weight?</h2>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            placeholder="Weight in kg"
            value={weight}
            onChange={(e) => onWeightChange(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-display font-semibold mb-6">Your measurements</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="waist">Waist (cm)</Label>
          <Input
            id="waist"
            type="number"
            value={waist}
            onChange={(e) => onWaistChange(e.target.value)}
            className="w-full mt-1"
          />
        </div>
        <div>
          <Label htmlFor="chest">Chest (cm)</Label>
          <Input
            id="chest"
            type="number"
            value={chest}
            onChange={(e) => onChestChange(e.target.value)}
            className="w-full mt-1"
          />
        </div>
      </div>
    </div>
  );
};