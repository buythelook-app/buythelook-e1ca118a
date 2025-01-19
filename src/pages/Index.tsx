import { HeroSection } from "@/components/HeroSection";
import { LookSection } from "@/components/LookSection";
import { Navbar } from "@/components/Navbar";
import { FilterOptions } from "@/components/filters/FilterOptions";
import { useCartStore } from "@/components/Cart";

export default function Index() {
  const { items, looks } = useCartStore();
  
  const getTotalCount = () => {
    const total = looks.length + items.length;
    return total > 9 ? '9+' : total.toString();
  };

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
      </div>
      <LookSection 
        title="Featured Looks"
        looks={featuredLooks}
      />
    </div>
  );
}