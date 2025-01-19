import { HeroSection } from "@/components/HeroSection";
import { LookSection } from "@/components/LookSection";
import { Navbar } from "@/components/Navbar";
import { FilterOptions } from "@/components/filters/FilterOptions";
import { useCartStore } from "@/components/Cart";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

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

  const totalCount = getTotalCount();

  return (
    <div className="min-h-screen bg-netflix-background">
      <Navbar />
      <div className="fixed top-4 right-4 z-50">
        <Link to="/cart" className="relative inline-block">
          <ShoppingCart className="h-6 w-6 text-netflix-text hover:text-netflix-accent transition-colors" />
          {(looks.length > 0 || items.length > 0) && (
            <span className="absolute -top-2 -right-2 bg-netflix-accent text-netflix-text text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {totalCount}
            </span>
          )}
        </Link>
      </div>
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