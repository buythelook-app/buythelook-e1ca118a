import { useEffect, useState } from "react";
import { HomeButton } from "./HomeButton";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";
import { LookCanvas } from "./LookCanvas";
import { analyzeStyleWithAI } from "./quiz/utils/quizUtils";
import { QuizFormData } from "./quiz/types";

interface DashboardItem {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string;
  type: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear';
}

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

const fallbackItems: OutfitItem[] = [
  {
    id: '1',
    title: 'Classic White Blouse',
    description: 'A timeless piece for your wardrobe',
    image: '/placeholder.svg',
    price: '$49.99',
    type: 'top'
  },
  {
    id: '2',
    title: 'Black Trousers',
    description: 'Elegant and versatile',
    image: '/placeholder.svg',
    price: '$69.99',
    type: 'bottom'
  }
];

export const LookSuggestions = () => {
  const [suggestions, setSuggestions] = useState<Look[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateSuggestions = async () => {
      try {
        // Get style analysis from localStorage
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

        // Parse and analyze style
        const parsedAnalysis = JSON.parse(styleAnalysis) as QuizFormData;
        const analysis = analyzeStyleWithAI(parsedAnalysis);
        console.log('Style analysis:', analysis);

        // Fetch items from API with error handling
        let dashboardItems: DashboardItem[] = [];
        try {
          const response = await fetch('https://preview--ai-bundle-construct-20.lovable.app/api/dashboard/items');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          if (!Array.isArray(data)) {
            throw new Error('Invalid data format');
          }
          dashboardItems = data;
          console.log('Dashboard items:', dashboardItems);
        } catch (error) {
          console.error('Error fetching dashboard items:', error);
          // Use fallback items if API fails
          dashboardItems = fallbackItems.map(item => ({
            id: item.id,
            name: item.title,
            description: item.description,
            image: item.image,
            price: item.price,
            type: item.type
          }));
        }
        
        // Map items to looks with validation
        const generatedLooks: Look[] = [{
          id: '1',
          title: `${analysis.analysis.styleProfile} Look`,
          description: `A ${analysis.analysis.styleProfile.toLowerCase()} outfit that matches your style preferences`,
          style: analysis.analysis.styleProfile,
          totalPrice: "$299.99",
          items: dashboardItems
            .filter(item => item && item.type && item.name) // Validate required fields
            .map((item) => ({
              id: item.id || String(Math.random()),
              title: item.name || 'Fashion Item',
              description: item.description || 'Stylish piece for your wardrobe',
              image: item.image || '/placeholder.svg',
              price: item.price || "$49.99",
              type: item.type || 'top'
            }))
            .slice(0, 6) // Limit to 6 items per look
        }];

        setSuggestions(generatedLooks);
      } catch (error) {
        console.error('Error generating suggestions:', error);
        toast({
          title: "Error",
          description: "Failed to generate style suggestions. Please try again.",
          variant: "destructive",
        });
        
        // Set fallback suggestion
        setSuggestions([{
          id: '1',
          title: 'Classic Look',
          description: 'A timeless outfit for any occasion',
          style: 'Classic',
          totalPrice: "$119.98",
          items: fallbackItems
        }]);
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