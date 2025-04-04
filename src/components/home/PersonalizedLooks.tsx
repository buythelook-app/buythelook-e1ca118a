
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { fetchItemsForOccasion } from "@/services/lookService";
import { LookItem } from "./LookItem";
import { generateOutfit } from "@/services/api/outfitApi";
import { mapBodyShape, mapStyle } from "@/services/mappers/styleMappers";
import { validateMood } from "@/services/utils/validationUtils";

interface PersonalizedLooksProps {
  userStyle: any;
  selectedMood: string | null;
}

export const PersonalizedLooks = ({ userStyle, selectedMood }: PersonalizedLooksProps) => {
  const { toast } = useToast();
  const [combinations, setCombinations] = useState<{ [key: string]: number }>({});
  const [isRefreshing, setIsRefreshing] = useState<{ [key: string]: boolean }>({});
  const [activeOccasion, setActiveOccasion] = useState<string>("Work");
  const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];

  const { data: occasionOutfits, isLoading, refetch } = useQuery({
    queryKey: ['dashboardItems', selectedMood],
    queryFn: async () => {
      return await fetchItemsForOccasion(false);
    },
    enabled: !!userStyle,
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (selectedMood) {
      localStorage.setItem('current-mood', selectedMood);
      refetch();
    }
  }, [selectedMood, refetch]);

  const handleShuffleLook = async (occasion: string) => {
    try {
      setIsRefreshing({ ...isRefreshing, [occasion]: true });
      
      const quizData = localStorage.getItem('styleAnalysis');
      const styleAnalysis = quizData ? JSON.parse(quizData) : null;
      
      if (!styleAnalysis?.analysis) {
        throw new Error("Style analysis data missing");
      }
      
      const bodyShape = mapBodyShape(styleAnalysis.analysis.bodyShape || 'H');
      const preferredStyle = styleAnalysis.analysis.styleProfile || 'classic';
      const style = mapStyle(preferredStyle);
      
      const currentMoodData = localStorage.getItem('current-mood');
      const mood = validateMood(currentMoodData);
      
      const response = await generateOutfit(bodyShape, style, mood);
      
      setCombinations(prev => ({
        ...prev,
        [occasion]: (prev[occasion] || 0) + 1
      }));
      
      await refetch();
      
      toast({
        title: "New Look Generated",
        description: "Here's a fresh style combination for you!",
      });
    } catch (error) {
      console.error("Error generating outfit:", error);
      toast({
        title: "Error",
        description: "Failed to generate a new look. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing({ ...isRefreshing, [occasion]: false });
    }
  };

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h2 className="text-3xl font-display font-semibold relative">
            Personalized Looks
            <span className="absolute -bottom-2 left-0 w-24 h-1 bg-netflix-accent rounded-full"></span>
          </h2>
          {userStyle?.analysis?.styleProfile && (
            <div className="mt-4 md:mt-0 px-4 py-2 bg-netflix-card rounded-full text-netflix-accent">
              Based on your {userStyle.analysis.styleProfile} style preference
            </div>
          )}
        </div>
        
        <div className="mb-6 flex justify-center">
          <div className="flex gap-3 overflow-x-auto pb-2 justify-center">
            {occasions.map((occasion) => (
              <button
                key={occasion}
                onClick={() => setActiveOccasion(occasion)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeOccasion === occasion
                    ? "bg-netflix-accent text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                }`}
              >
                {occasion}
              </button>
            ))}
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-pulse">Loading your personalized looks...</div>
          </div>
        ) : (
          <div className="relative max-w-xl mx-auto">
            {occasions.map((occasion, index) => {
              const items = occasionOutfits?.[occasion] || [];
              return (
                <div 
                  key={`${occasion}-${index}`} 
                  className={activeOccasion === occasion ? "block" : "hidden"}
                >
                  <LookItem 
                    occasion={occasion}
                    items={items}
                    isRefreshing={!!isRefreshing[occasion]}
                    userStyle={userStyle}
                    onShuffleLook={handleShuffleLook}
                    index={index}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
