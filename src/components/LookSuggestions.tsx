import { useEffect, useState } from "react";
import { HomeButton } from "./HomeButton";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";
import { LookCanvas } from "./LookCanvas";
import { analyzeStyleWithAI } from "../components/quiz/quizUtils";

interface OutfitItem {
  id: string;
  title: string;
  description: string;
  image: string;
  price: string;
  type: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear';
}

interface Look {
  id: string;
  title: string;
  description: string;
  items: OutfitItem[];
  totalPrice: string;
  style: string;
}

export const LookSuggestions = () => {
  const [suggestions, setSuggestions] = useState<Look[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateSuggestions = async () => {
      try {
        const styleAnalysis = localStorage.getItem('styleAnalysis');
        if (!styleAnalysis) {
          toast({
            title: "No style analysis found",
            description: "Please complete the style quiz first.",
            variant: "destructive",
          });
          navigate('/quiz');
          return;
        }

        const parsedAnalysis = JSON.parse(styleAnalysis);
        const analysis = await analyzeStyleWithAI(parsedAnalysis);
        
        // Generate looks based on the analysis
        const generatedLooks: Look[] = [{
          id: '1',
          title: `${analysis.styleProfile} Look`,
          description: `A ${analysis.styleProfile.toLowerCase()} outfit that matches your style preferences`,
          style: analysis.styleProfile,
          totalPrice: "$299.99",
          items: [
            {
              id: 'top1',
              title: analysis.recommendations.top.type,
              description: `A ${analysis.recommendations.top.color} ${analysis.recommendations.top.style} top`,
              image: '/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png',
              price: "$49.99",
              type: 'top'
            },
            {
              id: 'bottom1',
              title: analysis.recommendations.bottom.type,
              description: `${analysis.recommendations.bottom.color} ${analysis.recommendations.bottom.style} bottom`,
              image: '/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png',
              price: "$69.99",
              type: 'bottom'
            },
            {
              id: 'shoes1',
              title: analysis.recommendations.shoes.type,
              description: `${analysis.recommendations.shoes.color} ${analysis.recommendations.shoes.style} shoes`,
              image: '/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png',
              price: "$89.99",
              type: 'shoes'
            },
            {
              id: 'accessory1',
              title: analysis.recommendations.accessory.type,
              description: `${analysis.recommendations.accessory.color} ${analysis.recommendations.accessory.style} accessory`,
              image: '/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png',
              price: "$29.99",
              type: 'accessory'
            },
            {
              id: 'sunglasses1',
              title: analysis.recommendations.sunglasses.type,
              description: `${analysis.recommendations.sunglasses.color} ${analysis.recommendations.sunglasses.style} sunglasses`,
              image: '/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png',
              price: "$19.99",
              type: 'sunglasses'
            },
            {
              id: 'outerwear1',
              title: analysis.recommendations.outerwear.type,
              description: `${analysis.recommendations.outerwear.color} ${analysis.recommendations.outerwear.style} outerwear`,
              image: '/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png',
              price: "$39.99",
              type: 'outerwear'
            }
          ]
        }];

        setSuggestions(generatedLooks);
      } catch (error) {
        console.error('Error generating suggestions:', error);
        toast({
          title: "Error",
          description: "Failed to generate style suggestions. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateSuggestions();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-netflix-background text-netflix-text p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-netflix-accent mx-auto mb-4"></div>
          <p>Generating your personalized style suggestions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text p-6">
      <div className="container mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Your Personalized Look Suggestions</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {suggestions.map((look) => (
            <div 
              key={look.id}
              className="bg-netflix-card p-6 rounded-lg shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{look.title}</h2>
                <span className="px-3 py-1 bg-netflix-accent/20 rounded-full text-sm">
                  {look.style}
                </span>
              </div>
              <div className="mb-4">
                <LookCanvas items={look.items} />
              </div>
              <p className="text-netflix-accent font-semibold">Total: {look.totalPrice}</p>
              <button
                onClick={() => navigate(`/look/${look.id}`)}
                className="w-full mt-4 bg-netflix-accent text-white py-2 rounded-lg hover:bg-netflix-accent/90 transition-colors"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
      <HomeButton />
    </div>
  );
};