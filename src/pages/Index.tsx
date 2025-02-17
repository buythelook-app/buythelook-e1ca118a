
import { HeroSection } from "@/components/HeroSection";
import { LookSection } from "@/components/LookSection";
import { Navbar } from "@/components/Navbar";
import { FilterOptions } from "@/components/filters/FilterOptions";
import { LookCanvas } from "@/components/LookCanvas";
import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();
  const featuredLooks = [
    { 
      id: "look-1", 
      title: "Summer Casual", 
      items: [
        {
          id: "item-1",
          image: "https://images.unsplash.com/photo-1445205170230-053b83016050",
          type: "top" as const,
        },
        {
          id: "item-2",
          image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2",
          type: "bottom" as const,
        },
        {
          id: "item-3",
          image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
          type: "shoes" as const,
        },
        {
          id: "item-4",
          image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e",
          type: "accessory" as const,
        }
      ],
      price: "$199.99",
      category: "Casual",
    },
    { 
      id: "look-2", 
      title: "Business Professional", 
      items: [
        {
          id: "item-5",
          image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2",
          type: "top" as const,
        },
        {
          id: "item-6",
          image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
          type: "bottom" as const,
        },
        {
          id: "item-7",
          image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
          type: "shoes" as const,
        },
        {
          id: "item-8",
          image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e",
          type: "accessory" as const,
        }
      ],
      price: "$249.99",
      category: "Formal",
    },
    { 
      id: "look-3", 
      title: "Evening Elegance", 
      items: [
        {
          id: "item-9",
          image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
          type: "dress" as const,
        },
        {
          id: "item-10",
          image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
          type: "shoes" as const,
        },
        {
          id: "item-11",
          image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e",
          type: "accessory" as const,
        }
      ],
      price: "$299.99",
      category: "Business",
    },
    { 
      id: "look-4", 
      title: "Weekend Comfort", 
      items: [
        {
          id: "item-12",
          image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e",
          type: "top" as const,
        },
        {
          id: "item-13",
          image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
          type: "bottom" as const,
        },
        {
          id: "item-14",
          image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
          type: "shoes" as const,
        },
        {
          id: "item-15",
          image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e",
          type: "accessory" as const,
        }
      ],
      price: "$179.99",
      category: "Casual",
    },
  ];

  return (
    <div className="min-h-screen bg-netflix-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <Logo size="lg" className="animate-fade-in" />
        </div>
      </div>
      <HeroSection />
      <main className="container mx-auto px-4 py-8">
        <FilterOptions />
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-semibold mb-8 relative">
              Featured Looks
              <span className="absolute -bottom-2 left-0 w-24 h-1 bg-netflix-accent rounded-full"></span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredLooks.map((look) => (
                <div 
                  key={look.id}
                  className="bg-netflix-card p-6 rounded-lg shadow-lg"
                >
                  <h3 className="text-xl font-semibold mb-4">{look.title}</h3>
                  <div className="mb-4">
                    <LookCanvas items={look.items} />
                  </div>
                  <p className="text-netflix-accent font-semibold">Price: {look.price}</p>
                  <button
                    onClick={() => navigate(`/look/${look.id}`)}
                    className="w-full mt-4 bg-netflix-accent text-white py-2 rounded-lg hover:bg-netflix-accent/90 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
