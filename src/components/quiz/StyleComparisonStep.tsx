import { Button } from "@/components/ui/button";
import { useQuizContext } from "./QuizContext";

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
  const { formData } = useQuizContext();
  
  const isSelected = (styleName: string) => {
    return formData.stylePreferences[0] === styleName;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-semibold mb-6">
        {formData.stylePreferences.length > 0 
          ? "Do you prefer your current style or this new option?" 
          : "Which style do you prefer?"}
      </h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <div 
            className={`relative cursor-pointer group ${
              isSelected(style1.name) ? 'ring-4 ring-netflix-accent' : ''
            }`}
            onClick={() => onSelect(style1.name)}
          >
            <img 
              src={style1.image}
              alt={style1.name} 
              className={`w-full h-[300px] object-cover rounded-lg transition-transform ${
                isSelected(style1.name) ? 'scale-[1.02]' : 'group-hover:scale-105'
              }`}
            />
            {isSelected(style1.name) && (
              <div className="absolute inset-0 bg-netflix-accent/20 rounded-lg flex items-center justify-center">
                <div className="bg-netflix-accent text-white px-4 py-2 rounded-full">
                  Current Preference
                </div>
              </div>
            )}
          </div>
          <p className="text-center font-medium text-lg">{style1.name}</p>
        </div>
        <div className="space-y-2">
          <div 
            className={`relative cursor-pointer group ${
              isSelected(style2.name) ? 'ring-4 ring-netflix-accent' : ''
            }`}
            onClick={() => onSelect(style2.name)}
          >
            <img 
              src={style2.image}
              alt={style2.name} 
              className={`w-full h-[300px] object-cover rounded-lg transition-transform ${
                isSelected(style2.name) ? 'scale-[1.02]' : 'group-hover:scale-105'
              }`}
            />
            {isSelected(style2.name) && (
              <div className="absolute inset-0 bg-netflix-accent/20 rounded-lg flex items-center justify-center">
                <div className="bg-netflix-accent text-white px-4 py-2 rounded-full">
                  Current Preference
                </div>
              </div>
            )}
          </div>
          <p className="text-center font-medium text-lg">{style2.name}</p>
        </div>
      </div>
    </div>
  );
};