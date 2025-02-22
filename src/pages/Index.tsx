import { HeroSection } from "@/components/HeroSection";
import { LookSection } from "@/components/LookSection";
import { Navbar } from "@/components/Navbar";
import { FilterOptions } from "@/components/filters/FilterOptions";
import { LookCanvas } from "@/components/LookCanvas";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Mood } from "@/components/filters/MoodFilter";
import { MoodFilter } from "@/components/filters/MoodFilter";
import { useToast } from "@/hooks/use-toast";
import { fetchDashboardItems } from "@/services/lookService";
import { useQuery } from "@tanstack/react-query";
import { Shuffle, ArrowLeft, ArrowRight } from "lucide-react";

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
  const [lookVariations, setLookVariations] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const styleAnalysis = localStorage.getItem('styleAnalysis');
    if (styleAnalysis) {
      setUserStyle(JSON.parse(styleAnalysis));
    }
  }, []);

  const { data: suggestedItems, isLoading } = useQuery({
    queryKey: ['dashboardItems', selectedMood],
    queryFn: async () => {
      const items = await fetchDashboardItems();
      if (items.length === 0) {
        toast({
          title: "No items found",
          description: "We couldn't find any items matching your style. Please try adjusting your preferences.",
        });
      }
      return items;
    },
    enabled: !!userStyle,
    staleTime: 0,
  });

  // Helper function to get different combinations of items
  const getItemsByType = (items: any[] = [], type: string) => {
    const typeItems = items.filter(item => item.type === type);
    console.log(`Items of type ${type}:`, typeItems);
    return typeItems;
  };

  // Generate multiple looks for a specific occasion
  const generateLookVariations = (items: any[] = [], occasion: string) => {
    if (!items || items.length === 0) return null;

    const tops = getItemsByType(items, 'top');
    const bottoms = getItemsByType(items, 'bottom');
    const shoes = getItemsByType(items, 'shoes');
    const currentVariation = lookVariations[occasion] || 0;

    console.log('Available items for variations:', { 
      occasion,
      tops: tops.length,
      bottoms: bottoms.length,
      shoes: shoes.length,
      currentVariation 
    });

    // Calculate total possible combinations
    const maxCombinations = Math.max(tops.length, bottoms.length, shoes.length);
    const variationIndex = currentVariation % maxCombinations;

    return {
      top: tops[variationIndex % tops.length],
      bottom: bottoms[variationIndex % bottoms.length],
      shoes: shoes[variationIndex % shoes.length],
      totalVariations: maxCombinations
    };
  };

  const handleNextVariation = (occasion: string) => {
    setLookVariations(prev => ({
      ...prev,
      [occasion]: ((prev[occasion] || 0) + 1)
    }));
  };

  const handlePrevVariation = (occasion: string) => {
    const maxVariations = Math.max(
        getItemsByType(suggestedItems, 'top')?.length || 1,
        getItemsByType(suggestedItems, 'bottom')?.length || 1,
        getItemsByType(suggestedItems, 'shoes')?.length || 1
    );
    setLookVariations(prev => ({
      ...prev,
      [occasion]: ((prev[occasion] || 0) - 1 + maxVariations) % maxVariations
    }));
  };

  const generateFeaturedLooks = (): Look[] => {
    if (!userStyle || !suggestedItems || suggestedItems.length === 0) {
      console.log('No items available for looks');
      return [];
    }

    console.log('Generating looks with items:', suggestedItems);
    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    
    return occasions.map((occasion, index) => {
      const lookData = generateLookVariations(suggestedItems, occasion);
      if (!lookData) return null;

      const lookItems = [];

      if (lookData.top) {
        console.log('Adding top to look:', lookData.top);
        lookItems.push({
          id: lookData.top.id,
          image: lookData.top.image,
          type: 'top' as const,
        });
      }

      if (lookData.bottom) {
        console.log('Adding bottom to look:', lookData.bottom);
        lookItems.push({
          id: lookData.bottom.id,
          image: lookData.bottom.image,
          type: 'bottom' as const,
        });
      }

      if (lookData.shoes) {
        console.log('Adding shoes to look:', lookData.shoes);
        lookItems.push({
          id: lookData.shoes.id,
          image: lookData.shoes.image,
          type: 'shoes' as const,
        });
      }

      return {
        id: `look-${index + 1}`,
        title: `${occasion} Look`,
        items: lookItems,
        price: "$199.99",
        category: userStyle?.analysis?.styleProfile || "Casual",
        occasion
      };
    }).filter(Boolean) as Look[];
  };

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    localStorage.setItem('current-mood', mood);
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
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-semibold mb-8 relative">
              Personalized Looks
              <span className="absolute -bottom-2 left-0 w-24 h-1 bg-netflix-accent rounded-full"></span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {isLoading ? (
                <div className="col-span-2 text-center py-12">
                  <div className="animate-pulse">Loading your personalized looks...</div>
                </div>
              ) : generateFeaturedLooks().map((look) => (
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
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <button
                        onClick={() => handlePrevVariation(look.occasion)}
                        className="bg-netflix-accent text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Previous look"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleNextVariation(look.occasion)}
                        className="bg-netflix-accent text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Next look"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-netflix-accent font-semibold">{look.price}</p>
                    <button
                      onClick={() => navigate(`/look/${look.id}`)}
                      className="bg-netflix-accent text-white px-4 py-2 rounded-lg hover:bg-netflix-accent/90 transition-colors text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
