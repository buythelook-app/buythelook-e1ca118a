import { useEffect, useState } from "react";
import { LookCard } from "./LookCard";
import { HomeButton } from "./HomeButton";

export const LookSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Fetch suggestions from an API or some data source
    const fetchSuggestions = async () => {
      const response = await fetch("/api/suggestions");
      const data = await response.json();
      setSuggestions(data);
    };

    fetchSuggestions();
  }, []);

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text p-6">
      <div className="container mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Look Suggestions</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {suggestions.map((look) => (
            <LookCard key={look.id} {...look} />
          ))}
        </div>
      </div>
      <HomeButton />
    </div>
  );
};
