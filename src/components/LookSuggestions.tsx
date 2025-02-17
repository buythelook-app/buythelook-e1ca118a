
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { analyzeStyleWithAI } from "@/utils/styleAnalysis";
import { QuizFormData } from "@/components/quiz/types";
import { fetchDashboardItems } from "@/services/lookService";
import { LookGrid } from "./LookGrid";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { transformImageUrl, validateImageUrl } from "@/utils/imageUtils";

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
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const generateSuggestions = async () => {
      try {
        // Check for existing quiz data first
        const savedQuizData = localStorage.getItem('style-quiz-data');
        if (!savedQuizData) {
          toast({
            title: "No Style Profile Found",
            description: "Please complete the style quiz first to get personalized suggestions.",
            variant: "destructive",
          });
          navigate('/quiz');
          return;
        }

        // Parse the saved quiz data
        const quizData: QuizFormData = JSON.parse(savedQuizData);

        // Check if quiz data is complete
        if (!quizData.gender || !quizData.bodyShape || quizData.stylePreferences.length === 0) {
          toast({
            title: "Incomplete Style Profile",
            description: "Please complete all sections of the style quiz.",
            variant: "destructive",
          });
          navigate('/quiz');
          return;
        }

        // Generate or retrieve style analysis
        let styleAnalysis = localStorage.getItem('styleAnalysis');
        if (!styleAnalysis) {
          const newAnalysis = await analyzeStyleWithAI(quizData);
          styleAnalysis = JSON.stringify(newAnalysis);
          localStorage.setItem('styleAnalysis', styleAnalysis);
        }

        if (dashboardItems && Array.isArray(dashboardItems)) {
          console.log('Processing dashboard items:', dashboardItems);
          
          const gridLooks: GridLook[] = dashboardItems
            .filter(item => {
              const isValid = item && 
                item.image && 
                item.name &&
                validateImageUrl(item.image);
              console.log(`Item ${item?.id} validation:`, isValid, item);
              return isValid;
            })
            .map(item => ({
              id: item.id,
              image: transformImageUrl(item.image),
              title: item.name,
              price: item.price || '$99.99',
              category: item.type || 'Fashion',
              items: [{ id: item.id, image: transformImageUrl(item.image) }]
            }));

          console.log('Mapped grid looks:', gridLooks);
          setSuggestions(gridLooks);
        }
      } catch (error) {
        console.error('Error generating suggestions:', error);
        toast({
          title: "Error",
          description: "Failed to generate style suggestions. Please try again.",
          variant: "destructive",
        });
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
