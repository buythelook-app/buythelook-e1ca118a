import { Button } from "@/components/ui/button";
import { useQuizContext } from "./QuizContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
  Casual: "/lovable-uploads/6fe5dff3-dfba-447b-986f-7281b45a0703.png",
  Romantic: "/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png",
  Minimalist: "/lovable-uploads/553ba2e6-53fd-46dd-82eb-64121072a826.png",
  "Boo Hoo": "/lovable-uploads/386cf438-be54-406f-9dbb-6495a8f8bde9.png",
  Nordic: "/lovable-uploads/a1785297-040b-496d-a2fa-af4ecb55207a.png",
  Sporty: "/lovable-uploads/b2b5da4b-c967-4791-8832-747541e275be.png"
};

export const StyleComparisonStep = ({ style1, style2, onSelect }: StyleComparisonStepProps) => {
  const { formData, setFormData, step, handleNext } = useQuizContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const getStyleImage = (styleName: string) => {
    return STYLE_IMAGES[styleName as keyof typeof STYLE_IMAGES] || "/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png";
  };

  const isSelected = (styleName: string) => {
    return formData.stylePreferences[0] === styleName;
  };

  const handleStyleSelect = async (styleName: string) => {
    onSelect(styleName);
    
    // Update form data with selected style
    const updatedFormData = {
      ...formData,
      stylePreferences: [styleName]
    };
    setFormData(updatedFormData);
    
    // Only complete quiz and navigate if we're on the last step (13)
    if (step === 13) {
      toast({
        title: "Style selected!",
        description: "Analyzing your preferences and creating your personalized look...",
      });

      try {
        // Import the analysis function here to avoid circular dependencies
        const { analyzeStyleWithAI } = await import('./utils/quizUtils');
        const styleAnalysis = await analyzeStyleWithAI(updatedFormData);
        
        // Store analysis in localStorage
        localStorage.setItem('styleAnalysis', JSON.stringify(styleAnalysis));
        localStorage.setItem('originalQuizStyle', JSON.stringify({
          styleProfile: styleAnalysis.analysis.styleProfile,
          timestamp: new Date().toISOString()
        }));
        
        toast({
          title: "Analysis complete!",
          description: "Your personalized look suggestions are ready!",
        });
        
        // Navigate directly to suggestions page
        navigate('/suggestions');
      } catch (error) {
        console.error('Style analysis error:', error);
        toast({
          title: "Analysis Error",
          description: "Failed to analyze your style. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // Continue to next step if not on final step
      setTimeout(() => {
        handleNext();
      }, 500);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-display font-semibold mb-4">
        {formData.stylePreferences.length > 0 
          ? "Do you prefer your current style or this new option?" 
          : "Which style do you prefer?"}
      </h2>
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="flex flex-col space-y-2">
          <div 
            className={`relative cursor-pointer group flex-1 ${
              isSelected(style1.name) ? 'ring-2 ring-fashion-primary' : ''
            }`}
            onClick={() => handleStyleSelect(style1.name)}
          >
            <img 
              src={getStyleImage(style1.name)}
              alt={style1.name} 
              className={`w-full h-full object-contain rounded-lg transition-transform ${
                isSelected(style1.name) ? 'scale-[1.02]' : 'group-hover:scale-105'
              }`}
            />
            {isSelected(style1.name) && (
              <div className="absolute inset-0 bg-fashion-primary/20 rounded-lg flex items-center justify-center">
                <div className="bg-fashion-primary text-white px-2 py-1 rounded-full text-xs">
                  Current Preference
                </div>
              </div>
            )}
          </div>
          <p className="text-center font-medium text-sm">{style1.name}</p>
        </div>
        <div className="flex flex-col space-y-2">
          <div 
            className={`relative cursor-pointer group flex-1 ${
              isSelected(style2.name) ? 'ring-2 ring-fashion-primary' : ''
            }`}
            onClick={() => handleStyleSelect(style2.name)}
          >
            <img 
              src={getStyleImage(style2.name)}
              alt={style2.name} 
              className={`w-full h-full object-contain rounded-lg transition-transform ${
                isSelected(style2.name) ? 'scale-[1.02]' : 'group-hover:scale-105'
              }`}
            />
            {isSelected(style2.name) && (
              <div className="absolute inset-0 bg-fashion-primary/20 rounded-lg flex items-center justify-center">
                <div className="bg-fashion-primary text-white px-2 py-1 rounded-full text-xs">
                  Current Preference
                </div>
              </div>
            )}
          </div>
          <p className="text-center font-medium text-sm">{style2.name}</p>
        </div>
      </div>
    </div>
  );
};
