import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface GenderStepProps {
  value: string;
  onChange: (value: string) => void;
}

export const GenderStep = ({ value, onChange }: GenderStepProps) => {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-display font-semibold mb-6">What's your gender?</h2>
      <div className="flex-1 flex items-center">
        <RadioGroup
          value={value}
          onValueChange={onChange}
          className="flex flex-col space-y-4 w-full"
        >
          <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
            value === "male" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-400"
          }`}>
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male" className="text-lg font-medium cursor-pointer flex-1">Male</Label>
          </div>
          <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
            value === "female" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-400"
          }`}>
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female" className="text-lg font-medium cursor-pointer flex-1">Female</Label>
          </div>
          <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
            value === "other" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-400"
          }`}>
            <RadioGroupItem value="other" id="other" />
            <Label htmlFor="other" className="text-lg font-medium cursor-pointer flex-1">Other</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};