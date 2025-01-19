import { HeroSection } from "@/components/HeroSection";
import { LookSection } from "@/components/LookSection";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-50"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <Navbar />
      <HeroSection />
      <LookSection 
        title="Featured Looks"
        looks={featuredLooks}
      />
    </div>
  );
}