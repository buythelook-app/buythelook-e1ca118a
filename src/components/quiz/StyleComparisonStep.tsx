
import { Button } from "@/components/ui/button";
import { useQuizContext } from "./QuizContext";
import { useEffect } from "react";

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

const STYLE_IMAGES = {
  Classy: "/lovable-uploads/028933c6-ec95-471c-804c-0aa31a0e1f15.png",
  Modern: "/lovable-uploads/c7a32d15-ffe2-4f07-ae82-a943d5128293.png",
  Casual: "/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png",
  Romantic: "/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png",
  Minimalist: "/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png",
  "Boo Hoo": "/lovable-uploads/386cf438-be54-406f-9dbb-6495a8f8bde9.png",
  Nordic: "/lovable-uploads/a1785297-040b-496d-a2fa-af4ecb55207a.png",
  Sporty: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png", // Updated Sporty image
  Elegance: "/lovable-uploads/028933c6-ec95-471c-804c-0aa31a0e1f15.png"
};

export const StyleComparisonStep = ({ style1, style2, onSelect }: StyleComparisonStepProps) => {
  const { formData, handleNext } = useQuizContext();
  
  const getStyleImage = (styleName: string) => {
    return STYLE_IMAGES[styleName as keyof typeof STYLE_IMAGES] || "/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png";
  };

  const isSelected = (styleName: string) => {
    return formData.stylePreferences[0] === styleName;
  };

  const handleStyleSelect = (styleName: string) => {
    onSelect(styleName);
    // Automatically proceed to next step after a short delay
    setTimeout(() => {
      handleNext();
    }, 500);
  };

  return (
    <div className="flex-1 flex flex-col">
      <h2 className="text-2xl font-display font-semibold mb-6">
        {formData.stylePreferences.length > 0 
          ? "Do you prefer your current style or this new option?" 
          : "Which style do you prefer?"}
      </h2>
      <div className="grid grid-cols-2 gap-6 flex-1">
        <div className="flex flex-col space-y-2">
          <div 
            className={`relative cursor-pointer group flex-1 ${
              isSelected(style1.name) ? 'ring-4 ring-netflix-accent' : ''
            }`}
            onClick={() => handleStyleSelect(style1.name)}
          >
            <img 
              src={getStyleImage(style1.name)}
              alt={style1.name} 
              className={`w-full h-full object-cover rounded-lg transition-transform ${
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
        <div className="flex flex-col space-y-2">
          <div 
            className={`relative cursor-pointer group flex-1 ${
              isSelected(style2.name) ? 'ring-4 ring-netflix-accent' : ''
            }`}
            onClick={() => handleStyleSelect(style2.name)}
          >
            <img 
              src={getStyleImage(style2.name)}
              alt={style2.name} 
              className={`w-full h-full object-cover rounded-lg transition-transform ${
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
