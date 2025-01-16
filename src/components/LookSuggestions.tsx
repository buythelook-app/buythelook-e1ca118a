import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "./ui/button";
import { LookCanvas } from "./LookCanvas";

const mockLooks = [
  {
    id: "1",
    image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png",
    title: "Spring Time",
    price: "$149.99",
    category: "Casual",
    items: [
      { id: "1a", image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png" },
      { id: "1b", image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png" },
    ]
  },
  {
    id: "2",
    image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png",
    title: "Office Ready",
    price: "$199.99",
    category: "Work",
    items: [
      { id: "2a", image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png" },
      { id: "2b", image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png" },
    ]
  },
  {
    id: "3",
    image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png",
    title: "Night Out",
    price: "$249.99",
    category: "Party",
    items: [
      { id: "3a", image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png" },
      { id: "3b", image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png" },
    ]
  },
  {
    id: "4",
    image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png",
    title: "Fresh Collection",
    price: "$179.99",
    category: "New",
    items: [
      { id: "4a", image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png" },
      { id: "4b", image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png" },
    ]
  },
  {
    id: "5",
    image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png",
    title: "Summer Vibes",
    price: "$159.99",
    category: "New",
    items: [
      { id: "5a", image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png" },
      { id: "5b", image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png" },
    ]
  },
  {
    id: "6",
    image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png",
    title: "Weekend Casual",
    price: "$139.99",
    category: "Casual",
    items: [
      { id: "6a", image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png" },
      { id: "6b", image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png" },
    ]
  },
  {
    id: "7",
    image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png",
    title: "Business Casual",
    price: "$189.99",
    category: "Work",
    items: [
      { id: "7a", image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png" },
      { id: "7b", image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png" },
    ]
  },
  {
    id: "8",
    image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png",
    title: "Evening Elegance",
    price: "$229.99",
    category: "Party",
    items: [
      { id: "8a", image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png" },
      { id: "8b", image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png" },
    ]
  }
];

type Category = "New" | "Casual" | "Work" | "Party" | "All";

export const LookSuggestions = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");

  const filteredLooks = selectedCategory === "All" 
    ? mockLooks 
    : mockLooks.filter(look => look.category === selectedCategory);

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-display font-semibold">Have a Look!</h1>
          <div className="flex gap-2">
            {["All", "New", "Casual", "Work", "Party"].map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category as Category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredLooks.map((look) => (
            <div 
              key={look.id} 
              onClick={() => navigate(`/look/${look.id}`)}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              <div className="look-card">
                <LookCanvas items={look.items} />
                <div className="look-card-content">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-netflix-accent mb-1">{look.category}</p>
                      <h3 className="text-lg font-semibold mb-1">{look.title}</h3>
                      <p className="text-sm opacity-90">{look.price}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-netflix-card p-4">
          <div className="container mx-auto flex justify-around">
            <Button variant="ghost">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Button>
            <Button variant="ghost">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Button>
            <Button variant="ghost">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};