import { HeroSection } from "@/components/HeroSection";
import { LookSection } from "@/components/LookSection";
import { Navbar } from "@/components/Navbar";
import { FilterOptions } from "@/components/filters/FilterOptions";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();
  const featuredLooks = [
    {
      id: "1",
      image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png",
      title: "Spring Time",
      price: "$149.99",
      category: "Casual"
    },
    {
      id: "2",
      image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png",
      title: "Office Ready",
      price: "$199.99",
      category: "Work"
    },
    {
      id: "3",
      image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png",
      title: "Night Out",
      price: "$249.99",
      category: "Party"
    },
    {
      id: "4",
      image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png",
      title: "Fresh Collection",
      price: "$179.99",
      category: "New"
    }
  ];

  return (
    <div className="min-h-screen bg-netflix-background">
      <Navbar />
      <HeroSection />
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <FilterOptions />
          <Button 
            onClick={() => navigate('/suggestions')}
            className="bg-netflix-accent hover:bg-netflix-accent/80"
          >
            View All Suggestions
          </Button>
        </div>
      </div>
      <LookSection 
        title="Featured Looks"
        looks={featuredLooks}
      />
    </div>
  );
}