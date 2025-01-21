import { HeroSection } from "@/components/HeroSection";
import { LookSection } from "@/components/LookSection";
import { Navbar } from "@/components/Navbar";
import { FilterOptions } from "@/components/filters/FilterOptions";

export default function Index() {
  const featuredLooks = [
    { 
      id: "look-1", 
      title: "Summer Casual", 
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050",
      price: "$199.99",
      category: "Casual",
      items: [
        {
          id: "item-1",
          image: "https://images.unsplash.com/photo-1445205170230-053b83016050",
        }
      ]
    },
    { 
      id: "look-2", 
      title: "Business Professional", 
      image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2",
      price: "$249.99",
      category: "Formal",
      items: [
        {
          id: "item-2",
          image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2",
        }
      ]
    },
    { 
      id: "look-3", 
      title: "Evening Elegance", 
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
      price: "$299.99",
      category: "Business",
      items: [
        {
          id: "item-3",
          image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
        }
      ]
    },
    { 
      id: "look-4", 
      title: "Weekend Comfort", 
      image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e",
      price: "$179.99",
      category: "Casual",
      items: [
        {
          id: "item-4",
          image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e",
        }
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-netflix-background">
      <Navbar />
      <HeroSection />
      <main className="container mx-auto px-4 py-8">
        <FilterOptions />
        <LookSection title="Featured Looks" looks={featuredLooks} />
      </main>
    </div>
  );
}