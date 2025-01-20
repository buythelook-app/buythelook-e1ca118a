import { LookSection } from "@/components/LookSection";
import { Navbar } from "@/components/Navbar";
import { FilterOptions } from "@/components/filters/FilterOptions";

export default function Index() {
  const featuredLooks = [
    { 
      id: "1", 
      title: "Look 1", 
      image: "/images/look1.jpg",
      price: "$199.99",
      category: "Casual"
    },
    { 
      id: "2", 
      title: "Look 2", 
      image: "/images/look2.jpg",
      price: "$249.99",
      category: "Formal"
    },
    { 
      id: "3", 
      title: "Look 3", 
      image: "/images/look3.jpg",
      price: "$299.99",
      category: "Business"
    },
    { 
      id: "4", 
      title: "Look 4", 
      image: "/images/look4.jpg",
      price: "$179.99",
      category: "Casual"
    },
  ];

  return (
    <div className="min-h-screen bg-netflix-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <FilterOptions />
        <LookSection title="Featured Looks" looks={featuredLooks} />
      </main>
    </div>
  );
}