
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
    <div className="flex-1 flex flex-col">
      <h2 className="text-2xl font-display font-semibold mb-6">What's your body shape?</h2>
      <div className="flex-1 flex items-center">
        <RadioGroup
          value={value}
          onValueChange={onChange}
          className="flex flex-col space-y-4 w-full"
        >
          {["hourglass", "pear", "rectangle", "triangle", "oval"].map((shape) => {
            const emoji = bodyShapeEmojis[shape];
            return (
              <div key={shape} className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                value === shape ? "border-netflix-accent bg-netflix-accent/10" : "border-gray-200 hover:border-netflix-accent/50"
              }`}>
                <RadioGroupItem value={shape} id={shape} />
                <span className="text-2xl">{emoji}</span>
                <Label htmlFor={shape} className="text-lg font-medium cursor-pointer flex-1 capitalize">{shape}</Label>
              </div>
            );
          })}
        </RadioGroup>
      </div>
    </div>
  );
};
