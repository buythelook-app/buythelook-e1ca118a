
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

  useEffect(() => {
    // Load user style preferences from quiz results
    const styleAnalysis = localStorage.getItem('styleAnalysis');
    if (styleAnalysis) {
      setUserStyle(JSON.parse(styleAnalysis));
    }
  }, []);

  const { data: suggestedItems, isLoading } = useQuery({
    queryKey: ['dashboardItems', selectedMood],
    queryFn: fetchDashboardItems,
    enabled: !!userStyle,
    staleTime: 0,
  });

  const generateFeaturedLooks = (): Look[] => {
    if (!userStyle || !suggestedItems) return [];

    // Use the fetched items to create different looks based on occasions
    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    
    return occasions.map((occasion, index) => ({
      id: `look-${index + 1}`,
      title: `${occasion} Look`,
      items: suggestedItems.map(item => ({
        id: item.id,
        image: item.image,
        type: item.type as any,
      })),
      price: "$199.99",
      category: userStyle?.analysis?.styleProfile || "Casual",
      occasion
    }));
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
                  <div className="mb-4 bg-white rounded-lg overflow-hidden">
                    <LookCanvas items={look.items} width={300} height={480} />
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
