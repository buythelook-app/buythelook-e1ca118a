import { LookSection } from "@/components/LookSection";
import { Navbar } from "@/components/Navbar";
import { FilterOptions } from "@/components/filters/FilterOptions";

export default function Index() {
  const featuredLooks = [
    { id: 1, title: "Look 1", image: "/images/look1.jpg" },
    { id: 2, title: "Look 2", image: "/images/look2.jpg" },
    { id: 3, title: "Look 3", image: "/images/look3.jpg" },
    { id: 4, title: "Look 4", image: "/images/look4.jpg" },
  ];

  return (
    <div className="min-h-screen bg-netflix-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <FilterOptions />
        <LookSection looks={featuredLooks} />
      </main>
    </div>
  );
}
