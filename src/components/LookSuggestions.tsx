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

  const transformImageUrl = (url: string) => {
    if (!url) return '';
    // Handle both http and https URLs
    return url.replace(
      'http://preview--ai-bundle-construct-20.lovable.app',
      'https://bc0cf4d7-9a35-4a65-b424-9d5ecd554d30.lovableproject.com'
    ).replace(
      'https://preview--ai-bundle-construct-20.lovable.app',
      'https://bc0cf4d7-9a35-4a65-b424-9d5ecd554d30.lovableproject.com'
    );
  };

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

        if (dashboardItems && Array.isArray(dashboardItems)) {
          console.log('Processing dashboard items:', dashboardItems);
          
          // Filter and map items to GridLook format
          const gridLooks: GridLook[] = dashboardItems
            .filter(item => {
              const isValid = item && 
                item.image && 
                item.name &&
                (item.image.startsWith('http://preview--ai-bundle-construct-20.lovable.app') ||
                 item.image.startsWith('https://preview--ai-bundle-construct-20.lovable.app') ||
                 item.image.startsWith('https://bc0cf4d7-9a35-4a65-b424-9d5ecd554d30.lovableproject.com'));
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