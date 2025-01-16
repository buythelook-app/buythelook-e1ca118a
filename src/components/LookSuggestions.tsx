import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { LookCard } from "./LookCard";

const mockLooks = [
  {
    id: "1",
    image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png",
    title: "Spring Time",
    price: "$149.99",
    category: "Casual"
  },
  // Add more mock looks as needed
];

export const LookSuggestions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-display font-semibold">Have a Look!</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">New</Button>
            <Button variant="outline" size="sm">Casual</Button>
            <Button variant="outline" size="sm">Work</Button>
            <Button variant="outline" size="sm">Party</Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockLooks.map((look) => (
            <div key={look.id} onClick={() => navigate(`/look/${look.id}`)}>
              <LookCard {...look} />
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-netflix-card p-4">
          <div className="container mx-auto flex justify-around">
            <Button variant="ghost">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Button>
            <Button variant="ghost">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Button>
            <Button variant="ghost">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};