import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

const moods = [
  { id: 1, name: "Relaxing", icon: "🌅" },
  { id: 2, name: "Party", icon: "🎉" },
  { id: 3, name: "Work", icon: "💼" },
  { id: 4, name: "Date", icon: "💖" },
  { id: 5, name: "Travel", icon: "✈️" },
  { id: 6, name: "Shopping", icon: "🛍️" },
  { id: 7, name: "Sports", icon: "⚽" },
  { id: 8, name: "Casual", icon: "👕" },
];

export const MoodSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text p-6">
      <div className="container max-w-md mx-auto">
        <h1 className="text-2xl font-display font-semibold mb-8">What's Your Mood?</h1>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          {moods.map((mood) => (
            <button
              key={mood.id}
              className="p-6 bg-netflix-card rounded-lg hover:bg-netflix-accent/10 transition-colors text-center"
            >
              <span className="text-3xl mb-2 block">{mood.icon}</span>
              <span className="text-sm">{mood.name}</span>
            </button>
          ))}
        </div>

        <Button 
          onClick={() => navigate('/event')} 
          className="w-full"
        >
          Apply Mood
        </Button>
      </div>
    </div>
  );
};