import { useEffect, useState } from "react";
import { LookCard } from "./LookCard";
import { HomeButton } from "./HomeButton";
import { useNavigate } from "react-router-dom";

// Sample data for look suggestions
const sampleSuggestions = [
  {
    id: "1",
    title: "Casual Summer Look",
    description: "Perfect for a sunny day out",
    image: "/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png",
    price: "89.99",
    category: "Casual",
  },
  {
    id: "2",
    title: "Business Professional",
    description: "Elegant office attire",
    image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png",
    price: "149.99",
    category: "Work",
  },
  {
    id: "3",
    title: "Evening Elegance",
    description: "Perfect for special occasions",
    image: "/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png",
    price: "199.99",
    category: "Party",
  },
  {
    id: "4",
    title: "Weekend Casual",
    description: "Comfortable and stylish",
    image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png",
    price: "79.99",
    category: "Casual",
  },
];

export const LookSuggestions = () => {
  const [suggestions, setSuggestions] = useState(sampleSuggestions);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real application, this would fetch from an API
    setSuggestions(sampleSuggestions);
  }, []);

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text p-6">
      <div className="container mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Look Suggestions</h1>
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