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

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <main className="pb-16">
        <LookSection title="Featured Looks" looks={FEATURED_LOOKS} />
        <LookSection title="Trending Now" looks={FEATURED_LOOKS} />
      </main>
    </div>
  );
};

export default Index;