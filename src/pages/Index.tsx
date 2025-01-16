import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { LookSection } from "@/components/LookSection";

const FEATURED_LOOKS = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc",
    title: "Summer Evening Elegance",
    price: "$250-$500",
    category: "Evening Wear"
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b",
    title: "Urban Professional",
    price: "$150-$300",
    category: "Work Wear"
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c",
    title: "Weekend Casual",
    price: "$100-$200",
    category: "Casual Wear"
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f",
    title: "Date Night Special",
    price: "$200-$400",
    category: "Evening Wear"
  }
];

const TRENDING_LOOKS = [
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
    title: "Street Style Chic",
    price: "$150-$300",
    category: "Casual Wear"
  },
  {
    id: "6",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
    title: "Autumn Essentials",
    price: "$200-$400",
    category: "Seasonal"
  },
  {
    id: "7",
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e",
    title: "Modern Minimalist",
    price: "$180-$350",
    category: "Work Wear"
  },
  {
    id: "8",
    image: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d",
    title: "Classic Elegance",
    price: "$300-$600",
    category: "Evening Wear"
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-netflix-background to-netflix-card">
      <Navbar />
      <HeroSection />
      <main className="pb-16 space-y-12">
        <div className="relative">
          <div className="absolute inset-0 bg-netflix-accent/5 skew-y-3 transform -z-10" />
          <LookSection 
            title="Featured Collections" 
            looks={FEATURED_LOOKS} 
          />
        </div>
        
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-netflix-card/50 -skew-y-3 transform -z-10" />
          <LookSection 
            title="Trending Now" 
            looks={TRENDING_LOOKS} 
          />
        </div>

        <section className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-lg bg-netflix-card/50 backdrop-blur-sm">
              <h3 className="text-xl font-display font-semibold mb-2">Personalized Style</h3>
              <p className="text-netflix-text/80">Discover looks tailored to your unique preferences</p>
            </div>
            <div className="p-6 rounded-lg bg-netflix-card/50 backdrop-blur-sm">
              <h3 className="text-xl font-display font-semibold mb-2">Curated Collections</h3>
              <p className="text-netflix-text/80">Hand-picked selections for every occasion</p>
            </div>
            <div className="p-6 rounded-lg bg-netflix-card/50 backdrop-blur-sm">
              <h3 className="text-xl font-display font-semibold mb-2">Smart Recommendations</h3>
              <p className="text-netflix-text/80">AI-powered suggestions that match your style</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;