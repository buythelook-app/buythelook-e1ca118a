
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" onClick={() => setIsOpen(true)}>
          {selectedMood ? (
            <>
              <span className="mr-2 text-lg">{moodIcons[selectedMood]}</span>
              <span>Mood</span>
            </>
          ) : (
            <>
              <span className="mr-2">🎭</span>
              Select Mood
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>How are you feeling today?</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {(Object.keys(moodIcons) as Mood[]).map((mood) => (
            <Button
              key={mood}
              variant={selectedMood === mood ? "default" : "outline"}
              className="p-4 h-auto hover:bg-netflix-accent/10 transition-colors"
              onClick={() => handleMoodSelect(mood)}
            >
              <span className="mr-2 text-lg">{moodIcons[mood]}</span>
              <span className="text-sm capitalize">{mood}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
