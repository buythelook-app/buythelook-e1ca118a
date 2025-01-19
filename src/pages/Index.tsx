import { HeroSection } from "@/components/HeroSection";
import { LookSection } from "@/components/LookSection";
import { Navbar } from "@/components/Navbar";

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
      <LookSection 
        title="Featured Looks"
        looks={featuredLooks}
      />
    </div>
  );
}