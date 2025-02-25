
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Circle, 
  Triangle, 
  Square,
  Diamond,
  Drop
} from "lucide-react";

interface BodyShapeStepProps {
  value: string;
  onChange: (value: string) => void;
}

const bodyShapeIcons = {
  hourglass: Diamond,
  pear: Drop,
  rectangle: Square,
  triangle: Triangle,
  oval: Circle,
};

export const BodyShapeStep = ({ value, onChange }: BodyShapeStepProps) => {
  return (
    <div className="flex-1 flex flex-col">
      <h2 className="text-2xl font-display font-semibold mb-6">What's your body shape?</h2>
      <div className="flex-1 flex items-center">
        <RadioGroup
          value={value}
          onValueChange={onChange}
          className="flex flex-col space-y-4 w-full"
        >
          {["hourglass", "pear", "rectangle", "triangle", "oval"].map((shape) => {
            const Icon = bodyShapeIcons[shape];
            return (
              <div key={shape} className="flex items-center space-x-3">
                <RadioGroupItem value={shape} id={shape} />
                <Icon className="w-5 h-5 text-primary" />
                <Label htmlFor={shape} className="capitalize">{shape}</Label>
              </div>
            );
          })}
        </RadioGroup>
      </div>
    </div>
  );
};
