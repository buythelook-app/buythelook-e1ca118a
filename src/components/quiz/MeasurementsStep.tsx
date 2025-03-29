
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

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
  // For feet and inches input
  const [feet, setFeet] = useState<string>("");
  const [inches, setInches] = useState<string>("");

  // Convert cm to feet/inches when component mounts or height changes
  useEffect(() => {
    if (height) {
      const totalInches = Math.round(parseInt(height) / 2.54);
      const ft = Math.floor(totalInches / 12);
      const inch = totalInches % 12;
      
      setFeet(ft.toString());
      setInches(inch.toString());
    }
  }, [height]);

  // Convert feet/inches to cm when those values change
  const handleHeightChange = (newFeet: string, newInches: string) => {
    setFeet(newFeet);
    setInches(newInches);
    
    const ft = parseInt(newFeet) || 0;
    const inch = parseInt(newInches) || 0;
    const totalInches = (ft * 12) + inch;
    const cm = Math.round(totalInches * 2.54).toString();
    
    onHeightChange(cm);
  };

  if (step === 2) {
    return (
      <div className="flex-1 flex flex-col">
        <h2 className="text-2xl font-display font-semibold mb-6">What's your height?</h2>
        <div className="flex-1">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label htmlFor="feet">Feet</Label>
                <Input
                  id="feet"
                  type="number"
                  placeholder="Feet"
                  value={feet}
                  onChange={(e) => handleHeightChange(e.target.value, inches)}
                  className="w-full"
                  min="0"
                  max="8"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="inches">Inches</Label>
                <Input
                  id="inches"
                  type="number"
                  placeholder="Inches"
                  value={inches}
                  onChange={(e) => handleHeightChange(feet, e.target.value)}
                  className="w-full"
                  min="0"
                  max="11"
                />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Your height: {feet || 0}' {inches || 0}" ({height || 0} cm)
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="flex-1 flex flex-col">
        <h2 className="text-2xl font-display font-semibold mb-6">What's your weight?</h2>
        <div className="flex-1 flex items-center">
          <div className="w-full">
            <Input
              type="number"
              placeholder="Weight in kg"
              value={weight}
              onChange={(e) => onWeightChange(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <h2 className="text-2xl font-display font-semibold mb-6">Your measurements</h2>
      <div className="flex-1 flex items-center">
        <div className="space-y-4 w-full">
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
    </div>
  );
};
