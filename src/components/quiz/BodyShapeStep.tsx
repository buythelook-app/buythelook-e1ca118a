
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface BodyShapeStepProps {
  value: string;
  onChange: (value: string) => void;
}

const bodyShapeEmojis = {
  hourglass: "⌛",
  pear: "🍐",
  rectangle: "▯",
  triangle: "▲",
  oval: "⭕",
};

export const BodyShapeStep = ({ value, onChange }: BodyShapeStepProps) => {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-display font-semibold mb-4">What's your body shape?</h2>
      <div className="flex-1 flex items-center">
        <RadioGroup
          value={value}
          onValueChange={onChange}
          className="flex flex-col space-y-1 w-full"
        >
          {["hourglass", "pear", "rectangle", "triangle", "oval"].map((shape) => {
            const emoji = bodyShapeEmojis[shape];
            return (
              <div key={shape} className={`flex items-center space-x-2 p-2 rounded-md border transition-all ${
                value === shape ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-400"
              }`}>
                <RadioGroupItem value={shape} id={shape} className="w-4 h-4" />
                <span className="text-lg">{emoji}</span>
                <Label htmlFor={shape} className="text-sm font-medium cursor-pointer flex-1 capitalize">{shape}</Label>
              </div>
            );
          })}
        </RadioGroup>
      </div>
    </div>
  );
};
