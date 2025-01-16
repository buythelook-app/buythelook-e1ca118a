import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { LookSection } from "@/components/LookSection";

const FEATURED_LOOKS = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    title: "Summer Evening Elegance",
    price: "$250-$500",
    category: "Evening Wear"
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
    title: "Urban Professional",
    price: "$150-$300",
    category: "Work Wear"
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    title: "Weekend Casual",
    price: "$100-$200",
    category: "Casual Wear"
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    title: "Date Night Special",
    price: "$200-$400",
    category: "Evening Wear"
  }
];

const TRENDING_LOOKS = [
  // ... similar structure as FEATURED_LOOKS
  // Removed for brevity but would include different looks
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