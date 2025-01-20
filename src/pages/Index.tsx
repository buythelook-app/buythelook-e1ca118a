import { HeroSection } from "@/components/HeroSection";
import { LookSection } from "@/components/LookSection";
import { Navbar } from "@/components/Navbar";
import { FilterOptions } from "@/components/filters/FilterOptions";
import { Apple, Google } from "lucide-react";

export default function Index() {
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
        <FilterOptions />
        
        {/* Payment Options Section */}
        <div className="mt-8 mb-4">
          <h3 className="text-xl font-semibold text-netflix-text mb-4">Payment Options</h3>
          <div className="flex gap-4 items-center">
            <button className="flex items-center gap-2 bg-netflix-card hover:bg-netflix-card/80 text-netflix-text px-6 py-3 rounded-lg transition-colors">
              <Google className="w-6 h-6" />
              <span>Google Pay</span>
            </button>
            <button className="flex items-center gap-2 bg-netflix-card hover:bg-netflix-card/80 text-netflix-text px-6 py-3 rounded-lg transition-colors">
              <Apple className="w-6 h-6" />
              <span>Apple Pay</span>
            </button>
          </div>
        </div>
      </div>
      <LookSection 
        title="Featured Looks"
        looks={featuredLooks}
      />
    </div>
  );
}