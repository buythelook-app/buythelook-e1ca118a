import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface GenderStepProps {
  value: string;
  onChange: (value: string) => void;
}

export const GenderStep = ({ value, onChange }: GenderStepProps) => {
  return (
    <div className="flex-1 flex flex-col">
      <h2 className="text-2xl font-display font-semibold mb-6">What's your gender?</h2>
      <div className="flex-1 flex items-center">
        <RadioGroup
          value={value}
          onValueChange={onChange}
          className="flex flex-col space-y-4 w-full"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male">Male</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female">Female</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="other" id="other" />
            <Label htmlFor="other">Other</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};