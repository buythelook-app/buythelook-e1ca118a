import { Button } from "@/components/ui/button";

interface StyleComparisonStepProps {
  style1: {
    name: string;
    image: string;
  };
  style2: {
    name: string;
    image: string;
  };
  onSelect: (style: string) => void;
}

export const StyleComparisonStep = ({ style1, style2, onSelect }: StyleComparisonStepProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-semibold mb-6">Which style do you prefer?</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <img 
            src={style1.image} 
            alt={style1.name} 
            className="w-full h-[300px] object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
            onClick={() => onSelect(style1.name)}
          />
          <p className="text-center font-medium text-lg">{style1.name}</p>
        </div>
        <div className="space-y-2">
          <img 
            src={style2.image} 
            alt={style2.name} 
            className="w-full h-[300px] object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
            onClick={() => onSelect(style2.name)}
          />
          <p className="text-center font-medium text-lg">{style2.name}</p>
        </div>
      </div>
    </div>
  );
};