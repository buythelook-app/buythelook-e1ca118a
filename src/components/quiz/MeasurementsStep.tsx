
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Info, Eye, EyeOff } from "lucide-react";

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
  const [skipHeight, setSkipHeight] = useState<boolean>(height === "prefer_not_to_answer");
  const [showHeightRemark, setShowHeightRemark] = useState<boolean>(false);
  const [showWeightRemark, setShowWeightRemark] = useState<boolean>(false);
  const [showWaistRemark, setShowWaistRemark] = useState<boolean>(false);
  const [showChestRemark, setShowChestRemark] = useState<boolean>(false);
  
  // Convert cm to feet/inches when component mounts or height changes
  useEffect(() => {
    if (height && height !== "prefer_not_to_answer") {
      const totalInches = Math.round(parseFloat(height) / 2.54);
      const ft = Math.floor(totalInches / 12);
      const inch = totalInches % 12;
      
      setFeet(ft.toString());
      setInches(inch.toString());
      setSkipHeight(false);
    } else if (height === "prefer_not_to_answer") {
      setSkipHeight(true);
    }
  }, [height]);

  // Convert feet/inches to cm when those values change
  const handleHeightChange = (newFeet: string, newInches: string) => {
    setFeet(newFeet);
    setInches(newInches);
    
    const ft = parseFloat(newFeet) || 0;
    const inch = parseFloat(newInches) || 0;
    const totalInches = (ft * 12) + inch;
    const cm = Math.round(totalInches * 2.54).toString();
    
    onHeightChange(cm);
  };

  const handleSkipHeight = () => {
    setSkipHeight(!skipHeight);
    if (!skipHeight) {
      onHeightChange("prefer_not_to_answer");
      setShowHeightRemark(true);
      setTimeout(() => setShowHeightRemark(false), 5000);
    } else {
      // If unskipping, reset to previous values or default
      if (feet && inches) {
        handleHeightChange(feet, inches);
      } else {
        onHeightChange("");
      }
    }
  };

  const handleSkipWeight = () => {
    const newValue = weight === "prefer_not_to_answer" ? "" : "prefer_not_to_answer";
    onWeightChange(newValue);
    if (newValue === "prefer_not_to_answer") {
      setShowWeightRemark(true);
      setTimeout(() => setShowWeightRemark(false), 5000);
    }
  };

  const handleSkipWaist = () => {
    const newValue = waist === "prefer_not_to_answer" ? "" : "prefer_not_to_answer";
    onWaistChange(newValue);
    if (newValue === "prefer_not_to_answer") {
      setShowWaistRemark(true);
      setTimeout(() => setShowWaistRemark(false), 5000);
    }
  };

  const handleSkipChest = () => {
    const newValue = chest === "prefer_not_to_answer" ? "" : "prefer_not_to_answer";
    onChestChange(newValue);
    if (newValue === "prefer_not_to_answer") {
      setShowChestRemark(true);
      setTimeout(() => setShowChestRemark(false), 5000);
    }
  };

  // Convert cm to inches for display and input - allowing higher precision
  const cmToInches = (cm: string): string => {
    if (!cm || cm === "prefer_not_to_answer") return "";
    return (parseFloat(cm) / 2.54).toFixed(2);
  };

  // Convert inches to cm for storage - preserving all decimal places
  const inchesToCm = (inches: string): string => {
    if (!inches) return "";
    return Math.round(parseFloat(inches) * 2.54).toString();
  };

  const RemarkMessage = ({ show }: { show: boolean }) => {
    if (!show) return null;
    
    return (
      <div className="mt-2 remark-box animate-fadeIn flex items-start gap-2">
        <Info className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <span className="font-medium">Don't worry!</span> It will help us find the perfect size for you.
        </div>
      </div>
    );
  };

  if (step === 2) {
    return (
      <div className="flex-1 flex flex-col">
        <h2 className="text-2xl font-display font-semibold mb-6">What's your height?</h2>
        <div className="flex-1">
          <div className="flex flex-col gap-4">
            {!skipHeight ? (
              <>
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
                      inputMode="decimal"
                      min="0"
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
                      inputMode="decimal"
                      min="0"
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Your height: {feet || 0}' {inches || 0}" ({height || 0} cm)
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">
                You've chosen not to provide your height
              </div>
            )}
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleSkipHeight}
              className="mt-2"
            >
              {skipHeight ? "Add my height" : "Prefer not to answer"}
            </Button>
            <RemarkMessage show={showHeightRemark} />
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="flex-1 flex flex-col">
        <h2 className="text-2xl font-display font-semibold mb-6">What's your weight?</h2>
        <div className="flex-1 flex flex-col gap-4">
          <div className="w-full">
            <Label htmlFor="weight">Weight (lbs)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="Weight in pounds"
              value={weight === "prefer_not_to_answer" ? "" : weight ? (parseFloat(weight) * 2.2).toFixed(1) : ""}
              onChange={(e) => {
                const value = e.target.value;
                // Allow any input including empty string, decimal points, etc.
                if (value === "") {
                  onWeightChange("");
                } else if (!isNaN(parseFloat(value))) {
                  // No minimum restriction
                  const weightInKg = parseFloat(value) / 2.2;
                  onWeightChange(weightInKg.toFixed(1));
                }
              }}
              className="w-full"
              disabled={weight === "prefer_not_to_answer"}
              inputMode="decimal"
              step="0.1"
            />
            <div className="mt-1 text-xs text-gray-500">
              {weight && weight !== "prefer_not_to_answer" ? `${parseFloat(weight).toFixed(1)} kg` : ""}
            </div>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleSkipWeight}
            className="mt-2"
          >
            {weight === "prefer_not_to_answer" ? "Add my weight" : "Prefer not to answer"}
          </Button>
          <RemarkMessage show={showWeightRemark} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <h2 className="text-2xl font-display font-semibold mb-6">Your measurements</h2>
      <div className="flex-1 flex flex-col gap-4">
        <div>
          <Label htmlFor="waist">Waist (inches)</Label>
          <Input
            id="waist"
            type="number"
            placeholder="Waist in inches"
            value={waist === "prefer_not_to_answer" ? "" : cmToInches(waist)}
            onChange={(e) => {
              const value = e.target.value;
              // Handle empty input explicitly
              if (value === "") {
                onWaistChange("");
              } else {
                onWaistChange(inchesToCm(value));
              }
            }}
            className="w-full mt-1"
            disabled={waist === "prefer_not_to_answer"}
            inputMode="decimal"
            min="0"
            step="0.1"
          />
          <div className="mt-1 text-xs text-gray-500">
            {waist && waist !== "prefer_not_to_answer" ? `${waist} cm` : ""}
          </div>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleSkipWaist}
            className="mt-2 w-full"
          >
            {waist === "prefer_not_to_answer" ? "Add my waist measurement" : "Prefer not to answer"}
          </Button>
          <RemarkMessage show={showWaistRemark} />
        </div>
        <div>
          <Label htmlFor="chest">Chest (inches)</Label>
          <Input
            id="chest"
            type="number"
            placeholder="Chest in inches"
            value={chest === "prefer_not_to_answer" ? "" : cmToInches(chest)}
            onChange={(e) => {
              const value = e.target.value;
              // Handle empty input explicitly
              if (value === "") {
                onChestChange("");
              } else {
                onChestChange(inchesToCm(value));
              }
            }}
            className="w-full mt-1"
            disabled={chest === "prefer_not_to_answer"}
            inputMode="decimal"
            min="0"
            step="0.1"
          />
          <div className="mt-1 text-xs text-gray-500">
            {chest && chest !== "prefer_not_to_answer" ? `${chest} cm` : ""}
          </div>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleSkipChest}
            className="mt-2 w-full"
          >
            {chest === "prefer_not_to_answer" ? "Add my chest measurement" : "Prefer not to answer"}
          </Button>
          <RemarkMessage show={showChestRemark} />
        </div>
      </div>
    </div>
  );
};
