import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { analyzeStyleWithAI } from "@/utils/styleAnalysis";
import { QuizFormData } from "@/components/quiz/types";
import { Look } from "@/types/lookTypes";
import { fetchDashboardItems, mapDashboardItemToOutfitItem, fallbackItems } from "@/services/lookService";
import { LookGrid } from "./LookGrid";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

interface GridLook {
  id: string;
  image: string;
  title: string;
  price: string;
  category: string;
  items: { id: string; image: string; }[];
}

export const LookSuggestions = () => {
  const [suggestions, setSuggestions] = useState<GridLook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const generateSuggestions = async () => {
      try {
        const styleAnalysis = localStorage.getItem('styleAnalysis');
        if (!styleAnalysis) {
          toast({
            title: "No Style Analysis",
            description: "Please complete the style quiz first.",
            variant: "destructive",
          });
          navigate('/quiz');
          return;
        }

        const parsedAnalysis = JSON.parse(styleAnalysis) as QuizFormData;
        const analysis = analyzeStyleWithAI(parsedAnalysis);
        
        const dashboardItems = await fetchDashboardItems();
        const mappedItems = dashboardItems
          .filter(item => item && item.type && item.name)
          .map(mapDashboardItemToOutfitItem)
          .slice(0, 6);

        const gridLooks: GridLook[] = [{
          id: '1',
          image: mappedItems[0]?.image || '/placeholder.svg',
          title: `${analysis.analysis.styleProfile} Look`,
          price: "$299.99",
          category: analysis.analysis.styleProfile,
          items: mappedItems.map(item => ({
            id: item.id,
            image: item.image
          }))
        }];

        setSuggestions(gridLooks);
      } catch (error) {
        console.error('Error generating suggestions:', error);
        toast({
          title: "Error",
          description: "Failed to generate style suggestions. Please try again.",
          variant: "destructive",
        });
        
        setSuggestions([{
          id: '1',
          image: '/placeholder.svg',
          title: 'Classic Look',
          price: "$119.98",
          category: 'Classic',
          items: fallbackItems.map(item => ({
            id: item.id,
            image: item.image
          }))
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    generateSuggestions();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Style Suggestions</h1>
      {suggestions.length > 0 ? (
        <LookGrid looks={suggestions} />
      ) : (
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">No suggestions available.</p>
          <Button onClick={() => navigate('/quiz')}>Take Style Quiz</Button>
        </div>
      )}
    </div>
  );
};