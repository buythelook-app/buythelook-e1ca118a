
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { fetchItemsForOccasion } from "@/services/lookService";
import { LookItem } from "./LookItem";
import { generateOutfit } from "@/services/api/outfitGenerationService";
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
  const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];

  // Add console log to trace component rendering
  useEffect(() => {
    console.log("PersonalizedLooks component mounted or updated", {
      userStyle: !!userStyle,
      selectedMood,
      occasions
    });
  }, [userStyle, selectedMood]);

  const { data: occasionOutfits, isLoading, refetch } = useQuery({
    queryKey: ['dashboardItems', selectedMood],
    queryFn: async () => {
      console.log("Fetching dashboard items with mood:", selectedMood);
      return await fetchItemsForOccasion(true); // Force refresh to ensure data loads
    },
    enabled: !!userStyle,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (selectedMood) {
      localStorage.setItem('current-mood', selectedMood);
      refetch();
    }
    
    // Log the initial outfits data when component mounts
    if (occasionOutfits) {
      console.log("Initial outfit data:", occasionOutfits);
      occasions.forEach(occasion => {
        console.log(`${occasion} items:`, occasionOutfits[occasion] || []);
      });
    }
  }, [selectedMood, refetch, occasionOutfits, occasions]);

  const handleShuffleLook = async (occasion: string) => {
    try {
      setIsRefreshing({ ...isRefreshing, [occasion]: true });
      console.log(`Shuffling look for ${occasion}`);
      
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
      
      await generateOutfit(bodyShape, style, mood);
      
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

  // Display a message if loading
  if (isLoading) {
    console.log("PersonalizedLooks is loading data...");
  } else {
    console.log("PersonalizedLooks data loaded:", occasionOutfits);
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h2 className="text-3xl font-display font-semibold relative text-white">
            Personalized Looks
            <span className="absolute -bottom-2 left-0 w-24 h-1 bg-netflix-accent rounded-full"></span>
          </h2>
          {userStyle?.analysis?.styleProfile && (
            <div className="mt-4 md:mt-0 px-4 py-2 bg-netflix-card rounded-full text-netflix-accent">
              Based on your {userStyle.analysis.styleProfile} style preference
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {isLoading ? (
            <div className="col-span-2 text-center py-12 text-white">
              <div className="animate-pulse">Loading your personalized looks...</div>
            </div>
          ) : !occasionOutfits || Object.keys(occasionOutfits).length === 0 ? (
            <div className="col-span-2 text-center py-12 text-white">
              <p>No outfit suggestions available. Try choosing a different mood or generate new looks.</p>
            </div>
          ) : (
            occasions.map((occasion, index) => {
              const items = occasionOutfits?.[occasion] || [];
              
              console.log(`Rendering ${occasion} items:`, items);
              
              return (
                <LookItem 
                  key={`${occasion}-${combinations[occasion] || 0}-${index}`}
                  occasion={occasion}
                  items={items}
                  isRefreshing={!!isRefreshing[occasion]}
                  userStyle={userStyle}
                  onShuffleLook={handleShuffleLook}
                  index={index}
                />
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
