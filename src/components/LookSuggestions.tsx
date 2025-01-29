import { useEffect, useState } from "react";
import { LookCard } from "./LookCard";
import { HomeButton } from "./HomeButton";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";

interface Look {
  id: string;
  title: string;
  description: string;
  image: string;
  price: string;
  category: string;
  items: Array<{
    id: string;
    title: string;
    price: string;
    image: string;
  }>;
}

export const LookSuggestions = () => {
  const [suggestions, setSuggestions] = useState<Look[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAISuggestions = async () => {
      try {
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

        const response = await fetch('https://preview--ai-bundle-construct-20.lovable.app/api/generate-looks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: styleAnalysis,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }

        const data = await response.json();
        setSuggestions(data.looks);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        toast({
          title: "Error",
          description: "Failed to load style suggestions. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAISuggestions();
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {suggestions.map((look) => (
            <div 
              key={look.id} 
              onClick={() => navigate(`/look/${look.id}`)}
              className="cursor-pointer"
            >
              <LookCard {...look} />
            </div>
          ))}
        </div>
      </div>
      <HomeButton />
    </div>
  );
};