
import { HeroSection } from "@/components/HeroSection";
import { LookSection } from "@/components/LookSection";
import { Navbar } from "@/components/Navbar";
import { FilterOptions } from "@/components/filters/FilterOptions";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardItems } from "@/services/lookService";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();
  
  const { data: featuredLooks = [] } = useQuery({
    queryKey: ['featuredLooks'],
    queryFn: fetchDashboardItems,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const mappedLooks = featuredLooks.map(look => ({
    id: look.id,
    title: look.name,
    image: look.image,
    price: look.price,
    category: look.type,
    items: [{
      id: look.id,
      image: look.image,
      type: look.type as 'top' | 'bottom' | 'shoes' | 'accessory' | 'dress'
    }]
  }));

  return (
    <div className="min-h-screen bg-netflix-background">
      <Navbar />
      <HeroSection />
      <main className="container mx-auto px-4 py-8">
        <FilterOptions />
        <LookSection 
          title="Featured Looks" 
          looks={mappedLooks}
        />
      </main>
    </div>
  );
}
