
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useEffect, useState } from "react";

export type Mood = "mystery" | "quiet" | "elegant" | "energized" | "flowing" | "optimist" | 
           "calm" | "romantic" | "unique" | "sweet" | "childish" | "passionate" | "powerful";

const moodIcons: Record<Mood, string> = {
  mystery: "🤔",
  quiet: "😌",
  elegant: "😊",
  energized: "😄",
  flowing: "🌊",
  optimist: "🌟",
  calm: "😌",
  romantic: "💝",
  unique: "🦄",
  sweet: "🍯",
  childish: "👶",
  passionate: "❤️",
  powerful: "💪"
};

interface MoodFilterProps {
  selectedMood: Mood | null;
  onMoodSelect: (mood: Mood) => void;
}

export const MoodFilter = ({ selectedMood, onMoodSelect }: MoodFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Initialize from localStorage if exists
    const storedMood = localStorage.getItem('current-mood') as Mood;
    if (storedMood && !selectedMood) {
      onMoodSelect(storedMood);
    }
  }, [selectedMood, onMoodSelect]);

  const handleMoodSelect = (mood: Mood) => {
    onMoodSelect(mood);
    localStorage.setItem('current-mood', mood);
    setIsOpen(false); // Close the dialog after selection
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button 
            className="w-full max-w-md mx-auto fashion-card rounded-2xl p-6 text-center fashion-hover"
            onClick={() => setIsOpen(true)}
          >
            {selectedMood ? (
              <div className="space-y-2">
                <span className="text-3xl">{moodIcons[selectedMood]}</span>
                <p className="font-display text-lg fashion-text capitalize">{selectedMood}</p>
                <p className="fashion-muted text-sm">Tap to change your mood</p>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-3xl">🎭</span>
                <p className="font-display text-lg fashion-text">Select Your Mood</p>
                <p className="fashion-muted text-sm">Choose how you're feeling today</p>
              </div>
            )}
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl fashion-bg">
          <DialogHeader className="text-center pb-6">
            <DialogTitle className="text-2xl font-display fashion-text">
              How are you feeling today?
            </DialogTitle>
            <p className="fashion-muted">Your mood helps us curate the perfect look for you</p>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(Object.keys(moodIcons) as Mood[]).map((mood) => (
              <button
                key={mood}
                className={`p-6 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                  selectedMood === mood 
                    ? 'bg-fashion-accent text-white shadow-lg' 
                    : 'fashion-card hover:border-fashion-accent'
                }`}
                onClick={() => handleMoodSelect(mood)}
              >
                <span className="text-2xl mb-2 block">{moodIcons[mood]}</span>
                <span className="text-sm font-medium capitalize">{mood}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
