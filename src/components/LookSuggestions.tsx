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
import { useQuery } from "@tanstack/react-query";

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
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: dashboardItems, isLoading, error } = useQuery({
    queryKey: ['dashboardItems'],
    queryFn: fetchDashboardItems,
  });

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
        
        if (dashboardItems) {
          const mappedItems = dashboardItems
            .filter(item => item && item.type && item.name)
            .map(mapDashboardItemToOutfitItem);

          // Create grid looks from dashboard items
          const gridLooks: GridLook[] = mappedItems.map((item, index) => ({
            id: item.id,
            image: item.image,
            title: item.title,
            price: item.price,
            category: item.type,
            items: [{ id: item.id, image: item.image }]
          }));

          setSuggestions(gridLooks);
        }
      } catch (error) {
        console.error('Error generating suggestions:', error);
        toast({
          title: "Error",
          description: "Failed to generate style suggestions. Please try again.",
          variant: "destructive",
        });
        
        setSuggestions([{
          id: '1',
          image: fallbackItems[0].image,
          title: 'Classic Look',
          price: "$119.98",
          category: 'Classic',
          items: fallbackItems.map(item => ({
            id: item.id,
            image: item.image
          }))
        }]);
      }
    };

    if (dashboardItems) {
      generateSuggestions();
    }
  }, [dashboardItems, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500 mb-4">Failed to load suggestions</p>
        <Button onClick={() => navigate('/quiz')}>Take Style Quiz</Button>
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