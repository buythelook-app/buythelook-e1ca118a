import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface BodyShapeStepProps {
  value: string;
  onChange: (value: string) => void;
}

export const BodyShapeStep = ({ value, onChange }: BodyShapeStepProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-display font-semibold mb-6">What's your body shape?</h2>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex flex-col space-y-4"
      >
        {["hourglass", "pear", "rectangle", "triangle", "oval"].map((shape) => (
          <div key={shape} className="flex items-center space-x-2">
            <RadioGroupItem value={shape} id={shape} />
            <Label htmlFor={shape} className="capitalize">{shape}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};