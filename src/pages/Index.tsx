import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { FilterOptions } from "@/components/filters/FilterOptions";
import { LookCanvas } from "@/components/LookCanvas";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import type { Mood } from "@/components/filters/MoodFilter";
import { MoodFilter } from "@/components/filters/MoodFilter";
import { useToast } from "@/hooks/use-toast";
import { fetchItemsForOccasion, findBestColorMatch } from "@/services/lookService";
import { useQuery } from "@tanstack/react-query";
import { Shuffle } from "lucide-react";
import { generateOutfit } from "@/services/api/outfitApi";
import { mapBodyShape, mapStyle } from "@/services/mappers/styleMappers";
import { validateMood } from "@/services/utils/validationUtils";
import { DashboardItem } from "@/types/lookTypes";

interface Look {
  id: string;
  title: string;
  items: Array<{
    id: string;
    image: string;
    type: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear';
  }>;
  price: string;
  category: string;
  occasion: string;
}

export default function Index() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [userStyle, setUserStyle] = useState<any>(null);
  const [combinations, setCombinations] = useState<{ [key: string]: number }>({});
  const [isRefreshing, setIsRefreshing] = useState<{ [key: string]: boolean }>({});
  const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];

  useEffect(() => {
    const styleAnalysis = localStorage.getItem('styleAnalysis');
    if (styleAnalysis) {
      setUserStyle(JSON.parse(styleAnalysis));
    }
  }, []);

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

  const createLookFromItems = (items: DashboardItem[] = [], occasion: string, index: number): Look | null => {
    if (!items || items.length === 0) return null;
    
    const lookItems = items.map(item => ({
      id: item.id,
      image: item.image,
      type: item.type.toLowerCase() as 'top' | 'bottom' | 'shoes'
    }));
    
    let totalPrice = 0;
    items.forEach(item => {
      const itemPrice = item.price?.replace(/[^0-9.]/g, '') || '0';
      totalPrice += parseFloat(itemPrice);
    });
    
    return {
      id: `look-${occasion}-${index}`,
      title: `${occasion} Look`,
      items: lookItems,
      price: totalPrice > 0 ? `$${totalPrice.toFixed(2)}` : '$0.00',
      category: userStyle?.analysis?.styleProfile || "Casual",
      occasion: occasion
    };
  };

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    localStorage.setItem('current-mood', mood);
  };

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

  if (!userStyle) {
    return (
      <div className="min-h-screen bg-netflix-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Complete Your Style Quiz</h2>
          <p className="text-gray-600 mb-8">
            Take our style quiz to get personalized look suggestions that match your style.
          </p>
          <button
            onClick={() => navigate('/quiz')}
            className="bg-netflix-accent text-white px-6 py-3 rounded-lg hover:bg-netflix-accent/90 transition-colors"
          >
            Take Style Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-background">
      <Navbar />
      <HeroSection />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <MoodFilter selectedMood={selectedMood} onMoodSelect={handleMoodSelect} />
        </div>
        <FilterOptions />
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {isLoading ? (
                <div className="col-span-2 text-center py-12">
                  <div className="animate-pulse">Loading your personalized looks...</div>
                </div>
              ) : (
                occasions.map((occasion, index) => {
                  const items = occasionOutfits?.[occasion] || [];
                  const look = createLookFromItems(items, occasion, index);
                  
                  if (!look) return null;
                  
                  return (
                    <div 
                      key={look.id}
                      className="bg-netflix-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold">{look.title}</h3>
                        <span className="text-sm text-netflix-accent">{look.occasion}</span>
                      </div>
                      <div className="mb-4 bg-white rounded-lg overflow-hidden relative group">
                        <LookCanvas items={look.items} width={300} height={480} />
                        <button
                          onClick={() => handleShuffleLook(look.occasion)}
                          className="absolute bottom-4 right-4 bg-netflix-accent text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Try different combination"
                          disabled={isRefreshing[look.occasion]}
                        >
                          <Shuffle className={`w-4 h-4 ${isRefreshing[look.occasion] ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-netflix-accent font-semibold">{look.price}</p>
                        <button
                          onClick={() => {
                            localStorage.setItem(`look-${look.id}`, JSON.stringify({
                              ...look,
                              description: `A curated ${look.occasion.toLowerCase()} look that matches your ${userStyle.analysis.styleProfile} style preference.`
                            }));
                            navigate(`/look/${look.id}`);
                          }}
                          className="bg-netflix-accent text-white px-4 py-2 rounded-lg hover:bg-netflix-accent/90 transition-colors text-sm"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
